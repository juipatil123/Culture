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
  return await PMService.getAll();
};

export const getProjectManager = async (id) => {
  return await PMService.getById(id);
};

export const createProjectManager = async (projectManagerData) => {
  return await AuthService.registerUser({ ...projectManagerData, role: 'project-manager' });
};

export const updateProjectManager = async (id, projectManagerData) => {
  return await PMService.update(id, projectManagerData);
};

export const deleteProjectManager = async (id) => {
  return await PMService.delete(id);
};

export const assignProjectToManager = async (managerId, projectId) => {
  // Logic to link project to manager in Firestore
  const manager = await PMService.getById(managerId);
  const projects = manager.assignedProjects || [];
  if (!projects.includes(projectId)) {
    projects.push(projectId);
    await PMService.update(managerId, { assignedProjects: projects });
  }
  return { success: true };
};

export const removeProjectFromManager = async (managerId, projectId) => {
  const manager = await PMService.getById(managerId);
  const projects = (manager.assignedProjects || []).filter(id => id !== projectId);
  await PMService.update(managerId, { assignedProjects: projects });
  return { success: true };
};

// Legacy support
export const getProjectManagers = getAllProjectManagers;
export const addProjectManager = createProjectManager;

// Team Members
export const getTeamMembers = async (searchTerm = '') => {
  const allMembers = await MemberService.getAll();
  if (searchTerm) {
    return allMembers.filter(u =>
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  return allMembers;
};

export const getAllEmployees = async () => {
  return await MemberService.getAll();
};

export const addTeamMember = async (teamMemberData) => {
  return await AuthService.registerUser({ ...teamMemberData, role: teamMemberData.role || 'employee' });
};

// Auth (Bridge to AuthService)
export const signup = async (payload) => {
  // Firebase Auth handles signup via createUserWithEmailAndPassword in authService if implemented
  // For now, redirecting to login logic or just creating the doc
  return { success: true, message: "Use Firebase Console or specific signup logic" };
};

export const login = async (payload) => {
  const { identifier, password, role } = payload;
  return await AuthService.login(identifier, password, role);
};

// Self-service
export const getMe = async () => {
  const user = AuthService.getCurrentUser();
  if (!user) return null;
  // We'd need to know the role to find the profile
  // For now, return basic auth user
  return user;
};

export const submitAttendance = async (status) => {
  const user = AuthService.getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return await DailyWorkService.create({
    userId: user.uid,
    status,
    date: new Date().toISOString().split('T')[0]
  });
};

// Projects
export const getAllProjects = async () => {
  return await ProjectService.getAll();
};

export const getProject = async (id) => {
  return await ProjectService.getById(id);
};

export const createProject = async (projectData) => {
  return await ProjectService.create(projectData);
};

export const updateProject = async (id, projectData) => {
  return await ProjectService.update(id, projectData);
};

export const deleteProject = async (id) => {
  return await ProjectService.delete(id);
};

export const updateProjectProgress = async (id, progress) => {
  return await ProjectService.update(id, { progress });
};

// Users/Employees Management
export const getAllUsers = async () => {
  const members = await MemberService.getAll();
  const tls = await TLService.getAll();
  const pms = await PMService.getAll();
  const admins = await AdminService.getAll();
  return [...members, ...tls, ...pms, ...admins];
};

export const createUser = async (userData) => {
  return await AuthService.registerUser(userData);
};

export const updateUser = async (id, userData) => {
  const role = (userData.role || '').toLowerCase();
  if (role === 'project-manager') return await PMService.update(id, userData);
  if (role === 'team-leader') return await TLService.update(id, userData);
  if (role === 'admin') return await AdminService.update(id, userData);
  return await MemberService.update(id, userData);
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
  // We'd need to check all collections or have a unified users collection
  // For now, attempting delete on MemberService
  return await MemberService.delete(id);
};

// Tasks Management
export const getAllTasks = async () => {
  return await TaskService.getAll();
};

export const createTask = async (taskData) => {
  return await TaskService.create(taskData);
};

export const updateTask = async (id, taskData) => {
  return await TaskService.update(id, taskData);
};

export const deleteTask = async (id) => {
  return await TaskService.delete(id);
};

export const getTasksByUser = async (userId) => {
  const allTasks = await TaskService.getAll();
  return allTasks.filter(task => task.assignedTo === userId || (task.assignedMembers && task.assignedMembers.includes(userId)));
};

// Task Notes Management
export { subscribeToTasks };

export const addNoteToTask = async (taskId, noteData) => {
  const task = await TaskService.getById(taskId);
  const notes = task.notes || [];
  notes.push({ ...noteData, timestamp: new Date().toISOString() });
  return await TaskService.update(taskId, { notes });
};

export const getTaskNotes = async (taskId) => {
  const task = await TaskService.getById(taskId);
  return task ? (task.notes || []) : [];
};

export const addReactionToNote = async (taskId, noteId, reactionData) => {
  const task = await TaskService.getById(taskId);
  const notes = (task.notes || []).map(note =>
    (note.id === noteId) ? { ...note, reactions: [...(note.reactions || []), reactionData] } : note
  );
  return await TaskService.update(taskId, { notes });
};

export const markNoteAsRead = async (taskId, noteId) => {
  const task = await TaskService.getById(taskId);
  const notes = (task.notes || []).map(note =>
    (note.id === noteId) ? { ...note, read: true } : note
  );
  return await TaskService.update(taskId, { notes });
};

export const getManagerNotesForEmployee = async (employeeId) => {
  const allTasks = await TaskService.getAll();
  // Filter for tasks assigned to this employee that have notes from managers
  const relevantNotes = [];
  allTasks.forEach(task => {
    if (task.assignedTo === employeeId && task.notes) {
      relevantNotes.push(...task.notes);
    }
  });
  return relevantNotes;
};

// Team Leaders Management
export const getAllTeamLeaders = async () => {
  return await TLService.getAll();
};

export const createTeamLeader = async (teamLeaderData) => {
  console.log('createTeamLeader API called with:', teamLeaderData);
  return await AuthService.registerUser({ ...teamLeaderData, role: 'team-leader' });
};

export const updateTeamLeader = async (id, teamLeaderData) => {
  return await TLService.update(id, teamLeaderData);
};

export const deleteTeamLeader = async (id) => {
  return await TLService.delete(id);
};

// Custom Roles Management
export const getAllCustomRoles = async () => {
  return await RoleService.getAll();
};

export const createCustomRole = async (roleData) => {
  return await RoleService.create(roleData);
};

export const deleteCustomRole = async (id) => {
  return await RoleService.delete(id);
};

// Dashboard Analytics
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
  // Mocking detailed trend data for now as it requires time-series storage
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
  adminLogin: login, // Mapping adminLogin to unified login
  createAdmin: (data) => AuthService.registerUser({ ...data, role: 'admin' }),
  pmLogin: login,
  getPMProfile: getMe,
  getPMTeam: async () => MemberService.getAll(), // Simplified for now
  getPointsScheme: () => PointsService.getAll(),
  updatePointsScheme: (data) => PointsService.create(data),
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
  getTaskNotes,
  addReactionToNote,
  markNoteAsRead,
  getManagerNotesForEmployee,
  getAllTeamLeaders,
  createTeamLeader,
  updateTeamLeader,
  deleteTeamLeader,
  getAllCustomRoles,
  createCustomRole,
  deleteCustomRole,
  getDashboardStats,
  getProgressData,
  updateUserPassword
};

export default apiService;
