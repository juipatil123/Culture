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

  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

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
      const taskProject = (task.project && typeof task.project === 'object' ? task.project.name : (task.project || task.projectName || '')).toString().toLowerCase().trim();

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
      const pName = (project.name || '').toLowerCase().trim();

      const isManagedByMe = pManager === meName || pManager === meEmail;

      const hasTeamInvolved = project.assignedMembers && project.assignedMembers.some(member => {
        const mName = (typeof member === 'object' ? member.name : member)?.toString().toLowerCase().trim();
        return teamMemberNames.has(mName) || teamMemberEmails.has(mName);
      });

      return isManagedByMe || hasTeamInvolved;
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
            <small className="text-success">
              <i className="fas fa-arrow-up me-1"></i>0%
            </small>
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
            <small className="text-primary">
              <i className="fas fa-plus me-1"></i>New today
            </small>
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
            <small className={stats.performance >= 80 ? 'text-success' : 'text-warning'}>
              {stats.performance >= 80 ? 'Excellent' : 'Needs Focus'}
            </small>
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
            <small className="text-info">In progress</small>
            <div className="mt-2 small text-muted">Involving team</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Dashboard View (Activity & Performance)
  const renderDashboardView = () => {
    // Recent Activity Logic
    const recentActivity = relatedTasks
      .slice(0, 5)
      .map(task => ({
        type: 'task',
        title: task.title,
        message: `${task.assignedTo} - ${task.status}`,
        time: task.updatedAt || new Date(),
        icon: task.status === 'completed' ? 'fa-check-circle' : 'fa-clock',
        color: task.status === 'completed' ? 'text-success' : 'text-primary'
      }));

    return (
      <>
        {renderStatsCards()}
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
                      <div key={idx} className="list-group-item px-0 border-0 d-flex align-items-start mb-3">
                        <div className="me-3 mt-1">
                          <i className={`fas ${activity.icon} ${activity.color} fa-lg`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">{activity.title}</h6>
                          <p className="mb-0 text-muted small">{activity.message}</p>
                          <small className="text-muted">{new Date(activity.time).toLocaleString()}</small>
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
              <div className="card-header bg-white border-bottom-0 py-3">
                <h5 className="mb-0 fw-bold">Team Overview</h5>
              </div>
              <div className="card-body">
                {/* Simple radial chart visualization manual fallback */}
                <div className="text-center py-4">
                  <div className="position-relative d-inline-block">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e9ecef" strokeWidth="12" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#4361ee" strokeWidth="12"
                        strokeDasharray={`${(stats.performance * 3.39)}, 339.29`}
                        transform="rotate(-90 60 60)" />
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <span className="h4 fw-bold">{stats.performance}%</span>
                      <div className="small text-muted">Efficiency</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Active Members</span>
                    <span className="fw-bold">{activeUsers.length}/{stats.teamSize}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const activeUsers = teamMembers.filter(u => getUserWorkStatus && getUserWorkStatus(u).status === 'Active');

  // Render My Team View
  const renderMyTeamView = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold"><i className="fas fa-users me-2 text-primary"></i>My Team</h5>
        <button
          className="btn btn-primary btn-sm rounded-pill px-3"
          onClick={() => setShowAddUserModal(true)}
        >
          <i className="fas fa-plus me-1"></i> Add Member
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Active Task</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length > 0 ? (
                teamMembers.map(member => {
                  const workStatus = getUserWorkStatus ? getUserWorkStatus(member) : { status: 'Offline', task: null };
                  return (
                    <tr key={member.id || member._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h6 className="mb-0 fw-semibold">{member.name}</h6>
                            <small className="text-muted">{member.email}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge bg-secondary bg-opacity-10 text-secondary">{member.role}</span></td>
                      <td>
                        <span className={`badge ${workStatus.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                          {workStatus.status}
                        </span>
                      </td>
                      <td>
                        {workStatus.status === 'Active' && workStatus.task ? (
                          <small className="text-dark fw-medium">
                            <i className="fas fa-play-circle text-success me-1"></i>
                            {workStatus.task.title.substring(0, 20)}...
                          </small>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" title="View Details">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info"
                          title="Assign Task"
                          onClick={() => {
                            setEditingTask({ assignedTo: member.name });
                            setShowAddTaskModal(true);
                          }}
                        >
                          <i className="fas fa-tasks"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No team members found. Click 'Add Member' to build your team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );


  // Debug logging for troubleshooting data issues
  useEffect(() => {
    if (loading) return;
    console.log('--- Team Leader Dashboard Debug ---');
    console.log('Current User:', userData);
    console.log('All Users:', allUsers.length);
    console.log('Filtered Team Members:', dashboardStats.teamMembers.length);
    console.log('Managed Projects:', dashboardStats.managedProjects.length);
    console.log('Related Tasks:', dashboardStats.relatedTasks.length);
  }, [loading, userData, allUsers, dashboardStats]);

  // Render Projects View
  const renderProjectsView = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold"><i className="fas fa-project-diagram me-2 text-primary"></i>Projects</h5>
        <button
          className="btn btn-primary btn-sm rounded-pill px-3"
          onClick={() => setShowAddProjectModal(true)}
        >
          <i className="fas fa-plus me-1"></i> New Project
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {managedProjects.length > 0 ? (
                managedProjects.map(project => (
                  <tr key={project.id || project._id}>
                    <td className="ps-4 fw-semibold">{project.name || 'Unnamed Project'}</td>
                    <td>{project.client || project.clientName || 'No Client'}</td>
                    <td>
                      <span className={`badge ${((project.status || project.projectStatus || '').toLowerCase() === 'completed') ? 'bg-success' :
                        ((project.status || project.projectStatus || '').toLowerCase() === 'in progress' || (project.status || project.projectStatus || '').toLowerCase() === 'on-track') ? 'bg-primary' :
                          ((project.status || project.projectStatus || '').toLowerCase() === 'delayed' || (project.status || project.projectStatus || '').toLowerCase() === 'at-risk') ? 'bg-danger' : 'bg-secondary'
                        }`}>
                        {project.status || project.projectStatus || 'Active'}
                      </span>
                    </td>
                    <td style={{ width: '150px' }}>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${project.progress || 0}%` }}
                            aria-valuenow={project.progress || 0}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="ms-2 small text-muted">{project.progress || 0}%</span>
                      </div>
                    </td>
                    <td>
                      {project.dueDate ? (() => {
                        try {
                          const d = new Date(project.dueDate);
                          return isNaN(d.getTime()) ? 'No Date' : d.toLocaleDateString();
                        } catch (e) {
                          return 'No Date';
                        }
                      })() : 'No Date'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No projects found for this team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Tasks View
  const renderTasksView = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold"><i className="fas fa-tasks me-2 text-primary"></i>Team Tasks</h5>
        <button
          className="btn btn-primary btn-sm rounded-pill px-3"
          onClick={() => {
            setEditingTask(null);
            setShowAddTaskModal(true);
          }}
        >
          <i className="fas fa-plus me-1"></i> New Task
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Title</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {relatedTasks.length > 0 ? (
                relatedTasks.map(task => (
                  <tr key={task.id || task._id}>
                    <td className="ps-4">
                      <div className="fw-semibold">{task.title}</div>
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }}>{task.description}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                          {(() => {
                            const val = task.assignedTo;
                            const name = (val && typeof val === 'object' ? (val.name || val.email) : val) || '?';
                            return name.charAt(0);
                          })()}
                        </div>
                        <span>
                          {(() => {
                            const val = task.assignedTo;
                            return (val && typeof val === 'object' ? (val.name || val.email) : val) || 'Unassigned';
                          })()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${task.priority === 'High' ? 'bg-danger' :
                        task.priority === 'Medium' ? 'bg-warning' : 'bg-info'
                        }`}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${task.status === 'completed' ? 'bg-success' :
                        task.status === 'in-progress' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => {
                        setEditingTask(task);
                        setShowAddTaskModal(true);
                      }}>
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No tasks found for you or your team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
        return <TeamLeaderProfile userData={userData} />;
      default:
        return (
          <div className="alert alert-info">
            View <strong>{activeView}</strong> is under construction.
          </div>
        );
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

  return (
    <div className="d-flex h-100 bg-light">
      {/* Sidebar Component */}
      <TeamLeaderSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={onLogout}
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
          {renderContent()}
        </div>
      </div>

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