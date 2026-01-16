import React, { useState, useEffect } from 'react';
import './ProjectManagerDashboard.css';
import AddTaskModal from './AddTaskModal';
import AddProjectModal from './AddProjectModal';
import AddUserModal from './AddUserModal';
import { formatDate } from '../utils/dateUtils';

// Import modular PM components
import PMProjects from './pm/PMProjects';
import PMTasks from './pm/PMTasks';
import PMTeam from './pm/PMTeam';
import PMReports from './pm/PMReports';
import TeamLeaderNotice from './TeamLeaderNotice'; // Reusing TeamLeaderNotice component
import TeamLeaderSupport from './TeamLeaderSupport'; // Reusing TeamLeaderSupport component
import { subscribeToNotices } from '../firebase/firestoreService';

import {
  getAllProjects,
  getAllTasks,
  getAllUsers,
  createTask,
  updateTask,
  createProject,
  updateProject,
  deleteProject,
  createUser,
  updateUser,
  deleteUser,
  createTeamLeader,
  updateTeamLeader,
  deleteTeamLeader,
  createProjectManager,
  updateProjectManager,
  deleteProjectManager,
  getAllTeamLeaders,
  getAllProjectManagers
} from '../services/api';

const ProjectManagerDashboard = ({ userData, onLogout }) => {
  const safeUserData = userData || {};
  const safeOnLogout = onLogout || (() => { });

  const [userName, setUserName] = useState(safeUserData?.name || localStorage.getItem('userName') || 'Project Manager');
  const [userEmail] = useState(safeUserData?.email || localStorage.getItem('userEmail') || '');
  const [activeView, setActiveView] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    teamSize: 0,
    completionRate: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [notificationTitle, setNotificationTitle] = useState('New Message');
  const [overdueProjectsList, setOverdueProjectsList] = useState([]);
  const [overdueTasksList, setOverdueTasksList] = useState([]);
  const [showOverdueCard, setShowOverdueCard] = useState(false);

  useEffect(() => {
    if (!safeUserData.id && !safeUserData._id) return;
    let isFirstLoad = true;
    const unsubscribe = subscribeToNotices(safeUserData.id || safeUserData._id, (notices) => {
      const count = notices.filter(n => !n.read).length;

      if (!isFirstLoad && count > unreadCount) {
        const newest = notices[0];
        setNotificationTitle('New Message');
        setNotification(`New Message from ${newest.senderName}: ${newest.subject}`);
        setTimeout(() => setNotification(null), 5000);
      }
      setUnreadCount(count);
      isFirstLoad = false;
    });
    return () => unsubscribe();
  }, [safeUserData, unreadCount]);

  // Check for overdue projects and tasks
  useEffect(() => {
    if (loadingProjects || loadingTasks) return;

    const today = new Date().toISOString().split('T')[0];

    const overdueP = projects.filter(p => {
      const status = (p.status || '').toLowerCase();
      return status !== 'completed' && p.endDate && p.endDate < today;
    });

    const overdueT = assignedTasks.filter(t => {
      const status = (t.status || '').toLowerCase();
      return status !== 'completed' && t.dueDate && t.dueDate < today;
    });

    setOverdueProjectsList(overdueP);
    setOverdueTasksList(overdueT);

    if (overdueP.length > 0 || overdueT.length > 0) {
      setShowOverdueCard(true);
    } else {
      setShowOverdueCard(false);
    }
  }, [projects, assignedTasks, loadingProjects, loadingTasks]);

  // State for Quick Task Assignment (Ported from MultiRoleDashboard/PMDashboardSidebar)
  const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState('');
  const [selectedProjectForTask, setSelectedProjectForTask] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskStartDate, setTaskStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'task', title: 'Task Completed', desc: 'Review development team implementation completed', user: 'Jane Smith', project: 'E-learning Platform', date: formatDate(new Date('2025-11-23')), icon: 'check', color: 'success' },
    { id: 2, type: 'assignment', title: 'New Task Assigned', desc: 'Review development team implementations assigned to John Doe', user: 'John Doe', project: 'E-learning Platform', date: formatDate(new Date('2025-11-23')), icon: 'tasks', color: 'primary' },
    { id: 3, type: 'update', title: 'Project Update', desc: 'E-learning Platform - In progress: Completed UI mockups', user: 'System', project: 'E-learning Platform', date: formatDate(new Date('2025-11-23')), icon: 'info', color: 'info', progress: 75 }

  ]);

  // Load PM's projects
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await getAllProjects();

      const meName = userName ? userName.toString().trim().toLowerCase() : '';
      const meEmail = userEmail ? userEmail.toString().trim().toLowerCase() : '';

      // Filter projects managed by this PM
      const myProjects = projectsData.filter(project => {
        const pmRaw = project.projectManager;
        const pm = (typeof pmRaw === 'object' ? (pmRaw.name || pmRaw.email || pmRaw.id || pmRaw._id || '') : (pmRaw || '')).toString().trim().toLowerCase();

        // Match against current user's name, email, or potential ID
        const meId = (safeUserData?.id || safeUserData?._id || localStorage.getItem('userId') || '').toString().toLowerCase().trim();

        const isMatch = pm === meName || pm === meEmail || (meId && pm === meId);
        return isMatch;
      });

      // Special fallback: if absolutely no projects found but they exist in projectsData, 
      // maybe the PM name doesn't match exactly. Let's look for fuzzy matches.
      let finalProjects = myProjects;
      if (myProjects.length === 0 && projectsData.length > 0) {
        console.warn('⚠️ No exact PM match found for', { meName, meEmail, projectsFound: projectsData.length });
        finalProjects = projectsData.filter(project => {
          const pmRaw = (project.projectManager || '').toString().toLowerCase();
          return pmRaw.includes(meName) || pmRaw.includes(meEmail) || (meName && meName.includes(pmRaw));
        });
      }

      const transformedProjects = (finalProjects.length > 0 ? finalProjects : myProjects).map(project => ({
        id: project._id || project.id,
        _id: project._id || project.id,
        name: project.name,
        date: formatDate(project.startDate),
        progress: project.progress || 0,
        status: project.projectStatus === 'assigned' ? 'Assigned' :
          project.projectStatus === 'on-track' ? 'On Track' :
            project.projectStatus === 'at-risk' ? 'At Risk' :
              project.projectStatus === 'delayed' ? 'Delayed' :
                project.projectStatus === 'completed' ? 'Completed' : 'On Track',
        assigned: (project.assignedMembers || project.assigned) && (project.assignedMembers || project.assigned).length > 0
          ? (project.assignedMembers || project.assigned).map((member, index) => ({
            name: typeof member === 'object' ? (member.name || member.email) : member,
            color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][index % 5]
          }))
          : [],
        extra: (project.assignedMembers || project.assigned) && (project.assignedMembers || project.assigned).length > 3 ? (project.assignedMembers || project.assigned).length - 3 : 0,
        clientName: project.clientName,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: formatDate(project.createdAt),
        updatedAt: formatDate(project.updatedAt),
        description: project.description,
        projectCost: project.projectCost,
        advancePayment: project.advancePayment,
        projectManager: project.projectManager
      }));

      setProjects(transformedProjects);
      console.log(`✅ Loaded ${transformedProjects.length} projects for ${meName || meEmail}`);
      return transformedProjects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load PM's tasks
  const loadTasks = async (currentProjects = projects) => {
    setLoadingTasks(true);
    try {
      const allTasks = await getAllTasks();

      const meName = userName ? userName.toString().trim().toLowerCase() : '';
      const meEmail = userEmail ? userEmail.toString().trim().toLowerCase() : '';
      const projectNames = currentProjects.map(p => p.name.toLowerCase());

      // Filter tasks related to PM's projects or assigned by PM
      const myTasks = allTasks.filter(task => {
        const taskProject = (typeof task.project === 'object' ? task.project.name : (task.project || task.projectName || '')).toString().toLowerCase().trim();
        const assignedBy = (task.assignedBy || '').toString().toLowerCase().trim();
        const assignedTo = (typeof task.assignedTo === 'object' ? task.assignedTo.name : (task.assignedTo || '')).toString().toLowerCase().trim();

        return projectNames.includes(taskProject) ||
          assignedBy === meName ||
          assignedBy === meEmail ||
          assignedTo === meName ||
          assignedTo === meEmail;
      });

      setAssignedTasks(myTasks);
      return myTasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    } finally {
      setLoadingTasks(false);
    }
  };

  // Load team members and all users
  const loadTeamMembers = async (currentProjects = projects, currentTasks = assignedTasks) => {
    try {
      // Fetch from all sources to ensure we have TLs, PMs and Employees
      const [users, leaders, managers] = await Promise.all([
        getAllUsers(),
        getAllTeamLeaders(),
        getAllProjectManagers()
      ]);

      // Tag them with roles if missing
      const processedUsers = users.map(u => ({ ...u, role: u.role || 'employee' }));
      const processedLeaders = leaders.map(u => ({ ...u, role: 'team-leader' }));
      const processedManagers = managers.map(u => ({ ...u, role: 'project-manager' }));

      // Merge avoiding duplicates by email/id
      const allUsersMap = new Map();
      [...processedUsers, ...processedLeaders, ...processedManagers].forEach(u => {
        const key = u._id || u.id || u.email;
        if (key && !allUsersMap.has(key)) {
          allUsersMap.set(key, u);
        }
      });

      const allCombinedUsers = Array.from(allUsersMap.values());
      setAllUsersList(allCombinedUsers);

      // Filter team members to only those associated with this PM's projects or tasks
      const myProjectNames = currentProjects.map(p => p.name.toLowerCase().trim());
      const myMemberIdentifiers = new Set();

      // Collect identifiers from projects
      currentProjects.forEach(p => {
        const assigned = p.assignedMembers || p.assigned || [];
        assigned.forEach(m => {
          if (typeof m === 'object') {
            if (m.name) myMemberIdentifiers.add(m.name.toLowerCase().trim());
            if (m.email) myMemberIdentifiers.add(m.email.toLowerCase().trim());
            if (m.id || m._id) myMemberIdentifiers.add((m.id || m._id).toString());
          } else if (typeof m === 'string' && m.trim()) {
            myMemberIdentifiers.add(m.trim().toLowerCase());
          }
        });
      });

      // Collect identifiers from tasks
      currentTasks.forEach(t => {
        const assignedTo = t.assignedTo;
        const processMember = (m) => {
          if (typeof m === 'object') {
            if (m.name) myMemberIdentifiers.add(m.name.toLowerCase().trim());
            if (m.email) myMemberIdentifiers.add(m.email.toLowerCase().trim());
            if (m.id || m._id) myMemberIdentifiers.add((m.id || m._id).toString());
          } else if (typeof m === 'string' && m.trim()) {
            myMemberIdentifiers.add(m.trim().toLowerCase());
          }
        };

        if (Array.isArray(assignedTo)) {
          assignedTo.forEach(processMember);
        } else if (assignedTo) {
          processMember(assignedTo);
        }
      });

      const meName = (userName || '').toLowerCase().trim();
      const meEmail = (userEmail || '').toLowerCase().trim();
      const meId = (safeUserData?.id || safeUserData?._id || '').toString();

      const filteredTeam = allCombinedUsers.filter(u => {
        if (u.role === 'admin') return false;

        const name = (u.name || '').toLowerCase().trim();
        const email = (u.email || '').toLowerCase().trim();
        const id = (u._id || u.id || '').toString();

        // Don't include current PM in their own team count
        if ((name && name === meName) || (email && email === meEmail) || (id && id === meId)) {
          return false;
        }

        return myMemberIdentifiers.has(name) ||
          myMemberIdentifiers.has(email) ||
          (id && myMemberIdentifiers.has(id));
      });

      setTeamMembers(filteredTeam);
      return allCombinedUsers;
    } catch (error) {
      console.error('Error loading team members:', error);
      return [];
    }
  };

  const reloadAll = async () => {
    const loadedProjects = await loadProjects();
    const loadedTasks = await loadTasks(loadedProjects);
    await loadTeamMembers(loadedProjects, loadedTasks);
  };

  // Handle save/update task
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id || editingTask._id, taskData);
      } else {
        await createTask({
          ...taskData,
          assignedBy: userName || 'Project Manager'
        });
      }
      setNotificationTitle('Success');
      setNotification(editingTask ? 'Task updated successfully!' : 'Task added successfully!');
      setTimeout(() => setNotification(null), 5000);
      setShowAddTaskModal(false);
      setEditingTask(null);
      reloadAll();
    } catch (error) {
      console.error('Error saving task:', error);
      setNotificationTitle('Error');
      setNotification('Failed to save task. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Handle save/update user
  const handleSaveUser = async (userData) => {
    try {
      const isEditing = !!editingUser;
      const targetId = isEditing ? (editingUser.id || editingUser._id) : null;
      const role = userData.role?.toLowerCase();

      if (isEditing) {
        if (role === 'team-leader') {
          await updateTeamLeader(targetId, userData);
        } else if (role === 'project-manager') {
          await updateProjectManager(targetId, userData);
        } else {
          await updateUser(targetId, userData);
        }
      } else {
        if (role === 'team-leader') {
          await createTeamLeader(userData);
        } else if (role === 'project-manager') {
          await createProjectManager(userData);
        } else {
          await createUser(userData);
        }
      }

      setNotificationTitle('Success');
      setNotification(`User ${isEditing ? 'updated' : 'added'} successfully!`);
      setTimeout(() => setNotification(null), 5000);
      setShowAddUserModal(false);
      setEditingUser(null);
      reloadAll();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUserModal(true);
  };

  const handleDeleteUser = async (user) => {
    const userId = user.id || user._id;
    const userName = user.name;
    const role = (user.role || '').toLowerCase();

    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        if (role === 'team-leader') {
          await deleteTeamLeader(userId);
        } else if (role === 'project-manager') {
          await deleteProjectManager(userId);
        } else {
          await deleteUser(userId);
        }
        setNotificationTitle('Success');
        setNotification(`User ${userName} deleted successfully!`);
        setTimeout(() => setNotification(null), 5000);
        reloadAll();
      } catch (error) {
        console.error('Error deleting user:', error);
        setNotificationTitle('Error');
        setNotification('Failed to delete user. Please try again.');
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  // Handle save/update project
  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id || editingProject._id, projectData);
        setNotificationTitle('Success');
        setNotification('Project updated successfully!');
      } else {
        // Ensure project manager is set to this PM correctly
        const projectWithPM = {
          ...projectData,
          projectManager: userEmail || userName || localStorage.getItem('userEmail') || localStorage.getItem('userName')
        };
        await createProject(projectWithPM);
        setNotificationTitle('Success');
        setNotification('Project added successfully!');
      }
      setTimeout(() => setNotification(null), 5000);
      setShowAddProjectModal(false);
      setEditingProject(null);
      reloadAll();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  // Handle delete project
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        setNotificationTitle('Success');
        setNotification('Project deleted successfully!');
        setTimeout(() => setNotification(null), 5000);
        reloadAll();
      } catch (error) {
        console.error('Error deleting project:', error);
        setNotificationTitle('Error');
        setNotification('Failed to delete project. Please try again.');
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  // Calculate dashboard stats
  const calculateStats = () => {
    const stats = {
      totalProjects: projects.length,
      activeTasks: assignedTasks.filter(t => t.status !== 'completed').length,
      teamSize: teamMembers.length,
      completionRate: projects.length > 0
        ? Math.round((projects.filter(p => p.status === 'Completed').length / projects.length) * 100)
        : 0
    };
    setDashboardStats(stats);
  };

  // Load all data on mount
  useEffect(() => {
    reloadAll();
  }, [userName, userEmail]);

  useEffect(() => {
    calculateStats();
  }, [projects, assignedTasks, teamMembers]);

  // Handle Quick Task Assignment
  const handleQuickTaskAssignment = async () => {
    if (!selectedEmployeeForTask || !newTaskName.trim()) {
      alert('Please select an employee and enter a task name');
      return;
    }

    try {
      const assignedEmployees = selectedEmployeeForTask.split(',').map(emp => emp.trim()).filter(emp => emp);

      const taskData = {
        title: newTaskName.trim(),
        description: `Task assigned to ${assignedEmployees.join(', ')} for project: ${selectedProjectForTask || 'General'}`,
        assignedTo: assignedEmployees.length === 1 ? assignedEmployees[0] : assignedEmployees,
        assignedBy: userName,
        project: selectedProjectForTask || 'General',
        priority: taskPriority,
        startDate: taskStartDate,
        dueDate: taskDueDate,
        status: 'assigned',
        createdAt: new Date().toISOString(),
        assignedDate: new Date().toISOString()
      };

      await createTask(taskData);

      // Reset form
      setSelectedEmployeeForTask('');
      setSelectedProjectForTask('');
      setNewTaskName('');
      setTaskPriority('medium');
      setTaskStartDate(new Date().toISOString().split('T')[0]);
      setTaskDueDate(new Date().toISOString().split('T')[0]);

      setNotificationTitle('Success');
      setNotification(`Task "${taskData.title}" has been assigned successfully!`);
      setTimeout(() => setNotification(null), 5000);
      loadTasks();
    } catch (error) {
      console.error('Error in quick task assignment:', error);
      setNotificationTitle('Error');
      setNotification('Failed to assign task. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (safeOnLogout) {
      safeOnLogout();
      return;
    }

    localStorage.removeItem('pmToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');

    window.location.href = '/login';
  };

  // Handle menu clicks
  const handleMenuClick = (menuItem) => {
    if (menuItem === 'Dashboard') {
      setActiveView('dashboard');
    } else if (menuItem === 'My Projects') {
      setActiveView('projects');
    } else if (menuItem === 'Task Management') {
      setActiveView('tasks');
    } else if (menuItem === 'My Team') {
      setActiveView('team');
    } else if (menuItem === 'Reports') {
      setActiveView('reports');
    } else if (menuItem === 'Notice') {
      setActiveView('notice');
    } else if (menuItem === 'Support & Help') {
      setActiveView('support-help');
    }
    setIsMobileSidebarOpen(false);
  };

  // Get dashboard cards
  const getDashboardCards = () => {
    return [
      {
        title: 'Total Projects',
        value: dashboardStats.totalProjects,
        icon: 'fas fa-project-diagram',
        color: 'primary',
        clickable: true
      },
      {
        title: 'Active Tasks',
        value: dashboardStats.activeTasks,
        icon: 'fas fa-tasks',
        color: 'success',
        clickable: true
      },
      {
        title: 'Team Size',
        value: dashboardStats.teamSize,
        icon: 'fas fa-users',
        color: 'info',
        clickable: true
      },
      {
        title: 'Completion Rate',
        value: `${dashboardStats.completionRate}%`,
        icon: 'fas fa-chart-line',
        color: 'warning',
        clickable: false
      }
    ];
  };

  return (
    <div className="pm-dashboard">
      {/* Header */}
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
            <span className="user-name">Welcome, {userName}</span>
            <div className="user-avatar" title={userName}>
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="notification-pop animate__animated animate__fadeInDown" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: notificationTitle === 'Success' ? '#28a745' : notificationTitle === 'Overdue Reminder' ? '#dc3545' : '#007bff',
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
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>{notificationTitle}</strong>
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
      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-overlay ${isMobileSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Project Manager Dashboard</h3>
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
            <li className={activeView === 'projects' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('My Projects')}>
                <i className="fas fa-project-diagram"></i>
                <span>My Projects</span>
              </a>
            </li>
            <li className={activeView === 'tasks' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Task Management')}>
                <i className="fas fa-tasks"></i>
                <span>Task Management</span>
              </a>
            </li>
            <li className={activeView === 'team' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('My Team')}>
                <i className="fas fa-users"></i>
                <span>My Team</span>
              </a>
            </li>
            <li className={activeView === 'reports' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Reports')}>
                <i className="fas fa-chart-bar"></i>
                <span>Reports</span>
              </a>
            </li>
            <li className={activeView === 'notice' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Notice')}>
                <i className="fas fa-bell"></i>
                <span>Notice</span>
                {unreadCount > 0 && (
                  <span className="badge bg-danger rounded-pill ms-2 animate__animated animate__pulse animate__infinite" style={{ fontSize: '0.65rem' }}>
                    {unreadCount}
                  </span>
                )}
              </a>
            </li>
            <li className={activeView === 'support-help' ? 'active' : ''}>
              <a onClick={() => handleMenuClick('Support & Help')}>
                <i className="fas fa-headset"></i>
                <span>Support & Help</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {activeView === 'dashboard' && (
          <div className="dashboard-view">
            <h3 className="mb-4">Dashboard Overview</h3>            {/* Dashboard Cards */}
            <div className="row g-4 mb-4">
              {getDashboardCards().map((card, index) => (
                <div key={index} className="col-md-6 col-lg-3">
                  <div className={`dashboard-card bg-${card.color} text-white`}>
                    <div className="card-icon">
                      <i className={card.icon}></i>
                    </div>
                    <div className="card-content">
                      <h4>{card.value}</h4>
                      <p>{card.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overdue Items Alert Card */}
            {showOverdueCard && (
              <div className="card mb-4 border-start border-danger border-4 shadow-sm animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(255, 245, 245, 0.5)', borderRadius: '15px', border: '1px solid #fee2e2' }}>
                <div className="card-body p-4 position-relative">
                  <button
                    className="btn-close position-absolute top-0 end-0 m-3"
                    style={{ fontSize: '0.8rem', opacity: 0.5 }}
                    onClick={() => setShowOverdueCard(false)}
                  ></button>

                  <div className="d-flex align-items-start">
                    <div className="text-danger me-4 mt-1">
                      <i className="fas fa-exclamation-triangle fa-2x"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <i className="fas fa-bell me-2 text-dark small"></i>
                        <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>Overdue Items Detected!</h6>
                      </div>
                      <p className="text-muted small mb-3">You have {overdueProjectsList.length + overdueTasksList.length} overdue item(s) that require immediate attention.</p>

                      {/* Projects List */}
                      {overdueProjectsList.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold small mb-2 text-dark">
                            <i className="fas fa-project-diagram me-2"></i>
                            Overdue Projects ({overdueProjectsList.length}):
                          </h6>
                          <div className="ps-4">
                            {overdueProjectsList.map((p, i) => (
                              <div key={i} className="mb-2 d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark small">{p.name}</span>
                                <span className="text-muted smaller"> - Due: {formatDate(p.endDate)}</span>
                                <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '0.6rem' }}>OVERDUE</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tasks List */}
                      {overdueTasksList.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold small mb-2 text-dark">
                            <i className="fas fa-list-ul me-2"></i>
                            Overdue Tasks ({overdueTasksList.length}):
                          </h6>
                          <div className="ps-4">
                            {overdueTasksList.map((t, i) => (
                              <div key={i} className="mb-2 d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark small">{t.title}</span>
                                <span className="text-muted smaller"> - Due: {formatDate(t.dueDate)}</span>
                                <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '0.6rem' }}>OVERDUE</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 d-flex gap-2">
                        <button
                          className="btn btn-danger btn-sm px-3 fw-bold d-flex align-items-center gap-2"
                          style={{ borderRadius: '6px' }}
                          onClick={() => overdueProjectsList.length > 0 ? setActiveView('projects') : setActiveView('tasks')}
                        >
                          <i className="fas fa-eye small"></i> View Details
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm px-3 fw-bold"
                          style={{ borderRadius: '6px', backgroundColor: '#f8fafc' }}
                          onClick={() => setShowOverdueCard(false)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row mb-4">
              {/* Recent Activity Section */}
              <div className="col-lg-8">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                      <i className="fas fa-clock me-2 text-success"></i>Recent Activity
                    </h5>
                    <button className="btn btn-sm btn-outline-primary">View All</button>
                  </div>
                  <div className="card-body p-0">
                    <div className="activity-list">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="d-flex align-items-start p-3 border-bottom activity-item">
                          <div className={`rounded-circle bg-${activity.color} text-white d-flex align-items-center justify-content-center me-3`}
                            style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                            <i className={`fas fa-${activity.icon}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between">
                              <h6 className="fw-bold mb-1">{activity.title}</h6>
                              <small className="text-muted">{activity.date}</small>
                            </div>
                            <p className="text-muted small mb-1">{activity.desc}</p>
                            <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '0.75rem' }}>
                              <span><i className="fas fa-user me-1"></i>{activity.user}</span>
                              <span><i className="fas fa-project-diagram me-1"></i>{activity.project}</span>
                            </div>
                            {activity.progress && (
                              <div className="progress mt-2" style={{ height: '4px' }}>
                                <div className="progress-bar bg-info" style={{ width: `${activity.progress}%` }}></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Task Assignment Section */}
              <div className="col-lg-4">
                <div className="card h-100 border-0 shadow-sm quick-task-card">
                  <div className="card-body p-4 text-center">
                    {!selectedEmployeeForTask ? (
                      <div className="initial-state">
                        <div className="icon-container mb-3">
                          <div className="rounded-circle bg-light-primary d-inline-flex align-items-center justify-content-center"
                            style={{ width: '80px', height: '80px' }}>
                            <i className="fas fa-plus text-primary" style={{ fontSize: '2rem' }}></i>
                          </div>
                        </div>
                        <h4 className="fw-bold">Create New Task</h4>
                        <p className="text-muted">Add a new task and assign it to team members</p>
                        <button
                          className="btn btn-primary w-100 py-3 mt-3 fw-bold"
                          onClick={() => {
                            setEditingTask(null);
                            setShowAddTaskModal(true);
                          }}
                        >
                          <i className="fas fa-plus me-2"></i>Create Task
                        </button>
                      </div>
                    ) : (
                      <div className="text-start">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="mb-0 fw-bold">New Task</h5>
                          <button className="btn btn-sm btn-link text-muted" onClick={() => setSelectedEmployeeForTask('')}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-bold">Select Employee(s)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Type employee names..."
                            value={selectedEmployeeForTask === 'select' ? '' : selectedEmployeeForTask}
                            onChange={(e) => {
                              setSelectedEmployeeForTask(e.target.value);
                              const employee = allUsersList.find(u => u.name === e.target.value.trim());
                              if (employee && employee.assignedProject) {
                                setSelectedProjectForTask(employee.assignedProject);
                              }
                            }}
                            list="pmEmployeeList"
                          />
                          <datalist id="pmEmployeeList">
                            {allUsersList.filter(u => u.role === 'employee' || u.role === 'intern').map((u, i) => (
                              <option key={i} value={u.name}>{u.department}</option>
                            ))}
                          </datalist>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-bold">Project</label>
                          <input
                            type="text"
                            className="form-control form-control-sm bg-light"
                            value={selectedProjectForTask}
                            readOnly
                            placeholder="Auto-populated"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-bold">Task Name</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="What needs to be done?"
                            value={newTaskName}
                            onChange={(e) => {
                              const value = e.target.value;
                              const restrictedValue = value.replace(/[^a-zA-Z\s]/g, '');
                              setNewTaskName(restrictedValue);
                            }}
                          />
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-12 mb-2">
                            <label className="form-label small fw-bold text-start w-100">Priority</label>
                            <select className="form-select form-select-sm" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div className="col-6">
                            <label className="form-label small fw-bold text-start w-100">Start Date</label>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={taskStartDate}
                              onChange={(e) => setTaskStartDate(e.target.value)}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small fw-bold text-start w-100">Due Date</label>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={taskDueDate}
                              onChange={(e) => setTaskDueDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <button
                          className="btn btn-primary w-100 fw-bold"
                          onClick={handleQuickTaskAssignment}
                          disabled={!newTaskName.trim()}
                        >
                          <i className="fas fa-paper-plane me-2"></i>Assign Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Projects Table View */}
            <div className="card border-0 shadow-sm recent-projects-card">
              <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-project-diagram me-2 text-primary"></i>Recent Projects
                </h5>
                <button className="btn btn-sm btn-link" onClick={() => handleMenuClick('My Projects')}>View All</button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Project Name</th>
                        <th>Progress</th>
                        <th>Status</th>
                        <th className="pe-4">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.length > 0 ? (
                        projects.slice(0, 5).map((project) => (
                          <tr key={project.id}>
                            <td className="ps-4">
                              <div className="fw-bold">{project.name}</div>
                              <small className="text-muted">{project.clientName}</small>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '100px' }}>
                                  <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
                                </div>
                                <small>{project.progress}%</small>
                              </div>
                            </td>
                            <td>
                              <span className={`badge bg-${project.status === 'Completed' ? 'success' :
                                project.status === 'Delayed' ? 'danger' :
                                  project.status === 'At Risk' ? 'warning' : 'primary'
                                }`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="pe-4">
                              <small className="text-muted">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</small>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">No projects found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Component Views */}
        {activeView === 'projects' && (
          <PMProjects
            projects={projects}
            onRefresh={reloadAll}
            onAddProject={() => setShowAddProjectModal(true)}
            onEditProject={(project) => {
              setEditingProject(project);
              setShowAddProjectModal(true);
            }}
            onDeleteProject={handleDeleteProject}
            userName={userName}
            userEmail={userEmail}
          />
        )}

        {activeView === 'tasks' && (
          <PMTasks
            tasks={assignedTasks}
            projects={projects}
            users={teamMembers}
            onRefresh={reloadAll}
            onAddTask={() => {
              setEditingTask(null);
              setShowAddTaskModal(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setShowAddTaskModal(true);
            }}
            userName={userName}
            userEmail={userEmail}
          />
        )}

        {activeView === 'team' && (
          <PMTeam
            teamMembers={teamMembers}
            allUsers={teamMembers}
            projects={projects}
            onRefresh={reloadAll}
            onAddMember={() => {
              setEditingUser(null);
              setShowAddUserModal(true);
            }}
            onEditMember={handleEditUser}
            onDeleteMember={handleDeleteUser}
          />
        )}

        {activeView === 'reports' && (
          <PMReports
            projects={projects}
            tasks={assignedTasks}
            teamMembers={teamMembers}
          />
        )}

        {activeView === 'notice' && (
          <TeamLeaderNotice userData={safeUserData} />
        )}

        {activeView === 'support-help' && (
          <TeamLeaderSupport allUsers={allUsersList} userData={safeUserData} />
        )}
      </div>

      {/* Modals */}
      {showAddTaskModal && (
        <AddTaskModal
          show={showAddTaskModal}
          onHide={() => {
            setShowAddTaskModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          editingTask={editingTask}
          projects={projects}
          allUsers={allUsersList}
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
          availableEmployees={allUsersList}
        />
      )}

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
          teamLeaders={allUsersList.filter(u => u.role === 'team-leader' || u.userType === 'team-leader')}
        />
      )}
    </div>
  );
};

export default ProjectManagerDashboard;
