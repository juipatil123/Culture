import axios from 'axios';

// Use CRA proxy (package.json proxy -> http://localhost:5000)
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://YOUR-RENDER-BACKEND-URL.onrender.com/api"
    : "http://localhost:5000/api";


// Axios instance
const api = axios.create({ baseURL: API_URL });

// Attach token if present (check for employee, admin, or PM token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('pmToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Project Managers
export const getAllProjectManagers = async () => {
  try {
    const response = await api.get(`/project-managers`);
    return response.data;
  } catch (error) {
    return JSON.parse(localStorage.getItem('projectManagers') || '[]');
  }
};

export const getProjectManager = async (id) => {
  const response = await api.get(`/project-managers/${id}`);
  return response.data;
};

export const createProjectManager = async (projectManagerData) => {
  try {
    const response = await api.post(`/project-managers`, projectManagerData);
    return response.data;
  } catch (error) {
    const managers = JSON.parse(localStorage.getItem('projectManagers') || '[]');
    const newManager = {
      ...projectManagerData,
      id: `pm${Date.now()}`,
      _id: `pm${Date.now()}`,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    managers.push(newManager);
    localStorage.setItem('projectManagers', JSON.stringify(managers));
    return newManager;
  }
};

export const updateProjectManager = async (id, projectManagerData) => {
  try {
    const response = await api.put(`/project-managers/${id}`, projectManagerData);
    return response.data;
  } catch (error) {
    const managers = JSON.parse(localStorage.getItem('projectManagers') || '[]');
    const updated = managers.map(m =>
      (m.id === id || m._id === id) ? { ...m, ...projectManagerData } : m
    );
    localStorage.setItem('projectManagers', JSON.stringify(updated));
    return { ...projectManagerData, id };
  }
};

export const deleteProjectManager = async (id) => {
  try {
    const response = await api.delete(`/project-managers/${id}`);
    return response.data;
  } catch (error) {
    const managers = JSON.parse(localStorage.getItem('projectManagers') || '[]');
    const filtered = managers.filter(m => m.id !== id && m._id !== id);
    localStorage.setItem('projectManagers', JSON.stringify(filtered));
    return { success: true };
  }
};

export const assignProjectToManager = async (managerId, projectId) => {
  const response = await api.post(`/project-managers/${managerId}/assign-project`, { projectId });
  return response.data;
};

export const removeProjectFromManager = async (managerId, projectId) => {
  const response = await api.post(`/project-managers/${managerId}/remove-project`, { projectId });
  return response.data;
};

// Legacy support
export const getProjectManagers = getAllProjectManagers;
export const addProjectManager = createProjectManager;

// Team Members
export const getTeamMembers = async (searchTerm = '') => {
  try {
    const response = await api.get(`/team-members${searchTerm ? `?search=${searchTerm}` : ''}`);
    return response.data;
  } catch (error) {
    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (searchTerm) {
      return localUsers.filter(u =>
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return localUsers;
  }
};

// Get all employees across all managers
export const getAllEmployees = async () => {
  // Backend should aggregate all team members; if not available, this can be implemented server-side
  const response = await api.get(`/team-members`);
  return response.data;
};

// Add new team member (admin-side creation)
export const addTeamMember = async (teamMemberData) => {
  console.log('📡 API: addTeamMember request data:', teamMemberData);
  try {
    const response = await api.post(`/team-members`, teamMemberData);
    console.log('📡 API: addTeamMember response:', response.data);
    return response.data;
  } catch (error) {
    console.error('📡 API: addTeamMember fallback to localStorage due to error:', error);
    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const newUser = {
      ...teamMemberData,
      id: `u${Date.now()}`,
      _id: `u${Date.now()}`,
      status: teamMemberData.status || 'Active',
      joinDate: teamMemberData.joinDate || new Date().toISOString().split('T')[0]
    };
    localUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(localUsers));
    return newUser;
  }
};

// Auth
export const signup = async (payload) => {
  const res = await api.post(`/auth/signup`, payload);
  return res.data; // { token, user }
};

export const login = async (payload) => {
  const res = await api.post(`/auth/login`, payload);
  return res.data; // { token, user }
};

// Self-service
export const getMe = async () => {
  const res = await api.get(`/me`);
  return res.data;
};

export const submitAttendance = async (status) => {
  const res = await api.post(`/me/attendance`, { status });
  return res.data;
};

export const addMyProjectUpdate = async (payload) => {
  const res = await api.post(`/me/project-updates`, payload);
  return res.data;
};

export const updateMyProjectUpdate = async (id, payload) => {
  const res = await api.put(`/me/project-updates/${id}`, payload);
  return res.data;
};

export const deleteMyProjectUpdate = async (id) => {
  const res = await api.delete(`/me/project-updates/${id}`);
  return res.data;
};

// Admin Auth
export const adminLogin = async (payload) => {
  const res = await api.post(`/admin/login`, payload);
  return res.data; // { token, admin }
};

export const createAdmin = async (payload) => {
  const res = await api.post(`/admin/create`, payload);
  return res.data;
};

// Project Manager Auth
export const pmLogin = async (payload) => {
  const res = await api.post(`/pm-auth/login`, payload);
  return res.data; // { token, projectManager }
};

export const getPMProfile = async () => {
  const res = await api.get(`/pm/profile`);
  return res.data;
};

export const getPMTeam = async () => {
  const res = await api.get(`/pm/team`);
  return res.data;
};

export const getPMTeamMember = async (id) => {
  const res = await api.get(`/pm/team/${id}`);
  return res.data;
};

// Points Scheme
export const getPointsScheme = async () => {
  const res = await api.get(`/points-scheme`);
  return res.data;
};

export const updatePointsScheme = async (scheme) => {
  const res = await api.put(`/points-scheme`, { scheme });
  return res.data;
};

// Projects
export const getAllProjects = async () => {
  try {
    const res = await api.get(`/projects`);
    return res.data;
  } catch (error) {
    console.error('API Error fetching projects, falling back to localStorage:', error);
    return JSON.parse(localStorage.getItem('projects') || '[]');
  }
};

export const getProject = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};

export const createProject = async (projectData) => {
  try {
    const res = await api.post(`/projects`, projectData);
    return res.data;
  } catch (error) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const newProject = {
      ...projectData,
      id: `p${Date.now()}`,
      _id: `p${Date.now()}`,
      status: projectData.projectStatus || 'On Track',
      progress: projectData.progress || 0
    };
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    return newProject;
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const res = await api.put(`/projects/${id}`, projectData);
    return res.data;
  } catch (error) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projects.map(p =>
      (p.id === id || p._id === id) ? { ...p, ...projectData } : p
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    return { ...projectData, id };
  }
};

export const deleteProject = async (id) => {
  try {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  } catch (error) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const filteredProjects = projects.filter(p => p.id !== id && p._id !== id);
    localStorage.setItem('projects', JSON.stringify(filteredProjects));
    return { success: true };
  }
};

export const updateProjectProgress = async (id, progress) => {
  const res = await api.patch(`/projects/${id}/progress`, { progress });
  return res.data;
};

// Users/Employees Management (using existing team-members endpoints)
export const getAllUsers = async () => {
  try {
    const res = await api.get(`/team-members`);
    return res.data;
  } catch (error) {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }
};

export const createUser = async (userData) => {
  // Use the existing addTeamMember function
  return await addTeamMember(userData);
};

export const updateUser = async (id, userData) => {
  try {
    const res = await api.put(`/team-members/${id}`, userData);
    return res.data;
  } catch (error) {
    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = localUsers.map(user =>
      (user.id === id || user._id === id) ? { ...user, ...userData } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return { ...userData, id };
  }
};

export const updateUserPassword = async (id, newPassword) => {
  // Try different endpoints based on user type
  try {
    // Try team members first
    const res = await api.patch(`/team-members/${id}/password`, { password: newPassword });
    return res.data;
  } catch (error) {
    // If team member fails, try project manager
    try {
      const res = await api.patch(`/project-managers/${id}/password`, { password: newPassword });
      return res.data;
    } catch (pmError) {
      // If project manager fails, try team leader
      const res = await api.patch(`/team-leaders/${id}/password`, { password: newPassword });
      return res.data;
    }
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/team-members/${id}`);
    return res.data;
  } catch (error) {
    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = localUsers.filter(user => user.id !== id && user._id !== id);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    return { success: true };
  }
};

// Tasks Management (fallback to local storage for now)
export const getAllTasks = async () => {
  try {
    const res = await api.get(`/tasks`);
    return res.data;
  } catch (error) {
    // Fallback to localStorage if endpoint doesn't exist
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks;
  }
};

export const createTask = async (taskData) => {
  try {
    const res = await api.post(`/tasks`, taskData);
    return res.data;
  } catch (error) {
    // Fallback to localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const newTask = { ...taskData, id: Date.now(), _id: Date.now() };
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return newTask;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
  } catch (error) {
    // Fallback to localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = tasks.map(task =>
      task.id === id || task._id === id ? { ...task, ...taskData } : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return { ...taskData, id };
  }
};

export const deleteTask = async (id) => {
  try {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  } catch (error) {
    // Fallback to localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const filteredTasks = tasks.filter(task => task.id !== id && task._id !== id);
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    return { success: true };
  }
};

export const getTasksByUser = async (userId) => {
  try {
    const res = await api.get(`/tasks/user/${userId}`);
    return res.data;
  } catch (error) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks.filter(task => task.assignedTo === userId);
  }
};

// Task Notes Management
export const addNoteToTask = async (taskId, noteData) => {
  const res = await api.post(`/tasks/${taskId}/notes`, noteData);
  return res.data;
};

export const getTaskNotes = async (taskId) => {
  const res = await api.get(`/tasks/${taskId}/notes`);
  return res.data;
};

export const addReactionToNote = async (taskId, noteId, reactionData) => {
  const res = await api.post(`/tasks/${taskId}/notes/${noteId}/reactions`, reactionData);
  return res.data;
};

export const markNoteAsRead = async (taskId, noteId) => {
  const res = await api.patch(`/tasks/${taskId}/notes/${noteId}/read`);
  return res.data;
};

export const getManagerNotesForEmployee = async (employeeId) => {
  const res = await api.get(`/tasks/employee/${employeeId}/manager-notes`);
  return res.data;
};

// Team Leaders Management
export const getAllTeamLeaders = async () => {
  try {
    const res = await api.get(`/team-leaders`);
    return res.data;
  } catch (error) {
    // Fallback to localStorage - check both teamLeaders and users with team-leader role
    let teamLeaders = JSON.parse(localStorage.getItem('teamLeaders') || '[]');

    // Also get users with team-leader role from the users collection
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const teamLeaderUsers = allUsers.filter(user => user.role === 'team-leader');

    // Merge both sources, avoiding duplicates
    const existingEmails = teamLeaders.map(tl => tl.email);
    const newTeamLeaders = teamLeaderUsers.filter(user => !existingEmails.includes(user.email));

    return [...teamLeaders, ...newTeamLeaders];
  }
};

export const createTeamLeader = async (teamLeaderData) => {
  try {
    const res = await api.post(`/team-leaders`, teamLeaderData);
    return res.data;
  } catch (error) {
    // Fallback to localStorage
    const teamLeaders = JSON.parse(localStorage.getItem('teamLeaders') || '[]');
    const newTeamLeader = {
      ...teamLeaderData,
      id: `tl${Date.now()}`,
      _id: `tl${Date.now()}`,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    teamLeaders.push(newTeamLeader);
    localStorage.setItem('teamLeaders', JSON.stringify(teamLeaders));
    return newTeamLeader;
  }
};

export const updateTeamLeader = async (id, teamLeaderData) => {
  try {
    const res = await api.put(`/team-leaders/${id}`, teamLeaderData);
    return res.data;
  } catch (error) {
    // Fallback to localStorage
    const teamLeaders = JSON.parse(localStorage.getItem('teamLeaders') || '[]');
    const updatedTeamLeaders = teamLeaders.map(leader =>
      leader.id === id || leader._id === id ? { ...leader, ...teamLeaderData } : leader
    );
    localStorage.setItem('teamLeaders', JSON.stringify(updatedTeamLeaders));
    return { ...teamLeaderData, id };
  }
};

export const deleteTeamLeader = async (id) => {
  try {
    const res = await api.delete(`/team-leaders/${id}`);
    return res.data;
  } catch (error) {
    // Fallback to localStorage
    const teamLeaders = JSON.parse(localStorage.getItem('teamLeaders') || '[]');
    const filteredTeamLeaders = teamLeaders.filter(leader => leader.id !== id && leader._id !== id);
    localStorage.setItem('teamLeaders', JSON.stringify(filteredTeamLeaders));
    return { success: true };
  }
};

// Custom Roles Management
export const getAllCustomRoles = async () => {
  try {
    const res = await api.get(`/custom-roles`);
    return res.data;
  } catch (error) {
    // Fallback to localStorage if endpoint doesn't exist
    const customRoles = JSON.parse(localStorage.getItem('customRoles') || '[]');
    return customRoles;
  }
};

export const createCustomRole = async (roleData) => {
  try {
    const res = await api.post(`/custom-roles`, roleData);
    return res.data;
  } catch (error) {
    // Fallback to localStorage
    const customRoles = JSON.parse(localStorage.getItem('customRoles') || '[]');
    const newRole = {
      ...roleData,
      id: `role${Date.now()}`,
      _id: `role${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    customRoles.push(newRole);
    localStorage.setItem('customRoles', JSON.stringify(customRoles));
    return newRole;
  }
};

export const deleteCustomRole = async (id) => {
  try {
    const res = await api.delete(`/custom-roles/${id}`);
    return res.data;
  } catch (error) {
    // Fallback to localStorage
    const customRoles = JSON.parse(localStorage.getItem('customRoles') || '[]');
    const filteredRoles = customRoles.filter(role => role.id !== id && role._id !== id);
    localStorage.setItem('customRoles', JSON.stringify(filteredRoles));
    return { success: true };
  }
};

// Dashboard Analytics (fallback to calculated values)
export const getDashboardStats = async () => {
  try {
    const res = await api.get(`/dashboard/stats`);
    return res.data;
  } catch (error) {
    // Calculate stats from available data
    const projects = await getAllProjects();
    const users = await getAllUsers();
    return {
      totalUsers: users.length,
      activeProjects: projects.length,
      totalClients: projects.length, // Approximate
      totalRevenue: projects.reduce((sum, p) => sum + (p.projectCost || 0), 0)
    };
  }
};

export const getProgressData = async () => {
  try {
    const res = await api.get(`/dashboard/progress`);
    return res.data;
  } catch (error) {
    // Return default progress data
    return {
      projectCompletion: [25, 40, 55, 65, 75, 78],
      teamProductivity: [30, 45, 50, 60, 70, 82],
      monthlyTarget: {
        percentage: 75,
        comparison: 10,
        earnings: 3287,
        target: 20000,
        revenue: 20000,
        today: 20000
      }
    };
  }
};

const apiService = {
  getAllProjectManagers,
  getProjectManager,
  createProjectManager,
  updateProjectManager,
  deleteProjectManager,
  assignProjectToManager,
  removeProjectFromManager,
  getProjectManagers,
  getTeamMembers,
  getAllEmployees,
  addProjectManager,
  addTeamMember,
  signup,
  login,
  getMe,
  submitAttendance,
  addMyProjectUpdate,
  updateMyProjectUpdate,
  deleteMyProjectUpdate,
  adminLogin,
  createAdmin,
  pmLogin,
  getPMProfile,
  getPMTeam,
  getPMTeamMember,
  getPointsScheme,
  updatePointsScheme,
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectProgress,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksByUser,
  getAllTeamLeaders,
  createTeamLeader,
  updateTeamLeader,
  deleteTeamLeader,
  getAllCustomRoles,
  createCustomRole,
  deleteCustomRole,
  getDashboardStats,
  getProgressData,
};

export default apiService;
