import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { AuthService } from '../firebase/authService';
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
import RevenueView from './admin/Revenue';

import AdminOverview from './admin/AdminOverview';
import Reports from './admin/Reports';
import SupportHelp from './admin/SupportHelp';
import AdminNotice from './admin/AdminNotice';
import { subscribeToNotices, subscribeToProjects, subscribeToAllUsers } from '../firebase/firestoreService';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!safeUserData.id && !safeUserData._id) return;
    let isFirstLoad = true;
    const unsubscribe = subscribeToNotices(safeUserData.id || safeUserData._id, safeUserData.role, (notices) => {
      const count = notices.filter(n => !n.read).length;
      setUnreadCount(count);

      if (!isFirstLoad && count > unreadCount) {
        const newest = notices[0];
        setNotification(`New Message from ${newest.senderName}: ${newest.subject}`);
        setTimeout(() => setNotification(null), 5000);
      }
      isFirstLoad = false;
    });
    return () => unsubscribe();
  }, [safeUserData, unreadCount]);

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

  // Load project managers from database (Firestore only)
  const loadProjectManagers = async () => {
    setLoadingProjectManagers(true);

    try {
      const managersData = await getAllProjectManagers();

      if (managersData && managersData.length > 0) {
        // Transform and add identifying properties
        const pmUsers = managersData.map(pm => ({
          ...pm,
          id: pm.id || pm._id,
          _id: pm._id || pm.id,
          role: 'project-manager',
          userType: 'Project Manager',
          payroll: pm.payroll || `PM${(pm.id || pm._id)?.slice(-3) || '001'}`
        }));

        setProjectManagers(pmUsers);

        // Update allUsers state to include these PMs
        setAllUsers(prev => {
          // Remove existing PMs from state to avoid duplicates before adding fresh ones
          const withoutPMs = prev.filter(user => user.role !== 'project-manager');
          return [...withoutPMs, ...pmUsers];
        });

        console.log(`✅ Loaded ${pmUsers.length} Project Managers from Firestore`);
      } else {
        setProjectManagers([]);
      }
    } catch (error) {
      console.error('❌ Error loading project managers:', error);
      setProjectManagers([]);
    } finally {
      setLoadingProjectManagers(false);
    }
  };

  // Load all users from database (Firestore only - no localStorage)
  const loadUsers = async () => {
    setLoadingUsers(true);

    try {
      const apiUsers = await getAllUsers();

      if (!apiUsers || apiUsers.length === 0) {
        setAllUsers([]);
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

      // Remove duplicates
      const seenEmails = new Set();
      const seenIds = new Set();
      const uniqueUsers = [];

      processedUsers.forEach(user => {
        const email = user.email?.toLowerCase().trim();
        const userId = user.id || user._id;

        if (email && seenEmails.has(email)) return;
        if (userId && seenIds.has(userId)) return;

        if (email) seenEmails.add(email);
        if (userId) seenIds.add(userId);

        uniqueUsers.push(user);
      });

      setAllUsers(uniqueUsers);
      console.log(`✅ Loaded ${uniqueUsers.length} users from Firestore`);

    } catch (error) {
      console.error('❌ Error loading users from Firestore:', error);
      setAllUsers([]);
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

  // Load projects from database (Firestore only - no localStorage)
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
      console.log(`✅ Loaded ${transformedProjects.length} projects from Firestore`);
    } catch (error) {
      console.error('❌ Error loading projects from Firestore:', error);
      setProjects([]);
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

  // Load all data on component mount with real-time subscriptions
  useEffect(() => {
    // 1. Initial load for non-realtime stats if needed (like progressData)
    loadDashboardStats();
    loadTasks();
    loadTeamLeaders();
    loadCustomRoles();

    // 2. Setup real-time listeners for Users
    setLoadingUsers(true);
    const unsubscribeUsers = subscribeToAllUsers((apiUsers) => {
      if (apiUsers && apiUsers.length > 0) {
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
        setAllUsers(processedUsers);
      } else {
        setAllUsers([]);
      }
      setLoadingUsers(false);
    });

    // 3. Setup real-time listeners for Projects
    setLoadingProjects(true);
    const unsubscribeProjects = subscribeToProjects((projectsData) => {
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
      setLoadingProjects(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeProjects();
    };
  }, []);

  // Update dynamic dashboard stats whenever users or projects change
  useEffect(() => {
    const totalUsers = allUsers.length;
    const activeProjects = projects.filter(p => p.status !== 'Completed').length;
    const totalClients = new Set(projects.map(p => p.clientName).filter(Boolean)).size;
    const totalRevenue = projects.reduce((sum, p) => sum + (Number(p.projectCost) || 0), 0);

    setDashboardStats(prev => ({
      ...prev,
      totalUsers,
      activeProjects,
      totalClients,
      totalRevenue
    }));
  }, [allUsers, projects]);

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
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.message || 'Failed to save user.');
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
      alert(error.message || 'Failed to save project manager.');
    }
  };

  // Handler for saving/updating team leaders
  const handleSaveTeamLeader = async (tlData) => {
    console.log('🚀 handleSaveTeamLeader called with:', tlData);
    console.log('🛠️ AuthService status:', AuthService);

    if (!tlData.password && !editingTeamLeader) {
      alert("Debug: Password is missing in tlData!");
      return;
    }

    try {
      if (editingTeamLeader) {
        await updateTeamLeader(editingTeamLeader.id || editingTeamLeader._id, tlData);
      } else {
        // Direct save to Firebase via AuthService (bypassing api.js wrapper)
        const result = await AuthService.registerUser({ ...tlData, role: 'team-leader' });
        console.log('✅ Team Leader created successfully:', result);
      }
      setShowAddTeamLeaderModal(false);
      setEditingTeamLeader(null);
      loadTeamLeaders();
      loadDashboardStats();
    } catch (error) {
      console.error('❌ Error saving team leader:', error);

      // Detailed error extraction
      let errorMsg = 'Failed to save team leader.';
      if (typeof error === 'string') errorMsg = error;
      else if (error.message) errorMsg = error.message;
      else if (error.code) errorMsg = `Error Code: ${error.code}`;
      else {
        try {
          errorMsg = 'Full Error: ' + JSON.stringify(error);
        } catch (e) {
          errorMsg = 'Unknown error object';
        }
      }

      alert(errorMsg);
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
    } else if (menuItem === 'Support & Help') {
      setActiveView('support-help');
    } else if (menuItem === 'Notice') {
      setActiveView('notice');
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
    const formatNumber = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num?.toString() || '0';
    };

    return [
      {
        title: 'Registered Users',
        value: formatNumber(allUsers.length),
        icon: 'fas fa-users',
        color: 'purple',
        trend: `Total: ${allUsers.length}`,
        clickable: true,
        ariaLabel: `${allUsers.length} total users`
      },
      {
        title: 'Active Projects',
        value: formatNumber(projects.filter(p => p.status !== 'Completed').length),
        icon: 'fas fa-project-diagram',
        color: 'green',
        trend: `In Progress`,
        clickable: true,
        ariaLabel: `Active projects`
      },
      {
        title: 'Total Clients',
        value: formatNumber(new Set(projects.map(p => p.clientName).filter(Boolean)).size),
        icon: 'fas fa-handshake',
        color: 'teal',
        trend: 'Partners',
        clickable: true,
        ariaLabel: `Total clients`
      },
      {
        title: 'Total Revenue',
        value: `₹${formatNumber(projects.reduce((sum, p) => sum + (Number(p.projectCost) || 0), 0))}`,
        icon: 'fas fa-rupee-sign',
        color: 'orange',
        trend: 'Lifetime',
        clickable: true,
        ariaLabel: `Total revenue`
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
          <div className="user-profile-section">
            <div className="user-avatar-sm">AD</div>
            <div className="user-info-text d-none d-sm-block">
              <span className="user-name">Admin User</span>
            </div>
            <i className="fas fa-chevron-down small text-muted ms-2"></i>
          </div>
        </div>
      </div>

      {/* Sidebar - Customized with Purple Theme */}
      <div className={`dashboard-sidebar admin-purple-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        {notification && (
          <div className="notification-pop animate__animated animate__fadeInDown" style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '5px solid #0056b3'
          }}>
            <i className="fas fa-bell fa-lg"></i>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>New Notification</strong>
              <span style={{ fontSize: '0.85rem' }}>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', color: 'white', padding: '0 0 0 10px', cursor: 'pointer' }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        <div className="sidebar-header">
          <h3 className="text-white fw-bold mb-0">Admin Dashboard</h3>
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
            <li className={activeView === 'notice' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Notice')}>
                <i className="fas fa-bullhorn"></i>
                <span>Notice (Warnings)</span>
              </a>
            </li>
            <li className={activeView === 'support-help' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Support & Help')}>
                <i className="fas fa-headset"></i>
                <span>Support & Help</span>
                {unreadCount > 0 && (
                  <span className="badge bg-danger rounded-pill ms-2 animate__animated animate__pulse animate__infinite" style={{ fontSize: '0.65rem' }}>
                    {unreadCount}
                  </span>
                )}
              </a>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="footer-user-card">
            <div className="user-avatar-xs">AD</div>
            <div className="card-info">
              <div className="name">Admin</div>
              <div className="role">Culture Admin</div>
            </div>
          </div>
          <button className="logout-button-alt" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
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
                    className={`dashboard-card bg-${card.color} ${card.clickable ? 'clickable' : ''}`}
                    onClick={() => card.clickable && handleCardClick(card.title)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="dashboard-card-icon-container">
                        <i className={`${card.icon} text-white fs-5`}></i>
                      </div>
                      <span className="dashboard-card-status">{card.trend}</span>
                    </div>
                    <div>
                      <h3 className="text-white">{card.value}</h3>
                      <p className="text-white">{card.title}</p>
                    </div>
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

        {activeView === 'support-help' && (
          <SupportHelp adminData={safeUserData} />
        )}

        {activeView === 'revenue' && (
          <RevenueView />
        )}

        {activeView === 'notice' && (
          <AdminNotice />
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
