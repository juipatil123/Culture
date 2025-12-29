import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import AddProjectManagerModal from './AddProjectManagerModal';
import AddUserModal from './AddUserModal';
import AddTaskModal from './AddTaskModal';
import AddProjectModal from './AddProjectModal';

// Import modular admin components
import UserManagement from './admin/UserManagement';
import ProjectManagerManagement from './admin/ProjectManagerManagement';
import TeamLeaderManagement from './admin/TeamLeaderManagement';
import ProjectManagement from './admin/ProjectManagement';
import TaskManagement from './admin/TaskManagement';
import RoleManagement from './admin/RoleManagement';
import PointsScheme from './admin/PointsScheme';

import AdminOverview from './admin/AdminOverview';
import Reports from './admin/Reports';

import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getAllTasks,
  createTask,
  updateTask,
  getAllProjectManagers,
  createProjectManager,
  updateProjectManager,
  deleteProjectManager,
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

// Global project status configuration
const PROJECT_STATUS_CONFIG = {
  'Assigned': { bg: '#6f42c1', text: 'white', label: 'Assigned' },
  'Completed': { bg: '#28a745', text: 'white', label: 'Completed' },
  'On Track': { bg: '#007bff', text: 'white', label: 'On Track' },
  'At Risk': { bg: '#ffc107', text: 'black', label: 'At Risk' },
  'Delayed': { bg: '#dc3545', text: 'white', label: 'Delayed' }
};

const AdminDashboard = ({ userData, onLogout }) => {
  // Safety checks for props
  const safeUserData = userData || {};
  const safeOnLogout = onLogout || (() => { });

  const [userName, setUserName] = useState(safeUserData?.name || 'Admin User');
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
  const [activeDetailView, setActiveDetailView] = useState(null);
  const [projectManagers, setProjectManagers] = useState([]);
  const [pmSearchTerm, setPmSearchTerm] = useState('');

  // Filter and sort states for user management
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterByRole, setFilterByRole] = useState('all');
  const [filterByDepartment, setFilterByDepartment] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [filterByProject, setFilterByProject] = useState('all');
  const [filterByTeam, setFilterByTeam] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [pmFilterDepartment, setPmFilterDepartment] = useState('all');
  const [customRoles, setCustomRoles] = useState([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showPasswordManagementModal, setShowPasswordManagementModal] = useState(false);
  const [selectedUserForPasswordManagement, setSelectedUserForPasswordManagement] = useState(null);
  const [projectUpdates, setProjectUpdates] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [showAddTeamLeaderModal, setShowAddTeamLeaderModal] = useState(false);
  const [editingTeamLeader, setEditingTeamLeader] = useState(null);
  const [teamLeaderSearchTerm, setTeamLeaderSearchTerm] = useState('');
  const [teamLeaderViewMode, setTeamLeaderViewMode] = useState('card');
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
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
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingProjectManagers, setLoadingProjectManagers] = useState(false);
  const [showTaskAssignModal, setShowTaskAssignModal] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState('');
  const [showProjectUpdateModal, setShowProjectUpdateModal] = useState(false);
  const [projectViewMode, setProjectViewMode] = useState('card');
  const [showProjectTasksModal, setShowProjectTasksModal] = useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);
  const [taskFilterTab, setTaskFilterTab] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedTeamLeader, setSelectedTeamLeader] = useState(null);
  const [showTeamLeaderDetail, setShowTeamLeaderDetail] = useState(false);
  const [teamMemberViewMode, setTeamMemberViewMode] = useState('card');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMembersForTeam, setSelectedMembersForTeam] = useState([]);
  const [selectedTeamLeaderForMember, setSelectedTeamLeaderForMember] = useState(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [userViewMode, setUserViewMode] = useState('list');
  const [employeeViewMode, setEmployeeViewMode] = useState('card');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Helper function to get project status badge
  const getProjectStatusBadge = (status) => {
    const config = PROJECT_STATUS_CONFIG[status] || PROJECT_STATUS_CONFIG['On Track'];
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.text,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {config.label}
      </span>
    );
  };

  // Get user work status
  const getUserWorkStatus = (user) => {
    const userEmail = user.email;
    const userName = user.name;

    const userStatusData = JSON.parse(localStorage.getItem('userWorkStatus') || '{}');
    const storedStatus = userStatusData[userEmail] || userStatusData[userName];

    const activeTask = assignedTasks.find(task =>
      (task.assignedTo === userEmail || task.assignedTo === userName) &&
      task.status === 'in-progress'
    );

    if (activeTask || (storedStatus && storedStatus.status === 'Active')) {
      return { status: 'Active', color: 'bg-success' };
    }

    const hasAssignedTasks = assignedTasks.some(task =>
      (task.assignedTo === userEmail || task.assignedTo === userName) &&
      task.status !== 'completed'
    );

    if (user.isOnLeave || (storedStatus && storedStatus.status === 'On Leave')) {
      return { status: 'On Leave', color: 'bg-warning' };
    }

    if (hasAssignedTasks) {
      return { status: 'Inactive', color: 'bg-secondary' };
    }

    return { status: 'Inactive', color: 'bg-secondary' };
  };

  // Data persistence functions
  const saveUsersToLocalStorage = (users) => {
    try {
      const dataToSave = users.map((user, index) => ({
        id: user.id || user._id || `USER_${Date.now()}_${index}`,
        _id: user._id || user.id || `USER_${Date.now()}_${index}`,
        name: user.name || 'Unknown User',
        email: user.email || '',
        department: user.department || 'Web Developer',
        role: user.role || 'employee',
        userType: user.userType || (
          user.role === 'intern' ? 'Intern' :
            user.role === 'employee' ? 'Employee' :
              user.role === 'team-leader' ? 'Team Leader' :
                user.role === 'project-manager' ? 'Project Manager' : 'Employee'
        ),
        assignedProject: user.assignedProject || null,
        projectStatus: user.assignedProject ? 'Assigned' : 'Not Assigned',
        status: user.status || 'Active',
        joinDate: user.joinDate || new Date().toISOString().split('T')[0],
        phone: user.phone || null,
        teamLeaderId: user.teamLeaderId || null,
        teamLeaderName: user.teamLeaderName || null,
        password: user.password || 'defaultPassword123',
        savedAt: new Date().toISOString(),
        saveVersion: Date.now()
      }));

      localStorage.setItem('users', JSON.stringify(dataToSave));
      localStorage.setItem('users_current', JSON.stringify(dataToSave));
      localStorage.setItem('users_backup', JSON.stringify(dataToSave));
      localStorage.setItem('users_timestamp', Date.now().toString());
      localStorage.setItem('users_count', dataToSave.length.toString());

      console.log(`✅ SAVED ${dataToSave.length} users to localStorage`);
    } catch (error) {
      console.error('❌ Error saving users to localStorage:', error);
    }
  };

  const saveProjectsToLocalStorage = (projects) => {
    try {
      const dataToSave = projects.map(project => ({
        ...project,
        id: project.id || project._id,
        name: project.name,
        clientName: project.clientName,
        projectManager: project.projectManager,
        assigned: project.assigned,
        assignedMembers: project.assigned ? project.assigned.map(member => member.name) : [],
        progress: project.progress,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        projectCost: project.projectCost,
        advancePayment: project.advancePayment
      }));

      localStorage.setItem('projects', JSON.stringify(dataToSave));
      localStorage.setItem('projects_timestamp', Date.now().toString());
      console.log(`✅ Saved ${dataToSave.length} projects to localStorage`);
    } catch (error) {
      console.error('❌ Error saving projects to localStorage:', error);
    }
  };

  // Load project managers from database
  const loadProjectManagers = async () => {
    setLoadingProjectManagers(true);
    const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');

    try {
      const localPMs = localStorage.getItem('projectManagers');
      if (localPMs) {
        try {
          const parsedPMs = JSON.parse(localPMs);
          if (Array.isArray(parsedPMs) && parsedPMs.length > 0) {
            const filteredPMs = parsedPMs.filter(pm =>
              !deletedUsers.includes(pm.id) && !deletedUsers.includes(pm._id)
            );
            setProjectManagers(filteredPMs);
          }
        } catch (parseError) {
          console.error('Error parsing localStorage project managers:', parseError);
        }
      }

      const managersData = await getAllProjectManagers();

      if (managersData && managersData.length > 0) {
        const filteredManagers = managersData.filter(pm =>
          !deletedUsers.includes(pm.id) && !deletedUsers.includes(pm._id)
        );

        setProjectManagers(filteredManagers);
        localStorage.setItem('projectManagers', JSON.stringify(filteredManagers));

        const pmUsers = filteredManagers.map(pm => ({
          ...pm,
          id: pm.id || pm._id,
          _id: pm._id || pm.id,
          role: 'project-manager',
          userType: 'Project Manager',
          payroll: pm.payroll || `PM${(pm.id || pm._id)?.slice(-3) || '001'}`
        }));

        setAllUsers(prev => {
          const withoutPMs = prev.filter(user => user.role !== 'project-manager');
          return [...withoutPMs, ...pmUsers];
        });
      } else {
        setProjectManagers([]);
        localStorage.setItem('projectManagers', JSON.stringify([]));
      }
    } catch (error) {
      console.error('❌ Error loading project managers:', error);
    } finally {
      setLoadingProjectManagers(false);
    }
  };

  // Load all users from database
  const loadUsers = async () => {
    setLoadingUsers(true);
    const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');

    const localUsers = localStorage.getItem('users');
    if (localUsers) {
      try {
        const parsedUsers = JSON.parse(localUsers);
        const filteredUsers = parsedUsers.filter(user =>
          !deletedUsers.includes(user.id) && !deletedUsers.includes(user._id)
        );
        setAllUsers(filteredUsers);
      } catch (error) {
        console.error('Error parsing localStorage users:', error);
      }
    }

    try {
      const apiUsers = await getAllUsers();

      if (!apiUsers || apiUsers.length === 0) {
        setLoadingUsers(false);
        return;
      }

      const processedUsers = apiUsers.map(apiUser => ({
        ...apiUser,
        id: apiUser.id || apiUser._id,
        _id: apiUser._id || apiUser.id,
        department: apiUser.department || 'Web Developer',
        projectStatus: apiUser.assignedProject ? 'Assigned' : 'Not Assigned',
        userType: apiUser.userType || (
          apiUser.role === 'intern' ? 'Intern' :
            apiUser.role === 'employee' ? 'Employee' :
              apiUser.role === 'team-leader' ? 'Team Leader' :
                apiUser.role === 'project-manager' ? 'Project Manager' : 'Employee'
        ),
        status: apiUser.status || 'Active',
        joinDate: apiUser.joinDate || apiUser.joiningDate || new Date().toISOString().split('T')[0]
      }));

      let finalUsers = processedUsers.filter(user =>
        !deletedUsers.includes(user.id) && !deletedUsers.includes(user._id)
      );

      const seenEmails = new Set();
      const seenIds = new Set();
      const uniqueUsers = [];

      finalUsers.forEach(user => {
        const email = user.email?.toLowerCase().trim();
        const userId = user.id || user._id;

        if (email && seenEmails.has(email)) return;
        if (userId && seenIds.has(userId)) return;

        if (email) seenEmails.add(email);
        if (userId) seenIds.add(userId);

        uniqueUsers.push(user);
      });

      finalUsers = uniqueUsers;
      setAllUsers(finalUsers);
      saveUsersToLocalStorage(finalUsers);

      localStorage.setItem('users_count', finalUsers.length.toString());
      localStorage.setItem('users_last_sync', Date.now().toString());

    } catch (error) {
      console.error('❌ API fetch failed:', error);
      if (!localUsers) {
        setAllUsers([]);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load tasks from database
  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const allTasks = await getAllTasks();
      setAssignedTasks(allTasks);
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Load dashboard stats
  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const [statsData, progressDataResponse] = await Promise.all([
        getDashboardStats(),
        getProgressData()
      ]);
      setDashboardStats(statsData || {
        totalUsers: 0,
        activeProjects: 0,
        totalClients: 0,
        totalRevenue: 0
      });
      setProgressData(progressDataResponse);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load projects from database
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await getAllProjects();

      const transformedProjects = (projectsData || []).map((project, index) => ({
        id: project._id || project.id || `proj-${index}`,
        name: project.name || 'Untitled Project',
        date: project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date',
        progress: project.progress || 0,
        status: project.projectStatus === 'assigned' ? 'Assigned' :
          project.projectStatus === 'on-track' ? 'On Track' :
            project.projectStatus === 'at-risk' ? 'At Risk' :
              project.projectStatus === 'delayed' ? 'Delayed' :
                project.projectStatus === 'completed' ? 'Completed' : 'On Track',
        assigned: project.assignedMembers && project.assignedMembers.length > 0
          ? project.assignedMembers.map((member, i) => ({
            name: typeof member === 'object' ? member.name : member,
            color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][i % 5]
          }))
          : [],
        extra: project.assignedMembers && project.assignedMembers.length > 3 ? project.assignedMembers.length - 3 : 0,
        clientName: project.clientName || 'No Client',
        startDate: project.startDate,
        endDate: project.endDate,
        description: project.description,
        projectCost: project.projectCost,
        advancePayment: project.advancePayment,
        projectManager: project.projectManager
      }));

      setProjects(transformedProjects);
      localStorage.setItem('projects', JSON.stringify(transformedProjects));
    } catch (error) {
      console.error('Error loading projects:', error);
      const cachedProjects = localStorage.getItem('projects');
      if (cachedProjects) {
        try {
          const parsedProjects = JSON.parse(cachedProjects);
          setProjects(parsedProjects);
        } catch (parseError) {
          console.error('Error parsing cached projects:', parseError);
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load team leaders
  const loadTeamLeaders = async () => {
    try {
      const teamLeadersData = await getAllTeamLeaders();
      setTeamLeaders(teamLeadersData);
    } catch (error) {
      console.error('Error loading team leaders:', error);
    }
  };

  // Load custom roles
  const loadCustomRoles = async () => {
    try {
      const rolesData = await getAllCustomRoles();
      setCustomRoles(rolesData);
    } catch (error) {
      console.error('Error loading custom roles:', error);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    loadDashboardStats();
    loadUsers();
    loadProjects();
    loadTasks();
    loadProjectManagers();
    loadTeamLeaders();
    loadCustomRoles();
  }, []);

  // Handler for saving/updating users
  const handleSaveUser = async (userDataToSave) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id || editingUser._id, userDataToSave);
      } else {
        await createUser(userDataToSave);
      }
      setShowAddUserModal(false);
      setEditingUser(null);
      loadUsers();
      loadDashboardStats();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  // Handler for saving/updating project managers
  const handleSaveProjectManager = async (pmData) => {
    try {
      if (editingProjectManager) {
        await updateProjectManager(editingProjectManager.id || editingProjectManager._id, pmData);
      } else {
        await createProjectManager(pmData);
      }
      setShowAddProjectManagerModal(false);
      setEditingProjectManager(null);
      loadProjectManagers();
      loadDashboardStats();
    } catch (error) {
      console.error('Error saving project manager:', error);
    }
  };

  // Handler for saving/updating team leaders
  const handleSaveTeamLeader = async (tlData) => {
    try {
      if (editingTeamLeader) {
        await updateTeamLeader(editingTeamLeader.id || editingTeamLeader._id, tlData);
      } else {
        await createTeamLeader(tlData);
      }
      setShowAddTeamLeaderModal(false);
      setEditingTeamLeader(null);
      loadTeamLeaders();
      loadDashboardStats();
    } catch (error) {
      console.error('Error saving team leader:', error);
    }
  };

  // Handler for saving/updating projects
  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id || editingProject._id, projectData);
      } else {
        await createProject(projectData);
      }
      setShowAddProjectModal(false);
      setEditingProject(null);
      loadProjects();
      loadDashboardStats();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  // Handler for saving/updating tasks
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id || editingTask._id, taskData);
      } else {
        await createTask(taskData);
      }
      setShowAddTaskModal(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (safeOnLogout) {
      safeOnLogout();
      return;
    }

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('userData');

    window.location.href = '/login';
  };

  // Handle menu clicks
  const handleMenuClick = (menuItem) => {
    if (menuItem === 'Dashboard') {
      setActiveView('dashboard');
    } else if (menuItem === 'Add Task') {
      setEditingTask(null);
      setShowAddTaskModal(true);
      setIsMobileSidebarOpen(false);
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
    } else if (menuItem === 'Task Assignment') {
      setActiveView('assigned-tasks');
    } else if (menuItem === 'Reports') {
      setActiveView('reports');
    }
    setIsMobileSidebarOpen(false);
  };

  // Handle card clicks
  const handleCardClick = (cardTitle) => {
    if (cardTitle === 'Total Employees' || cardTitle === 'Total Users') {
      setActiveView('employees');
    } else if (cardTitle === 'Active Projects' || cardTitle === 'Total Projects') {
      setActiveView('projects');
    } else if (cardTitle === 'Total Clients') {
      setActiveView('client-dashboard');
    } else if (cardTitle === 'Total Revenue') {
      setActiveView('revenue');
    } else if (cardTitle === 'Recent Activity') {
      setActiveView('recent-activity');
    } else if (cardTitle === 'Assigned Tasks' || cardTitle === 'Tasks') {
      setActiveView('assigned-tasks');
    }
  };

  // Format number helper
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  // Get dashboard cards data
  const getDashboardCards = () => {
    return [
      {
        title: 'Total Users',
        value: formatNumber(dashboardStats.totalUsers || allUsers.length),
        icon: 'fas fa-users',
        color: 'primary',
        trend: '+12%',
        clickable: true,
        ariaLabel: `${dashboardStats.totalUsers || allUsers.length} total users`
      },
      {
        title: 'Active Projects',
        value: formatNumber(dashboardStats.activeProjects || projects.length),
        icon: 'fas fa-project-diagram',
        color: 'success',
        trend: '+8%',
        clickable: true,
        ariaLabel: `${dashboardStats.activeProjects || projects.length} active projects`
      },
      {
        title: 'Total Clients',
        value: formatNumber(dashboardStats.totalClients || 0),
        icon: 'fas fa-handshake',
        color: 'info',
        trend: '+15%',
        clickable: true,
        ariaLabel: `${dashboardStats.totalClients || 0} total clients`
      },
      {
        title: 'Total Revenue',
        value: `$${formatNumber(dashboardStats.totalRevenue || 0)}`,
        icon: 'fas fa-dollar-sign',
        color: 'warning',
        trend: '+20%',
        clickable: true,
        ariaLabel: `$${dashboardStats.totalRevenue || 0} total revenue`
      }
    ];
  };

  return (
    <div className="multi-role-dashboard">
      {/* Admin Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
        <div className="header-right">
          <div className="user-info">

            <span className="user-role badge bg-danger">Admin</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h3 className="text-primary fw-bold mb-0">Admin Dashboard</h3>
          <button
            className="mobile-close"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeView === 'dashboard' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Dashboard')}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li className={activeView === 'employees' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('User Management')}>
                <i className="fas fa-users"></i>
                <span>User Management</span>
              </a>
            </li>
            <li className={activeView === 'project-managers' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Project Manager Management')}>
                <i className="fas fa-user-tie"></i>
                <span>Project Managers</span>
              </a>
            </li>
            <li className={activeView === 'team-leaders' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Team Leader Management')}>
                <i className="fas fa-users-cog"></i>
                <span>Team Leaders</span>
              </a>
            </li>
            <li className={activeView === 'projects' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('All Projects')}>
                <i className="fas fa-project-diagram"></i>
                <span>All Projects</span>
              </a>
            </li>
            <li className={activeView === 'assigned-tasks' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Task Assignment')}>
                <i className="fas fa-tasks"></i>
                <span>Task Management</span>
              </a>
            </li>
            <li className={activeView === 'role-management' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Role Management')}>
                <i className="fas fa-user-shield"></i>
                <span>Role Management</span>
              </a>
            </li>
            <li className={activeView === 'points-scheme' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Points Scheme')}>
                <i className="fas fa-star"></i>
                <span>Points Scheme</span>
              </a>
            </li>
            <li className={activeView === 'reports' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Reports')}>
                <i className="fas fa-file-alt"></i>
                <span>Reports</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {activeView === 'dashboard' && (
          <div className="dashboard-content-area">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">Dashboard Overview</h3>
              <div className="text-muted small">
                <i className="fas fa-calendar-alt me-2"></i>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="row g-4 mb-4">
              {getDashboardCards().map((card, index) => (
                <div key={index} className="col-md-6 col-lg-3">
                  <div
                    className={`dashboard-card bg-${card.color} text-white ${card.clickable ? 'clickable shadow-sm' : ''}`}
                    onClick={() => card.clickable && handleCardClick(card.title)}
                    style={{ borderRadius: '15px', padding: '20px', transition: 'transform 0.3s ease' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                        <i className={`${card.icon} fs-5`}></i>
                      </div>
                      <span className="badge bg-white bg-opacity-25 rounded-pill" style={{ fontSize: '0.7rem' }}>{card.trend}</span>
                    </div>
                    <h3 className="fw-bold mb-1">{card.value}</h3>
                    <p className="mb-0 opacity-75 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>{card.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <AdminOverview
              stats={dashboardStats}
              recentActivities={recentActivities}
              projects={projects}
              onAddProject={() => {
                setEditingProject(null);
                setShowAddProjectModal(true);
              }}
              onCardClick={handleMenuClick}
            />
          </div>
        )}

        {/* Other views will be rendered here based on activeView state */}
        {activeView === 'employees' && (
          <UserManagement />
        )}

        {activeView === 'project-managers' && (
          <ProjectManagerManagement />
        )}

        {activeView === 'team-leaders' && (
          <TeamLeaderManagement />
        )}

        {activeView === 'projects' && (
          <ProjectManagement />
        )}

        {activeView === 'assigned-tasks' && (
          <TaskManagement
            projects={projects}
            allUsers={allUsers}
          />
        )}

        {activeView === 'role-management' && (
          <RoleManagement />
        )}

        {activeView === 'points-scheme' && (
          <PointsScheme />
        )}

        {activeView === 'reports' && (
          <Reports />
        )}
      </div>

      {/* Modals */}
      {showAddUserModal && (
        <AddUserModal
          show={showAddUserModal}
          onHide={() => {
            setShowAddUserModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          editingUser={editingUser}
          projects={projects}
        />
      )}

      {showAddProjectModal && (
        <AddProjectModal
          show={showAddProjectModal}
          onHide={() => {
            setShowAddProjectModal(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          editingProject={editingProject}
          availableEmployees={allUsers}
        />
      )}

      {showAddTaskModal && (
        <AddTaskModal
          show={showAddTaskModal}
          onHide={() => {
            setShowAddTaskModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          editingTask={editingTask}
          allUsers={allUsers}
          projects={projects}
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
          editingProjectManager={editingProjectManager}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
