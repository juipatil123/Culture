import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllUsers,
  getAllProjects,
  getAllTasks,
  updateTask,
  createTask,
  updateProject,
  createProject,
  createUser,
  updateUser
} from '../services/api';
import AddTaskModal from './AddTaskModal';
import AddUserModal from './AddUserModal';
import AddProjectModal from './AddProjectModal';
import TeamLeaderSidebar from './TeamLeaderSidebar';
import TeamLeaderReports from './TeamLeaderReports';
import TeamLeaderProfile from './TeamLeaderProfile';
import TeamLeaderSupport from './TeamLeaderSupport';
import TeamLeaderNotice from './TeamLeaderNotice';
import { subscribeToNotices } from '../firebase/firestoreService';

const TeamLeaderDashboard = ({
  userData,
  activeView: initialActiveView = 'dashboard',
  getUserWorkStatus,
  onLogout // Optional, if needed
}) => {
  // Local state for layout
  const [activeView, setActiveView] = useState(initialActiveView);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Local state for data
  const [allUsers, setAllUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamViewMode, setTeamViewMode] = useState('card');
  const [teamFilter, setTeamFilter] = useState('all');

  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userData) return;
    let isFirstLoad = true;
    const unsubscribe = subscribeToNotices(userData.id || userData._id, userData.role, (notices) => {
      const count = notices.filter(n => !n.read).length;

      // Only show popup for critical notices, not for requirements/routine updates
      if (!isFirstLoad && count > unreadCount) {
        const newest = notices[0];
        // Check if it's a routine update or requirement
        const isRoutine = (newest.subject || '').toLowerCase().includes('requirement') ||
          (newest.type || '').toLowerCase() === 'requirement';

        if (!isRoutine) {
          setNotification(`New Message from ${newest.senderName}: ${newest.subject}`);
          setTimeout(() => setNotification(null), 5000);
        }
      }
      setUnreadCount(count);
      isFirstLoad = false;
    });
    return () => unsubscribe();
  }, [userData, unreadCount]);

  // Derived state for the Team Leader
  const [dashboardStats, setDashboardStats] = useState({
    teamMembers: [],
    managedProjects: [],
    relatedTasks: [],
    stats: {
      teamSize: 0,
      totalTasks: 0,
      completedTasks: 0,
      performance: 0,
      activeProjects: 0
    }
  });

  // Fetch all necessary data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [usersResponse, projectsResponse, tasksResponse] = await Promise.all([
        getAllUsers(),
        getAllProjects(),
        getAllTasks()
      ]);

      setAllUsers(usersResponse || []);
      setProjects(projectsResponse || []);
      setAssignedTasks(tasksResponse || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching Team Leader dashboard data:', error);
      // Fallback to localStorage if API fails
      try {
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');

        setAllUsers(localUsers);
        setProjects(localProjects);
        setAssignedTasks(localTasks);
        setLastUpdate(new Date());

        console.log('✅ Loaded Team Leader dashboard data from localStorage');
        console.log(`Users: ${localUsers.length}, Projects: ${localProjects.length}, Tasks: ${localTasks.length}`);
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchDashboardData();

    // Listen for storage events for cross-tab updates
    const handleStorageChange = (e) => {
      if (['users', 'projects', 'tasks', 'teamLeaders'].includes(e.key)) {
        fetchDashboardData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchDashboardData]);

  // Calculate generic stats and filter data for the current TL
  useEffect(() => {
    if (!userData || loading) return;

    const meName = (userData.name || localStorage.getItem('userName') || '').toString().toLowerCase().trim();
    const meEmail = (userData.email || localStorage.getItem('userEmail') || '').toString().toLowerCase().trim();
    const meId = String(userData.id || userData._id || '').toLowerCase();

    // 1. Identify Team Members
    const teamMembers = allUsers.filter(user => {
      const uRole = (user.role || '').toLowerCase();
      const uTLId = String(user.teamLeaderId || '').toLowerCase();
      const uTLName = (user.teamLeaderName || user.teamLeader || '').toLowerCase().trim();

      return (uRole === 'employee' || uRole === 'intern') && (
        (uTLId === meId && uTLId !== '') ||
        uTLName === meName ||
        uTLName === meEmail
      );
    });

    const teamMemberNames = new Set(teamMembers.map(m => m.name.toLowerCase().trim()));
    const teamMemberEmails = new Set(teamMembers.map(m => (m.email || '').toLowerCase().trim()));

    // 2. Identify Tasks (assigned to team members OR assigned by TL OR assigned TO TL)
    const relatedTasks = assignedTasks.filter(task => {
      if (!task) return false;

      // Handle task.assignedTo being string or object
      const assignedToRaw = task.assignedTo;
      let assignedToList = [];

      if (Array.isArray(assignedToRaw)) {
        assignedToList = assignedToRaw.map(e => (e && typeof e === 'object' ? (e.name || e.email) : e)?.toString().toLowerCase().trim()).filter(Boolean);
      } else if (assignedToRaw) {
        assignedToList = [(typeof assignedToRaw === 'object' ? (assignedToRaw.name || assignedToRaw.email) : assignedToRaw)?.toString().toLowerCase().trim()].filter(Boolean);
      }

      const assignedBy = (task.assignedBy || '').toString().toLowerCase().trim();
      // const taskProject = (task.project && typeof task.project === 'object' ? task.project.name : (task.project || task.projectName || '')).toString().toLowerCase().trim();

      // Check if assigned to ME
      const isToMe = assignedToList.includes(meName) || assignedToList.includes(meEmail);
      // Check if assigned BY ME
      const isByMe = assignedBy === meName || assignedBy === meEmail;
      // Check if assigned to ANY team member
      const isToTeam = assignedToList.some(to => teamMemberNames.has(to) || teamMemberEmails.has(to));

      return isToMe || isByMe || isToTeam;
    });

    // 3. Identify Projects (where TL or their team is involved)
    const managedProjects = projects.filter(project => {
      if (!project) return false;
      const pManager = (project.projectManager || '').toLowerCase().trim();

      const isManagedByMe = pManager === meName || pManager === meEmail;

      // Check if I am explicitly assigned to this project
      const isAssignedToMe = project.assignedMembers && project.assignedMembers.some(member => {
        const mName = (typeof member === 'object' ? member.name : member)?.toString().toLowerCase().trim();
        return mName === meName || mName === meEmail;
      });

      const hasTeamInvolved = project.assignedMembers && project.assignedMembers.some(member => {
        const mName = (typeof member === 'object' ? member.name : member)?.toString().toLowerCase().trim();
        return teamMemberNames.has(mName) || teamMemberEmails.has(mName);
      });

      return isManagedByMe || isAssignedToMe || hasTeamInvolved;
    });

    // 4. Calculate Stats
    const completedTasks = relatedTasks.filter(task => (task.status || '').toLowerCase() === 'completed').length;
    const totalTasks = relatedTasks.length;
    const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const activeProjectsCount = managedProjects.filter(p => (p.status || '').toLowerCase() !== 'completed').length;

    setDashboardStats({
      teamMembers,
      managedProjects,
      relatedTasks,
      stats: {
        teamSize: teamMembers.length,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        performance,
        activeProjects: activeProjectsCount
      }
    });

  }, [allUsers, projects, assignedTasks, userData, loading]);

  const { stats, teamMembers, relatedTasks, managedProjects } = dashboardStats;

  // Helper to format numbers
  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Handle save/update task
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id || editingTask._id, taskData);
      } else {
        await createTask(taskData);
      }
      setShowAddTaskModal(false);
      setEditingTask(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Handle save/update project
  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id || editingProject._id, projectData);
      } else {
        await createProject(projectData);
      }
      setShowAddProjectModal(false);
      setEditingProject(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  // Handle save/update user
  const handleSaveUser = async (userDataToSave) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id || editingUser._id, userDataToSave);
      } else {
        // If the current user is a Team Leader, auto-assign this user to them
        const userToCreate = {
          ...userDataToSave,
          teamLeaderId: userData.id || userData._id,
          teamLeaderName: userData.name
        };
        await createUser(userToCreate);
      }
      setShowAddUserModal(false);
      setEditingUser(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  // View Member Details
  const handleViewMemberDetails = (member) => {
    setSelectedMember(member);
    setShowMemberDetailsModal(true);
  };

  // ...

  // Render Stats Cards
  const renderStatsCards = () => (
    <div className="row mb-4">
      <div className="col-12 col-md-6 col-xl-3 mb-3 mb-xl-0">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-muted mb-0">Team Members</h6>
              <div className="icon-wrapper bg-success bg-opacity-10 rounded-circle p-2">
                <i className="fas fa-users text-success"></i>
              </div>
            </div>
            <h3 className="mb-1 fw-bold">{formatNumber(stats.teamSize)}</h3>
            <div className="mt-2 small text-muted">Active members</div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3 mb-3 mb-xl-0">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-muted mb-0">Team Tasks</h6>
              <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle p-2">
                <i className="fas fa-tasks text-primary"></i>
              </div>
            </div>
            <h3 className="mb-1 fw-bold">{formatNumber(stats.totalTasks)}</h3>
            <div className="mt-2 small text-muted">Assigned to team</div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3 mb-3 mb-xl-0">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-muted mb-0">Team Performance</h6>
              <div className="icon-wrapper bg-warning bg-opacity-10 rounded-circle p-2">
                <i className="fas fa-chart-line text-warning"></i>
              </div>
            </div>
            <h3 className="mb-1 fw-bold">{stats.performance}%</h3>
            <div className="mt-2 small text-muted">Completion rate</div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3 mb-3 mb-xl-0">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-muted mb-0">Active Projects</h6>
              <div className="icon-wrapper bg-info bg-opacity-10 rounded-circle p-2">
                <i className="fas fa-project-diagram text-info"></i>
              </div>
            </div>
            <h3 className="mb-1 fw-bold">{formatNumber(stats.activeProjects)}</h3>
            <div className="mt-2 small text-muted">Involving team</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ...

  // Render My Team View
  const renderMyTeamView = () => {
    // Filter logic
    const filteredMembers = teamMembers.filter(member => {
      if (teamFilter === 'all') return true;
      // Example logic for filters - mapping 'availability' or 'status'
      // You might need actual status fields on users. For now, simulating based on pending tasks.
      const memberTasks = assignedTasks.filter(t =>
        (Array.isArray(t.assignedTo) ? t.assignedTo.includes(member.name) : t.assignedTo === member.name) &&
        t.status !== 'completed'
      );
      const isBusy = memberTasks.length >= 3;

      if (teamFilter === 'available') return !isBusy;
      if (teamFilter === 'busy') return isBusy;
      return true;
    });

    return (
      <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
        <div className="card-header bg-white border-0 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h5 className="mb-1 fw-bold">My Team</h5>
            <p className="text-muted small mb-0">Manage your team members</p>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* View Toggles */}
            <div className="btn-group shadow-sm rounded-pill p-1 bg-light">
              <button
                className={`btn btn-sm rounded-pill px-3 fw-bold ${teamViewMode === 'card' ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`}
                onClick={() => setTeamViewMode('card')}
              >
                <i className="fas fa-th-large me-1"></i> Card
              </button>
              <button
                className={`btn btn-sm rounded-pill px-3 fw-bold ${teamViewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`}
                onClick={() => setTeamViewMode('list')}
              >
                <i className="fas fa-list me-1"></i> List
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pb-3">
          <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {['all', 'available', 'busy', 'on-leave'].map(f => (
              <button
                key={f}
                className={`btn rounded-pill px-4 fw-500 ${teamFilter === f ? 'btn-primary' : 'btn-light bg-white border'}`}
                onClick={() => setTeamFilter(f)}
                style={{ whiteSpace: 'nowrap' }}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body bg-light p-4">
          {filteredMembers.length > 0 ? (
            <div className={teamViewMode === 'card' ? "row g-4" : "d-flex flex-column gap-3"}>
              {filteredMembers.map(member => {
                // Calculate Status
                const memberTasks = assignedTasks.filter(t =>
                  (Array.isArray(t.assignedTo) ? t.assignedTo.includes(member.name) : t.assignedTo === member.name)
                );
                const pendingCount = memberTasks.filter(t => t.status !== 'completed').length;
                const status = pendingCount >= 3 ? 'BUSY' : 'AVAILABLE';
                const statusColor = status === 'BUSY' ? 'warning' : 'success';

                return (
                  <div key={member.id || member._id} className={teamViewMode === 'card' ? "col-md-6 col-lg-4" : "col-12"}>
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                      <div className="card-body p-4">
                        {/* Header: Name & Badges */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="fw-bold text-dark mb-1">{member.name}</h5>
                            <div className="d-flex gap-2 mb-2">
                              <span className={`badge bg-${statusColor} bg-opacity-10 text-${statusColor} px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                                {status}
                              </span>
                              <span className="badge border border-info text-info bg-transparent px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                {(member.role || 'MEMBER').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {/* Excluded Points Star as per request */}
                        </div>

                        {/* Description (Email/Role) */}
                        <p className="text-muted small mb-4 text-truncate">
                          {member.email || 'No email provided'}
                        </p>

                        {/* Assignee Info (Mapped to Team Leads/Managers) */}
                        <div className="row g-3 mb-4">
                          <div className="col-6">
                            <small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Team Member:</small>
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="small fw-semibold text-dark text-truncate">
                                {member.name}
                              </span>
                            </div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block mb-1" style={{ fontSize: '0.75rem' }}>Reports To:</small>
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                {userData?.name?.charAt(0).toUpperCase() || 'L'}
                              </div>
                              <span className="small fw-semibold text-dark text-truncate">
                                {userData?.name || 'Team Leader'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <hr className="bg-light my-3" />

                        {/* Footer: Date & Actions */}
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center text-muted small">
                            <i className="far fa-calendar-alt text-danger me-2"></i>
                            <span>Joined: {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-light text-primary px-3 py-1 btn-sm fw-semibold"
                              style={{ backgroundColor: '#eff6ff' }}
                              onClick={() => handleViewMemberDetails(member)}
                            >
                              <i className="fas fa-eye me-1"></i> View
                            </button>
                            <button
                              className="btn btn-light text-info px-3 py-1 btn-sm fw-semibold"
                              style={{ backgroundColor: '#f0f9ff' }}
                              onClick={() => {
                                setEditingTask({ assignedTo: member.name });
                                setShowAddTaskModal(true);
                              }}
                            >
                              <i className="fas fa-tasks me-1"></i> Task
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3 opacity-25"></i>
              <p className="text-muted">No team members found.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Requirements Section for Dashboard
  const renderRequirementsDashboardSection = () => {
    const allReqs = [];
    Object.keys(projectRequirements).forEach(pId => {
      const project = projects.find(p => (p.id || p._id) === pId);
      if (project) {
        projectRequirements[pId].forEach(req => {
          allReqs.push({ ...req, projectName: project.name, projectId: pId });
        });
      }
    });

    const sortedReqs = allReqs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

    return (
      <div className="card border-0 shadow-sm mb-4 overflow-hidden">
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold"><i className="fas fa-clipboard-list me-2 text-primary"></i>Project Requirements Overview</h5>
          <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => setActiveView('projects')}>View All</button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Project</th>
                  <th>Requirement</th>
                  <th>Date</th>
                  <th className="pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedReqs.length > 0 ? (
                  sortedReqs.map(req => (
                    <tr key={req.id}>
                      <td className="ps-4 fw-bold text-primary">{req.projectName}</td>
                      <td className="text-muted small" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.text}
                      </td>
                      <td>{new Date(req.date).toLocaleDateString()}</td>
                      <td className="pe-4">
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3">Pending</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted small">No requirements recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Dashboard View (Activity & Notices)
  const renderDashboardView = () => {
    // Recent Activity Logic
    const recentActivity = relatedTasks
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)
      .map(task => {
        const isNew = task.status === 'assigned' || task.status === 'Assigned' ||
          (task.createdAt && new Date().getTime() - new Date(task.createdAt).getTime() < 86400000); // Created within 24h

        return {
          type: 'task',
          title: task.title,
          message: isNew
            ? `New task assigned to ${Array.isArray(task.assignedTo) ? task.assignedTo.map(x => (typeof x === 'object' ? x.name : x)).join(', ') : task.assignedTo}`
            : `Task updated: ${task.status} - ${Array.isArray(task.assignedTo) ? task.assignedTo.map(x => (typeof x === 'object' ? x.name : x)).join(', ') : task.assignedTo}`,
          time: task.updatedAt || task.createdAt || new Date(),
          icon: task.status === 'completed' ? 'fa-check-circle' : (isNew ? 'fa-plus-circle' : 'fa-clock'),
          color: task.status === 'completed' ? 'text-success' : (isNew ? 'text-primary' : 'text-info')
        };
      });

    return (
      <>
        {renderStatsCards()}
        {renderRequirementsDashboardSection()}
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0 py-3">
                <h5 className="mb-0 fw-bold">Recent Activity</h5>
              </div>
              <div className="card-body">
                {recentActivity.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="list-group-item px-0 border-0 d-flex align-items-start mb-3 activity-item" style={{ transition: 'all 0.2s' }}>
                        <div className="me-3 mt-1">
                          <div className={`icon-circle ${activity.color.replace('text-', 'bg-')} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                            <i className={`fas ${activity.icon} ${activity.color}`}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-0 fw-bold">{activity.title}</h6>
                          <p className="mb-1 text-muted small">{activity.message}</p>
                          <small className="text-muted d-flex align-items-center">
                            <i className="far fa-clock me-1"></i>
                            {new Date(activity.time).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">No recent activity found.</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Latest Notices</h5>
                <button className="btn btn-sm text-primary" onClick={() => setActiveView('notice')}>View All</button>
              </div>
              <div className="card-body p-0">
                <div className="p-3">
                  <TeamLeaderNotice userData={userData} compact={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Persistence and State for Requirements & Meetings
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [activeProjectForRequirement, setActiveProjectForRequirement] = useState(null);
  const [requirementText, setRequirementText] = useState('');
  const [editingRequirement, setEditingRequirement] = useState(null);

  const [projectRequirements, setProjectRequirements] = useState(() => {
    try {
      const savedNew = localStorage.getItem('tl_project_requirements');
      if (savedNew) return JSON.parse(savedNew);

      const savedOld = localStorage.getItem('tl_project_requests');
      return savedOld ? JSON.parse(savedOld) : {};
    } catch (e) { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('tl_project_requirements', JSON.stringify(projectRequirements));
  }, [projectRequirements]);

  const [showWorkingNoteModal, setShowWorkingNoteModal] = useState(false);
  const [activeProjectForWorkingNote, setActiveProjectForWorkingNote] = useState(null);
  const [workingNoteText, setWorkingNoteText] = useState('');
  const [editingWorkingNote, setEditingWorkingNote] = useState(null);

  const [projectWorkingNotes, setProjectWorkingNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('tl_project_working_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const [lastSeenRequirements, setLastSeenRequirements] = useState(() => {
    try {
      const saved = localStorage.getItem('tl_last_seen_requirements');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('tl_last_seen_requirements', JSON.stringify(lastSeenRequirements));
  }, [lastSeenRequirements]);

  useEffect(() => {
    localStorage.setItem('tl_project_working_notes', JSON.stringify(projectWorkingNotes));
  }, [projectWorkingNotes]);

  // handle saving requirement (add/update)
  const handleSaveRequirement = () => {
    if (!requirementText.trim() || !activeProjectForRequirement) return;

    const projectId = activeProjectForRequirement.id || activeProjectForRequirement._id;

    if (editingRequirement) {
      setProjectRequirements(prev => {
        const projectReqs = [...(prev[projectId] || [])];
        const index = projectReqs.findIndex(r => r.id === editingRequirement.id);
        if (index !== -1) {
          projectReqs[index] = {
            ...editingRequirement,
            text: requirementText,
            updatedAt: new Date().toISOString()
          };
        }
        return { ...prev, [projectId]: projectReqs };
      });
    } else {
      const newRequirement = {
        id: Date.now(),
        text: requirementText,
        date: new Date().toISOString(),
        status: 'pending'
      };

      setProjectRequirements(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newRequirement]
      }));
    }

    setRequirementText('');
    setEditingRequirement(null);
  };

  const handleEditRequirement = (req) => {
    setEditingRequirement(req);
    setRequirementText(req.text);
  };

  // handle saving working note (add/update)
  const handleSaveWorkingNote = () => {
    if (!workingNoteText.trim() || !activeProjectForWorkingNote) return;

    const projectId = activeProjectForWorkingNote.id || activeProjectForWorkingNote._id;

    if (editingWorkingNote) {
      setProjectWorkingNotes(prev => {
        const projectNotes = [...(prev[projectId] || [])];
        const index = projectNotes.findIndex(n => n.id === editingWorkingNote.id);
        if (index !== -1) {
          projectNotes[index] = {
            ...editingWorkingNote,
            text: workingNoteText,
            updatedAt: new Date().toISOString()
          };
        }
        return { ...prev, [projectId]: projectNotes };
      });
    } else {
      const newNote = {
        id: Date.now(),
        text: workingNoteText,
        date: new Date().toISOString()
      };

      setProjectWorkingNotes(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newNote]
      }));
    }

    setWorkingNoteText('');
    setEditingWorkingNote(null);
  };

  const handleEditWorkingNote = (note) => {
    setEditingWorkingNote(note);
    setWorkingNoteText(note.text);
  };

  // Render Projects View - Card-based layout with detailed information
  const renderProjectsView = () => (
    <>
      {/* Projects Grid - Card View */}
      <div className="row g-4 mb-4">
        {managedProjects.length > 0 ? (
          managedProjects.map(project => {
            // Calculate Duration
            const startDate = project.startDate ? new Date(project.startDate) : new Date();
            const dueDate = project.dueDate ? new Date(project.dueDate) : new Date();
            const diffTime = Math.abs(dueDate - startDate);
            const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Count Members (People working on project)
            const memberCount = project.assignedMembers ? project.assignedMembers.length : 0;

            // Count Devices (if available in project data)
            const deviceCount = project.devices ? project.devices.length : (project.deviceCount || 0);

            // Project ID
            const pId = project.id || project._id;

            // Requirement Count (Unseen only)
            const totalReqs = (projectRequirements[pId] || []).length;
            const seenCount = lastSeenRequirements[pId] || 0;
            const unseenCount = Math.max(0, totalReqs - seenCount);

            return (
              <div key={project.id || project._id} className="col-12 col-lg-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                  {/* Card Header */}
                  <div className="card-header bg-gradient-primary text-white py-3" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h5 className="mb-1 fw-bold text-white">{project.name || 'Unnamed Project'}</h5>
                        <small className="text-white-50">
                          <i className="fas fa-building me-1"></i>
                          {project.client || project.clientName || 'No Client'}
                        </small>
                      </div>
                      <span className={`badge ${((project.status || project.projectStatus || '').toLowerCase() === 'completed') ? 'bg-success' :
                        ((project.status || project.projectStatus || '').toLowerCase() === 'in progress') ? 'bg-info' :
                          'bg-warning text-dark'
                        }`}>
                        {project.status || project.projectStatus || 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body - Project Details */}
                  <div className="card-body">
                    {/* Project Description */}
                    {project.description && (
                      <p className="text-muted small mb-3" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {project.description}
                      </p>
                    )}

                    {/* Key Metrics Grid */}
                    <div className="row g-2 mb-3">
                      {/* People Working */}
                      <div className="col-6">
                        <div className="p-2 bg-light rounded-3 text-center h-100 d-flex flex-column justify-content-center">
                          <i className="fas fa-users text-primary mb-1"></i>
                          <span className="fw-bold small">{memberCount}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Members</span>
                        </div>
                      </div>

                      {/* Duration/Days */}
                      <div className="col-6">
                        <div className="p-2 bg-light rounded-3 text-center h-100 d-flex flex-column justify-content-center">
                          <i className="far fa-clock text-warning mb-1"></i>
                          <span className="fw-bold small">{durationDays}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Timeline & Status */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Timeline</small>
                        <small className="text-primary fw-bold" style={{ fontSize: '0.75rem' }}>{project.progress || 0}%</small>
                      </div>
                      <div className="progress mb-2" style={{ height: '6px' }}>
                        <div
                          className="progress-bar bg-gradient-primary"
                          style={{ width: `${project.progress || 0}%` }}
                          role="progressbar"
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                          <i className="far fa-calendar-alt me-1"></i>
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Start N/A'}
                        </small>
                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                          <i className="fas fa-flag-checkered me-1"></i>
                          {project.dueDate || project.endDate ? new Date(project.dueDate || project.endDate).toLocaleDateString() : 'Due N/A'}
                        </small>
                      </div>
                    </div>

                    {/* Devices Section (Optional display if needed, but keeping layout compact) */}
                    {deviceCount > 0 && (
                      <div className="mb-3">
                        <small className="text-muted"><i className="fas fa-laptop me-1"></i> {deviceCount} Devices Associated</small>
                      </div>
                    )}
                  </div>

                  {/* Card Footer - Action Buttons */}
                  <div className="card-footer bg-light border-0 py-3">
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary position-relative"
                        onClick={() => {
                          setActiveProjectForRequirement(project);
                          setShowRequirementModal(true);
                          // Mark as seen
                          setLastSeenRequirements(prev => ({
                            ...prev,
                            [pId]: (projectRequirements[pId] || []).length
                          }));
                        }}
                      >
                        <i className="fas fa-clipboard-list me-2"></i>
                        View Requirements
                        {unseenCount > 0 && (!showRequirementModal || (activeProjectForRequirement?.id !== pId && activeProjectForRequirement?._id !== pId)) && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm border border-white">
                            {unseenCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="fas fa-folder-open fa-3x text-muted mb-3 opacity-50"></i>
                <h5 className="text-muted">No Projects Found</h5>
                <p className="text-muted mb-0">No projects are currently assigned to your team.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Requirements Modal - Notes Format */}
      {showRequirementModal && activeProjectForRequirement && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <div className="text-white">
                  <h5 className="modal-title fw-bold mb-1">
                    <i className="fas fa-clipboard-list me-2"></i>
                    Project Requirements
                  </h5>
                  <small className="opacity-75">{activeProjectForRequirement.name}</small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => {
                  setShowRequirementModal(false);
                  setEditingRequirement(null);
                  setRequirementText('');
                }}></button>
              </div>

              <div className="modal-body p-4">
                {/* Add New Requirement Section */}
                <div className="mb-4 p-4 bg-light rounded-3">
                  <label className="form-label fw-bold text-primary mb-3">
                    <i className="fas fa-plus-circle me-2"></i>
                    {editingRequirement ? 'Update Requirement' : 'Add New Requirement'}
                  </label>
                  <textarea
                    className="form-control border-2 shadow-sm mb-3"
                    rows="4"
                    value={requirementText}
                    onChange={(e) => setRequirementText(e.target.value)}
                    placeholder="Enter requirement details, specifications, or changes needed for this project..."
                    style={{ resize: 'none' }}
                  ></textarea>
                  <div className="d-flex gap-2">
                    <button
                      className={`btn ${editingRequirement ? 'btn-success' : 'btn-primary'} flex-grow-1 shadow-sm`}
                      onClick={handleSaveRequirement}
                      disabled={!requirementText.trim()}
                    >
                      <i className={`fas ${editingRequirement ? 'fa-save' : 'fa-plus'} me-2`}></i>
                      {editingRequirement ? 'Update Requirement' : 'Add Requirement'}
                    </button>
                    {editingRequirement && (
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setEditingRequirement(null);
                          setRequirementText('');
                        }}
                      >
                        <i className="fas fa-times me-1"></i>Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Requirements List - Notes Format */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">
                      <i className="fas fa-list-ul me-2 text-primary"></i>
                      All Requirements
                    </h6>
                    <span className="badge bg-primary">{(projectRequirements[activeProjectForRequirement.id || activeProjectForRequirement._id] || []).length} Total</span>
                  </div>

                  <div className="requirements-notes-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {(projectRequirements[activeProjectForRequirement.id || activeProjectForRequirement._id] || []).length > 0 ? (
                      (projectRequirements[activeProjectForRequirement.id || activeProjectForRequirement._id] || [])
                        .slice().reverse()
                        .map((req, index) => (
                          <div
                            key={req.id}
                            className={`card mb-3 border-start border-4 ${editingRequirement?.id === req.id ? 'border-primary shadow' : 'border-secondary'}`}
                            style={{ transition: 'all 0.2s' }}
                          >
                            <div className="card-body p-3">
                              {/* Note Header */}
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="badge bg-secondary">#{(projectRequirements[activeProjectForRequirement.id || activeProjectForRequirement._id] || []).length - index}</span>
                                    <small className="text-muted">
                                      <i className="far fa-calendar-alt me-1"></i>
                                      {new Date(req.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </small>
                                  </div>
                                  {req.updatedAt && (
                                    <small className="text-info d-block">
                                      <i className="fas fa-edit me-1"></i>
                                      Last updated: {new Date(req.updatedAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </small>
                                  )}
                                </div>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditRequirement(req)}
                                    title="Edit Requirement"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <span className="badge bg-warning text-dark align-self-start">Pending</span>
                                </div>
                              </div>

                              {/* Note Content */}
                              <div className="requirement-note-content p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                                {req.text}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-5">
                        <i className="fas fa-clipboard fa-3x text-muted mb-3 opacity-25"></i>
                        <h6 className="text-muted">No Requirements Added Yet</h6>
                        <p className="text-muted small mb-0">Add your first requirement using the form above</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 bg-light">
                <button type="button" className="btn btn-secondary px-4" onClick={() => {
                  setShowRequirementModal(false);
                  setEditingRequirement(null);
                  setRequirementText('');
                }}>
                  <i className="fas fa-times me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Render Tasks View
  const renderTasksView = () => (
    <div className="tasks-view-container p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">
          <i className="fas fa-tasks me-3 text-primary"></i>
          Team Task Management
        </h4>
        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill px-4 py-2"
          onClick={() => {
            setEditingTask(null);
            setShowAddTaskModal(true);
          }}
        >
          <i className="fas fa-plus"></i>
          <span>Assign New Task</span>
        </button>
      </div>

      <div className="row g-4">
        {relatedTasks.length > 0 ? (
          relatedTasks.map(task => {
            const urgencyColor = task.priority === 'High' || task.priority === 'urgent' ? 'danger' :
              task.priority === 'Medium' ? 'warning' : 'info';
            const statusColor = task.status === 'completed' ? 'success' :
              task.status === 'in-progress' ? 'primary' : 'secondary';

            return (
              <div key={task.id || task._id} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100 task-card-design transition-all" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff' }}>
                  {/* Task Header with dynamic color stripe */}
                  <div className={`py-3 px-4 border-start border-4 border-${statusColor}`} style={{ backgroundColor: '#fdfdfd', borderBottom: '1px solid #eee' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="mb-0 fw-bold text-dark text-truncate" title={task.title}>{task.title}</h6>
                          {task.points && (
                            <span className="badge bg-warning text-dark rounded-pill small" style={{ fontSize: '0.6rem' }}>
                              <i className="fas fa-star me-1"></i>{task.points}
                            </span>
                          )}
                        </div>
                        <p className="text-muted smaller mb-0 d-flex align-items-center">
                          <i className="fas fa-layer-group me-1 text-primary"></i>
                          {task.projectName || 'General Tasks'}
                        </p>
                      </div>
                      <div className="ms-2">
                        <button className="btn btn-light btn-sm shadow-sm rounded-circle" onClick={() => {
                          setEditingTask(task);
                          setShowAddTaskModal(true);
                        }}>
                          <i className="fas fa-edit text-primary"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    <p className="task-desc text-muted mb-4 small" style={{ minHeight: '40px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {task.description || 'No description provided.'}
                    </p>

                    {/* Progress Bar with modern styling */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-end mb-2">
                        <span className="text-dark small fw-bold">Progress: {task.progress || 0}%</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '6px', background: '#f1f4f9' }}>
                        <div
                          className={`progress-bar bg-${statusColor} progress-bar-striped progress-bar-animated`}
                          role="progressbar"
                          style={{ width: `${task.progress || 0}%`, borderRadius: '20px' }}
                        ></div>
                      </div>
                    </div>

                    {/* Metadata Items */}
                    <div className="row g-2 mb-3">
                      <div className="col-12">
                        <div className="p-3 border rounded-3 bg-light bg-opacity-50 d-flex align-items-center justify-content-between">
                          <span className="text-muted smaller fw-semibold">Assignee</span>
                          <span className="small text-truncate fw-bold text-dark">
                            {Array.isArray(task.assignedTo) ?
                              task.assignedTo.map(v => (typeof v === 'object' ? (v.name || v.email) : v)).join(', ') :
                              (task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo.name : task.assignedTo) || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className={`badge bg-${urgencyColor} text-white rounded-pill px-3 py-2 shadow-sm`} style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                        <i className="fas fa-bolt me-1"></i> {task.priority || 'Medium'}
                      </span>
                      <span className={`badge bg-${statusColor} text-white rounded-pill px-3 py-2 shadow-sm text-capitalize`} style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                        <i className={`fas ${task.status === 'completed' ? 'fa-check-circle' : 'fa-clock'} me-1`}></i>
                        {task.status || 'Assigned'}
                      </span>
                    </div>

                    {/* Requirement/Update Indicators */}
                    {(task.requirement || task.workingNotes) && (
                      <div className="mt-4 pt-3 border-top d-flex gap-2">
                        {task.requirement && (
                          <div className="badge bg-warning text-dark px-2 py-2 rounded flex-fill shadow-sm" style={{ fontSize: '0.65rem' }}>
                            <i className="fas fa-clipboard-list me-1"></i> REQ UPDATED
                          </div>
                        )}
                        {task.workingNotes && (
                          <div className="badge bg-success text-white px-2 py-2 rounded flex-fill shadow-sm" style={{ fontSize: '0.65rem' }}>
                            <i className="fas fa-stream me-1"></i> NOTES ADDED
                          </div>
                        )}
                      </div>
                    )}
                  </div>


                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
              <i className="fas fa-tasks fa-3x text-muted mb-3 opacity-25"></i>
              <h5 className="text-muted">No Team Tasks Yet</h5>
              <p className="text-muted small mb-0">Start by creating tasks for your team members.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Dashboard content renderer based on view
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboardView();
      case 'my-team':
        return renderMyTeamView();
      case 'tasks':
        return renderTasksView();
      case 'projects':
        return renderProjectsView();
      case 'reports':
        return <TeamLeaderReports stats={stats} projects={managedProjects} tasks={relatedTasks} />;
      case 'profile':
        return <TeamLeaderProfile userData={userData} onUpdateProfile={handleSaveProfile} />;
      case 'help':
        return <TeamLeaderSupport allUsers={allUsers} userData={userData} />;
      case 'notice':
        return <TeamLeaderNotice userData={userData} />;
      default:
        return <div>View not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (updatedData) => {
    try {
      await updateUser(userData.id || userData._id, updatedData);
      alert('Profile updated successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  // Content Wrapper with Header
  const renderDashboardHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 className="fw-bold text-dark mb-0">
          {activeView === 'help' ? 'Support & Help' :
            activeView === 'notice' ? 'Notifications / Notices' :
              `Welcome back, ${userData?.name || 'Team Leader'}`}
        </h2>
      </div>
      <div>
        <span className="text-muted small me-2">Last updated: {lastUpdate.toLocaleTimeString()}</span>
        <button className="btn btn-light btn-sm rounded-circle shadow-sm" onClick={fetchDashboardData} title="Refresh Data">
          <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin text-primary' : 'text-muted'}`}></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="d-flex h-100 bg-light">
      {/* Sidebar Component */}
      <TeamLeaderSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={onLogout}
        userData={userData}
      />

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column" style={{
        marginLeft: window.innerWidth > 768 ? '260px' : '0', // Adjust based on sidebar width
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        {/* Top Navbar for Mobile */}
        <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center d-md-none sticky-top">
          <button className="btn btn-link text-dark p-0" onClick={() => setIsMobileOpen(true)}>
            <i className="fas fa-bars fa-lg"></i>
          </button>
          <span className="fw-bold">Team Leader</span>
          <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            {userData?.name?.charAt(0) || 'T'}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto">
          {renderDashboardHeader()}
          {activeView === 'profile'
            ? <TeamLeaderProfile userData={userData} onUpdateProfile={handleSaveProfile} />
            : renderContent()
          }
        </div>
      </div>

      {/* Member Details Modal */}
      {showMemberDetailsModal && selectedMember && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Team Member Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowMemberDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center mb-4">
                  <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">{selectedMember.name}</h4>
                    <p className="text-muted mb-0">{selectedMember.email}</p>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary mt-1">{selectedMember.role}</span>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <h3 className="fw-bold mb-0 text-primary">
                        {projects.filter(p => p.assignedMembers && p.assignedMembers.some(m => (typeof m === 'object' ? m.name : m) === selectedMember.name)).length}
                      </h3>
                      <small className="text-muted">Projects</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <h3 className="fw-bold mb-0 text-success">
                        {assignedTasks.filter(t => (typeof t.assignedTo === 'object' ? t.assignedTo.name : t.assignedTo) === selectedMember.name && t.status === 'completed').length}
                      </h3>
                      <small className="text-muted">Completed Tasks</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <h3 className="fw-bold mb-0 text-warning">
                        {assignedTasks.filter(t => (typeof t.assignedTo === 'object' ? t.assignedTo.name : t.assignedTo) === selectedMember.name && t.status !== 'completed').length}
                      </h3>
                      <small className="text-muted">Pending Tasks</small>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Assigned Projects</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Status</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.filter(p => p.assignedMembers && p.assignedMembers.some(m => (typeof m === 'object' ? m.name : m) === selectedMember.name)).length > 0 ? (
                        projects
                          .filter(p => p.assignedMembers && p.assignedMembers.some(m => (typeof m === 'object' ? m.name : m) === selectedMember.name))
                          .map(project => (
                            <tr key={project.id || project._id}>
                              <td>{project.name}</td>
                              <td><span className={`badge ${project.status === 'completed' ? 'bg-success' : 'bg-primary'}`}>{project.status}</span></td>
                              <td>{project.progress}%</td>
                            </tr>
                          ))
                      ) : (
                        <tr><td colSpan="3" className="text-center text-muted">No assigned projects</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberDetailsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddTaskModal && (
        <AddTaskModal
          show={showAddTaskModal}
          onHide={() => {
            setShowAddTaskModal(false);
            setEditingTask(null);
          }}
          currentUser={userData}
          editingTask={editingTask}
          allUsers={allUsers}
          projects={projects}
          onSave={handleSaveTask}
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
    </div>
  );
};

export default TeamLeaderDashboard;