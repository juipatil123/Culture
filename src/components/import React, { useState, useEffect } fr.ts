import React, { useState, useEffect } from 'react';
import AddProjectManagerModal from './AddProjectManagerModal';
import AddUserModal from './AddUserModal';
import AddTaskModal from './AddTaskModal';
import AddProjectModal from './AddProjectModal';
import AddPointsSchemeModal from './AddPointsSchemeModal';
import AddEmployeeModal from './AddEmployeeModal';
import AddTeamLeaderModal from './AddTeamLeaderModal';
import AddRoleModal from './AddRoleModal';
import DailyReports from './DailyReports';
import { 
  getAllProjectManagers,
  createProjectManager,
  updateProjectManager,
  deleteProjectManager,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getAllTeamLeaders,
  createTeamLeader,
  updateTeamLeader,
  deleteTeamLeader,
  getAllCustomRoles,
  createCustomRole,
  deleteCustomRole,
  getDashboardStats,
  getProgressData,
  assignProjectToManager,
  removeProjectFromManager
} from '../services/api';

const MultiRoleDashboard = () => {
  const [currentRole, setCurrentRole] = useState('admin'); // Current dashboard view
  const [originalUserRole, setOriginalUserRole] = useState('admin'); // User's actual role
  const [userName, setUserName] = useState('Admin User');
  const [activeView, setActiveView] = useState('dashboard');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [editingPointsScheme, setEditingPointsScheme] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddProjectManagerModal, setShowAddProjectManagerModal] = useState(false);
  const [editingProjectManager, setEditingProjectManager] = useState(null);
  const [selectedProjectManager, setSelectedProjectManager] = useState(null);
  const [showIndividualDashboard, setShowIndividualDashboard] = useState(false);
  const [activeDetailView, setActiveDetailView] = useState(null); // 'projects', 'members', 'tasks'
  const [projectManagers, setProjectManagers] = useState([]);
  const [pmSearchTerm, setPmSearchTerm] = useState('');
  
  // Filter and sort states for user management
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [userViewMode, setUserViewMode] = useState('list'); // 'list' or 'card'
  const [filterByRole, setFilterByRole] = useState('all');
  const [filterByDepartment, setFilterByDepartment] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [filterByProject, setFilterByProject] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [pmFilterDepartment, setPmFilterDepartment] = useState('all');
  const [customRoles, setCustomRoles] = useState([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [showAddTeamLeaderModal, setShowAddTeamLeaderModal] = useState(false);
  const [editingTeamLeader, setEditingTeamLeader] = useState(null);
  const [teamLeaderSearchTerm, setTeamLeaderSearchTerm] = useState('');
  const [teamLeaderViewMode, setTeamLeaderViewMode] = useState('card'); // 'card' or 'list'
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showAddPerformanceModal, setShowAddPerformanceModal] = useState(false);
  const [performanceData, setPerformanceData] = useState({});
  const [showEditPerformanceModal, setShowEditPerformanceModal] = useState(false);
  const [editingPerformanceUser, setEditingPerformanceUser] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pointsSchemes, setPointsSchemes] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [progressData, setProgressData] = useState({
    projectCompletion: [],
    teamProductivity: [],
    monthlyTarget: {
      percentage: 0,
      comparison: 0,
      earnings: 0,
      target: 0,
      revenue: 0,
      today: 0
    }
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    totalClients: 0,
    totalRevenue: 0
  });
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingProjectManagers, setLoadingProjectManagers] = useState(false);
  const [showTaskAssignModal, setShowTaskAssignModal] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState(null);
  const [showProjectUpdateModal, setShowProjectUpdateModal] = useState(false);
  const [projectViewMode, setProjectViewMode] = useState('card'); // 'card' or 'list'
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'task',
      title: 'New Task Assigned',
      message: 'Complete Admin UI Design has been assigned to you',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'update',
      title: 'Project Update Required',
      message: 'Weekly update needed for E-commerce Platform project',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'deadline',
      title: 'Deadline Approaching',
      message: 'Database Migration task due tomorrow',
      time: '3 hours ago',
      read: true
    }
  ]);

  // Load project managers from database
  const loadProjectManagers = async () => {
    setLoadingProjectManagers(true);
    try {
      const managersData = await getAllProjectManagers();
      setProjectManagers(managersData);
      
      // Add project managers to allUsers for unified user management
      const pmUsers = managersData.map(pm => ({
        ...pm,
        role: 'project-manager',
        userType: 'Project Manager',
        payroll: pm.payroll || `PM${pm.id?.slice(-3) || '001'}`
      }));
      
      // Update allUsers to include project managers
      setAllUsers(prev => {
        const existingIds = prev.map(user => user.id);
        const newPMs = pmUsers.filter(pm => !existingIds.includes(pm.id));
        return [...prev, ...newPMs];
      });
    } catch (error) {
      console.error('Error loading project managers:', error);
    } finally {
      setLoadingProjectManagers(false);
    }
  };

  // Load all data from database
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await getAllUsers();
      console.log('Loaded users data:', usersData);
      
      // Ensure all users have required fields
      const normalizedUsers = usersData.map(user => ({
        ...user,
        phone: user.phone || user.phoneNumber || '',
        phoneNumber: user.phone || user.phoneNumber || '',
        department: user.department || '', // Keep original department, don't add default
        role: user.role || '',
        userType: user.userType || user.role || '',
        assignedProject: user.assignedProject || null,
        projectStatus: user.assignedProject ? 'Assigned' : 'Not Assigned',
        status: user.status || 'Active',
        joinDate: user.joinDate || new Date().toISOString().split('T')[0]
      }));
      
      setAllUsers(normalizedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      // Don't show alert for loading errors, just log them
      // Users will start with empty array which is fine
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const tasksData = await getAllTasks();
      setAssignedTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Start with empty array, tasks can be added via form
      setAssignedTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const [statsData, progressDataResponse] = await Promise.all([
        getDashboardStats(),
        getProgressData()
      ]);
      setDashboardStats(statsData);
      setProgressData(progressDataResponse);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Continue with default values if stats fail to load
    } finally {
      setLoadingStats(false);
    }
  };

  // Load projects from database
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await getAllProjects();
      // Transform the data to match the expected format
      const transformedProjects = projectsData.map(project => ({
        id: project._id,
        name: project.name,
        date: new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        progress: project.progress || 0,
        status: project.projectStatus === 'on-track' ? 'On Track' :
                project.projectStatus === 'at-risk' ? 'At Risk' :
                project.projectStatus === 'delayed' ? 'Delayed' :
                project.projectStatus === 'completed' ? 'Completed' : 'On Track',
        assigned: project.assignedMembers && project.assignedMembers.length > 0 
          ? project.assignedMembers.map((member, index) => ({
              name: member,
              color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][index % 5]
            }))
          : [{ name: project.projectManager, color: 'bg-primary' }],
        extra: project.assignedMembers && project.assignedMembers.length > 3 ? project.assignedMembers.length - 3 : 0,
        clientName: project.clientName,
        startDate: project.startDate,
        endDate: project.endDate,
        description: project.description,
        projectCost: project.projectCost,
        advancePayment: project.advancePayment,
        projectManager: project.projectManager
      }));
      setProjects(transformedProjects);
      
      // Sync user assignments with loaded projects
      syncUserProjectAssignments(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      alert('Failed to load projects. Please try again.');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Function to sync user project assignments
  const syncUserProjectAssignments = (projectsData) => {
    setAllUsers(prev => prev.map(user => {
      // Find if user is assigned to any project
      const assignedProject = projectsData.find(project => 
        project.projectManager === user.name || 
        (project.assignedMembers && project.assignedMembers.includes(user.name))
      );
      
      if (assignedProject) {
        return {
          ...user,
          projectStatus: 'Assigned',
          assignedProject: assignedProject.name
        };
      } else {
        return {
          ...user,
          projectStatus: 'Not Assigned',
          assignedProject: null
        };
      }
    }));
  };

  useEffect(() => {
    // Get user role from localStorage
    const storedRole = localStorage.getItem('userRole') || 'admin';
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    
    // Treat interns as employees
    const effectiveRole = storedRole === 'intern' ? 'employee' : storedRole;
    setCurrentRole(effectiveRole);
    
    if (adminAuth.admin) {
      setUserName(adminAuth.admin.username || 'Admin User');
    } else {
      const email = localStorage.getItem('userEmail') || 'user@company.com';
      const name = email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }

    // Load all data from database
    const loadAllData = async () => {
      await Promise.all([
        loadProjects(),
        loadUsers(),
        loadTasks(),
        loadDashboardStats(),
        loadProjectManagers()
      ]);
      // Load workflow data after projects and users are loaded
      await loadWorkflowData();
    };
    
    loadAllData();
    loadTeamLeaders();
    loadCustomRoles();
  }, []);

  // Initialize user role from localStorage
  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole') || 'admin';
    setOriginalUserRole(storedUserRole);
    // Treat interns as employees for dashboard purposes
    const effectiveRole = storedUserRole === 'intern' ? 'employee' : storedUserRole;
    setCurrentRole(effectiveRole); // Start with effective role
  }, []);

  // Load team leaders
  const loadTeamLeaders = async () => {
    try {
      const teamLeadersData = await getAllTeamLeaders();
      setTeamLeaders(teamLeadersData);
      
      // Add team leaders to allUsers for unified user management
      const teamLeaderUsers = teamLeadersData.map(leader => ({
        ...leader,
        role: 'team-leader',
        userType: 'Team Leader',
        payroll: leader.payroll || `TL${leader.id?.slice(-3) || '001'}`
      }));
      
      // Update allUsers to include team leaders
      setAllUsers(prev => {
        const existingIds = prev.map(user => user.id);
        const newTeamLeaders = teamLeaderUsers.filter(leader => !existingIds.includes(leader.id));
        return [...prev, ...newTeamLeaders];
      });
    } catch (error) {
      console.error('Error loading team leaders:', error);
      setTeamLeaders([]);
    }
  };

  // Load custom roles
  const loadCustomRoles = async () => {
    try {
      const customRolesData = await getAllCustomRoles();
      setCustomRoles(customRolesData);
    } catch (error) {
      console.error('Error loading custom roles:', error);
      // Initialize with empty array if loading fails
      setCustomRoles([]);
    }
  };

  // Utility function to format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Utility function to format percentage
  const formatPercentage = (num) => {
    return `${Math.round(num * 10) / 10}%`;
  };

  // Role configurations with improved KPI design
  const roles = {
    'admin': {
      title: 'Admin Panel',
      menu: [
        { icon: 'fas fa-home', text: 'Dashboard', active: true },
        { icon: 'fas fa-users', text: 'User Management' },
        { icon: 'fas fa-user-tie', text: 'Project Manager Management' },
        { icon: 'fas fa-users-cog', text: 'Team Leader Management' },
        { icon: 'fas fa-user-shield', text: 'Role Management' },
        { icon: 'fas fa-tasks', text: 'All Projects' },
        { icon: 'fas fa-chart-bar', text: 'Analytics' },
        { icon: 'fas fa-trophy', text: 'Points Scheme' },
        { icon: 'fas fa-cog', text: 'System Settings' }
      ],
      stats: [
        { 
          title: 'Active Users', 
          value: formatNumber(allUsers.length), 
          icon: 'fas fa-users', 
          color: 'success', 
          trend: '+12%',
          clickable: true,
          ariaLabel: `${allUsers.length} active users in system`
        },
        { 
          title: 'Active Projects', 
          value: formatNumber(projects.length), 
          icon: 'fas fa-project-diagram', 
          color: 'success', 
          trend: '+8%',
          clickable: true,
          ariaLabel: `${projects.length} active projects`
        },
        { 
          title: 'Total Clients', 
          value: formatNumber(dashboardStats.totalClients), 
          icon: 'fas fa-user-friends', 
          color: 'success', 
          trend: '+5%',
          clickable: true,
          ariaLabel: `${dashboardStats.totalClients} total clients`
        },
        { 
          title: 'Revenue', 
          value: `$${formatNumber(dashboardStats.totalRevenue)}`, 
          icon: 'fas fa-dollar-sign', 
          color: 'success', 
          trend: '+15%',
          clickable: true,
          ariaLabel: `$${dashboardStats.totalRevenue.toLocaleString()} total revenue`
        }
      ]
    },
    'project-manager': {
      title: 'Project Manager Dashboard',
      menu: [
        { icon: 'fas fa-home', text: 'Dashboard', active: true },
        { icon: 'fas fa-project-diagram', text: 'My Projects' },
        { icon: 'fas fa-users-cog', text: 'Team Leader Management' },
        { icon: 'fas fa-tasks', text: 'Task Assignment' },
        { icon: 'fas fa-chart-pie', text: 'Progress Reports' },
        { icon: 'fas fa-calendar-alt', text: 'Schedule' }
      ],
      stats: [
        { 
          title: 'Total Users', 
          value: formatNumber(allUsers.length), 
          icon: 'fas fa-users', 
          color: 'success', 
          trend: '+3%',
          clickable: true,
          ariaLabel: `${allUsers.length} total users`
        },
        { 
          title: 'Active Projects', 
          value: formatNumber(projects.filter(project => project.status === 'On Track' || project.status === 'At Risk').length), 
          icon: 'fas fa-project-diagram', 
          color: 'success', 
          trend: '+2%',
          clickable: true,
          ariaLabel: `${projects.filter(project => project.status === 'On Track' || project.status === 'At Risk').length} active projects`
        },
        { 
          title: 'Active Users', 
          value: formatNumber(allUsers.filter(user => user.status === 'Active' || !user.status).length), 
          icon: 'fas fa-user-check', 
          color: 'warning', 
          trend: '+10%',
          ariaLabel: `${allUsers.filter(user => user.status === 'Active' || !user.status).length} active users`
        },
        { 
          title: 'Assigned Tasks', 
          value: formatNumber(assignedTasks.filter(task => task.status === 'assigned' || task.status === 'pending' || task.status === 'in-progress').length), 
          icon: 'fas fa-tasks', 
          color: 'success', 
          trend: '+18%',
          ariaLabel: `${assignedTasks.filter(task => task.status === 'assigned' || task.status === 'pending' || task.status === 'in-progress').length} assigned tasks`
        }
      ]
    },
    'team-leader': {
      title: 'Team Leader Dashboard',
      menu: [
        { icon: 'fas fa-home', text: 'Dashboard', active: true },
        { icon: 'fas fa-users', text: 'My Team' },
        { icon: 'fas fa-tasks', text: 'Task Management' },
        { icon: 'fas fa-chart-bar', text: 'Performance' },
        { icon: 'fas fa-file-alt', text: 'Daily Reports' }
      ],
      stats: [
        { 
          title: 'Active Users', 
          value: formatNumber(allUsers.length), 
          icon: 'fas fa-users', 
          color: 'success', 
          trend: '+12%',
          clickable: true,
          ariaLabel: `${allUsers.length} active users`
        },
        { 
          title: 'Assigned Tasks', 
          value: formatNumber(assignedTasks.length), 
          icon: 'fas fa-tasks', 
          color: 'primary', 
          trend: '+8',
          clickable: true,
          ariaLabel: `${assignedTasks.length} assigned tasks`
        },
        { 
          title: 'Performance', 
          value: '92%', 
          icon: 'fas fa-chart-line', 
          color: 'success', 
          trend: '+5%',
          clickable: true,
          ariaLabel: '92% team performance score'
        },
        { 
          title: 'Team Points', 
          value: formatNumber(pointsSchemes.reduce((sum, s) => sum + s.points, 0)), 
          icon: 'fas fa-trophy', 
          color: 'warning', 
          trend: '+15',
          clickable: true,
          ariaLabel: `${pointsSchemes.reduce((sum, s) => sum + s.points, 0)} team points`
        }
      ]
    },
    'employee': {
      title: 'Employee Dashboard',
      menu: [
        { icon: 'fas fa-home', text: 'Dashboard', active: true },
        { icon: 'fas fa-clock', text: 'Time Tracking' },
        { icon: 'fas fa-comments', text: 'Team Communication' },
        { icon: 'fas fa-file-export', text: 'Submit Work' }
      ],  
      stats: [
        { 
          title: 'Assigned', 
          value: formatNumber(assignedTasks.length), 
          icon: 'fas fa-tasks', 
          color: 'primary', 
          trend: '+3',
          clickable: true,
          ariaLabel: `${assignedTasks.length} assigned tasks`
        },
        { 
          title: 'Completed', 
          value: formatNumber(assignedTasks.filter(task => task.status === 'completed').length), 
          icon: 'fas fa-check-circle', 
          color: 'success', 
          trend: '+8',
          ariaLabel: `${assignedTasks.filter(task => task.status === 'completed').length} completed tasks`
        },
        { 
          title: 'In Progress', 
          value: formatNumber(assignedTasks.filter(task => task.status === 'in-progress').length), 
          icon: 'fas fa-clock', 
          color: 'warning', 
          trend: '+2',
          ariaLabel: `${assignedTasks.filter(task => task.status === 'in-progress').length} tasks in progress`
        },
        { 
          title: 'Pending', 
          value: formatNumber(assignedTasks.filter(task => task.status === 'pending').length), 
          icon: 'fas fa-hourglass-half', 
          color: 'danger', 
          trend: '-1',
          ariaLabel: `${assignedTasks.filter(task => task.status === 'pending').length} pending tasks`
        }
      ]
    }
  };

  const handleLogout = () => {
    // Clear all authentication data for all user types
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('pmToken');
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('teamLeaderToken');
    localStorage.removeItem('isAuthenticated');
    
    // Reset component state
    setCurrentRole('admin');
    setUserName('Admin User');
    setActiveView('dashboard');
    
    // Redirect to login
    window.location.href = '/login';
  };

  const handleRoleSwitch = (role) => {
    // Define role hierarchy and access permissions
    const roleHierarchy = {
      'admin': ['admin', 'project-manager', 'team-leader', 'employee'],
      'project-manager': ['project-manager', 'team-leader', 'employee'],
      'team-leader': ['team-leader', 'employee'],
      'employee': ['employee'],
      'intern': ['employee'] // Interns can only access employee dashboard
    };
    
    // Use originalUserRole for permission checking, not currentRole
    const allowedRoles = roleHierarchy[originalUserRole] || ['employee'];
    
    // Automatically redirect interns to employee dashboard
    if (originalUserRole === 'intern') {
      setCurrentRole('employee');
      setActiveView('dashboard');
      return;
    }
    
    // Only allow role switch if the target role is in the allowed list
    if (allowedRoles.includes(role)) {
      setCurrentRole(role);
      setActiveView('dashboard'); // Reset to dashboard view when switching roles
      // Don't overwrite localStorage - keep original user role intact
    } else {
      alert(`Access denied. You don't have permission to access the ${role} dashboard.`);
    }
  };

  const handleCardClick = (cardTitle) => {
    if (cardTitle === 'Total Employees') {
      setActiveView('employees');
    } else if (cardTitle === 'Total Users') {
      setActiveView('employees');
    } else if (cardTitle === 'Active Users') {
      setActiveView('employees');
    } else if (cardTitle === 'Active Projects') {
      setActiveView('projects');
    } else if (cardTitle === 'Total Projects') {
      setActiveView('projects');
    } else if (cardTitle === 'Total Clients') {
      setActiveView('client-dashboard');
    } else if (cardTitle === 'Total Revenue' || cardTitle === 'Revenue') {
      setActiveView('revenue');
    } else if (cardTitle === 'Monthly Target') {
      setActiveView('monthly-target');
    } else if (cardTitle === 'Assigned Tasks') {
      setActiveView('assigned-tasks');
    } else if (cardTitle === 'Team Points') {
      setActiveView('points-scheme');
    } else if (cardTitle === 'Performance') {
      setActiveView('performance');
    }
  };

  const handleMenuClick = (menuItem) => {
    if (menuItem === 'Dashboard') {
      setActiveView('dashboard');
    } else if (menuItem === 'Points Scheme') {
      setActiveView('points-scheme');
    } else if (menuItem === 'User Management') {
      setActiveView('employees');
    } else if (menuItem === 'Project Manager Management') {
      setActiveView('project-managers');
    } else if (menuItem === 'Team Leader Management') {
      setActiveView('team-leaders');
    } else if (menuItem === 'Role Management') {
      setActiveView('role-management');
    } else if (menuItem === 'All Projects') {
      setActiveView('projects');
    } else if (menuItem === 'My Projects') {
      setActiveView('projects');
    } else if (menuItem === 'My Team') {
      // For Project Manager role, show the PM employee management section
      if (currentRole === 'project-manager') {
        setPmActiveSection('members');
      } else {
        setActiveView('employees');
      }
    } else if (menuItem === 'Analytics') {
      setActiveView('revenue');
    } else if (menuItem === 'Performance') {
      setActiveView('performance');
    } else if (menuItem === 'Task Management') {
      setActiveView('assigned-tasks');
    } else if (menuItem === 'Task Assignment') {
      // For Project Manager role, show the PM task management section
      if (currentRole === 'project-manager') {
        setPmActiveSection('tasks');
      } else {
        setActiveView('assigned-tasks');
      }
    } else if (menuItem === 'Daily Reports') {
      setActiveView('daily-reports');
    } else {
      console.log('Menu clicked:', menuItem);
    }
  };

  const handleAddPointsScheme = () => {
    setEditingPointsScheme(null);
    setShowAddPointsModal(true);
  };

  const handleEditPointsScheme = (scheme) => {
    setEditingPointsScheme(scheme);
    setShowAddPointsModal(true);
  };

  const handleDeletePointsScheme = (schemeId) => {
    if (window.confirm('Are you sure you want to delete this points scheme?')) {
      setPointsSchemes(prev => prev.filter(scheme => scheme.id !== schemeId));
    }
  };


  const handleSavePointsScheme = (schemeData) => {
    if (editingPointsScheme) {
      // Update existing scheme
      setPointsSchemes(prev => prev.map(scheme => 
        scheme.id === editingPointsScheme.id 
          ? { ...schemeData, id: editingPointsScheme.id }
          : scheme
      ));
    } else {
      // Add new scheme
      const newId = Math.max(...pointsSchemes.map(p => p.id), 0) + 1;
      const schemeToAdd = {
        ...schemeData,
        id: newId
      };
      setPointsSchemes(prev => [...prev, schemeToAdd]);
    }
    setEditingPointsScheme(null);
  };

  const handleAddEmployee = async (employeeData) => {
    // Validate that name exists and is a string
    if (!employeeData.name || typeof employeeData.name !== 'string') {
      console.error('Employee name is required and must be a string');
      return;
    }

    const newUser = {
      ...employeeData,
      role: employeeData.role || 'employee', // Ensure role is set, default to 'employee'
      payroll: `EMP${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      avatar: employeeData.name.trim().split(' ').map(n => n[0]).join('').toUpperCase(),
      projectIds: [],
      status: 'Active',
      projectStatus: 'Not Assigned'
    };

    try {
      // Save to database
      const savedUser = await createUser(newUser);
      console.log('Employee created successfully:', savedUser);
      
      // Update local state with the saved user
      const userWithId = {
        ...newUser,
        ...savedUser,
        id: savedUser.id || savedUser._id || `EMP${String(allUsers.length + 1).padStart(3, '0')}`,
        assignedProject: employeeData.assignedProject || null,
        projectStatus: employeeData.assignedProject ? 'Assigned' : 'Not Assigned',
        userType: 'Employee'
      };
      
      setAllUsers(prev => [...prev, userWithId]);
      
      // Add notification for admin
      addNotification({
        type: 'user',
        title: 'New Employee Added',
        message: `${userWithId.name} has been added as an Employee in ${userWithId.department} department`,
        timestamp: new Date().toISOString(),
        priority: 'medium'
      });
      setEmployees(prev => [...prev, userWithId]);
      
      // Show success notification
      const notification = {
        id: `notif${Date.now()}`,
        type: 'success',
        title: 'Employee Added',
        message: `${newUser.name} has been successfully added as ${newUser.role}`,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
      
    } catch (apiError) {
      console.warn('API call failed, using local fallback:', apiError);
      const userWithId = {
        ...newUser,
        id: `EMP${String(allUsers.length + 1).padStart(3, '0')}`,
        _id: Date.now()
      };
      setAllUsers(prev => [...prev, userWithId]);
      setEmployees(prev => [...prev, userWithId]);
    }
  };

  const getEmployeesByRole = (role) => {
    return employees.filter(emp => emp.role === role);
  };

  const getVisibleEmployees = () => {
    if (currentRole === 'admin') {
      return employees; // Admin sees all employees
    } else if (currentRole === 'project-manager') {
      return employees; // PM sees all employees and team leaders
    } else if (currentRole === 'team-leader') {
      // Team leader sees only their team members
      const currentUser = employees.find(emp => emp.email === localStorage.getItem('userEmail'));
      if (currentUser) {
        return employees.filter(emp => 
          emp.teamLeaderId === currentUser.id || emp.id === currentUser.id
        );
      }
      return [];
    }
    return [];
  };

  const handleAssignToTeam = (employeeId, teamLeaderId) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, teamLeaderId }
        : emp
    ));
  };

  // Project Management Functions
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowAddProjectModal(true);
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      try {
        await deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        
        // Unassign users from the deleted project
        setAllUsers(prev => prev.map(user => {
          if (user.assignedProject === projectName) {
            return {
              ...user,
              projectStatus: 'Not Assigned',
              assignedProject: null
            };
          }
          return user;
        }));
        
        alert(`Project "${projectName}" has been deleted successfully!`);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleViewProject = (project) => {
    alert(`Project Details:\n\nName: ${project.name}\nClient: ${project.clientName}\nManager: ${project.projectManager}\nProgress: ${project.progress}%\nStatus: ${project.status}\nCost: $${project.projectCost}\nStart: ${project.startDate}\nEnd: ${project.endDate}\nDescription: ${project.description || 'No description'}`);
  };

  const handleAddProject = async (projectData) => {
    try {
      // Transform data to match backend API expectations
      const transformedData = {
        name: projectData.name,
        description: projectData.description || '',
        clientName: projectData.clientName,
        projectManager: projectData.projectManager,
        assignedMembers: projectData.assignedMembers || [],
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        projectCost: parseFloat(projectData.projectCost) || 0,
        advancePayment: parseFloat(projectData.advancePayment) || 0,
        progress: parseInt(projectData.progress) || 0,
        projectStatus: projectData.projectStatus === 'available' ? 'on-track' : projectData.projectStatus || 'on-track'
      };

      console.log('Sending project data:', transformedData);
      
      // Save to MongoDB
      const savedProject = await createProject(transformedData);
      

      // Transform and add to projects (for active projects view)
      const newProject = {
        id: savedProject._id,
        name: savedProject.name,
        date: new Date(savedProject.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        progress: savedProject.progress || 0,
        status: savedProject.projectStatus === 'on-track' ? 'On Track' :
                savedProject.projectStatus === 'at-risk' ? 'At Risk' :
                savedProject.projectStatus === 'delayed' ? 'Delayed' :
                savedProject.projectStatus === 'completed' ? 'Completed' : 'On Track',
        assigned: savedProject.assignedMembers && savedProject.assignedMembers.length > 0 
          ? savedProject.assignedMembers.map((member, index) => ({
              name: member,
              color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][index % 5]
            }))
          : [{ name: savedProject.projectManager, color: 'bg-primary' }],
        extra: 0,
        clientName: savedProject.clientName,
        startDate: savedProject.startDate,
        endDate: savedProject.endDate,
        description: savedProject.description,
        projectCost: savedProject.projectCost,
        advancePayment: savedProject.advancePayment,
        projectManager: savedProject.projectManager
      };
      setProjects(prev => [...prev, newProject]);
      
      // Update user assignments if project manager is assigned
      if (savedProject.projectManager) {
        setAllUsers(prev => prev.map(user => {
          if (user.name === savedProject.projectManager) {
            return {
              ...user,
              projectStatus: 'Assigned',
              assignedProject: savedProject.name
            };
          }
          return user;
        }));
      }

      // Update assigned members if any
      if (savedProject.assignedMembers && savedProject.assignedMembers.length > 0) {
        setAllUsers(prev => prev.map(user => {
          if (savedProject.assignedMembers.includes(user.name)) {
            return {
              ...user,
              projectStatus: 'Assigned',
              assignedProject: savedProject.name
            };
          }
          return user;
        }));
      }
      
      // Show success message
      const notification = {
        id: `notif${Date.now()}`,
        type: 'success',
        title: 'Project Added',
        message: `Project "${transformedData.name}" has been added successfully`,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
      
      alert(`Project "${transformedData.name}" has been added successfully and saved to database!`);
    } catch (error) {
      console.error('Error adding project:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to add project: ${errorMessage}`);
    }
  };

  // User Management Functions
  const handleAddUser = async (userData) => {
    console.log('Adding user with data:', userData);
    console.log('Department from form:', userData.department);
    console.log('Role from form:', userData.role);
    
    try {
      const newUser = {
        name: userData.name,
        role: userData.role || '', // Job role (e.g., "Senior Frontend Developer")
        email: userData.email,
        phone: userData.phone || '', // Add phone number
        phoneNumber: userData.phone || '', // Also save as phoneNumber for compatibility
        password: userData.password || 'defaultPassword123', // Add default password
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`,
        manager: null, // No specific manager for admin-created users
        attendance: {
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0
        },
        meetingAttendance: {
          attended: 0,
          missed: 0,
          percentage: 0
        },
        recentActivity: [],
        dailyPerformance: {
          overallRating: 0,
          tasksCompleted: 0,
          codeQuality: 0,
          collaboration: 0,
          innovation: 0,
          recentScores: []
        },
        projectUpdates: [],
        // Keep the original fields for compatibility
        department: userData.department || '', // Department (e.g., "Web Developer")
        userType: userData.role || userData.department || '', // For display purposes
        projectStatus: userData.assignedProject ? 'Assigned' : 'Not Assigned',
        assignedProject: userData.assignedProject || null,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      
      console.log('Saving user with department:', newUser.department);
      console.log('Saving user with role:', newUser.role);
      

      try {
        const savedUser = await createUser(newUser);
        // Ensure the user has an ID for display and preserve all fields
        const userWithId = {
          ...newUser,
          ...savedUser,
          id: savedUser.id || savedUser._id || `EMP${String(allUsers.length + 1).padStart(3, '0')}`,
          assignedProject: userData.assignedProject || null,
          projectStatus: userData.assignedProject ? 'Assigned' : 'Not Assigned'
        };
        setAllUsers(prev => [...prev, userWithId]);
        alert(`User "${userData.name}" has been added successfully and saved to database!`);
        setShowAddUserModal(false);
      } catch (apiError) {
        // Fallback: Add to local state with generated ID
        console.warn('API call failed, using local fallback:', apiError);
        const userWithId = {
          ...newUser,
          id: `EMP${String(allUsers.length + 1).padStart(3, '0')}`,
          _id: Date.now()
        };
        setAllUsers(prev => [...prev, userWithId]);
        alert(`User "${userData.name}" has been added successfully (local storage)!`);
        setShowAddUserModal(false);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please try again.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUserModal(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
      const updatedUserData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        phoneNumber: userData.phone || '',
        department: userData.department,
        role: userData.role,
        projectStatus: userData.assignedProject ? 'Assigned' : 'Not Assigned',
        assignedProject: userData.assignedProject || null
      };

      const userId = editingUser.id || editingUser._id;
      
      // Try to update via API if user has a real database ID
      if (userId && !userId.startsWith('EMP')) {
        const updatedUser = await updateUser(userId, updatedUserData);
        setAllUsers(prev => prev.map(user => 
          (user.id === userId || user._id === userId) ? 
          { ...user, ...updatedUser, ...updatedUserData } : user
        ));
      } else {
        // Update local state for generated IDs
        setAllUsers(prev => prev.map(user => 
          (user.id === userId || user._id === userId) ? 
          { ...user, ...updatedUserData } : user
        ));
      }
      
      alert(`User "${userData.name}" has been updated successfully!`);
      setEditingUser(null);
      setShowAddUserModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      // Fallback: update local state even if API fails
      const userId = editingUser.id || editingUser._id;
      setAllUsers(prev => prev.map(user => 
        (user.id === userId || user._id === userId) ? 
        { ...user, ...userData, projectStatus: userData.assignedProject ? 'Assigned' : 'Not Assigned' } : user
      ));
      alert(`User "${userData.name}" has been updated locally. API update may have failed.`);
      setEditingUser(null);
      setShowAddUserModal(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      try {
        // Try to delete from API if userId exists and is not a generated EMP ID
        if (userId && !userId.startsWith('EMP')) {
          await deleteUser(userId);
        }
        // Remove from local state regardless
        setAllUsers(prev => prev.filter(user => 
          (user.id !== userId) && (user._id !== userId)
        ));
        alert(`User "${userName}" has been deleted successfully!`);
      } catch (error) {
        console.error('Error deleting user:', error);
        // Still remove from local state even if API call fails
        setAllUsers(prev => prev.filter(user => 
          (user.id !== userId) && (user._id !== userId)
        ));
        alert(`User "${userName}" has been deleted from local view. API deletion may have failed.`);
      }
    }
  };

  // Task Management Functions
  const handleAddTask = async (taskData) => {
    try {
      const savedTask = await createTask(taskData);
      setAssignedTasks(prev => [...prev, savedTask]);
      alert(`Task "${taskData.title}" has been added successfully and saved to database!`);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowAddTaskModal(true);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const updatedTask = await updateTask(editingTask.id, taskData);
      setAssignedTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
      alert(`Task "${taskData.title}" has been updated successfully!`);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`)) {
      try {
        await deleteTask(taskId);
        setAssignedTasks(prev => prev.filter(task => 
          (task.id !== taskId) && (task._id !== taskId)
        ));
        alert(`Task "${taskTitle}" has been deleted successfully!`);
      } catch (error) {
        console.error('Error deleting task:', error);
        setAssignedTasks(prev => prev.filter(task => 
          (task.id !== taskId) && (task._id !== taskId)
        ));
        alert('Failed to delete task from server, but removed from local view.');
      }
    }
  };

  // Project Workflow Functions
  const loadWorkflowData = async () => {
    try {
      // Load project updates, tasks, and assignments
      const currentUser = localStorage.getItem('userEmail') || 'admin@company.com';
      const currentUserRole = localStorage.getItem('userRole') || 'admin';
      
      // Mock data - in production, these would come from API calls
      const mockProjectUpdates = [
        {
          id: 'pu1',
          projectId: projects[0]?.id,
          projectName: projects[0]?.name || 'E-learning Platform',
          employeeName: 'John Doe',
          employeeId: 'emp1',
          updateDate: new Date().toISOString().split('T')[0],
          status: 'in-progress',
          description: 'Completed UI mockups for admin dashboard',
          completionPercentage: 25,
          nextSteps: 'Start implementing responsive design',
          blockers: 'Waiting for design approval'
        }
      ];
      
      const mockDailyTasks = [
        {
          id: 'dt1',
          title: 'Complete Admin UI Design',
          description: 'Finish the admin dashboard UI components',
          projectId: projects[0]?.id,
          projectName: projects[0]?.name || 'E-learning Platform',
          assignedTo: currentUser,
          assignedBy: 'project.manager@company.com',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'high',
          status: 'pending',
          estimatedHours: 8,
          actualHours: 0,
          createdAt: new Date().toISOString()
        },
        {
          id: 'dt2',
          title: 'Fix Login Authentication Bug',
          description: 'Resolve the authentication issue in login component',
          projectId: projects[0]?.id,
          projectName: projects[0]?.name || 'E-learning Platform',
          assignedTo: currentUser,
          assignedBy: 'project.manager@company.com',
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'medium',
          status: 'in-progress',
          estimatedHours: 4,
          actualHours: 2,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const mockTeamAssignments = allUsers.map(user => {
        const userProjects = projects.filter(project => 
          project.assignedMembers?.some(member => member.name === user.name) ||
          project.projectManager === user.name
        );
        return {
          employeeId: user.id || user._id,
          employeeName: user.name,
          assignedProjects: userProjects,
          role: user.role,
          teamLeader: user.teamLeaderId ? allUsers.find(u => u.id === user.teamLeaderId)?.name : null
        };
      });
      
      setProjectUpdates(mockProjectUpdates);
      setDailyTasks(mockDailyTasks);
      setTeamAssignments(mockTeamAssignments);
      
    } catch (error) {
      console.error('Error loading workflow data:', error);
    }
  };

  const handleProjectUpdate = async (updateData) => {
    try {
      const newUpdate = {
        id: `pu${Date.now()}`,
        ...updateData,
        employeeName: localStorage.getItem('userName') || 'Current User',
        employeeId: localStorage.getItem('userId') || 'current_user',
        updateDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      setProjectUpdates(prev => [...prev, newUpdate]);
      
      // Update project progress if provided
      if (updateData.completionPercentage) {
        setProjects(prev => prev.map(project => 
          project.id === updateData.projectId 
            ? { ...project, progress: updateData.completionPercentage }
            : project
        ));
      }
      
      alert('Project update submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting project update:', error);
      alert('Failed to submit project update. Please try again.');
    }
  };

  const getEmployeeProjects = (employeeEmail) => {
    return teamAssignments.find(assignment => 
      allUsers.find(user => user.email === employeeEmail)?.name === assignment.employeeName
    )?.assignedProjects || [];
  };

  // Helper function to check if a user is assigned to a task (handles both string and array formats)
  const isUserAssignedToTask = (task, userName) => {
    if (!task.assignedTo) return false;
    if (Array.isArray(task.assignedTo)) {
      return task.assignedTo.includes(userName);
    }
    return task.assignedTo === userName;
  };

  const getEmployeeTasks = (employeeEmail) => {
    return dailyTasks.filter(task => isUserAssignedToTask(task, employeeEmail));
  };

  const getProjectManagerProjects = (managerEmail) => {
    const managerName = allUsers.find(user => user.email === managerEmail)?.name;
    return projects.filter(project => project.projectManager === managerName);
  };

  const getTeamLeaderEmployees = (teamLeaderEmail) => {
    const teamLeaderName = allUsers.find(user => user.email === teamLeaderEmail)?.name;
    return teamAssignments.filter(assignment => assignment.teamLeader === teamLeaderName);
  };

  // Handle notification actions
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Add notification helper function
  const addNotification = (notificationData) => {
    const notification = {
      id: Date.now(),
      ...notificationData,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Export users to CSV
  const exportUsers = () => {
    const csvData = filteredAndSortedUsers.map(user => ({
      Name: user.name,
      ID: user.payroll || user.id,
      Email: user.email,
      Department: user.department,
      UserType: user.userType || user.role,
      Status: user.status || 'Active',
      Project: user.assignedProject || 'Not Assigned',
      JoinDate: user.joinDate || new Date().toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get unique departments for filter
  const getUniqueDepartments = () => {
    const departments = [...new Set(allUsers.map(user => user.department).filter(Boolean))];
    return departments.sort();
  };

  // Get unique roles for filter
  const getUniqueRoles = () => {
    const roles = [...new Set(allUsers.map(user => user.userType || user.role).filter(Boolean))];
    return roles.sort();
  };

  // Get unique projects for filter
  const getUniqueProjects = () => {
    const projects = [...new Set(allUsers.map(user => user.assignedProject).filter(Boolean))];
    return projects.sort();
  };

  // Filter and sort users
  const filteredAndSortedUsers = allUsers
    .filter(user => {
      const matchesSearch = !userSearchTerm || 
        user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.payroll?.toLowerCase().includes(userSearchTerm.toLowerCase());
      
      const matchesRole = filterByRole === 'all' || 
        (user.userType || user.role) === filterByRole;
      
      const matchesDepartment = filterByDepartment === 'all' || 
        user.department === filterByDepartment;
      
      const matchesStatus = filterByStatus === 'all' || 
        (user.status || 'Active') === filterByStatus;
      
      const matchesProject = filterByProject === 'all' || 
        (filterByProject === 'assigned' && user.assignedProject) ||
        (filterByProject === 'unassigned' && !user.assignedProject) ||
        user.assignedProject === filterByProject;
      
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesProject;
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Handle task assignment
  const handleTaskAssignment = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      status: 'pending',
      assignedBy: localStorage.getItem('userEmail'),
      createdAt: new Date().toISOString()
    };
    
    setDailyTasks(prev => [...prev, newTask]);
    
    // Add notification for assigned user
    const notification = {
      id: Date.now() + 1,
      type: 'task',
      title: 'New Task Assigned',
      message: `${taskData.title} has been assigned to you`,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    
    alert('Task assigned successfully!');
  };

  // Handle task status update
  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      setDailyTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Add notification for task status change
      const task = dailyTasks.find(t => t.id === taskId);
      if (task) {
        const notification = {
          id: `notif${Date.now()}`,
          type: 'task_status_update',
          title: 'Task Status Updated',
          message: `Task "${task.title}" status changed to ${newStatus}`,
          time: 'Just now',
          read: false
        };
        
        setNotifications(prev => [notification, ...prev]);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  // Project Manager Management Functions
  const handleAddProjectManager = async (managerData) => {
    try {
      const savedManager = await createProjectManager(managerData);
      setProjectManagers(prev => [...prev, savedManager]);
      
      // Also add to allUsers with project-manager role
      const userEntry = {
        ...savedManager,
        role: 'project-manager',
        userType: 'Project Manager',
        payroll: savedManager.payroll || `PM${savedManager.id?.slice(-3) || '001'}`,
        status: savedManager.status
      };
      setAllUsers(prev => [...prev, userEntry]);
      
      // Add notification for admin
      addNotification({
        type: 'user',
        title: 'New Project Manager Added',
        message: `${savedManager.name} has been added as a Project Manager in ${savedManager.department} department`,
        timestamp: new Date().toISOString(),
        priority: 'medium'
      });
      
      alert(`Project Manager "${managerData.name}" has been added successfully and saved to database!`);
    } catch (error) {
      console.error('Error adding project manager:', error);
      alert('Failed to add project manager. Please try again.');
    }
  };

  const handleEditProjectManager = (manager) => {
    setEditingProjectManager(manager);
    setShowAddProjectManagerModal(true);
  };

  const handleUpdateProjectManager = async (managerData) => {
    try {
      const managerId = editingProjectManager.id || editingProjectManager._id;
      const updatedManager = await updateProjectManager(managerId, managerData);
      
      setProjectManagers(prev => prev.map(manager => 
        (manager.id === managerId || manager._id === managerId) ? 
        updatedManager : manager
      ));
      
      // Update in allUsers as well
      setAllUsers(prev => prev.map(user => 
        (user.id === managerId || user._id === managerId) ? 
        { ...user, ...updatedManager, role: 'project-manager' } : user
      ));
      
      alert(`Project Manager "${managerData.name}" has been updated successfully!`);
      setEditingProjectManager(null);
    } catch (error) {
      console.error('Error updating project manager:', error);
      alert('Failed to update project manager. Please try again.');
    }
  };

  const handleDeleteProjectManager = async (managerId, managerName) => {
    if (window.confirm(`Are you sure you want to delete "${managerName}"? This action cannot be undone.`)) {
      try {
        await deleteProjectManager(managerId);
        setProjectManagers(prev => prev.filter(manager => 
          manager.id !== managerId && manager._id !== managerId
        ));
        setAllUsers(prev => prev.filter(user => 
          user.id !== managerId && user._id !== managerId
        ));
        alert(`Project Manager "${managerName}" has been deleted successfully!`);
      } catch (error) {
        console.error('Error deleting project manager:', error);
        alert('Failed to delete project manager. Please try again.');
      }
    }
  };

  const handleSaveProjectManager = (managerData) => {
    if (editingProjectManager) {
      handleUpdateProjectManager(managerData);
    } else {
      handleAddProjectManager(managerData);
    }
    setShowAddProjectManagerModal(false);
  };

  const handleSaveTeamLeader = (leaderData) => {
    if (editingTeamLeader) {
      handleUpdateTeamLeader(leaderData);
    } else {
      handleAddTeamLeader(leaderData);
    }
    setShowAddTeamLeaderModal(false);
  };

  const handleViewProjectManager = (manager) => {
    setSelectedProjectManager(manager);
    setShowIndividualDashboard(true);
    setActiveDetailView(null); // Reset detail view when opening dashboard
  };

  const handleBackToProjectManagers = () => {
    setSelectedProjectManager(null);
    setShowIndividualDashboard(false);
    setActiveDetailView(null);
  };

  const handleDetailViewClick = (viewType) => {
    setActiveDetailView(activeDetailView === viewType ? null : viewType);
  };

  // Team Leader Management Functions
  const getFilteredTeamLeaders = () => {
    return teamLeaders.filter(leader => {
      const searchLower = teamLeaderSearchTerm.toLowerCase();
      return (
        leader.name.toLowerCase().includes(searchLower) ||
        leader.email.toLowerCase().includes(searchLower) ||
        leader.department.toLowerCase().includes(searchLower)
      );
    });
  };

  const handleAddTeamLeader = async (leaderData) => {
    try {
      const newLeader = await createTeamLeader({
        ...leaderData,
        managedBy: currentRole === 'project-manager' ? userName : null
      });
      setTeamLeaders(prev => [...prev, newLeader]);
      
      // Add to unified user list
      const teamLeaderUser = {
        ...newLeader,
        role: 'team-leader',
        userType: 'Team Leader',
        payroll: newLeader.payroll || `TL${newLeader.id?.slice(-3) || '001'}`
      };
      setAllUsers(prev => [...prev, teamLeaderUser]);
      
      // Add notification for admin
      addNotification({
        type: 'user',
        title: 'New Team Leader Added',
        message: `${newLeader.name} has been added as a Team Leader in ${newLeader.department} department`,
        timestamp: new Date().toISOString(),
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error adding team leader:', error);
      alert('Failed to add team leader. Please try again.');
    }
  };

  const handleEditTeamLeader = (leader) => {
    setEditingTeamLeader(leader);
    setShowAddTeamLeaderModal(true);
  };

  const handleUpdateTeamLeader = async (leaderData) => {
    try {
      const updatedLeader = await updateTeamLeader(editingTeamLeader.id, leaderData);
      setTeamLeaders(prev => prev.map(leader => 
        leader.id === editingTeamLeader.id ? { ...leader, ...leaderData } : leader
      ));
    } catch (error) {
      console.error('Error updating team leader:', error);
      alert('Failed to update team leader. Please try again.');
    }
  };

  const handleDeleteTeamLeader = async (leaderId, leaderName) => {
    if (window.confirm(`Are you sure you want to delete "${leaderName}"? This action cannot be undone.`)) {
      try {
        await deleteTeamLeader(leaderId);
        setTeamLeaders(prev => prev.filter(leader => leader.id !== leaderId));
      } catch (error) {
        console.error('Error deleting team leader:', error);
        alert('Failed to delete team leader. Please try again.');
      }
    }
  };

  // Role Management Functions
  const handleAddCustomRole = async (roleData) => {
    try {
      const newRole = await createCustomRole({
        ...roleData,
        createdBy: userName
      });
      setCustomRoles(prev => [...prev, newRole]);
    } catch (error) {
      console.error('Error adding custom role:', error);
      alert('Failed to add custom role. Please try again.');
    }
  };

  const handleDeleteCustomRole = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the "${roleName}" role? This action cannot be undone.`)) {
      try {
        await deleteCustomRole(roleId);
        setCustomRoles(prev => prev.filter(role => role.id !== roleId));
      } catch (error) {
        console.error('Error deleting custom role:', error);
        alert('Failed to delete custom role. Please try again.');
      }
    }
  };

  // Chart initialization
  useEffect(() => {
    if (currentRole === 'admin' && activeView === 'dashboard') {
      const canvas = document.getElementById('progressChart');
      if (canvas && window.Chart) {
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.progressChartInstance) {
          window.progressChartInstance.destroy();
        }
        
        window.progressChartInstance = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [
              {
                label: 'Project Completion',
                data: progressData.projectCompletion,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
              },
              {
                label: 'Team Productivity',
                data: progressData.teamProductivity,
                borderColor: '#4cc9f0',
                backgroundColor: 'rgba(76, 201, 240, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              }
            }
          }
        });
      }
    }
  }, [currentRole, activeView, progressData]);

  const handleSaveEmployee = (newEmployee) => {
    // Validate that name exists and is a string
    if (!newEmployee.name || typeof newEmployee.name !== 'string') {
      console.error('Employee name is required and must be a string');
      return;
    }

    // Generate payroll ID and avatar
    const payrollId = `EMP${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const avatar = newEmployee.name.trim().split(' ').map(n => n[0]).join('').toUpperCase();
    const newId = Math.max(...employees.map(e => e.id), 0) + 1;
    
    const employeeToAdd = {
      id: newId,
      ...newEmployee,
      payroll: payrollId,
      avatar: avatar,
      dept: newEmployee.department,
      date: new Date(newEmployee.joiningDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      projectIds: []
    };
    
    setEmployees(prev => [...prev, employeeToAdd]);
  };

  const handleAssignEmployee = (projectId, employeeId) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, projectIds: [...emp.projectIds, projectId] }
        : emp
    ));
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            assigned: [...project.assigned, employees.find(e => e.id === employeeId)]
          }
        : project
    ));
  };

  const handleUnassignEmployee = (projectId, employeeId) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, projectIds: emp.projectIds.filter(id => id !== projectId) }
        : emp
    ));
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            assigned: project.assigned.filter(emp => emp.id !== employeeId)
          }
        : project
    ));
  };

  // Sort projects by completion percentage (100% first, then descending)
  const sortedProjects = [...projects].sort((a, b) => b.progress - a.progress);
  const assignedProjects = sortedProjects.filter(p => p.assigned.length > 0);
  const unassignedProjects = sortedProjects.filter(p => p.assigned.length === 0);

  const roleConfig = roles[currentRole];

  return (
    <div>
      {/* External CSS (Bootstrap, Font Awesome) should be included in public/index.html */}
      
      <style>{`
        .sidebar {
          min-height: 100vh;
          max-height: 100vh;
          background: linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%);
          position: fixed;
          z-index: 10;
          overflow: hidden;
        }
        .sidebar * {
          color: inherit;
        }
        .sidebar .nav {
          --bs-nav-link-color: #e5e7eb;
          --bs-nav-link-hover-color: white;
        }
        .nav-link {
          color: #e5e7eb !important;
          border-radius: 0.5rem;
          margin-bottom: 0.25rem;
          padding: 0.75rem 1rem;
          text-decoration: none !important;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .nav-link:hover, .nav-link.active {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          transform: translateX(5px);
          border-left: 4px solid rgba(255, 255, 255, 0.8);
        }
        .nav-link:focus {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
        .nav-link i {
          margin-right: 0.75rem;
          width: 20px;
          text-align: center;
          opacity: 1 !important;
          visibility: visible !important;
        }
        .sidebar .nav-pills .nav-link {
          color: #e5e7eb !important;
        }
        .sidebar .nav-pills .nav-link:hover {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
        .sidebar .nav-pills .nav-link.active {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.25) !important;
        }
        /* Standardized Card Styling */
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .hover-shadow:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-4px);
        }
        
        /* Interactive dashboard cards */
        .dashboard-card {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dashboard-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px) scale(1.02);
          border-color: #3b82f6;
        }
        .dashboard-card:active {
          transform: translateY(-2px) scale(1.01);
        }
        .dashboard-header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        /* Enhanced KPI Card Styling */
        .kpi-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .kpi-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px) scale(1.02);
          border-color: #3b82f6;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .kpi-card:active {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .kpi-card.clickable {
          cursor: pointer;
        }
        .kpi-card.clickable:hover {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .kpi-card.clickable:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Enhanced hover effects for icons and text */
        .kpi-card:hover .kpi-icon {
          /* Icon size remains constant on hover */
          transform: none;
        }
        .kpi-card:hover .kpi-value {
          color: #3b82f6 !important;
          transition: color 0.3s ease;
        }
        .kpi-card:hover .kpi-trend {
          transform: translateX(2px);
          transition: transform 0.3s ease;
        }
        .kpi-content {
          width: 100%;
        }
        .kpi-icon {
          font-size: 1.25rem;
        }
        .kpi-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.2;
        }
        .kpi-trend {
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        /* 3-Level Heading Hierarchy */
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1rem;
        }
        .widget-title {
          font-size: 1rem;
          font-weight: 500;
          color: #4a5568;
          margin-bottom: 0.75rem;
        }
        
        /* Improved Text Contrast */
        .text-primary-dark {
          color: #1a202c !important;
        }
        .text-secondary-muted {
          color: #718096 !important;
        }
        .text-tertiary-light {
          color: #a0aec0 !important;
        }
        .border-left-primary { border-left: 0.25rem solid #007bff !important; }
        .border-left-success { border-left: 0.25rem solid #28a745 !important; }
        .border-left-info { border-left: 0.25rem solid #17a2b8 !important; }
        .border-left-warning { border-left: 0.25rem solid #ffc107 !important; }
        .text-primary { color: #007bff !important; }
        .text-success { color: #28a745 !important; }
        .text-info { color: #17a2b8 !important; }
        .text-warning { color: #ffc107 !important; }
        .text-gray-800 { color: #2d3748 !important; }
        .text-gray-300 { color: #cbd5e0 !important; }
        .text-xs { font-size: 0.75rem; }
        .font-weight-bold { font-weight: 700 !important; }
        .text-uppercase { text-transform: uppercase !important; }
      `}</style>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar p-0">
            <div className="d-flex flex-column h-100">
            <div className="d-flex flex-column flex-shrink-0 p-3 text-white">
              <a href="#" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <i className="fas fa-tachometer-alt me-2"></i>
                <span className="fs-4">{roleConfig.title}</span>
              </a>
              <hr />
              <ul className="nav nav-pills flex-column mb-auto">
                {roleConfig.menu.map((item, index) => (
                  <li key={index} className="nav-item">
                    <a 
                      href="#" 
                      className={`nav-link ${item.active ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMenuClick(item.text);
                      }}
                    >
                      <i className={`${item.icon} me-2`}></i>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
              <hr />
              <div className="dropdown">
                <a 
                  href="#" 
                  className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" 
                  id="dropdownUser1" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <img 
                    src="https://github.com/mdo.png" 
                    alt="" 
                    width="32" 
                    height="32" 
                    className="rounded-circle me-2" 
                  />
                  <strong>{userName}</strong>
                </a>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                  <li><a className="dropdown-item" href="#">Profile</a></li>
                  <li><a className="dropdown-item" href="#">Settings</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i>Sign out</a></li>
                </ul>
              </div>
            </div>
          </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10 ms-sm-auto px-4" style={{marginLeft: '16.666667%'}}>
            {/* Header */}
            <div className="dashboard-header pt-3 pb-2 mb-3">
              <div className="row align-items-center">
                <div className="col">
                  <h1 className="page-title">{roleConfig.title}</h1>
                  <p className="text-secondary-muted mb-0">Welcome to your {currentRole.replace('-', ' ')} dashboard</p>
                </div>
                <div className="col-auto">
                  <div className="d-flex align-items-center gap-2">
                    {/* Notification Dropdown */}
                    <div className="dropdown">
                      <button 
                        className="btn btn-outline-secondary btn-sm position-relative" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        title="Notifications"
                      >
                        <i className="fas fa-bell"></i>
                        {getUnreadNotificationCount() > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {getUnreadNotificationCount()}
                          </span>
                        )}
                      </button>
                      <div className="dropdown-menu dropdown-menu-end" style={{width: '350px', maxHeight: '400px', overflowY: 'auto'}}>
                        <div className="dropdown-header d-flex justify-content-between align-items-center">
                          <span>Notifications</span>
                          {notifications.length > 0 && (
                            <button 
                              className="btn btn-sm btn-link text-decoration-none p-0"
                              onClick={clearAllNotifications}
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <div className="dropdown-item-text text-center text-muted py-3">
                            <i className="fas fa-bell-slash mb-2 d-block"></i>
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`dropdown-item ${!notification.read ? 'bg-light' : ''}`}
                              onClick={() => markNotificationAsRead(notification.id)}
                              style={{cursor: 'pointer'}}
                            >
                              <div className="d-flex align-items-start">
                                <div className={`me-2 mt-1 ${
                                  notification.type === 'task' ? 'text-primary' :
                                  notification.type === 'update' ? 'text-info' :
                                  notification.type === 'deadline' ? 'text-warning' : 'text-secondary'
                                }`}>
                                  <i className={`fas ${
                                    notification.type === 'task' ? 'fa-tasks' :
                                    notification.type === 'update' ? 'fa-clipboard-list' :
                                    notification.type === 'deadline' ? 'fa-clock' : 'fa-bell'
                                  }`}></i>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-semibold">{notification.title}</div>
                                  <div className="text-muted small">{notification.message}</div>
                                  <div className="text-muted small mt-1">{notification.time}</div>
                                </div>
                                {!notification.read && (
                                  <div className="ms-2">
                                    <span className="badge bg-primary rounded-pill" style={{width: '8px', height: '8px'}}></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="btn-group">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        title={`Viewing as: ${roleConfig.title.split(' ')[0]} | Your role: ${originalUserRole.charAt(0).toUpperCase() + originalUserRole.slice(1).replace('-', ' ')}`}
                      >
                        <span>{roleConfig.title.split(' ')[0]}</span>
                        {currentRole !== originalUserRole && (
                          <small className="ms-1 badge bg-info">Viewing</small>
                        )}
                      </button>
                      <ul className="dropdown-menu">
                        {(() => {
                          const roleHierarchy = {
                            'admin': ['admin', 'project-manager', 'team-leader', 'employee'],
                            'project-manager': ['project-manager', 'team-leader', 'employee'],
                            'team-leader': ['team-leader', 'employee'],
                            'employee': ['employee']
                          };
                          const allowedRoles = roleHierarchy[originalUserRole] || ['employee'];
                          
                          return (
                            <>
                              <li><h6 className="dropdown-header">Available Dashboards</h6></li>
                              {allowedRoles.includes('admin') && (
                                <li>
                                  <a className={`dropdown-item ${currentRole === 'admin' ? 'active' : ''}`} href="#" onClick={() => handleRoleSwitch('admin')}>
                                    <i className="fas fa-user-shield me-2"></i>Admin
                                    {originalUserRole === 'admin' && <small className="ms-1 badge bg-primary">Your Role</small>}
                                    {currentRole === 'admin' && currentRole !== originalUserRole && <small className="ms-1 badge bg-success">Current</small>}
                                  </a>
                                </li>
                              )}
                              {allowedRoles.includes('project-manager') && (
                                <li>
                                  <a className={`dropdown-item ${currentRole === 'project-manager' ? 'active' : ''}`} href="#" onClick={() => handleRoleSwitch('project-manager')}>
                                    <i className="fas fa-user-tie me-2"></i>Project Manager
                                    {originalUserRole === 'project-manager' && <small className="ms-1 badge bg-primary">Your Role</small>}
                                    {currentRole === 'project-manager' && currentRole !== originalUserRole && <small className="ms-1 badge bg-success">Current</small>}
                                  </a>
                                </li>
                              )}
                              {allowedRoles.includes('team-leader') && (
                                <li>
                                  <a className={`dropdown-item ${currentRole === 'team-leader' ? 'active' : ''}`} href="#" onClick={() => handleRoleSwitch('team-leader')}>
                                    <i className="fas fa-users me-2"></i>Team Leader
                                    {originalUserRole === 'team-leader' && <small className="ms-1 badge bg-primary">Your Role</small>}
                                    {currentRole === 'team-leader' && currentRole !== originalUserRole && <small className="ms-1 badge bg-success">Current</small>}
                                  </a>
                                </li>
                              )}
                              {allowedRoles.includes('employee') && (
                                <li>
                                  <a className={`dropdown-item ${currentRole === 'employee' ? 'active' : ''}`} href="#" onClick={() => handleRoleSwitch('employee')}>
                                    <i className="fas fa-user me-2"></i>Employee
                                    {originalUserRole === 'employee' && <small className="ms-1 badge bg-primary">Your Role</small>}
                                    {currentRole === 'employee' && currentRole !== originalUserRole && <small className="ms-1 badge bg-success">Current</small>}
                                  </a>
                                </li>
                              )}
                            </>
                          );
                        })()}
                      </ul>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <i className="fas fa-sign-out-alt me-1"></i>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced KPI Cards */}
            <div className="row g-3 mb-4">
              {roleConfig.stats.map((stat, index) => (
                <div key={index} className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                  <div 
                    className={`card kpi-card h-100 ${stat.clickable ? 'clickable' : ''}`}
                    onClick={() => stat.clickable && handleCardClick(stat.title)}
                    role={stat.clickable ? 'button' : 'presentation'}
                    tabIndex={stat.clickable ? 0 : -1}
                    aria-label={stat.ariaLabel}
                    onKeyDown={(e) => {
                      if (stat.clickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleCardClick(stat.title);
                      }
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="kpi-content">
                          <div className={`kpi-icon text-${stat.color} mb-2`}>
                            <i className={`${stat.icon} fa-lg`} aria-hidden="true"></i>
                          </div>
                          <div className="kpi-title text-muted small mb-1">{stat.title}</div>
                          <div className="kpi-value h4 mb-0 font-weight-bold text-dark">{stat.value}</div>
                          {stat.trend && (
                            <div className={`kpi-trend small mt-1 ${
                              stat.trend.startsWith('+') ? 'text-success' : 
                              stat.trend.startsWith('-') ? 'text-danger' : 'text-muted'
                            }`}>
                              <i className={`fas ${
                                stat.trend.startsWith('+') ? 'fa-arrow-up' : 
                                stat.trend.startsWith('-') ? 'fa-arrow-down' : 'fa-minus'
                              } me-1`} aria-hidden="true"></i>
                              {stat.trend}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content based on role */}
            <div className="row">
              <div className="col-12">
                {currentRole === 'admin' && activeView === 'dashboard' && (
                  <div>
                    <div className="row mb-4">
                      {/* Overall Progress Analytics Chart */}
                      <div className="col-md-8 mb-4">
                        <div className="card h-100">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="section-title mb-0">Overall Progress Analytics</h3>
                            <div className="dropdown">
                              <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                This Month
                              </button>
                              <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">This Week</a></li>
                                <li><a className="dropdown-item" href="#">This Month</a></li>
                                <li><a className="dropdown-item" href="#">This Quarter</a></li>
                              </ul>
                            </div>
                          </div>
                          <div className="card-body">
                            <canvas id="progressChart" style={{height: '300px'}}></canvas>
                          </div>
                        </div>
                      </div>

                      {/* Monthly Target Card */}
                      <div className="col-md-4 mb-4">
                        <div className="card h-100 stats-card clickable" onClick={() => handleCardClick('Monthly Target')}>
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="widget-title mb-0">Monthly Target</h4>
                            <i className="fas fa-ellipsis-h"></i>
                          </div>
                          <div className="card-body text-center">
                            <div className="position-relative d-inline-flex align-items-center justify-content-center mb-3" style={{width: '120px', height: '120px'}}>
                              <svg width="120" height="120" className="position-absolute">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" strokeWidth="8"></circle>
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#4f46e5" strokeWidth="8" strokeDasharray="314" strokeDashoffset={314 - (314 * progressData.monthlyTarget.percentage / 100)} strokeLinecap="round" transform="rotate(-90 60 60)"></circle>
                              </svg>
                              <div className="text-center">
                                <h3 className="mb-0">{progressData.monthlyTarget.percentage}%</h3>
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-success">
                                <i className="fas fa-arrow-up me-1"></i>
                                +{progressData.monthlyTarget.comparison}% from last month
                              </small>
                            </div>
                            <p className="text-muted mb-3">
                              You earn ${progressData.monthlyTarget.earnings.toLocaleString()} today, it's higher than last month. Keep up your good work!
                            </p>
                            <div className="row">
                              <div className="col-4">
                                <div className="text-center">
                                  <small className="text-muted d-block">Target</small>
                                  <span className="fw-bold text-danger">
                                    ${(progressData.monthlyTarget.target / 1000).toFixed(0)}K <i className="fas fa-arrow-down"></i>
                                  </span>
                                </div>
                              </div>
                              <div className="col-4">
                                <div className="text-center">
                                  <small className="text-muted d-block">Revenue</small>
                                  <span className="fw-bold text-success">
                                    ${(progressData.monthlyTarget.revenue / 1000).toFixed(0)}K <i className="fas fa-arrow-up"></i>
                                  </span>
                                </div>
                              </div>
                              <div className="col-4">
                                <div className="text-center">
                                  <small className="text-muted d-block">Today</small>
                                  <span className="fw-bold text-success">
                                    ${(progressData.monthlyTarget.today / 1000).toFixed(0)}K <i className="fas fa-arrow-up"></i>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Projects Section */}
                    <div className="card mb-4">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                          <h3 className="section-title mb-0">Active Projects</h3>
                          <small className="text-secondary-muted">Track and manage project progress</small>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-secondary btn-sm">
                            <i className="fas fa-filter me-1"></i> Filter
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setEditingProject(null);
                              setShowAddProjectModal(true);
                            }}
                          >
                            <i className="fas fa-plus me-1"></i> New Project
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>Name</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>Assigned</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignedProjects.map((project, index) => (
                                <tr key={index}>
                                  <td>
                                    <div>
                                      <div className="fw-semibold">{project.name}</div>
                                      <small className="text-muted">{project.date}</small>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <span className="me-2">{project.progress}%</span>
                                      <div className="progress" style={{width: '100px', height: '6px'}}>
                                        <div 
                                          className={`progress-bar ${
                                            project.progress === 100 ? 'bg-success' : 
                                            project.progress >= 70 ? 'bg-primary' : 
                                            project.progress >= 40 ? 'bg-warning' : 'bg-danger'
                                          }`} 
                                          role="progressbar" 
                                          style={{width: `${project.progress}%`}}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      project.status === 'Completed' ? 'bg-success' :
                                      project.status === 'On Track' ? 'bg-primary' :
                                      project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
                                    }`}>
                                      {project.status}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {project.assigned.slice(0, 3).map((person, idx) => (
                                        <div 
                                          key={idx}
                                          className={`rounded-circle text-white d-flex align-items-center justify-content-center me-1 ${person.color}`}
                                          style={{width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold', marginLeft: idx > 0 ? '-8px' : '0'}}
                                          title={person.name}
                                        >
                                          {person.name.charAt(0)}
                                        </div>
                                      ))}
                                      {project.extra > 0 && (
                                        <div 
                                          className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                                          style={{width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold', marginLeft: '-8px'}}
                                        >
                                          +{project.extra}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="dropdown">
                                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                        <i className="fas fa-ellipsis-v"></i>
                                      </button>
                                      <ul className="dropdown-menu">
                                        <li><a className="dropdown-item" href="#"><i className="fas fa-eye me-2"></i>View</a></li>
                                        <li><a className="dropdown-item" href="#"><i className="fas fa-edit me-2"></i>Edit</a></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><a className="dropdown-item text-danger" href="#"><i className="fas fa-trash me-2"></i>Delete</a></li>
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="text-center mt-3">
                          <a href="#" className="text-decoration-none text-primary">
                            <i className="fas fa-arrow-right me-1"></i>
                            View All Projects
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Unassigned Projects Section */}
                    {unassignedProjects.length > 0 && (
                      <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <div>
                            <h3 className="section-title mb-0">Unassigned Projects</h3>
                            <small className="text-secondary-muted">Projects waiting for team assignment</small>
                          </div>
                          <span className="badge bg-warning">{unassignedProjects.length} Projects</span>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead className="table-light">
                                <tr>
                                  <th>Project Name</th>
                                  <th>Client Name</th>
                                  <th>Advance Payment</th>
                                  <th>Due Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {unassignedProjects.map((project, index) => (
                                  <tr key={index}>
                                    <td>
                                      <div>
                                        <div className="fw-semibold">{project.name}</div>
                                        <span className="badge bg-secondary">{project.status}</span>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="fw-semibold text-primary">{project.clientName}</div>
                                    </td>
                                    <td>
                                      <span className="fw-bold text-success">${project.advancePayment.toLocaleString()}</span>
                                    </td>
                                    <td>
                                      <small className="text-muted">{project.date}</small>
                                    </td>
                                    <td>
                                      <button className="btn btn-sm btn-primary me-2">
                                        <i className="fas fa-user-plus me-1"></i>
                                        Assign Team
                                      </button>
                                      <div className="dropdown d-inline">
                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                          <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul className="dropdown-menu">
                                          <li><a className="dropdown-item" href="#"><i className="fas fa-eye me-2"></i>View Details</a></li>
                                          <li><a className="dropdown-item" href="#"><i className="fas fa-edit me-2"></i>Edit Project</a></li>
                                          <li><hr className="dropdown-divider" /></li>
                                          <li><a className="dropdown-item text-danger" href="#"><i className="fas fa-trash me-2"></i>Delete</a></li>
                                        </ul>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}


                  </div>
                )}

                {/* Project Manager Dashboard */}
                {currentRole === 'project-manager' && activeView === 'dashboard' && (
                  <div>

                    {/* My Projects and Daily Updates */}
                    <div className="row mb-4">
                      <div className="col-md-8">
                        <div className="card">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                              <i className="fas fa-project-diagram me-2"></i>My Projects
                            </h5>
                            <div className="d-flex gap-2">
                              <div className="btn-group" role="group">
                                <button 
                                  type="button" 
                                  className={`btn btn-sm ${projectViewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => setProjectViewMode('card')}
                                >
                                  <i className="fas fa-th me-1"></i>Cards
                                </button>
                                <button 
                                  type="button" 
                                  className={`btn btn-sm ${projectViewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => setProjectViewMode('list')}
                                >
                                  <i className="fas fa-list me-1"></i>List
                                </button>
                              </div>
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => setShowProjectUpdateModal(true)}
                              >
                                <i className="fas fa-plus me-1"></i> Add Update
                              </button>
                            </div>
                          </div>
                          <div className="card-body">
                            {projectViewMode === 'card' ? (
                              // Card View
                              <div className="row">
                                {getProjectManagerProjects(localStorage.getItem('userEmail')).map((project, index) => (
                                  <div key={index} className="col-md-6 mb-3">
                                    <div className="card h-100 border shadow-sm">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                          <h6 className="card-title fw-bold mb-0">{project.name}</h6>
                                          <span className={`badge ${
                                            project.status === 'On Track' ? 'bg-success' : 
                                            project.status === 'At Risk' ? 'bg-warning' : 
                                            project.status === 'Delayed' ? 'bg-danger' :
                                            project.status === 'Completed' ? 'bg-info' : 'bg-secondary'
                                          }`}>
                                            {project.status}
                                          </span>
                                        </div>
                                        
                                        <div className="mb-3">
                                          <small className="text-muted d-block mb-1">
                                            <i className="fas fa-users me-1"></i>Team Members
                                          </small>
                                          <div className="d-flex flex-wrap gap-1">
                                            {project.assigned && project.assigned.length > 0 ? (
                                              project.assigned.slice(0, 3).map((member, idx) => (
                                                <span key={idx} className={`badge ${member.color} text-white`}>
                                                  {member.name}
                                                </span>
                                              ))
                                            ) : (
                                              <span className="badge bg-secondary">No members assigned</span>
                                            )}
                                            {project.extra > 0 && (
                                              <span className="badge bg-light text-dark">+{project.extra} more</span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="mb-3">
                                          <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small className="text-muted">
                                              <i className="fas fa-chart-line me-1"></i>Progress
                                            </small>
                                            <small className="fw-bold">{project.progress}%</small>
                                          </div>
                                          <div className="progress" style={{height: '8px'}}>
                                            <div 
                                              className={`progress-bar ${
                                                project.progress >= 80 ? 'bg-success' :
                                                project.progress >= 50 ? 'bg-primary' :
                                                project.progress >= 25 ? 'bg-warning' : 'bg-danger'
                                              }`}
                                              style={{width: `${project.progress}%`}}
                                            ></div>
                                          </div>
                                        </div>

                                        <div className="mb-3">
                                          <small className="text-muted d-block">
                                            <i className="fas fa-calendar me-1"></i>Due Date
                                          </small>
                                          <span className="fw-semibold">
                                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                                          </span>
                                        </div>

                                        <div className="d-flex gap-2">
                                          <button 
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                            onClick={() => {
                                              setSelectedProjectForTask(project);
                                              setShowTaskAssignModal(true);
                                            }}
                                          >
                                            <i className="fas fa-tasks me-1"></i>Assign Task
                                          </button>
                                          <button className="btn btn-outline-secondary btn-sm">
                                            <i className="fas fa-eye"></i>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // List View
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Project Name</th>
                                      <th>Members Assigned</th>
                                      <th>Progress</th>
                                      <th>Due Date</th>
                                      <th>Status</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getProjectManagerProjects(localStorage.getItem('userEmail')).map((project, index) => (
                                      <tr key={index}>
                                        <td>
                                          <div>
                                            <div className="fw-semibold">{project.name}</div>
                                            <small className="text-muted">{project.clientName}</small>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="d-flex flex-wrap gap-1">
                                            {project.assigned && project.assigned.length > 0 ? (
                                              <>
                                                {project.assigned.slice(0, 2).map((member, idx) => (
                                                  <span key={idx} className={`badge ${member.color} text-white`}>
                                                    {member.name}
                                                  </span>
                                                ))}
                                                {project.extra > 0 && (
                                                  <span className="badge bg-light text-dark">+{project.extra}</span>
                                                )}
                                              </>
                                            ) : (
                                              <span className="text-muted">No members</span>
                                            )}
                                          </div>
                                        </td>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <div className="progress me-2" style={{width: '80px', height: '6px'}}>
                                              <div 
                                                className={`progress-bar ${
                                                  project.progress >= 80 ? 'bg-success' :
                                                  project.progress >= 50 ? 'bg-primary' :
                                                  project.progress >= 25 ? 'bg-warning' : 'bg-danger'
                                                }`}
                                                style={{width: `${project.progress}%`}}
                                              ></div>
                                            </div>
                                            <small className="fw-bold">{project.progress}%</small>
                                          </div>
                                        </td>
                                        <td>
                                          <span className="fw-semibold">
                                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                                          </span>
                                        </td>
                                        <td>
                                          <span className={`badge ${
                                            project.status === 'On Track' ? 'bg-success' : 
                                            project.status === 'At Risk' ? 'bg-warning' : 
                                            project.status === 'Delayed' ? 'bg-danger' :
                                            project.status === 'Completed' ? 'bg-info' : 'bg-secondary'
                                          }`}>
                                            {project.status}
                                          </span>
                                        </td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <button 
                                              className="btn btn-outline-primary btn-sm"
                                              onClick={() => {
                                                setSelectedProjectForTask(project);
                                                setShowTaskAssignModal(true);
                                              }}
                                              title="Assign Task"
                                            >
                                              <i className="fas fa-tasks"></i>
                                            </button>
                                            <button className="btn btn-outline-secondary btn-sm" title="View Details">
                                              <i className="fas fa-eye"></i>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title mb-0">
                              <i className="fas fa-bell me-2"></i>Recent Updates
                            </h5>
                          </div>
                          <div className="card-body">
                            {projectUpdates.slice(0, 5).map((update, index) => (
                              <div key={index} className="d-flex align-items-start mb-3">
                                <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-3" style={{width: '32px', height: '32px', fontSize: '12px'}}>
                                  {update.employeeName.charAt(0)}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-semibold small">{update.employeeName}</div>
                                  <div className="text-muted small">{update.description}</div>
                                  <div className="text-muted small">{update.updateDate}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Leader Dashboard */}
                {currentRole === 'team-leader' && activeView === 'dashboard' && (
                  <div>
                    {/* Dashboard content removed - use stat cards and menu navigation */}
                  </div>
                )}

                {/* Employee Dashboard */}
                {currentRole === 'employee' && activeView === 'dashboard' && (
                  <div>
                    {/* Employee Stats - Section Removed */}

                    {/* Daily Tasks and Project Updates */}
                    <div className="row mb-4">
                      <div className="col-md-8">
                        <div className="card">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                              <i className="fas fa-tasks me-2"></i>My Daily Tasks
                            </h5>
                            <span className="badge bg-primary">{getEmployeeTasks(localStorage.getItem('userEmail')).length} Tasks</span>
                          </div>
                          <div className="card-body">
                            {getEmployeeTasks(localStorage.getItem('userEmail')).map((task, index) => (
                              <div key={index} className="border rounded p-3 mb-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="fw-bold mb-1">{task.title}</h6>
                                    <p className="text-muted small mb-1">{task.description}</p>
                                    <small className="text-muted">Project: {task.projectName}</small>
                                  </div>
                                  <div className="text-end">
                                    <span className={`badge ${
                                      task.status === 'completed' ? 'bg-success' : 
                                      task.status === 'in-progress' ? 'bg-warning' : 
                                      'bg-secondary'
                                    }`}>
                                      {task.status}
                                    </span>
                                    <div className="small text-muted mt-1">Due: {task.dueDate}</div>
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="small text-muted">
                                    <i className="fas fa-clock me-1"></i>
                                    {task.actualHours}/{task.estimatedHours} hours
                                  </div>
                                  <div>
                                    {task.status === 'pending' && (
                                      <button 
                                        className="btn btn-outline-primary btn-sm me-2"
                                        onClick={() => handleTaskStatusUpdate(task.id, 'in-progress')}
                                      >
                                        <i className="fas fa-play me-1"></i>Start
                                      </button>
                                    )}
                                    {task.status === 'in-progress' && (
                                      <button 
                                        className="btn btn-outline-success btn-sm me-2"
                                        onClick={() => handleTaskStatusUpdate(task.id, 'completed', task.estimatedHours)}
                                      >
                                        <i className="fas fa-check me-1"></i>Complete
                                      </button>
                                    )}
                                    <button 
                                      className="btn btn-outline-info btn-sm"
                                      onClick={() => setShowProjectUpdateModal(true)}
                                    >
                                      <i className="fas fa-comment me-1"></i>Update
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title mb-0">
                              <i className="fas fa-project-diagram me-2"></i>My Projects
                            </h5>
                          </div>
                          <div className="card-body">
                            {getEmployeeProjects(localStorage.getItem('userEmail')).map((project, index) => (
                              <div key={index} className="border rounded p-2 mb-3">
                                <div className="fw-semibold small">{project.name}</div>
                                <div className="text-muted small mb-2">Client: {project.clientName}</div>
                                <div className="progress mb-1" style={{height: '6px'}}>
                                  <div 
                                    className="progress-bar bg-primary" 
                                    style={{width: `${project.progress}%`}}
                                  ></div>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <small className="text-muted">{project.progress}% Complete</small>
                                  <span className={`badge ${project.status === 'On Track' ? 'bg-success' : 'bg-warning'}`} style={{fontSize: '10px'}}>
                                    {project.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Employee Projects View */}
                {currentRole === 'admin' && activeView === 'employee-projects' && (
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">Employee Project Assignments</h5>
                        <small className="text-muted">View employee details with project assignments and status</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm">
                          <i className="fas fa-filter me-1"></i> Filter
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddEmployeeModal(true)}>
                          <i className="fas fa-plus me-1"></i> Add Employee
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Employee</th>
                              <th>Role</th>
                              <th>Project Names</th>
                              <th>Client Names</th>
                              <th>Project Status</th>
                              <th>Assignment Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employees.map((employee, index) => {
                              const employeeProjects = getEmployeeProjects(employee.id);
                              const isAssigned = employeeProjects.length > 0;
                              return (
                                <tr key={index}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold'}}>
                                        {employee.avatar}
                                      </div>
                                      <div>
                                        <div className="fw-semibold">{employee.name}</div>
                                        <small className="text-muted">{employee.email}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-light text-dark border">{employee.role}</span>
                                  </td>
                                  <td>
                                    {employeeProjects.length > 0 ? (
                                      <div>
                                        {employeeProjects.map((project, idx) => (
                                          <div key={idx} className="mb-1">
                                            <span className="fw-semibold">{project.name}</span>
                                            {idx < employeeProjects.length - 1 && <br />}
                                          </div>
                                        ))}
                                        {employeeProjects.length > 1 && (
                                          <small className="text-muted">({employeeProjects.length} projects)</small>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-muted fst-italic">No projects assigned</span>
                                    )}
                                  </td>
                                  <td>
                                    {employeeProjects.length > 0 ? (
                                      <div>
                                        {employeeProjects.map((project, idx) => (
                                          <div key={idx} className="mb-1">
                                            <span className="text-primary fw-semibold">{project.clientName}</span>
                                            {idx < employeeProjects.length - 1 && <br />}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </td>
                                  <td>
                                    {employeeProjects.length > 0 ? (
                                      <div>
                                        {employeeProjects.map((project, idx) => (
                                          <div key={idx} className="mb-1">
                                            <span className={`badge ${
                                              project.status === 'Completed' ? 'bg-success' :
                                              project.status === 'On Track' ? 'bg-primary' :
                                              project.status === 'At Risk' ? 'bg-warning' : 
                                              project.status === 'Delayed' ? 'bg-danger' : 'bg-secondary'
                                            }`}>
                                              {project.status}
                                            </span>
                                            {idx < employeeProjects.length - 1 && <br />}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="badge bg-secondary">Available</span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div 
                                        className={`rounded-pill px-2 py-1 text-white fw-bold ${
                                          isAssigned ? 'bg-danger' : 'bg-success'
                                        }`}
                                        style={{fontSize: '12px'}}
                                      >
                                        {isAssigned ? 'ASSIGNED' : 'AVAILABLE'}
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="dropdown">
                                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                        <i className="fas fa-ellipsis-v"></i>
                                      </button>
                                      <ul className="dropdown-menu">
                                        <li><a className="dropdown-item" href="#"><i className="fas fa-eye me-2"></i>View Details</a></li>
                                        <li><a className="dropdown-item" href="#"><i className="fas fa-user-plus me-2"></i>Assign Project</a></li>
                                        <li><a className="dropdown-item" href="#"><i className="fas fa-edit me-2"></i>Edit Employee</a></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><a className="dropdown-item text-danger" href="#"><i className="fas fa-trash me-2"></i>Remove</a></li>
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Employee Management View */}
                {(currentRole === 'admin' || currentRole === 'team-leader') && activeView === 'employees' && (
                  <div>
                    {currentRole === 'team-leader' && (
                      <div className="mb-3">
                        <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
                          <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                        </button>
                      </div>
                    )}
                    <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">{currentRole === 'admin' ? 'User Management' : 'My Team'}</h5>
                        <small className="text-muted">
                          {currentRole === 'admin' 
                            ? 'View and manage all users (Employees, Managers, Team Leaders)' 
                            : 'View and manage your team members'}
                        </small>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <button 
                          className={`btn btn-sm ${userViewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setUserViewMode('list')}
                          title="Switch to List View"
                        >
                          <i className="fas fa-list me-1"></i> 
                          <span className="d-none d-sm-inline">List View</span>
                        </button>
                        <button 
                          className={`btn btn-sm ${userViewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setUserViewMode('card')}
                          title="Switch to Card View"
                        >
                          <i className="fas fa-th me-1"></i> 
                          <span className="d-none d-sm-inline">Card View</span>
                        </button>
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => setShowAddUserModal(true)}
                        >
                          <i className="fas fa-plus me-1"></i> 
                          <span className="d-none d-sm-inline">New User</span>
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-users me-2 text-primary"></i>
                          <span className="fw-bold">Total Users: {allUsers.length} persons</span>
                        </div>
                        <div className="d-flex gap-2">
                          <div className="input-group" style={{width: '300px'}}>
                            <span className="input-group-text"><i className="fas fa-search"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Search by name, email, or payroll" 
                              value={userSearchTerm}
                              onChange={(e) => setUserSearchTerm(e.target.value)}
                            />
                          </div>
                          
                          {/* Filter Dropdown */}
                          <div className="dropdown position-relative">
                            <button 
                              className="btn btn-outline-secondary dropdown-toggle"
                              type="button"
                              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                              <i className="fas fa-filter me-1"></i> Filter
                            </button>
                            {showFilterDropdown && (
                              <div 
                                className="dropdown-menu show position-absolute" 
                                style={{
                                  minWidth: '280px',
                                  top: '100%',
                                  left: '0',
                                  zIndex: 1050,
                                  backgroundColor: 'white',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '0.375rem',
                                  boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
                                }}
                              >
                                <div className="px-3 py-2">
                                  <h6 className="dropdown-header">Filter Options</h6>
                                  
                                  {/* Role Filter */}
                                  <div className="mb-3">
                                    <label className="form-label small fw-bold">By User Role</label>
                                    <select 
                                      className="form-select form-select-sm"
                                      value={filterByRole}
                                      onChange={(e) => setFilterByRole(e.target.value)}
                                    >
                                      <option value="all">All Roles</option>
                                      {getUniqueRoles().map(role => (
                                        <option key={role} value={role}>{role}</option>
                                      ))}
                                    </select>
                                  </div>
                                  
                                  {/* Department Filter */}
                                  <div className="mb-3">
                                    <label className="form-label small fw-bold">By Department</label>
                                    <select 
                                      className="form-select form-select-sm"
                                      value={filterByDepartment}
                                      onChange={(e) => setFilterByDepartment(e.target.value)}
                                    >
                                      <option value="all">All Departments</option>
                                      {getUniqueDepartments().map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                      ))}
                                    </select>
                                  </div>
                                  
                                  {/* Status Filter */}
                                  <div className="mb-3">
                                    <label className="form-label small fw-bold">By Status</label>
                                    <select 
                                      className="form-select form-select-sm"
                                      value={filterByStatus}
                                      onChange={(e) => setFilterByStatus(e.target.value)}
                                    >
                                      <option value="all">All Status</option>
                                      <option value="Active">Active</option>
                                      <option value="Inactive">Inactive</option>
                                      <option value="On Leave">On Leave</option>
                                      <option value="Suspended">Suspended</option>
                                    </select>
                                  </div>
                                  
                                  {/* Project Assignment Filter */}
                                  <div className="mb-3">
                                    <label className="form-label small fw-bold">By Project Assignment</label>
                                    <select 
                                      className="form-select form-select-sm"
                                      value={filterByProject}
                                      onChange={(e) => setFilterByProject(e.target.value)}
                                    >
                                      <option value="all">All Users</option>
                                      <option value="assigned">Has Project Assignment</option>
                                      <option value="unassigned">No Project Assignment</option>
                                      <optgroup label="Specific Projects">
                                        {getUniqueProjects().map(project => (
                                          <option key={project} value={project}>{project}</option>
                                        ))}
                                      </optgroup>
                                    </select>
                                  </div>
                                  
                                  {/* Filter Actions */}
                                  <div className="d-flex gap-2 mt-3 pt-2 border-top">
                                    <button 
                                      className="btn btn-sm btn-outline-danger flex-fill"
                                      onClick={() => {
                                        setFilterByRole('all');
                                        setFilterByDepartment('all');
                                        setFilterByStatus('all');
                                        setFilterByProject('all');
                                        setUserSearchTerm('');
                                      }}
                                    >
                                      <i className="fas fa-times me-1"></i>Clear All
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-primary flex-fill"
                                      onClick={() => setShowFilterDropdown(false)}
                                    >
                                      <i className="fas fa-check me-1"></i>Apply
                                    </button>
                                  </div>
                                  
                                  {/* Active Filters Display */}
                                  {(filterByRole !== 'all' || filterByDepartment !== 'all' || filterByStatus !== 'all' || filterByProject !== 'all' || userSearchTerm) && (
                                    <div className="mt-3 pt-2 border-top">
                                      <small className="text-muted fw-bold">Active Filters:</small>
                                      <div className="mt-1">
                                        {filterByRole !== 'all' && (
                                          <span className="badge bg-primary me-1 mb-1">Role: {filterByRole}</span>
                                        )}
                                        {filterByDepartment !== 'all' && (
                                          <span className="badge bg-success me-1 mb-1">Dept: {filterByDepartment}</span>
                                        )}
                                        {filterByStatus !== 'all' && (
                                          <span className="badge bg-warning me-1 mb-1">Status: {filterByStatus}</span>
                                        )}
                                        {filterByProject !== 'all' && (
                                          <span className="badge bg-info me-1 mb-1">
                                            Project: {filterByProject === 'assigned' ? 'Has Assignment' : 
                                                     filterByProject === 'unassigned' ? 'No Assignment' : filterByProject}
                                          </span>
                                        )}
                                        {userSearchTerm && (
                                          <span className="badge bg-secondary me-1 mb-1">Search: "{userSearchTerm}"</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Sort Dropdown */}
                          <div className="dropdown">
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                                setSortOrder(newOrder);
                              }}
                              title={`Currently sorting by ${sortBy} (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'}). Click to toggle.`}
                            >
                              <i className={`fas ${sortOrder === 'asc' ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up'} me-1`}></i> 
                              Sort {sortBy === 'name' ? 'Name' : sortBy === 'department' ? 'Dept' : 'Type'}
                            </button>
                          </div>
                          
                          {/* Export Button */}
                          <button 
                            className="btn btn-outline-primary"
                            onClick={exportUsers}
                            title="Export user data to CSV"
                          >
                            <i className="fas fa-download me-1"></i> Export
                          </button>
                        </div>
                      </div>
                      
                      {/* User Management Views */}
                      {userViewMode === 'list' ? (
                        /* List View - Table */
                        <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Name</th>
                              <th>{currentRole === 'team-leader' ? 'Phone Number' : 'ID'}</th>
                              <th>Department</th>
                              <th>Project Name</th>
                              <th>User Type</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAndSortedUsers.map((user, index) => (
                                <tr key={index}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div 
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                        style={{width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold'}}
                                      >
                                        {user.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="fw-semibold">{user.name}</div>
                                        <small className="text-muted">{user.email}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    {currentRole === 'team-leader' ? (
                                      <div>
                                        <i className="fas fa-phone me-2 text-success"></i>
                                        <span>{user.phone || user.phoneNumber || 'N/A'}</span>
                                      </div>
                                    ) : (
                                      <span className="badge bg-secondary">{user.id || `EMP${String(index + 1).padStart(3, '0')}`}</span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="fw-medium">{user.department || 'Not Specified'}</div>
                                  </td>
                                  <td>
                                    {user.assignedProject ? (
                                      <div>
                                        <div className="fw-medium text-primary">{user.assignedProject}</div>
                                        <small className="text-muted">Active Project</small>
                                      </div>
                                    ) : (
                                      <span className="text-muted">No project assigned</span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="fw-medium">{user.role || user.userType}</div>
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      user.assignedProject ? 'bg-danger' : 'bg-success'
                                    }`}>
                                      {user.assignedProject ? 'Assigned' : 'Not Assigned'}
                                    </span>
                                  </td>
                                  <td>
                                    {currentRole === 'team-leader' ? (
                                      <button 
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => alert(`User Details:\n\nName: ${user.name}\nPhone: ${user.phone || user.phoneNumber || 'N/A'}\nDepartment: ${user.department}\nRole: ${user.role}\nEmail: ${user.email}\nProject: ${user.assignedProject || 'No project assigned'}\nStatus: ${user.assignedProject ? 'Assigned' : 'Not Assigned'}\nJoin Date: ${user.joinDate || 'N/A'}`)}
                                        title="View User Details"
                                      >
                                        <i className="fas fa-eye me-1"></i> View
                                      </button>
                                    ) : (
                                      <div className="btn-group" role="group">
                                        <button 
                                          className="btn btn-sm btn-outline-info"
                                          onClick={() => alert(`User Details:\n\nID: ${user.id || `EMP${String(index + 1).padStart(3, '0')}`}\nName: ${user.name}\nDepartment: ${user.department}\nRole: ${user.role}\nEmail: ${user.email}\nProject: ${user.assignedProject || 'No project assigned'}\nStatus: ${user.assignedProject ? 'Assigned' : 'Not Assigned'}\nJoin Date: ${user.joinDate}`)}
                                          title="View User Details"
                                        >
                                          <i className="fas fa-eye"></i>
                                        </button>
                                        <button 
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => handleEditUser(user)}
                                          title="Edit User"
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleDeleteUser(user.id || user._id || `EMP${String(index + 1).padStart(3, '0')}`, user.name)}
                                          title="Delete User"
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      ) : (
                        /* Card View - Grid */
                        <div className="row g-3">
                          {filteredAndSortedUsers.map((user, index) => (
                            <div key={index} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                              <div className="card h-100 shadow-sm hover-shadow" style={{transition: 'all 0.3s ease'}}>
                                <div className="card-body">
                                  <div className="text-center mb-3">
                                    <div 
                                      className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2"
                                      style={{width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold'}}
                                    >
                                      {user.name.charAt(0)}
                                    </div>
                                    <h6 className="mb-1 fw-bold">{user.name}</h6>
                                    <small className="text-muted d-block mb-2">{user.email}</small>
                                    {currentRole === 'team-leader' ? (
                                      <div className="mb-2">
                                        <i className="fas fa-phone me-2 text-success"></i>
                                        <small>{user.phone || user.phoneNumber || 'N/A'}</small>
                                      </div>
                                    ) : (
                                      <span className="badge bg-secondary mb-2">{user.id || `EMP${String(index + 1).padStart(3, '0')}`}</span>
                                    )}
                                  </div>
                                  
                                  <div className="mb-2">
                                    <small className="text-muted d-block">Department</small>
                                    <strong className="d-block">{user.department || 'Not Specified'}</strong>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <small className="text-muted d-block">User Type</small>
                                    <strong className="d-block">{user.role || user.userType}</strong>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <small className="text-muted d-block">Project</small>
                                    {user.assignedProject ? (
                                      <span className="text-primary fw-medium">{user.assignedProject}</span>
                                    ) : (
                                      <span className="text-muted">Not assigned</span>
                                    )}
                                  </div>
                                  
                                  <div className="mb-3">
                                    <span className={`badge w-100 ${user.assignedProject ? 'bg-danger' : 'bg-success'}`}>
                                      {user.assignedProject ? 'Assigned' : 'Not Assigned'}
                                    </span>
                                  </div>
                                  
                                  <div className="d-grid gap-2">
                                    {currentRole === 'team-leader' ? (
                                      <button 
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => alert(`User Details:\n\nName: ${user.name}\nPhone: ${user.phone || user.phoneNumber || 'N/A'}\nDepartment: ${user.department}\nRole: ${user.role}\nEmail: ${user.email}\nProject: ${user.assignedProject || 'No project assigned'}\nStatus: ${user.assignedProject ? 'Assigned' : 'Not Assigned'}\nJoin Date: ${user.joinDate || 'N/A'}`)}
                                      >
                                        <i className="fas fa-eye me-1"></i> View Details
                                      </button>
                                    ) : (
                                      <>
                                        <button 
                                          className="btn btn-sm btn-outline-info"
                                          onClick={() => alert(`User Details:\n\nID: ${user.id || `EMP${String(index + 1).padStart(3, '0')}`}\nName: ${user.name}\nDepartment: ${user.department}\nRole: ${user.role}\nEmail: ${user.email}\nProject: ${user.assignedProject || 'No project assigned'}\nStatus: ${user.assignedProject ? 'Assigned' : 'Not Assigned'}\nJoin Date: ${user.joinDate}`)}
                                        >
                                          <i className="fas fa-eye me-1"></i> View
                                        </button>
                                        <div className="btn-group">
                                          <button 
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleEditUser(user)}
                                          >
                                            <i className="fas fa-edit me-1"></i> Edit
                                          </button>
                                          <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteUser(user.id || user._id || `EMP${String(index + 1).padStart(3, '0')}`, user.name)}
                                          >
                                            <i className="fas fa-trash me-1"></i> Delete
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          Showing {filteredAndSortedUsers.length} users • Total Active: {allUsers.filter(u => u.status === 'Active').length} • 
                          Assigned to Projects: {allUsers.filter(u => u.projectStatus === 'Assigned').length}
                        </small>
                      </div>
                    </div>
                  </div>
                  </div>
                )}

                {/* Project Manager Management View */}
                {currentRole === 'admin' && activeView === 'project-managers' && !showIndividualDashboard && (
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">Project Manager Management</h5>
                        <small className="text-muted">Manage project managers and their assignments</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm">
                          <i className="fas fa-list me-1"></i> List View
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">
                          <i className="fas fa-th me-1"></i> Card View
                        </button>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => {
                            setEditingProjectManager(null);
                            setShowAddProjectManagerModal(true);
                          }}
                        >
                          <i className="fas fa-plus me-1"></i> Add Project Manager
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-user-tie me-2 text-primary"></i>
                          <span className="fw-bold">Total Project Managers: {projectManagers.length} persons</span>
                        </div>
                        <div className="d-flex gap-2">
                          <div className="input-group" style={{width: '300px'}}>
                            <span className="input-group-text"><i className="fas fa-search"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Search by name or department" 
                              value={pmSearchTerm}
                              onChange={(e) => setPmSearchTerm(e.target.value)}
                            />
                          </div>
                          <button className="btn btn-outline-secondary">
                            <i className="fas fa-filter me-1"></i> Filter
                          </button>
                          <button className="btn btn-outline-secondary">
                            <i className="fas fa-sort me-1"></i> Sort
                          </button>
                        </div>
                      </div>
                      
                      {/* Project Manager Cards */}
                      {projectManagers.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="fas fa-user-tie fa-3x text-muted mb-3"></i>
                          <h5 className="text-muted">No Project Managers Added</h5>
                          <p className="text-muted">Click "Add Project Manager" to get started</p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              setEditingProjectManager(null);
                              setShowAddProjectManagerModal(true);
                            }}
                          >
                            <i className="fas fa-plus me-1"></i> Add First Project Manager
                          </button>
                        </div>
                      ) : (
                        <div className="row">
                          {projectManagers.map((manager, index) => (
                            <div key={manager.id} className="col-md-6 col-lg-4 mb-4">
                              <div className="card h-100 border-2">
                                <div className="card-body">
                                  <div className="d-flex align-items-center mb-3">
                                    <div 
                                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                      style={{width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold'}}
                                    >
                                      {manager.name.charAt(0)}
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="card-title mb-1">{manager.name}</h6>
                                      <small className="text-muted">{manager.email}</small>
                                    </div>
                                    <div className="dropdown">
                                      <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                        <i className="fas fa-ellipsis-v"></i>
                                      </button>
                                      <ul className="dropdown-menu">
                                        <li>
                                          <button 
                                            className="dropdown-item"
                                            onClick={() => handleEditProjectManager(manager)}
                                          >
                                            <i className="fas fa-edit me-2"></i>Edit
                                          </button>
                                        </li>
                                        <li>
                                          <button 
                                            className="dropdown-item text-danger"
                                            onClick={() => handleDeleteProjectManager(manager.id, manager.name)}
                                          >
                                            <i className="fas fa-trash me-2"></i>Delete
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  
                                  <div className="row text-center mb-3">
                                    <div className="col-4">
                                      <div className="fw-bold text-primary">{manager.projectsAssigned || 0}</div>
                                      <small className="text-muted">Projects</small>
                                    </div>
                                    <div className="col-4">
                                      <div className="fw-bold text-success">{manager.teamSize || 0}</div>
                                      <small className="text-muted">Team Size</small>
                                    </div>
                                    <div className="col-4">
                                      <div className="fw-bold text-info">{manager.experience}</div>
                                      <small className="text-muted">Experience</small>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <small className="text-muted">Department:</small>
                                    <span className="ms-2 badge bg-light text-dark">{manager.department}</span>
                                  </div>
                                  
                                  {manager.specialization && (
                                    <div className="mb-2">
                                      <small className="text-muted">Specialization:</small>
                                      <span className="ms-2">{manager.specialization}</span>
                                    </div>
                                  )}
                                  
                                  <div className="mb-2">
                                    <small className="text-muted">Status:</small>
                                    <span className={`ms-2 badge ${manager.status === 'Active' ? 'bg-success' : 
                                      manager.status === 'Inactive' ? 'bg-danger' : 'bg-warning'}`}>
                                      {manager.status}
                                    </span>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <small className="text-muted">Joined:</small>
                                    <span className="ms-2">{new Date(manager.joiningDate).toLocaleDateString()}</span>
                                  </div>
                                  
                                  {manager.phone && (
                                    <div className="mb-2">
                                      <small className="text-muted">Phone:</small>
                                      <span className="ms-2">{manager.phone}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="card-footer bg-light">
                                  <div className="d-flex gap-2">
                                    <button 
                                      className="btn btn-sm btn-outline-primary flex-fill"
                                      onClick={() => handleEditProjectManager(manager)}
                                    >
                                      <i className="fas fa-edit me-1"></i>Edit
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-info flex-fill"
                                      onClick={() => handleViewProjectManager(manager)}
                                    >
                                      <i className="fas fa-eye me-1"></i>View
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          Showing {projectManagers.length} project managers • 
                          Active: {projectManagers.filter(pm => pm.status === 'Active').length} • 
                          Total Projects Managed: {projectManagers.reduce((sum, pm) => sum + (pm.projectsAssigned || 0), 0)}
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Project Manager Dashboard */}
                {currentRole === 'admin' && activeView === 'project-managers' && showIndividualDashboard && selectedProjectManager && (
                  <div>
                    {/* Header with Back Button */}
                    <div className="card mb-4" style={{background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', color: 'white'}}>
                      <div className="card-body py-4">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <div className="d-flex align-items-center">
                              <button 
                                className="btn btn-light btn-sm me-3"
                                onClick={handleBackToProjectManagers}
                              >
                                <i className="fas fa-arrow-left me-1"></i> Back
                              </button>
                              <div>
                                <h3 className="mb-1">{selectedProjectManager.name} - Dashboard</h3>
                                <p className="mb-0 opacity-75">Project Manager Individual Dashboard</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end mt-3 mt-md-0">
                            <div className="d-flex align-items-center justify-content-md-end">
                              <div 
                                className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3"
                                style={{width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold'}}
                              >
                                {selectedProjectManager.name.charAt(0)}
                              </div>
                              <div className="text-start text-md-end">
                                <div className="fw-bold">{selectedProjectManager.email}</div>
                                <small className="opacity-75">{selectedProjectManager.department}</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Stats Cards */}
                    <div className="row mb-4">
                      <div className="col-md-3 mb-3">
                        <div 
                          className={`card h-100 border-0 shadow-sm ${activeDetailView === 'projects' ? 'border-primary' : ''}`}
                          onClick={() => handleDetailViewClick('projects')}
                          style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div className="card-body text-center">
                            <div className="mb-2">
                              <i className="fas fa-project-diagram fa-2x text-primary"></i>
                            </div>
                            <h4 className="mb-1 text-primary">{selectedProjectManager.projectsAssigned || 0}</h4>
                            <p className="text-muted mb-0">Assigned Projects</p>
                            <small className="text-primary"><i className="fas fa-mouse-pointer me-1"></i>Click to view details</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div 
                          className={`card h-100 border-0 shadow-sm ${activeDetailView === 'members' ? 'border-success' : ''}`}
                          onClick={() => handleDetailViewClick('members')}
                          style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div className="card-body text-center">
                            <div className="mb-2">
                              <i className="fas fa-users fa-2x text-success"></i>
                            </div>
                            <h4 className="mb-1 text-success">{selectedProjectManager.teamSize || 0}</h4>
                            <p className="text-muted mb-0">Total Project Members</p>
                            <small className="text-success"><i className="fas fa-mouse-pointer me-1"></i>Click to view details</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div 
                          className={`card h-100 border-0 shadow-sm ${activeDetailView === 'tasks' ? 'border-warning' : ''}`}
                          onClick={() => handleDetailViewClick('tasks')}
                          style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div className="card-body text-center">
                            <div className="mb-2">
                              <i className="fas fa-tasks fa-2x text-warning"></i>
                            </div>
                            <h4 className="mb-1 text-warning">{assignedTasks.filter(task => isUserAssignedToTask(task, selectedProjectManager.name)).length}</h4>
                            <p className="text-muted mb-0">Assigned Tasks</p>
                            <small className="text-warning"><i className="fas fa-mouse-pointer me-1"></i>Click to view details</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body text-center">
                            <div className="mb-2">
                              <i className="fas fa-clock fa-2x text-info"></i>
                            </div>
                            <h4 className="mb-1 text-info">{selectedProjectManager.experience}</h4>
                            <p className="text-muted mb-0">Experience</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Views */}
                    {activeDetailView === 'projects' && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <div className="card border-primary">
                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                              <h5 className="mb-0"><i className="fas fa-project-diagram me-2"></i>Assigned Projects Details</h5>
                              <button 
                                className="btn btn-light btn-sm"
                                onClick={() => setActiveDetailView(null)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                            <div className="card-body">
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead>
                                    <tr>
                                      <th>Project Name</th>
                                      <th>Client</th>
                                      <th>Status</th>
                                      <th>Progress</th>
                                      <th>Start Date</th>
                                      <th>End Date</th>
                                      <th>Budget</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {/* Sample project data */}
                                    {Array.from({length: selectedProjectManager.projectsAssigned || 3}, (_, index) => (
                                      <tr key={index}>
                                        <td>
                                          <div className="fw-semibold">Project {index + 1}</div>
                                          <small className="text-muted">Web Development</small>
                                        </td>
                                        <td>Client {String.fromCharCode(65 + index)} Corp</td>
                                        <td>
                                          <span className={`badge ${
                                            index % 3 === 0 ? 'bg-success' : 
                                            index % 3 === 1 ? 'bg-primary' : 'bg-warning'
                                          }`}>
                                            {index % 3 === 0 ? 'Completed' : 
                                             index % 3 === 1 ? 'In Progress' : 'Planning'}
                                          </span>
                                        </td>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <div className="progress me-2" style={{width: '80px', height: '8px'}}>
                                              <div 
                                                className="progress-bar" 
                                                style={{width: `${(index + 1) * 30}%`}}
                                              ></div>
                                            </div>
                                            <small>{(index + 1) * 30}%</small>
                                          </div>
                                        </td>
                                        <td>2024-0{index + 1}-15</td>
                                        <td>2024-{String(index + 6).padStart(2, '0')}-15</td>
                                        <td className="text-success fw-bold">${(index + 1) * 50000}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDetailView === 'members' && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <div className="card border-success">
                            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                              <h5 className="mb-0"><i className="fas fa-users me-2"></i>Project Members Details</h5>
                              <button 
                                className="btn btn-light btn-sm"
                                onClick={() => setActiveDetailView(null)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                {Array.from({length: selectedProjectManager.teamSize || 6}, (_, index) => (
                                  <div key={index} className="col-md-6 col-lg-4 mb-3">
                                    <div className="card border h-100">
                                      <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                          <div 
                                            className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
                                            style={{width: '50px', height: '50px', fontSize: '18px'}}
                                          >
                                            {String.fromCharCode(65 + index)}
                                          </div>
                                          <div>
                                            <h6 className="mb-1">Team Member {index + 1}</h6>
                                            <small className="text-muted">member{index + 1}@company.com</small>
                                          </div>
                                        </div>
                                        <div className="mb-2">
                                          <strong>Role:</strong> {
                                            index % 4 === 0 ? 'Senior Developer' :
                                            index % 4 === 1 ? 'UI/UX Designer' :
                                            index % 4 === 2 ? 'Backend Developer' : 'QA Engineer'
                                          }
                                        </div>
                                        <div className="mb-2">
                                          <strong>Experience:</strong> {index + 2} years
                                        </div>
                                        <div className="mb-2">
                                          <strong>Status:</strong> 
                                          <span className={`ms-1 badge ${index % 2 === 0 ? 'bg-success' : 'bg-primary'}`}>
                                            {index % 2 === 0 ? 'Available' : 'Busy'}
                                          </span>
                                        </div>
                                        <div>
                                          <strong>Skills:</strong>
                                          <div className="mt-1">
                                            {index % 4 === 0 && <><span className="badge bg-light text-dark me-1">React</span><span className="badge bg-light text-dark">Node.js</span></>}
                                            {index % 4 === 1 && <><span className="badge bg-light text-dark me-1">Figma</span><span className="badge bg-light text-dark">Adobe XD</span></>}
                                            {index % 4 === 2 && <><span className="badge bg-light text-dark me-1">Python</span><span className="badge bg-light text-dark">MongoDB</span></>}
                                            {index % 4 === 3 && <><span className="badge bg-light text-dark me-1">Testing</span><span className="badge bg-light text-dark">Automation</span></>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDetailView === 'tasks' && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <div className="card border-warning">
                            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                              <h5 className="mb-0"><i className="fas fa-tasks me-2"></i>Assigned Tasks Details</h5>
                              <button 
                                className="btn btn-dark btn-sm"
                                onClick={() => setActiveDetailView(null)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                            <div className="card-body">
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead>
                                    <tr>
                                      <th>Task Name</th>
                                      <th>Project</th>
                                      <th>Priority</th>
                                      <th>Status</th>
                                      <th>Assigned To</th>
                                      <th>Due Date</th>
                                      <th>Progress</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {/* Sample task data */}
                                    {Array.from({length: 8}, (_, index) => (
                                      <tr key={index}>
                                        <td>
                                          <div className="fw-semibold">Task {index + 1}</div>
                                          <small className="text-muted">
                                            {index % 3 === 0 ? 'Frontend Development' :
                                             index % 3 === 1 ? 'Backend API' : 'Testing & QA'}
                                          </small>
                                        </td>
                                        <td>Project {Math.floor(index / 3) + 1}</td>
                                        <td>
                                          <span className={`badge ${
                                            index % 3 === 0 ? 'bg-danger' :
                                            index % 3 === 1 ? 'bg-warning' : 'bg-success'
                                          }`}>
                                            {index % 3 === 0 ? 'High' :
                                             index % 3 === 1 ? 'Medium' : 'Low'}
                                          </span>
                                        </td>
                                        <td>
                                          <span className={`badge ${
                                            index % 4 === 0 ? 'bg-success' :
                                            index % 4 === 1 ? 'bg-primary' :
                                            index % 4 === 2 ? 'bg-warning' : 'bg-secondary'
                                          }`}>
                                            {index % 4 === 0 ? 'Completed' :
                                             index % 4 === 1 ? 'In Progress' :
                                             index % 4 === 2 ? 'Review' : 'Todo'}
                                          </span>
                                        </td>
                                        <td>Team Member {(index % 6) + 1}</td>
                                        <td>2024-12-{String(15 + index).padStart(2, '0')}</td>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <div className="progress me-2" style={{width: '60px', height: '8px'}}>
                                              <div 
                                                className="progress-bar" 
                                                style={{width: `${(index + 1) * 12}%`}}
                                              ></div>
                                            </div>
                                            <small>{(index + 1) * 12}%</small>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Team Leader Management View */}
                {(currentRole === 'admin' || currentRole === 'project-manager') && activeView === 'team-leaders' && (
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">Team Leader Management</h5>
                        <small className="text-muted">Manage team leaders and their assignments</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button 
                          className={`btn btn-sm ${teamLeaderViewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setTeamLeaderViewMode('list')}
                        >
                          <i className="fas fa-list me-1"></i> List View
                        </button>
                        <button 
                          className={`btn btn-sm ${teamLeaderViewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setTeamLeaderViewMode('card')}
                        >
                          <i className="fas fa-th me-1"></i> Card View
                        </button>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => {
                            setEditingTeamLeader(null);
                            setShowAddTeamLeaderModal(true);
                          }}
                        >
                          <i className="fas fa-plus me-1"></i> Add Team Leader
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-users-cog me-2 text-primary"></i>
                          <span className="fw-bold">Total Team Leaders: {teamLeaders.length} persons</span>
                        </div>
                        <div className="d-flex gap-2">
                          <div className="input-group" style={{width: '300px'}}>
                            <span className="input-group-text"><i className="fas fa-search"></i></span>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Search by name or department" 
                              value={teamLeaderSearchTerm}
                              onChange={(e) => setTeamLeaderSearchTerm(e.target.value)}
                            />
                          </div>
                          <button className="btn btn-outline-secondary">
                            <i className="fas fa-filter me-1"></i> Filter
                          </button>
                          <button className="btn btn-outline-secondary">
                            <i className="fas fa-sort me-1"></i> Sort
                          </button>
                        </div>
                      </div>
                      
                      {/* Team Leader Cards */}
                      {(() => {
                        const filteredLeaders = getFilteredTeamLeaders();
                        
                        if (teamLeaders.length === 0) {
                          return (
                            <div className="text-center py-5">
                              <i className="fas fa-users-cog fa-3x text-muted mb-3"></i>
                              <h5 className="text-muted">No Team Leaders Added</h5>
                              <p className="text-muted">Click "Add Team Leader" to get started</p>
                              <button 
                                className="btn btn-primary"
                                onClick={() => {
                                  setEditingTeamLeader(null);
                                  setShowAddTeamLeaderModal(true);
                                }}
                              >
                                <i className="fas fa-plus me-1"></i> Add First Team Leader
                              </button>
                            </div>
                          );
                        }
                        
                        if (filteredLeaders.length === 0) {
                          return (
                            <div className="text-center py-5">
                              <i className="fas fa-search fa-3x text-muted mb-3"></i>
                              <h5 className="text-muted">No Team Leaders Found</h5>
                              <p className="text-muted">Try adjusting your search criteria</p>
                            </div>
                          );
                        }
                        
                        if (teamLeaderViewMode === 'list') {
                          return (
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th>Team Leader</th>
                                    <th>Department</th>
                                    <th>Projects</th>
                                    <th>Team Size</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredLeaders.map((leader, index) => (
                                    <tr key={leader.id}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <div 
                                            className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
                                            style={{width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold'}}
                                          >
                                            {leader.name.charAt(0)}
                                          </div>
                                          <div>
                                            <div className="fw-bold">{leader.name}</div>
                                            <small className="text-muted">{leader.email}</small>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <span className="badge bg-light text-dark">{leader.department}</span>
                                      </td>
                                      <td>
                                        <span className="fw-bold text-primary">{leader.projectsManaged || 0}</span>
                                      </td>
                                      <td>
                                        <span className="fw-bold text-success">{leader.teamSize || 0}</span>
                                      </td>
                                      <td>
                                        <span className={`badge ${leader.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                          {leader.status}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="d-flex gap-2">
                                          <button 
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleEditTeamLeader(leader)}
                                          >
                                            <i className="fas fa-edit"></i>
                                          </button>
                                          <button 
                                            className="btn btn-sm btn-outline-info"
                                            onClick={() => alert(`Team Leader Details:\n\nName: ${leader.name}\nEmail: ${leader.email}\nDepartment: ${leader.department}\nTeam Size: ${leader.teamSize}\nProjects: ${leader.projectsManaged}\nSkills: ${leader.skills?.join(', ') || 'None'}`)}
                                          >
                                            <i className="fas fa-eye"></i>
                                          </button>
                                          <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteTeamLeader(leader.id, leader.name)}
                                          >
                                            <i className="fas fa-trash"></i>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="row">
                            {filteredLeaders.map((leader, index) => (
                            <div key={leader.id} className="col-md-6 col-lg-4 mb-4">
                              <div className="card h-100 border-2">
                                <div className="card-body">
                                  <div className="d-flex align-items-center mb-3">
                                    <div 
                                      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
                                      style={{width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold'}}
                                    >
                                      {leader.name.charAt(0)}
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="card-title mb-1">{leader.name}</h6>
                                      <small className="text-muted">{leader.email}</small>
                                    </div>
                                    <div className="dropdown">
                                      <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                        <i className="fas fa-ellipsis-v"></i>
                                      </button>
                                      <ul className="dropdown-menu">
                                        <li>
                                          <button 
                                            className="dropdown-item"
                                            onClick={() => handleEditTeamLeader(leader)}
                                          >
                                            <i className="fas fa-edit me-2"></i>Edit
                                          </button>
                                        </li>
                                        <li>
                                          <button 
                                            className="dropdown-item text-danger"
                                            onClick={() => handleDeleteTeamLeader(leader.id, leader.name)}
                                          >
                                            <i className="fas fa-trash me-2"></i>Delete
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  
                                  <div className="row text-center mb-3">
                                    <div className="col-4">
                                      <div className="fw-bold text-primary">{leader.projectsManaged || 0}</div>
                                      <small className="text-muted">Projects</small>
                                    </div>
                                    <div className="col-4">
                                      <div className="fw-bold text-success">{leader.teamSize || 0}</div>
                                      <small className="text-muted">Team Size</small>
                                    </div>
                                    <div className="col-4">
                                      <div className="fw-bold text-info">{leader.skills?.length || 0}</div>
                                      <small className="text-muted">Skills</small>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <small className="text-muted">Department:</small>
                                    <span className="ms-2 badge bg-light text-dark">{leader.department}</span>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <small className="text-muted">Status:</small>
                                    <span className={`ms-2 badge ${leader.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                      {leader.status}
                                    </span>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <small className="text-muted">Joined:</small>
                                    <span className="ms-2">{new Date(leader.joinDate).toLocaleDateString()}</span>
                                  </div>
                                  
                                  {leader.managedBy && (
                                    <div className="mb-2">
                                      <small className="text-muted">Managed by:</small>
                                      <span className="ms-2">{leader.managedBy}</span>
                                    </div>
                                  )}
                                  
                                  {leader.skills && leader.skills.length > 0 && (
                                    <div className="mb-2">
                                      <small className="text-muted">Skills:</small>
                                      <div className="mt-1">
                                        {leader.skills.slice(0, 3).map((skill, idx) => (
                                          <span key={idx} className="badge bg-light text-dark me-1 mb-1">{skill}</span>
                                        ))}
                                        {leader.skills.length > 3 && (
                                          <span className="badge bg-secondary">+{leader.skills.length - 3}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="card-footer bg-light">
                                  <div className="d-flex gap-2">
                                    <button 
                                      className="btn btn-sm btn-outline-primary flex-fill"
                                      onClick={() => handleEditTeamLeader(leader)}
                                    >
                                      <i className="fas fa-edit me-1"></i>Edit
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-info flex-fill"
                                      onClick={() => alert(`Team Leader Details:\n\nName: ${leader.name}\nEmail: ${leader.email}\nDepartment: ${leader.department}\nTeam Size: ${leader.teamSize}\nProjects: ${leader.projectsManaged}\nSkills: ${leader.skills?.join(', ') || 'None'}`)}
                                    >
                                      <i className="fas fa-eye me-1"></i>View
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        );
                      })()}
                      
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          {(() => {
                            const filteredLeaders = getFilteredTeamLeaders();
                            return `Showing ${filteredLeaders.length} of ${teamLeaders.length} team leaders • 
                            Active: ${filteredLeaders.filter(tl => tl.status === 'Active').length} • 
                            Total Team Members: ${filteredLeaders.reduce((sum, tl) => sum + (tl.teamSize || 0), 0)}`;
                          })()}
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Role Management View */}
                {currentRole === 'admin' && activeView === 'role-management' && (
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">Role Management</h5>
                        <small className="text-muted">Create and manage custom roles with specific permissions</small>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => setShowAddRoleModal(true)}
                      >
                        <i className="fas fa-plus me-1"></i> Create New Role
                      </button>
                    </div>
                    <div className="card-body">
                      {/* Default Roles */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">Default System Roles</h6>
                        <div className="row">
                          {[
                            { name: 'Admin', icon: 'fas fa-user-shield', color: 'danger', description: 'Full system access and management', users: allUsers.filter(u => u.role === 'admin').length },
                            { name: 'Project Manager', icon: 'fas fa-user-tie', color: 'primary', description: 'Manage projects and team leaders', users: projectManagers.length },
                            { name: 'Team Leader', icon: 'fas fa-users-cog', color: 'success', description: 'Lead teams and manage tasks', users: teamLeaders.length },
                            { name: 'Employee', icon: 'fas fa-user', color: 'info', description: 'Basic user access', users: allUsers.filter(u => u.role === 'employee').length }
                          ].map((role, index) => (
                            <div key={index} className="col-md-6 col-lg-3 mb-3">
                              <div className="card border h-100">
                                <div className="card-body text-center">
                                  <div className={`rounded-circle bg-${role.color} text-white d-inline-flex align-items-center justify-content-center mb-3`}
                                       style={{width: '60px', height: '60px', fontSize: '24px'}}>
                                    <i className={role.icon}></i>
                                  </div>
                                  <h6 className="card-title">{role.name}</h6>
                                  <p className="text-muted small">{role.description}</p>
                                  <div className={`badge bg-${role.color}`}>{role.users} users</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Roles */}
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="text-muted mb-0">Custom Roles</h6>
                          <span className="badge bg-secondary">{customRoles.length} custom roles</span>
                        </div>
                        
                        {customRoles.length === 0 ? (
                          <div className="text-center py-4">
                            <i className="fas fa-user-plus fa-3x text-muted mb-3"></i>
                            <h6 className="text-muted">No Custom Roles Created</h6>
                            <p className="text-muted">Create custom roles to fit your organization's needs</p>
                            <button 
                              className="btn btn-primary"
                              onClick={() => setShowAddRoleModal(true)}
                            >
                              <i className="fas fa-plus me-1"></i> Create First Custom Role
                            </button>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th>Role Name</th>
                                  <th>Description</th>
                                  <th>Permissions</th>
                                  <th>Users</th>
                                  <th>Created By</th>
                                  <th>Created Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customRoles.map((role) => (
                                  <tr key={role.id}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className={`rounded-circle bg-${role.color || 'secondary'} text-white d-flex align-items-center justify-content-center me-2`}
                                             style={{width: '30px', height: '30px', fontSize: '12px'}}>
                                          <i className={role.icon || 'fas fa-user'}></i>
                                        </div>
                                        <strong>{role.name}</strong>
                                      </div>
                                    </td>
                                    <td>{role.description}</td>
                                    <td>
                                      {role.permissions?.slice(0, 3).map((perm, idx) => (
                                        <span key={idx} className="badge bg-light text-dark me-1">{perm}</span>
                                      ))}
                                      {role.permissions?.length > 3 && (
                                        <span className="badge bg-secondary">+{role.permissions.length - 3}</span>
                                      )}
                                    </td>
                                    <td>
                                      <span className="badge bg-info">{role.userCount || 0} users</span>
                                    </td>
                                    <td>{role.createdBy}</td>
                                    <td>{new Date(role.createdAt).toLocaleDateString()}</td>
                                    <td>
                                      <div className="btn-group btn-group-sm">
                                        <button 
                                          className="btn btn-outline-primary"
                                          onClick={() => alert(`Edit role: ${role.name}`)}
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                          className="btn btn-outline-danger"
                                          onClick={() => handleDeleteCustomRole(role.id, role.name)}
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* All Users View */}
                {(currentRole === 'admin' || currentRole === 'project-manager') && activeView === 'all-users' && (
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">All Users</h5>
                        <small className="text-muted">Complete list of all system users with their details</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm">
                          <i className="fas fa-filter me-1"></i> Filter
                        </button>
                        <button className="btn btn-outline-primary btn-sm">
                          <i className="fas fa-download me-1"></i> Export
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowAddUserModal(true)}
                        >
                          <i className="fas fa-plus me-1"></i> New User
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Name</th>
                              <th>ID</th>
                              <th>Department</th>
                              <th>Project Name</th>
                              <th>Role</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAndSortedUsers.map((user, index) => (
                                <tr key={index}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div 
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                        style={{width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold'}}
                                      >
                                        {user.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="fw-semibold">{user.name}</div>
                                        <small className="text-muted">{user.email}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-secondary">{user.id || `EMP${String(index + 1).padStart(3, '0')}`}</span>
                                  </td>
                                  <td>
                                    <div>
                                      <div className="fw-medium">{user.department}</div>
                                      <small className="text-muted">{user.role}</small>
                                    </div>
                                  </td>
                                  <td>
                                    {user.assignedProject ? (
                                      <div>
                                        <div className="fw-medium text-primary">{user.assignedProject}</div>
                                        <small className="text-muted">Active Project</small>
                                      </div>
                                    ) : (
                                      <span className="text-muted">No project assigned</span>
                                    )}
                                  </td>
                                  <td>
                                    <small className="text-muted">{user.role}</small>
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      user.assignedProject ? 'bg-danger' : 'bg-success'
                                    }`}>
                                      {user.assignedProject ? 'Assigned' : 'Not Assigned'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="btn-group" role="group">
                                      <button 
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => alert(`User Details:\n\nID: ${user.id || `EMP${String(index + 1).padStart(3, '0')}`}\nName: ${user.name}\nDepartment: ${user.department}\nRole: ${user.role}\nEmail: ${user.email}\nProject: ${user.assignedProject || 'No project assigned'}\nStatus: ${user.assignedProject ? 'Assigned' : 'Not Assigned'}\nJoin Date: ${user.joinDate}`)}
                                        title="View User Details"
                                      >
                                        <i className="fas fa-eye"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleEditUser(user)}
                                        title="Edit User"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeleteUser(user.id || user._id || `EMP${String(index + 1).padStart(3, '0')}`, user.name)}
                                        title="Delete User"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          Showing {allUsers.length} users • Total Active: {allUsers.filter(u => u.status === 'Active').length} • 
                          Assigned to Projects: {allUsers.filter(u => u.projectStatus === 'Assigned').length}
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Projects View */}
                {(currentRole === 'admin' || currentRole === 'project-manager') && activeView === 'projects' && (
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">Active Projects</h5>
                        <small className="text-muted">Manage and track project progress</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm">
                          <i className="fas fa-filter me-1"></i> Filter
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowAddProjectModal(true)}
                        >
                          <i className="fas fa-plus me-1"></i> New Project
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Name</th>
                              <th>Progress</th>
                              <th>Status</th>
                              <th>Assigned</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingProjects ? (
                              <tr>
                                <td colSpan="5" className="text-center py-4">
                                  <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  <div className="mt-2">Loading projects...</div>
                                </td>
                              </tr>
                            ) : projects.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">
                                  No projects found. Click "New Project" to add one.
                                </td>
                              </tr>
                            ) : projects.map((project, index) => (
                              <tr key={index}>
                                <td>
                                  <div>
                                    <div className="fw-semibold">{project.name}</div>
                                    <small className="text-muted">{project.date}</small>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <span className="me-2">{project.progress}%</span>
                                    <div className="progress" style={{width: '100px', height: '6px'}}>
                                      <div 
                                        className={`progress-bar ${
                                          project.progress === 100 ? 'bg-success' : 
                                          project.progress >= 70 ? 'bg-primary' : 
                                          project.progress >= 40 ? 'bg-warning' : 'bg-danger'
                                        }`} 
                                        role="progressbar" 
                                        style={{width: `${project.progress}%`}}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    project.status === 'Completed' ? 'bg-success' :
                                    project.status === 'On Track' ? 'bg-primary' :
                                    project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
                                  }`}>
                                    {project.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {project.assigned.slice(0, 3).map((person, idx) => (
                                      <div 
                                        key={idx}
                                        className={`rounded-circle text-white d-flex align-items-center justify-content-center me-1 ${person.color}`}
                                        style={{width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold', marginLeft: idx > 0 ? '-8px' : '0'}}
                                        title={person.name}
                                      >
                                        {person.name.charAt(0)}
                                      </div>
                                    ))}
                                    {project.extra > 0 && (
                                      <div 
                                        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                                        style={{width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold', marginLeft: '-8px'}}
                                      >
                                        +{project.extra}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="btn-group" role="group">
                                    <button 
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() => handleViewProject(project)}
                                      title="View Project Details"
                                    >
                                      <i className="fas fa-eye"></i>
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleEditProject(project)}
                                      title="Edit Project"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDeleteProject(project.id, project.name)}
                                      title="Delete Project"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-center mt-3">
                        <a href="#" className="text-decoration-none text-primary">
                          <i className="fas fa-arrow-right me-1"></i>
                          View All Projects
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Target Detail View */}
                {currentRole === 'admin' && activeView === 'monthly-target' && (
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Monthly Target Details</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="text-center mb-4">
                            <div className="position-relative d-inline-flex align-items-center justify-content-center mb-3" style={{width: '200px', height: '200px'}}>
                              <svg width="200" height="200" className="position-absolute">
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#e9ecef" strokeWidth="12"></circle>
                                <circle cx="100" cy="100" r="80" fill="none" stroke="#4f46e5" strokeWidth="12" strokeDasharray="502" strokeDashoffset="123" strokeLinecap="round" transform="rotate(-90 100 100)"></circle>
                              </svg>
                              <div className="text-center">
                                <h2 className="mb-0">75.55%</h2>
                                <small className="text-success fw-bold">+10%</small>
                              </div>
                            </div>
                            <p className="text-muted">Target you've set for each month</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-4">
                            <h6 className="text-muted mb-3">Performance Metrics</h6>
                            <div className="row">
                              <div className="col-4 text-center">
                                <div className="border rounded p-3">
                                  <h5 className="text-danger mb-1">$20K <i className="fas fa-arrow-down"></i></h5>
                                  <small className="text-muted">Target</small>
                                </div>
                              </div>
                              <div className="col-4 text-center">
                                <div className="border rounded p-3">
                                  <h5 className="text-success mb-1">$20K <i className="fas fa-arrow-up"></i></h5>
                                  <small className="text-muted">Revenue</small>
                                </div>
                              </div>
                              <div className="col-4 text-center">
                                <div className="border rounded p-3">
                                  <h5 className="text-success mb-1">$20K <i className="fas fa-arrow-up"></i></h5>
                                  <small className="text-muted">Today</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="alert alert-success" role="alert">
                            <h6 className="alert-heading">Great Progress!</h6>
                            <p className="mb-0">You earn $3287 today, it's higher than last month. Keep up your good work!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Revenue View */}
                {currentRole === 'admin' && activeView === 'revenue' && (
                  <div>
                    {/* Active Projects Financial Details */}
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Active Projects</h5>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary">{projects.length} Projects</span>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setEditingProject(null);
                              setShowAddProjectModal(true);
                            }}
                          >
                            <i className="fas fa-plus me-1"></i> Add Project
                          </button>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead style={{background: '#f8f9fa'}}>
                              <tr>
                                <th className="border-0 px-4 py-3">Project name | Client</th>
                                <th className="border-0 px-4 py-3">Due date</th>
                                <th className="border-0 px-4 py-3">Progress</th>
                                <th className="border-0 px-4 py-3">Income</th>
                                <th className="border-0 px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projects.length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="text-center py-4 text-muted">
                                    <i className="fas fa-inbox fa-2x mb-2"></i>
                                    <p>No active projects found</p>
                                  </td>
                                </tr>
                              ) : (
                                projects.map((project, index) => {
                                  const projectCost = parseFloat(project.projectCost) || 0;
                                  const advancePayment = parseFloat(project.advancePayment) || 0;
                                  const remainingPayment = projectCost - advancePayment;
                                  const progress = parseInt(project.progress) || 0;
                                  
                                  return (
                                    <tr key={project.id || index}>
                                      <td className="px-4 py-3">
                                        <div className="d-flex align-items-center">
                                          <div 
                                            className="rounded-circle me-2" 
                                            style={{
                                              width: '8px', 
                                              height: '8px', 
                                              background: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4'][index % 4]
                                            }}
                                          ></div>
                                          <div>
                                            <div className="fw-bold">{project.name}</div>
                                            <small className="text-muted">{project.clientName}</small>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        {new Date(project.endDate).toLocaleDateString('en-US', { 
                                          day: 'numeric', 
                                          month: 'numeric' 
                                        })}
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="d-flex align-items-center">
                                          <div className="progress flex-grow-1 me-2" style={{height: '8px', width: '80px'}}>
                                            <div 
                                              className="progress-bar" 
                                              role="progressbar" 
                                              style={{
                                                width: `${progress}%`,
                                                background: progress < 30 ? '#ffd93d' : progress < 70 ? '#4ecdc4' : '#6bcf7f'
                                              }}
                                              aria-valuenow={progress} 
                                              aria-valuemin="0" 
                                              aria-valuemax="100"
                                            ></div>
                                          </div>
                                          <span className="text-muted small">{progress}%</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div>
                                          <div className="fw-bold">{projectCost.toLocaleString()}.00</div>
                                          <small className="text-success">{advancePayment.toLocaleString()}.00</small>
                                        </div>
                                        <small className="text-muted d-block">{progress}%</small>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`badge ${
                                          project.status === 'Completed' ? 'bg-success' :
                                          project.status === 'On Track' ? 'bg-primary' :
                                          project.status === 'At Risk' ? 'bg-warning' :
                                          'bg-danger'
                                        }`}>
                                          {project.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Dashboard View */}
                {currentRole === 'admin' && activeView === 'client-dashboard' && (
                  <div>
                    <div className="row">
                      {/* Client Projects Table */}
                      <div className="col-lg-12">
                        <div className="card">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Client Projects Overview</h5>
                            <div className="d-flex">
                              <div className="position-relative me-2">
                                <i className="fas fa-search position-absolute" style={{left: '15px', top: '12px', color: '#6c757d'}}></i>
                                <input type="text" className="form-control" placeholder="Search projects..." style={{paddingLeft: '40px', borderRadius: '50px', border: '1px solid #e2e8f0'}} />
                              </div>
                              <button className="btn me-2" style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '8px 20px', color: '#6c757d'}}>
                                <i className="fas fa-filter me-1"></i> Filter
                              </button>
                              <button 
                                className="btn btn-primary"
                                onClick={() => setShowAddProjectModal(true)}
                                style={{borderRadius: '50px', padding: '8px 20px'}}
                              >
                                <i className="fas fa-plus me-1"></i> New Project
                              </button>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Client Name</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Name</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Manager</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Cost</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Advance Payment</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Status</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Report</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {projects.map((project) => {
                                    const getProjectStatusBadge = (status) => {
                                      const statusConfig = {
                                        'Completed': { bg: '#28a745', text: 'white', label: 'Completed' },
                                        'On Track': { bg: '#007bff', text: 'white', label: 'On Track' },
                                        'At Risk': { bg: '#ffc107', text: 'black', label: 'At Risk' },
                                        'Delayed': { bg: '#dc3545', text: 'white', label: 'Delayed' }
                                      };
                                      const config = statusConfig[status] || statusConfig['On Track'];
                                      return (
                                        <span style={{
                                          padding: '5px 10px',
                                          borderRadius: '20px',
                                          fontSize: '0.8rem',
                                          fontWeight: '500',
                                          backgroundColor: config.bg,
                                          color: config.text
                                        }}>
                                          {config.label}
                                        </span>
                                      );
                                    };

                                    return (
                                      <tr key={project.id}>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <div className="me-3">
                                              <i className="fas fa-user-tie text-primary p-2 rounded-circle" style={{backgroundColor: 'rgba(67, 97, 238, 0.1)'}}></i>
                                            </div>
                                            <div>
                                              <div className="fw-semibold">{project.clientName || 'N/A'}</div>
                                              <small className="text-muted">Client</small>
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="fw-semibold text-primary">{project.name}</div>
                                          <small className="text-muted">Started: {project.date}</small>
                                        </td>
                                        <td>
                                          <div className="fw-semibold">{project.projectManager || 'Not Assigned'}</div>
                                          <small className="text-muted">Manager</small>
                                        </td>
                                        <td>
                                          <div className="fw-bold text-success">${project.projectCost ? project.projectCost.toLocaleString() : '0'}</div>
                                          <small className="text-muted">Total Cost</small>
                                        </td>
                                        <td>
                                          <div className="fw-bold text-info">${project.advancePayment ? project.advancePayment.toLocaleString() : '0'}</div>
                                          <small className="text-muted">Paid in Advance</small>
                                        </td>
                                        <td>{getProjectStatusBadge(project.status)}</td>
                                        <td>
                                          <button 
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleViewProject(project)}
                                          >
                                            <i className="fas fa-file-alt me-1"></i>
                                            View Report
                                          </button>
                                        </td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <button 
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => handleEditProject(project)}
                                              title="Edit Project"
                                            >
                                              <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() => handleDeleteProject(project.id, project.name)}
                                              title="Delete Project"
                                            >
                                              <i className="fas fa-trash"></i>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clients Overview View */}
                {currentRole === 'admin' && activeView === 'clients-overview' && (
                  <div>
                    {/* Clients Overview Header */}
                    <div className="card mb-4" style={{background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', color: 'white', borderRadius: '0 0 20px 20px'}}>
                      <div className="card-body py-4">
                        <div className="row align-items-center">
                          <div className="col-md-6">
                            <h3 className="mb-1">Clients Overview</h3>
                            <p className="mb-0 opacity-75">Track client projects, payments, and progress</p>
                          </div>
                          <div className="col-md-6 text-md-end mt-3 mt-md-0">
                            <button className="btn btn-light me-2">
                              <i className="fas fa-download me-1"></i> Export Report
                            </button>
                            <button 
                              className="btn btn-light"
                              onClick={() => setShowAddProjectModal(true)}
                            >
                              <i className="fas fa-plus me-1"></i> New Project
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      {/* Clients Projects Table */}
                      <div className="col-12">
                        <div className="card">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Client Projects Data</h5>
                            <div className="d-flex">
                              <div className="position-relative me-2">
                                <i className="fas fa-search position-absolute" style={{left: '15px', top: '12px', color: '#6c757d'}}></i>
                                <input type="text" className="form-control" placeholder="Search clients..." style={{paddingLeft: '40px', borderRadius: '50px', border: '1px solid #e2e8f0'}} />
                              </div>
                              <button className="btn" style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '8px 20px', color: '#6c757d'}}>
                                <i className="fas fa-filter me-1"></i> Filter
                              </button>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Client Name</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Name</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Manager</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Cost</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Advance Payment</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Status</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Project Report</th>
                                    <th style={{borderTop: 'none', fontWeight: '600', color: '#4361ee'}}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {projects.map((project) => {
                                    const getProjectStatusBadge = (status) => {
                                      const statusConfig = {
                                        'Completed': { bg: '#28a745', text: 'white', label: 'Completed' },
                                        'On Track': { bg: '#007bff', text: 'white', label: 'On Track' },
                                        'At Risk': { bg: '#ffc107', text: 'black', label: 'At Risk' },
                                        'Delayed': { bg: '#dc3545', text: 'white', label: 'Delayed' }
                                      };
                                      const config = statusConfig[status] || statusConfig['On Track'];
                                      return (
                                        <span style={{
                                          padding: '5px 10px',
                                          borderRadius: '20px',
                                          fontSize: '0.8rem',
                                          fontWeight: '500',
                                          backgroundColor: config.bg,
                                          color: config.text
                                        }}>
                                          {config.label}
                                        </span>
                                      );
                                    };
                                    
                                    return (
                                      <tr key={project.id}>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <div className="me-3">
                                              <i className="fas fa-user-tie text-primary p-2 rounded-circle" style={{backgroundColor: 'rgba(67, 97, 238, 0.1)'}}></i>
                                            </div>
                                            <div>
                                              <div className="fw-semibold">{project.clientName || 'N/A'}</div>
                                              <small className="text-muted">Client</small>
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="fw-semibold text-primary">{project.name}</div>
                                          <small className="text-muted">Started: {project.date}</small>
                                        </td>
                                        <td>
                                          <div className="fw-semibold">{project.projectManager || 'Not Assigned'}</div>
                                          <small className="text-muted">Manager</small>
                                        </td>
                                        <td>
                                          <div className="fw-bold text-success">${project.projectCost ? project.projectCost.toLocaleString() : '0'}</div>
                                          <small className="text-muted">Total Cost</small>
                                        </td>
                                        <td>
                                          <div className="fw-bold text-info">${project.advancePayment ? project.advancePayment.toLocaleString() : '0'}</div>
                                          <small className="text-muted">Paid in Advance</small>
                                        </td>
                                        <td>{getProjectStatusBadge(project.status)}</td>
                                        <td>
                                          <button 
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleViewProject(project)}
                                          >
                                            <i className="fas fa-file-alt me-1"></i>
                                            View Report
                                          </button>
                                        </td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <button 
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => handleEditProject(project)}
                                              title="Edit Project"
                                            >
                                              <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() => handleDeleteProject(project.id, project.name)}
                                              title="Delete Project"
                                            >
                                              <i className="fas fa-trash"></i>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {projects.length === 0 && (
                                    <tr>
                                      <td colSpan="8" className="text-center py-4">
                                        <div className="text-muted">
                                          <i className="fas fa-inbox fa-2x mb-2"></i>
                                          <p>No client projects found. Add a new project to get started.</p>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Points Scheme View - Admin */}
                {currentRole === 'admin' && activeView === 'points-scheme' && (
                  <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title mb-0">Points Scheme Configuration</h5>
                        <small className="text-muted">Configure how many points employees earn for each activity</small>
                      </div>
                      <button className="btn btn-primary" onClick={handleAddPointsScheme}>
                        <i className="fas fa-plus me-2"></i>
                        Add New Point Scheme
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {pointsSchemes.map((scheme, index) => (
                          <div key={index} className="col-md-6 col-lg-4 mb-4">
                            <div className="card border">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="card-title mb-0">{scheme.name}</h6>
                                  <span className="badge bg-primary">{scheme.points} pts</span>
                                </div>
                                <p className="text-muted small mb-2">{scheme.description}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="badge bg-light text-dark">{scheme.category}</span>
                                  <div className="dropdown">
                                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                      <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul className="dropdown-menu">
                                      <li>
                                        <a 
                                          className="dropdown-item" 
                                          href="#" 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleEditPointsScheme(scheme);
                                          }}
                                        >
                                          <i className="fas fa-edit me-2"></i>Edit
                                        </a>
                                      </li>
                                      <li>
                                        <a 
                                          className="dropdown-item text-danger" 
                                          href="#" 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleDeletePointsScheme(scheme.id);
                                          }}
                                        >
                                          <i className="fas fa-trash me-2"></i>Delete
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Summary Section */}
                      <div className="row mt-4">
                        <div className="col-12">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6 className="card-title">Points Summary</h6>
                              <div className="row text-center">
                                <div className="col-md-3">
                                  <h4 className="text-primary">{pointsSchemes.filter(s => s.category === 'Attendance').length}</h4>
                                  <small className="text-muted">Attendance Schemes</small>
                                </div>
                                <div className="col-md-3">
                                  <h4 className="text-success">{pointsSchemes.filter(s => s.category === 'Performance').length}</h4>
                                  <small className="text-muted">Performance Schemes</small>
                                </div>
                                <div className="col-md-3">
                                  <h4 className="text-info">{pointsSchemes.filter(s => s.category === 'Business').length}</h4>
                                  <small className="text-muted">Business Schemes</small>
                                </div>
                                <div className="col-md-3">
                                  <h4 className="text-warning">{pointsSchemes.reduce((sum, s) => sum + s.points, 0)}</h4>
                                  <small className="text-muted">Total Points Available</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Points View - Team Leader */}
                {currentRole === 'team-leader' && activeView === 'points-scheme' && (
                  <div>
                    <div className="mb-3">
                      <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
                        <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                      </button>
                    </div>

                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="card-title mb-0">Team Points Overview</h5>
                        <small className="text-muted">View your team's earned points and achievements</small>
                      </div>
                      <div className="card-body">
                        {/* Total Team Points Summary */}
                        <div className="row mb-4">
                          <div className="col-md-3">
                            <div className="card bg-warning text-white">
                              <div className="card-body text-center">
                                <i className="fas fa-trophy fa-2x mb-2"></i>
                                <h3 className="mb-0">
                                  {allUsers.reduce((sum, user) => sum + (user.totalPoints || Math.floor(Math.random() * 500) + 100), 0)}
                                </h3>
                                <small>Total Team Points</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-success text-white">
                              <div className="card-body text-center">
                                <i className="fas fa-users fa-2x mb-2"></i>
                                <h3 className="mb-0">{allUsers.length}</h3>
                                <small>Team Members</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-info text-white">
                              <div className="card-body text-center">
                                <i className="fas fa-star fa-2x mb-2"></i>
                                <h3 className="mb-0">
                                  {allUsers.length > 0 ? Math.round(allUsers.reduce((sum, user) => sum + (user.totalPoints || Math.floor(Math.random() * 500) + 100), 0) / allUsers.length) : 0}
                                </h3>
                                <small>Average Points</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-primary text-white">
                              <div className="card-body text-center">
                                <i className="fas fa-medal fa-2x mb-2"></i>
                                <h3 className="mb-0">
                                  {allUsers.length > 0 ? allUsers.reduce((max, user) => Math.max(max, user.totalPoints || Math.floor(Math.random() * 500) + 100), 0) : 0}
                                </h3>
                                <small>Highest Points</small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Team Members Points Table */}
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead style={{background: '#f8f9fa'}}>
                              <tr>
                                <th className="border-0 px-4 py-3">Rank</th>
                                <th className="border-0 px-4 py-3">Employee</th>
                                <th className="border-0 px-4 py-3">Department</th>
                                <th className="border-0 px-4 py-3">Tasks Completed</th>
                                <th className="border-0 px-4 py-3">Total Points</th>
                                <th className="border-0 px-4 py-3">Performance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allUsers.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="text-center py-4 text-muted">
                                    <i className="fas fa-users fa-2x mb-2 d-block"></i>
                                    <p className="mb-0">No team members found</p>
                                  </td>
                                </tr>
                              ) : (
                                allUsers
                                  .map(user => ({
                                    ...user,
                                    totalPoints: user.totalPoints || Math.floor(Math.random() * 500) + 100,
                                    completedTasks: assignedTasks.filter(task => 
                                      isUserAssignedToTask(task, user.name) && task.status === 'completed'
                                    ).length
                                  }))
                                  .sort((a, b) => b.totalPoints - a.totalPoints)
                                  .map((user, index) => {
                                    const rankColors = ['text-warning', 'text-secondary', 'text-danger'];
                                    const rankIcons = ['fa-trophy', 'fa-medal', 'fa-award'];
                                    
                                    return (
                                      <tr key={user.id || index}>
                                        <td className="px-4 py-3">
                                          <div className={`fw-bold ${index < 3 ? rankColors[index] : ''}`}>
                                            {index < 3 ? (
                                              <i className={`fas ${rankIcons[index]} me-2`}></i>
                                            ) : null}
                                            #{index + 1}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="d-flex align-items-center">
                                            <div 
                                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                                              style={{width: '40px', height: '40px', fontSize: '14px'}}
                                            >
                                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                              <div className="fw-bold">{user.name}</div>
                                              <small className="text-muted">{user.email}</small>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="badge bg-light text-dark">{user.department || 'N/A'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="badge bg-success">{user.completedTasks} tasks</span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="d-flex align-items-center">
                                            <i className="fas fa-star text-warning me-2"></i>
                                            <span className="fw-bold fs-5">{user.totalPoints}</span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="progress" style={{height: '20px'}}>
                                            <div 
                                              className={`progress-bar ${
                                                user.totalPoints >= 400 ? 'bg-success' :
                                                user.totalPoints >= 250 ? 'bg-info' :
                                                user.totalPoints >= 150 ? 'bg-warning' :
                                                'bg-danger'
                                              }`}
                                              style={{width: `${Math.min((user.totalPoints / 500) * 100, 100)}%`}}
                                            >
                                              {Math.round((user.totalPoints / 500) * 100)}%
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })
                              )}
                            </tbody>
                          </table>
                        </div>


                      </div>
                    </div>
                  </div>
                )}

                {/* Back to Dashboard Button */}
                {currentRole === 'admin' && activeView !== 'dashboard' && (
                  <div className="mb-3">
                    <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
                      <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                    </button>
                  </div>
                )}

                {/* Assigned Tasks View for Employee and Team Leader */}
                {(currentRole === 'employee' || currentRole === 'team-leader') && activeView === 'assigned-tasks' && (
                  <div>
                    <div className="mb-3">
                      <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
                        <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                      </button>
                    </div>
                    
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Assigned Tasks</h5>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary">{assignedTasks.length} Tasks</span>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowAddTaskModal(true)}
                          >
                            <i className="fas fa-plus me-1"></i> New Task
                          </button>
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead style={{background: '#f8f9fa'}}>
                              <tr>
                                <th className="border-0 px-4 py-3">Task Name</th>
                                <th className="border-0 px-4 py-3">Project</th>
                                <th className="border-0 px-4 py-3">Assigned To</th>
                                <th className="border-0 px-4 py-3">Due Date</th>
                                <th className="border-0 px-4 py-3">Priority</th>
                                <th className="border-0 px-4 py-3">Status</th>
                                <th className="border-0 px-4 py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignedTasks.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="text-center py-4 text-muted">
                                    <i className="fas fa-tasks fa-2x mb-2 d-block"></i>
                                    <p className="mb-0">No assigned tasks found</p>
                                  </td>
                                </tr>
                              ) : (
                                assignedTasks.map((task, index) => (
                                  <tr key={task.id || index}>
                                    <td className="px-4 py-3">
                                      <div className="fw-bold">{task.title}</div>
                                      <small className="text-muted">{task.description}</small>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-muted">{task.project || 'N/A'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="d-flex align-items-center">
                                        {(() => {
                                          // Handle both string (legacy) and array (new) assignedTo formats
                                          const assignees = Array.isArray(task.assignedTo) 
                                            ? task.assignedTo 
                                            : task.assignedTo ? [task.assignedTo] : [];
                                          
                                          const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'];
                                          const displayAssignees = assignees.slice(0, 3);
                                          const extraCount = assignees.length > 3 ? assignees.length - 3 : 0;
                                          
                                          return (
                                            <>
                                              {displayAssignees.map((assignee, idx) => (
                                                <div 
                                                  key={idx}
                                                  className={`rounded-circle text-white d-flex align-items-center justify-content-center ${colors[idx % colors.length]}`}
                                                  style={{
                                                    width: '32px', 
                                                    height: '32px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    marginLeft: idx > 0 ? '-8px' : '0',
                                                    zIndex: 10 - idx
                                                  }}
                                                  title={assignee}
                                                >
                                                  {assignee.charAt(0).toUpperCase()}
                                                </div>
                                              ))}
                                              {extraCount > 0 && (
                                                <div 
                                                  className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                                                  style={{
                                                    width: '32px', 
                                                    height: '32px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    marginLeft: '-8px',
                                                    zIndex: 1
                                                  }}
                                                  title={`+${extraCount} more assignees`}
                                                >
                                                  +{extraCount}
                                                </div>
                                              )}
                                              {assignees.length === 0 && (
                                                <div 
                                                  className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center border"
                                                  style={{width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold'}}
                                                  title="Unassigned"
                                                >
                                                  ?
                                                </div>
                                              )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                                        day: 'numeric', 
                                        month: 'short',
                                        year: 'numeric'
                                      }) : 'No due date'}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`badge ${
                                        task.priority === 'urgent' ? 'bg-danger' :
                                        task.priority === 'high' ? 'bg-warning' :
                                        task.priority === 'medium' ? 'bg-info' :
                                        'bg-secondary'
                                      }`}>
                                        {task.priority ? task.priority.toUpperCase() : 'NORMAL'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`badge ${
                                        task.status === 'completed' ? 'bg-success' :
                                        task.status === 'in-progress' ? 'bg-primary' :
                                        'bg-warning'
                                      }`}>
                                        {task.status === 'in-progress' ? 'In Progress' : 
                                         task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'Pending'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="btn-group" role="group">
                                        <button 
                                          className="btn btn-sm btn-outline-info"
                                          onClick={() => handleEditTask(task)}
                                          title="Edit Task"
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleDeleteTask(task.id, task.title)}
                                          title="Delete Task"
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance View for Team Leader */}
                {currentRole === 'team-leader' && activeView === 'performance' && (
                  <div>
                    <div className="mb-3">
                      <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
                        <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                      </button>
                    </div>
                    
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Team Performance</h5>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-success">92% Overall</span>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowAddPerformanceModal(true)}
                          >
                            <i className="fas fa-plus me-1"></i> Add Performance
                          </button>
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead style={{background: '#f8f9fa'}}>
                              <tr>
                                <th className="border-0 px-4 py-3">Employee</th>
                                <th className="border-0 px-4 py-3">Department</th>
                                <th className="border-0 px-4 py-3">Project</th>
                                <th className="border-0 px-4 py-3">Project Status</th>
                                <th className="border-0 px-4 py-3">Tasks Completed</th>
                                <th className="border-0 px-4 py-3">Tasks Pending</th>
                                <th className="border-0 px-4 py-3">Status</th>
                                <th className="border-0 px-4 py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allUsers.length === 0 ? (
                                <tr>
                                  <td colSpan="8" className="text-center py-4 text-muted">
                                    <i className="fas fa-chart-line fa-2x mb-2 d-block"></i>
                                    <p className="mb-0">No employee performance data found</p>
                                  </td>
                                </tr>
                              ) : (
                                allUsers.map((user, index) => {
                                  // Get stored performance data or calculate from tasks
                                  const storedPerformance = performanceData[user.id] || user.performanceData || {};
                                  const userTasks = assignedTasks.filter(task => isUserAssignedToTask(task, user.name));
                                  
                                  // Use stored data if available, otherwise calculate
                                  const completedTasks = storedPerformance.tasksCompleted 
                                    ? parseInt(storedPerformance.tasksCompleted) 
                                    : userTasks.filter(task => task.status === 'completed').length;
                                  
                                  const pendingTasks = storedPerformance.tasksPending 
                                    ? parseInt(storedPerformance.tasksPending) 
                                    : userTasks.filter(task => task.status !== 'completed').length;
                                  
                                  const totalTasks = completedTasks + pendingTasks;
                                  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                                  
                                  const performanceScore = storedPerformance.performanceScore 
                                    ? parseInt(storedPerformance.performanceScore) 
                                    : completionRate
                                  
                                  return (
                                    <tr key={user.id || index}>
                                      <td className="px-4 py-3">
                                        <div className="d-flex align-items-center">
                                          <div 
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                                            style={{width: '40px', height: '40px', fontSize: '14px'}}
                                          >
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                          </div>
                                          <div>
                                            <div className="fw-bold">{user.name}</div>
                                            <small className="text-muted">{user.email}</small>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="text-muted">{user.department || 'N/A'}</span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="text-muted">{user.assignedProject || 'Not Assigned'}</span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`badge ${
                                          user.projectStatus === 'Assigned' ? 'bg-success' : 'bg-secondary'
                                        }`}>
                                          {user.projectStatus || 'Not Assigned'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="badge bg-success">{completedTasks}</span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="badge bg-warning">{pendingTasks}</span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`badge ${
                                          performanceScore >= 80 ? 'bg-success' :
                                          performanceScore >= 50 ? 'bg-warning' :
                                          'bg-danger'
                                        }`}>
                                          {performanceScore >= 80 ? 'Excellent' :
                                           performanceScore >= 50 ? 'Good' :
                                           'Needs Improvement'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <button 
                                          className="btn btn-sm btn-outline-primary btn-sm"
                                          onClick={() => {
                                            setEditingPerformanceUser(user);
                                            setShowEditPerformanceModal(true);
                                          }}
                                          title="Update Performance"
                                          style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Daily Reports View for Team Leader */}
                {currentRole === 'team-leader' && activeView === 'daily-reports' && (
                  <DailyReports 
                    allUsers={allUsers}
                    projects={projects}
                    assignedTasks={assignedTasks}
                    notifications={notifications}
                  />
                )}


              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External JS (Bootstrap bundle) should be included in public/index.html */}
      
      {showAddEmployeeModal && (
        <AddEmployeeModal
          show={showAddEmployeeModal}
          onClose={() => setShowAddEmployeeModal(false)}
          onSave={handleAddEmployee}
        />
      )}
      
      {showAddPointsModal && (
        <AddPointsSchemeModal
          show={showAddPointsModal}
          onClose={() => {
            setShowAddPointsModal(false);
            setEditingPointsScheme(null);
          }}
          editingScheme={editingPointsScheme}
          onSave={handleSavePointsScheme}
        />
      )}
      
      {showAddProjectModal && (
        <AddProjectModal
          show={showAddProjectModal}
          onClose={() => {
            setShowAddProjectModal(false);
            setEditingProject(null);
          }}
          onSave={handleAddProject}
          editingProject={editingProject}
          availableEmployees={allUsers}
        />
      )}

      {showAddUserModal && (
        <AddUserModal
          show={showAddUserModal}
          onClose={() => {
            setShowAddUserModal(false);
            setEditingUser(null);
          }}
          onSave={editingUser ? handleUpdateUser : handleAddUser}
          editingUser={editingUser}
          projects={projects}
        />
      )}

      {showAddTaskModal && (
        <AddTaskModal
          show={showAddTaskModal}
          onClose={() => {
            setShowAddTaskModal(false);
            setEditingTask(null);
          }}
          onSave={editingTask ? handleUpdateTask : handleAddTask}
          editingTask={editingTask}
          allUsers={allUsers}
        />
      )}

      {showAddProjectManagerModal && (
        <AddProjectManagerModal
          show={showAddProjectManagerModal}
          onHide={() => {
            setShowAddProjectManagerModal(false);
            setEditingProjectManager(null);
          }}
          onSave={handleSaveProjectManager}
          editingManager={editingProjectManager}
        />
      )}

      {showAddTeamLeaderModal && (
        <AddTeamLeaderModal
          show={showAddTeamLeaderModal}
          onHide={() => {
            setShowAddTeamLeaderModal(false);
            setEditingTeamLeader(null);
          }}
          onSave={handleSaveTeamLeader}
          editingLeader={editingTeamLeader}
        />
      )}

      {showAddRoleModal && (
        <AddRoleModal
          show={showAddRoleModal}
          onHide={() => setShowAddRoleModal(false)}
          onSave={handleAddCustomRole}
        />
      )}

      {/* Task Assignment Modal */}
      {showTaskAssignModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-tasks me-2"></i>
                  Assign Task - {selectedProjectForTask?.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowTaskAssignModal(false);
                    setSelectedProjectForTask(null);
                  }}
                ></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const taskData = {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  projectId: selectedProjectForTask?.id,
                  projectName: selectedProjectForTask?.name,
                  assignedTo: [formData.get('assignedTo')], // Convert to array for consistency
                  dueDate: formData.get('dueDate'),
                  priority: formData.get('priority'),
                  estimatedHours: parseInt(formData.get('estimatedHours'))
                };
                handleTaskAssignment(taskData);
                setShowTaskAssignModal(false);
                setSelectedProjectForTask(null);
              }}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Task Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        placeholder="e.g., Complete Admin UI Design"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority *</label>
                      <select className="form-select" name="priority" required>
                        <option value="">Select Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Task Description *</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="3"
                      placeholder="Describe the task requirements, deliverables, and any specific instructions..."
                      required
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Assign To *</label>
                      <select className="form-select" name="assignedTo" required>
                        <option value="">Select Employee</option>
                        {allUsers.map((user, index) => (
                          <option key={index} value={user.email}>
                            {user.name} ({user.role || 'Employee'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Due Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dueDate"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Estimated Hours</label>
                      <input
                        type="number"
                        className="form-control"
                        name="estimatedHours"
                        placeholder="8"
                        min="1"
                        max="40"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Project</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedProjectForTask?.name || ''}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowTaskAssignModal(false);
                      setSelectedProjectForTask(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>Assign Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Project Update Modal */}
      {showProjectUpdateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-clipboard-list me-2"></i>
                  Submit Project Update
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowProjectUpdateModal(false)}
                ></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updateData = {
                  projectId: formData.get('projectId'),
                  projectName: projects.find(p => p.id === formData.get('projectId'))?.name,
                  status: formData.get('status'),
                  description: formData.get('description'),
                  completionPercentage: parseInt(formData.get('completionPercentage')),
                  nextSteps: formData.get('nextSteps'),
                  blockers: formData.get('blockers')
                };
                handleProjectUpdate(updateData);
                setShowProjectUpdateModal(false);
              }}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Project *</label>
                      <select className="form-select" name="projectId" required>
                        <option value="">Select Project</option>
                        {(currentRole === 'employee' ? getEmployeeProjects(localStorage.getItem('userEmail')) : 
                          currentRole === 'project-manager' ? getProjectManagerProjects(localStorage.getItem('userEmail')) : 
                          projects).map((project, index) => (
                          <option key={index} value={project.id}>
                            {project.name} - {project.clientName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Status *</label>
                      <select className="form-select" name="status" required>
                        <option value="">Select Status</option>
                        <option value="on-track">On Track</option>
                        <option value="in-progress">In Progress</option>
                        <option value="at-risk">At Risk</option>
                        <option value="delayed">Delayed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Progress Update *</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="3"
                      placeholder="Describe what has been accomplished, current progress, and any important updates..."
                      required
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Completion Percentage</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          name="completionPercentage"
                          placeholder="25"
                          min="0"
                          max="100"
                        />
                        <span className="input-group-text">%</span>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Update Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={new Date().toISOString().split('T')[0]}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Next Steps</label>
                    <textarea
                      className="form-control"
                      name="nextSteps"
                      rows="2"
                      placeholder="What are the planned next steps or upcoming milestones?"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Blockers / Issues</label>
                    <textarea
                      className="form-control"
                      name="blockers"
                      rows="2"
                      placeholder="Any blockers, issues, or help needed?"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowProjectUpdateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-info">
                    <i className="fas fa-paper-plane me-2"></i>Submit Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Performance Modal */}
      {showAddPerformanceModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-chart-line me-2"></i>Add/Update Team Performance
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddPerformanceModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning mb-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Fill in the performance data and click "Save" to update. Changes will not be saved until you submit the form.
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  // Update all users with performance data
                  setAllUsers(prev => prev.map(user => ({
                    ...user,
                    performanceData: performanceData[user.id] || user.performanceData || {}
                  })));
                  setShowAddPerformanceModal(false);
                }}>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Employee</th>
                          <th>Department</th>
                          <th>Tasks Completed</th>
                          <th>Tasks Pending</th>
                          <th>Performance Score (%)</th>
                          <th>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user, index) => (
                          <tr key={user.id || index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                                  style={{width: '32px', height: '32px', fontSize: '12px'}}
                                >
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div className="fw-bold small">{user.name}</div>
                                  <small className="text-muted">{user.department || 'N/A'}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                placeholder="Department"
                                key={`dept-${user.id || index}`}
                                name={`department-${user.id || index}`}
                                defaultValue={user.department || ''}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-sm" 
                                placeholder="0"
                                min="0"
                                key={`tasks-completed-${user.id || index}`}
                                defaultValue={assignedTasks.filter(task => isUserAssignedToTask(task, user.name) && task.status === 'completed').length}
                                onBlur={(e) => {
                                  const userId = user.id || user._id || `user-${index}`;
                                  setPerformanceData(prev => ({
                                    ...prev,
                                    [userId]: {
                                      ...prev[userId],
                                      tasksCompleted: e.target.value
                                    }
                                  }));
                                }}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-sm" 
                                placeholder="0"
                                min="0"
                                key={`tasks-pending-${user.id || index}`}
                                defaultValue={assignedTasks.filter(task => isUserAssignedToTask(task, user.name) && task.status !== 'completed').length}
                                onBlur={(e) => {
                                  const userId = user.id || user._id || `user-${index}`;
                                  setPerformanceData(prev => ({
                                    ...prev,
                                    [userId]: {
                                      ...prev[userId],
                                      tasksPending: e.target.value
                                    }
                                  }));
                                }}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-sm" 
                                placeholder="0-100"
                                min="0"
                                max="100"
                                key={`performance-score-${user.id || index}`}
                                defaultValue=""
                                onBlur={(e) => {
                                  const userId = user.id || user._id || `user-${index}`;
                                  setPerformanceData(prev => ({
                                    ...prev,
                                    [userId]: {
                                      ...prev[userId],
                                      performanceScore: e.target.value
                                    }
                                  }));
                                }}
                              />
                            </td>
                            <td>
                              <textarea 
                                className="form-control form-control-sm" 
                                rows="1"
                                placeholder="Add comments..."
                                key={`comments-${user.id || index}`}
                                defaultValue=""
                                onBlur={(e) => {
                                  const userId = user.id || user._id || `user-${index}`;
                                  setPerformanceData(prev => ({
                                    ...prev,
                                    [userId]: {
                                      ...prev[userId],
                                      comments: e.target.value
                                    }
                                  }));
                                }}
                              ></textarea>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowAddPerformanceModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-check me-2"></i>Done
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Performance Modal */}
      {showEditPerformanceModal && editingPerformanceUser && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>Edit Performance - {editingPerformanceUser.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditPerformanceModal(false);
                    setEditingPerformanceUser(null);
                  }}
                ></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedData = {
                  department: formData.get('department'),
                  tasksCompleted: formData.get('tasksCompleted'),
                  tasksPending: formData.get('tasksPending'),
                  performanceScore: formData.get('performanceScore'),
                  comments: formData.get('comments')
                };
                
                // Update user data
                setAllUsers(prev => prev.map(u => 
                  u.id === editingPerformanceUser.id 
                    ? {...u, ...updatedData, performanceData: updatedData} 
                    : u
                ));
                
                // Update performance data
                setPerformanceData(prev => ({
                  ...prev,
                  [editingPerformanceUser.id]: updatedData
                }));
                
                setShowEditPerformanceModal(false);
                setEditingPerformanceUser(null);
              }}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Employee Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editingPerformanceUser.name}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editingPerformanceUser.email}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Department</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="department"
                        defaultValue={editingPerformanceUser.department || ''}
                        placeholder="Enter department"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Performance Score (%)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="performanceScore"
                        min="0"
                        max="100"
                        defaultValue={performanceData[editingPerformanceUser.id]?.performanceScore || ''}
                        placeholder="0-100"
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tasks Completed</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="tasksCompleted"
                        min="0"
                        defaultValue={
                          performanceData[editingPerformanceUser.id]?.tasksCompleted || 
                          assignedTasks.filter(task => isUserAssignedToTask(task, editingPerformanceUser.name) && task.status === 'completed').length
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tasks Pending</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="tasksPending"
                        min="0"
                        defaultValue={
                          performanceData[editingPerformanceUser.id]?.tasksPending || 
                          assignedTasks.filter(task => isUserAssignedToTask(task, editingPerformanceUser.name) && task.status !== 'completed').length
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Comments</label>
                    <textarea 
                      className="form-control" 
                      name="comments"
                      rows="3"
                      defaultValue={performanceData[editingPerformanceUser.id]?.comments || ''}
                      placeholder="Add performance comments..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditPerformanceModal(false);
                      setEditingPerformanceUser(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiRoleDashboard;
