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
import {
  subscribeToNotices,
  subscribeToProjects,
  subscribeToTasks,
  subscribeToAllUsers
} from '../firebase/firestoreService';
import { formatDate, formatDateTime } from '../utils/dateUtils';

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
  const [projectFilter, setProjectFilter] = useState('all');

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

    // Set up real-time subscriptions
    const unsubProjects = subscribeToProjects((data) => {
      setProjects(data || []);
      setLastUpdate(new Date());
    });

    const unsubTasks = subscribeToTasks((data) => {
      setAssignedTasks(data || []);
      setLastUpdate(new Date());
    });

    const unsubUsers = subscribeToAllUsers((data) => {
      setAllUsers(data || []);
      setLastUpdate(new Date());
    });

    // Listen for storage events (legacy fallback or cross-component signaling)
    const handleStorageChange = (e) => {
      if (['users', 'projects', 'tasks', 'teamLeaders'].includes(e.key)) {
        fetchDashboardData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (unsubProjects) unsubProjects();
      if (unsubTasks) unsubTasks();
      if (unsubUsers) unsubUsers();
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

      // Broaden to include all roles reporting to this TL, excluding admins
      const matchesTL = (uTLId === meId && uTLId !== '') ||
        uTLName === meName ||
        uTLName === meEmail;

      return uRole !== 'admin' && matchesTL;
    });

    // Special case for Jagdish: Explicitly ensure Manasi Patil and Neha S Patil are tracked
    const isJagdish = meName.includes('jagdish');
    const specificTeammates = isJagdish ? ['manasi patil', 'neha s patil'] : [];

    const teamMemberNames = new Set([
      ...teamMembers.map(m => (m.name || '').toLowerCase().trim()),
      ...specificTeammates
    ]);
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

      const assignedByRaw = task.assignedBy;
      const assignedBy = (typeof assignedByRaw === 'object' ? (assignedByRaw.name || assignedByRaw.email || assignedByRaw.id) : (assignedByRaw || '')).toString().toLowerCase().trim();

      // Check if assigned to ME
      const isToMe = assignedToList.includes(meName) || assignedToList.includes(meEmail) || (meId && assignedToList.includes(meId));
      // Check if assigned BY ME
      const isByMe = assignedBy === meName || assignedBy === meEmail || (meId && assignedBy === meId);
      // Check if assigned to ANY team member (including specific ones for Jagdish)
      const isToTeam = assignedToList.some(to => teamMemberNames.has(to) || teamMemberEmails.has(to));

      return isToMe || isByMe || isToTeam;
    });

    // 3. Identify Projects (where TL or their team is involved)
    let managedProjects = projects.filter(project => {
      if (!project) return false;

      // Check multiple fields for Project Manager / TL
      const pmRaw = project.projectManager || project.pm || '';
      const pm = (typeof pmRaw === 'object' ? (pmRaw.name || pmRaw.email || pmRaw.id || pmRaw._id || '') : (pmRaw || '')).toString().trim().toLowerCase();

      const tlRaw = project.teamLeader || project.teamLeaderName || project.tl || '';
      const tl = (typeof tlRaw === 'object' ? (tlRaw.name || tlRaw.email || tlRaw.id || tlRaw._id || '') : (tlRaw || '')).toString().trim().toLowerCase();

      const isManagedByMe = pm === meName || pm === meEmail || (meId && pm === meId) ||
        tl === meName || tl === meEmail || (meId && tl === meId);

      // Get exhaustive list of members
      const membersList = [
        ...(Array.isArray(project.assignedMembers) ? project.assignedMembers : []),
        ...(Array.isArray(project.assigned) ? project.assigned : []),
        ...(typeof project.assignedTo === 'string' ? [project.assignedTo] : [])
      ];

      // Check if I am explicitly assigned as a member
      const isAssignedToMe = membersList.some(member => {
        const mText = (typeof member === 'object' ? (member.name || member.email) : member)?.toString().toLowerCase().trim();
        const mId = (typeof member === 'object' ? (member.id || member._id) : '')?.toString().toLowerCase().trim();
        return mText === meName || mText === meEmail || (meId && mId === meId);
      });

      // Check if any of my team members (regular or specific) are assigned
      const hasTeamInvolved = membersList.some(member => {
        const mText = (typeof member === 'object' ? (member.name || member.email) : member)?.toString().toLowerCase().trim();
        const mId = (typeof member === 'object' ? (member.id || member._id) : '')?.toString().toLowerCase().trim();

        // Match by Name/Email
        if (teamMemberNames.has(mText) || teamMemberEmails.has(mText)) return true;

        // Match by ID
        if (mId && teamMembers.some(tm => (tm.id === mId || tm._id === mId))) return true;

        // Soft match for names (e.g. "Manasi Patil" matches "Manasi Patil (Dev)")
        return Array.from(teamMemberNames).some(name => mText && mText.includes(name));
      });

      const matched = isManagedByMe || isAssignedToMe || hasTeamInvolved;
      return matched;
    });

    console.log('📊 TL Dashboard Debug Summary:', {
      me: { name: meName, email: meEmail, id: meId },
      teamSize: teamMembers.length,
      totalProjectsLoaded: projects.length,
      managedProjectsFound: managedProjects.length
    });

    // Fallback: If still no projects, attempt a slightly broader fuzzy match for names
    if (managedProjects.length === 0 && projects.length > 0) {
      console.log('🕵️ No strict matches. Checking fuzzy name/email overlaps...');
      managedProjects = projects.filter(project => {
        const pmRaw = (project.projectManager || '').toString().toLowerCase();
        const tlRaw = (project.teamLeader || project.teamLeaderName || '').toString().toLowerCase();

        const isFuzzyPM = pmRaw.includes(meName) || pmRaw.includes(meEmail) || (meName && meName.includes(pmRaw)) ||
          tlRaw.includes(meName) || tlRaw.includes(meEmail) || (meName && meName.includes(tlRaw));

        const membersList = Array.isArray(project.assignedMembers) ? project.assignedMembers :
          (Array.isArray(project.assigned) ? project.assigned : []);

        const isFuzzyMember = membersList.some(member => {
          const mText = (typeof member === 'object' ? (member.name || member.email) : member)?.toString().toLowerCase().trim();
          // Match if it includes TL's name/email OR any team member's name
          return (meName && mText.includes(meName)) ||
            (meEmail && mText.includes(meEmail)) ||
            Array.from(teamMemberNames).some(name => name.length > 2 && mText && mText.includes(name));
        });
        return isFuzzyPM || isFuzzyMember;
      });
      if (managedProjects.length > 0) {
        console.log(`🔍 Found ${managedProjects.length} projects via fuzzy search.`);
      }
    }

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
        // Ensure project manager is set - default to current TL if not selected
        const projectWithPM = {
          ...projectData,
          projectManager: projectData.projectManager || userData?.name || localStorage.getItem('userName') || ''
        };
        await createProject(projectWithPM);
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
    // Calculate Status Counts
    const counts = {
      all: teamMembers.length,
      available: 0,
      busy: 0,
      'on-leave': 0
    };

    teamMembers.forEach(member => {
      const memberTasks = assignedTasks.filter(t =>
        (Array.isArray(t.assignedTo) ? t.assignedTo.includes(member.name) : t.assignedTo === member.name) &&
        (t.status || '').toLowerCase() !== 'completed'
      );
      const isBusy = memberTasks.length >= 3;
      const onLeave = (member.status || '').toLowerCase() === 'on leave';

      if (onLeave) counts['on-leave']++;
      else if (isBusy) counts.busy++;
      else counts.available++;
    });

    // Filter logic
    const filteredMembers = teamMembers.filter(member => {
      if (teamFilter === 'all') return true;

      const memberTasks = assignedTasks.filter(t =>
        (Array.isArray(t.assignedTo) ? t.assignedTo.includes(member.name) : t.assignedTo === member.name) &&
        (t.status || '').toLowerCase() !== 'completed'
      );
      const isBusy = memberTasks.length >= 3;
      const onLeave = (member.status || '').toLowerCase() === 'on leave';

      if (teamFilter === 'on-leave') return onLeave;
      if (onLeave) return false; // Don't show in available/busy if on leave

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
                <span className={`ms-2 badge rounded-pill ${teamFilter === f ? 'bg-white text-primary' : 'bg-primary text-white'}`} style={{ fontSize: '0.75rem' }}>
                  {counts[f]}
                </span>
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
                const pendingCount = memberTasks.filter(t => (t.status || '').toLowerCase() !== 'completed').length;
                const onLeave = (member.status || '').toLowerCase() === 'on leave';

                let status = pendingCount >= 3 ? 'BUSY' : 'AVAILABLE';
                if (onLeave) status = 'ON LEAVE';

                const statusColor = status === 'BUSY' ? 'warning' : status === 'ON LEAVE' ? 'danger' : 'success';

                return (
                  <div key={member.id || member._id} className={teamViewMode === 'card' ? "col-md-6 col-lg-4" : "col-12"}>
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                      <div className="card-body p-4">
                        {/* Header: Name & Badges */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="fw-bold text-dark mb-1">{member.name}</h5>
                            <div className="d-flex gap-2 mb-2">
                              <span className={`badge rounded-pill bg-${statusColor} ${statusColor === 'warning' ? 'text-dark' : 'text-white'} px-3 py-1`} style={{ fontSize: '0.7rem' }}>
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
                            <span>Joined: {formatDate(member.createdAt)}</span>
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
                      <td>{formatDate(req.date)}</td>
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
        const isNew = task.status === 'assigned' || task.status === 'pending' || task.status === 'Assigned' ||
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
  const renderProjectsView = () => {
    // Calculate counts for filters
    const projectCounts = {
      all: managedProjects.length,
      'in-progress': managedProjects.filter(p => (p.status || p.projectStatus || '').toLowerCase() === 'in progress').length,
      'delayed': managedProjects.filter(p => (p.status || p.projectStatus || '').toLowerCase() === 'delayed' || (p.status || p.projectStatus || '').toLowerCase() === 'at-risk').length,
      'completed': managedProjects.filter(p => (p.status || p.projectStatus || '').toLowerCase() === 'completed').length
    };

    // Filter projects based on selection
    const filteredProjects = managedProjects.filter(project => {
      const status = (project.status || project.projectStatus || '').toLowerCase();
      if (projectFilter === 'all') return true;
      if (projectFilter === 'in-progress') return status === 'in progress';
      if (projectFilter === 'delayed') return status === 'delayed' || status === 'at-risk';
      if (projectFilter === 'completed') return status === 'completed';
      return true;
    });

    return (
      <>
        {/* Project Filters - Matching My Team Style */}
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4 mt-2">
          {[
            { id: 'all', label: 'All', color: '#007bff' },
            { id: 'in-progress', label: 'In Progress', color: '#6f42c1' },
            { id: 'delayed', label: 'Delayed', color: '#dc3545' },
            { id: 'completed', label: 'Completed', color: '#10b981' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setProjectFilter(f.id)}
              className="btn d-flex align-items-center shadow-sm"
              style={{
                borderRadius: '50px',
                padding: '8px 24px',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                backgroundColor: projectFilter === f.id ? f.color : '#ffffff',
                color: projectFilter === f.id ? '#ffffff' : '#444444',
                border: projectFilter === f.id ? `1px solid ${f.color}` : '1px solid #e0e0e0',
                boxShadow: projectFilter === f.id ? `0 4px 12px ${f.color}44` : '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              {f.label}
              <span className="ms-2 badge rounded-pill"
                style={{
                  fontSize: '0.75rem',
                  minWidth: '22px',
                  backgroundColor: projectFilter === f.id ? '#ffffff' : '#f3f4f6',
                  color: projectFilter === f.id ? f.color : '#6b7280'
                }}>
                {projectCounts[f.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Projects Grid - Card View */}
        <div className="row g-4 mb-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => {
              // Calculate Duration
              const startDate = project.startDate ? new Date(project.startDate) : new Date();
              const dueDate = project.dueDate ? new Date(project.dueDate) : new Date();
              const diffTime = Math.abs(dueDate - startDate);
              const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              // Count Members (People working on project)
              const membersList = [
                ...(Array.isArray(project.assignedMembers) ? project.assignedMembers : []),
                ...(Array.isArray(project.assigned) ? project.assigned : []),
                ...(typeof project.assignedTo === 'string' ? [project.assignedTo] : [])
              ];
              const memberCount = membersList.length;

              // Count Devices (if available in project data)
              const deviceCount = project.devices ? project.devices.length : (project.deviceCount || 0);

              // Project ID
              const pId = project.id || project._id;

              return (
                <div key={pId} className="col-12 col-lg-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'transform 0.2s', borderRadius: '15px', overflow: 'hidden' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                    {/* Card Header */}
                    <div className="card-header bg-gradient-primary text-white py-3" style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
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

                    {/* Top Progress Bar */}
                    <div className="progress rounded-0" style={{ height: '5px', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${project.progress || 0}%`, transition: 'width 0.6s ease' }}
                        role="progressbar"
                      ></div>
                    </div>

                    {/* Card Body - Project Details */}
                    <div className="card-body">
                      {/* Project Timeline & Status */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Current Progress</small>
                          <small className="text-primary fw-bold" style={{ fontSize: '0.75rem' }}>{project.progress || 0}%</small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                            <i className="far fa-calendar-alt me-1 text-primary"></i>
                            Starts: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                          </small>
                          <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                            <i className="fas fa-flag-checkered me-1 text-danger"></i>
                            Due: {project.dueDate || project.endDate ? new Date(project.dueDate || project.endDate).toLocaleDateString() : 'N/A'}
                          </small>
                        </div>
                      </div>

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
                      <div className="row g-2">
                        {/* People Working */}
                        <div className="col-6">
                          <div className="p-2 border border-light rounded-3 text-center h-100 d-flex flex-column justify-content-center bg-light bg-opacity-50">
                            <i className="fas fa-users text-primary mb-1"></i>
                            <span className="fw-bold small">{memberCount}</span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Members</span>
                          </div>
                        </div>

                        {/* Duration/Days */}
                        <div className="col-6">
                          <div className="p-2 border border-light rounded-3 text-center h-100 d-flex flex-column justify-content-center bg-light bg-opacity-50">
                            <i className="far fa-clock text-warning mb-1"></i>
                            <span className="fw-bold small">{durationDays}</span>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Days</span>
                          </div>
                        </div>
                      </div>

                      {/* Devices Section */}
                      {deviceCount > 0 && (
                        <div className="mt-3">
                          <small className="text-muted"><i className="fas fa-laptop me-1"></i> {deviceCount} Devices Associated</small>
                        </div>
                      )}
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
                  <p className="text-muted mb-0">No projects currently match this status filter.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

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
                        <div className="p-2 border rounded-3 bg-light bg-opacity-50 d-flex align-items-center justify-content-between">
                          <span className="text-muted smaller fw-semibold"><i className="fas fa-user-circle me-1 text-primary"></i> Assignee</span>
                          <span className="small text-truncate fw-bold text-dark">
                            {Array.isArray(task.assignedTo) ?
                              task.assignedTo.map(v => (typeof v === 'object' ? (v.name || v.email) : v)).join(', ') :
                              (task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo.name : task.assignedTo) || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-2 border rounded-3 bg-light bg-opacity-50 d-flex align-items-center justify-content-between">
                          <span className="text-muted smaller fw-semibold"><i className="fas fa-calendar-alt me-1 text-success"></i> Started At</span>
                          <span className="small fw-bold text-dark">
                            {formatDateTime(task.startDate || task.date || task.createdAt)}
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
          assignedTasks={assignedTasks}
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