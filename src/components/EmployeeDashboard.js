import React, { useState, useEffect } from 'react';
import ManagerNotesSection from './ManagerNotesSection';
import './ProjectManagerDashboard.css'; // Reuse PM dashboard styles

const EmployeeDashboard = ({
    userData,
    assignedTasks,
    projects,
    onLogout,
    isRefreshing,
    manualRefreshTasks,
    openTaskNotesModal,
    getTaskNoteCount
}) => {
    const [selectedTaskFilter, setSelectedTaskFilter] = useState('all');
    const [activeView, setActiveView] = useState('dashboard');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const userEmail = userData?.email || localStorage.getItem('userEmail');
    const userName = userData?.name || localStorage.getItem('userName');

    const isUserAssignedToTask = (task, email) => {
        if (!task || !email) return false;
        const assignedTo = task.assignedTo;
        if (Array.isArray(assignedTo)) {
            return assignedTo.some(e =>
                (typeof e === 'object' ? (e.email || e.name || '') : e).toString().toLowerCase() === email.toLowerCase()
            );
        }
        const to = (typeof assignedTo === 'object' ? (assignedTo.email || assignedTo.name || '') : (assignedTo || '')).toString().toLowerCase();
        return to === email.toLowerCase();
    };

    const myTasks = assignedTasks.filter(task => isUserAssignedToTask(task, userEmail));

    const taskStats = {
        all: myTasks.length,
        completed: myTasks.filter(t => t.status === 'completed').length,
        inProgress: myTasks.filter(t => t.status === 'in-progress').length,
        pending: myTasks.filter(t => t.status === 'pending' || t.status === 'assigned' || !t.status).length
    };

    const getFilteredTasks = () => {
        switch (selectedTaskFilter) {
            case 'completed': return myTasks.filter(t => t.status === 'completed');
            case 'in-progress': return myTasks.filter(t => t.status === 'in-progress');
            case 'pending': return myTasks.filter(t => t.status === 'pending' || t.status === 'assigned' || !t.status);
            default: return myTasks;
        }
    };

    const handleMenuClick = (menuItem) => {
        if (menuItem === 'Dashboard') {
            setActiveView('dashboard');
        } else if (menuItem === 'My Tasks') {
            setActiveView('tasks');
        } else if (menuItem === 'My Projects') {
            setActiveView('projects');
        } else if (menuItem === 'Profile') {
            setActiveView('profile');
        }
        setIsMobileSidebarOpen(false);
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
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
                    <h2>Employee Dashboard</h2>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role badge bg-success">Employee</span>
                    </div>
                    <button className="btn btn-outline-primary me-2" onClick={manualRefreshTasks} disabled={isRefreshing}>
                        <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}></i>
                    </button>
                    <button className="btn btn-outline-danger" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`dashboard-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Employee Panel</h3>
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
                        <li className={activeView === 'tasks' ? 'active' : ''}>
                            <a onClick={() => handleMenuClick('My Tasks')}>
                                <i className="fas fa-tasks"></i>
                                <span>My Tasks</span>
                            </a>
                        </li>
                        <li className={activeView === 'projects' ? 'active' : ''}>
                            <a onClick={() => handleMenuClick('My Projects')}>
                                <i className="fas fa-project-diagram"></i>
                                <span>My Projects</span>
                            </a>
                        </li>
                        <li className={activeView === 'profile' ? 'active' : ''}>
                            <a onClick={() => handleMenuClick('Profile')}>
                                <i className="fas fa-user"></i>
                                <span>Profile</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {activeView === 'dashboard' && (
                    <div className="dashboard-view">
                        <h3 className="mb-4">Dashboard Overview</h3>

                        <div className="row g-4 mb-4">
                            {/* Stats Cards */}
                            {[
                                { title: 'Total Tasks', value: taskStats.all, color: 'primary', icon: 'fa-list-ul' },
                                { title: 'In Progress', value: taskStats.inProgress, color: 'warning', icon: 'fa-spinner' },
                                { title: 'Completed', value: taskStats.completed, color: 'success', icon: 'fa-check' },
                                { title: 'Pending', value: taskStats.pending, color: 'danger', icon: 'fa-clock' }
                            ].map((stat, i) => (
                                <div key={i} className="col-md-6 col-lg-3">
                                    <div className={`dashboard-card bg-${stat.color} text-white`}>
                                        <div className="card-icon">
                                            <i className={`fas ${stat.icon}`}></i>
                                        </div>
                                        <div className="card-content">
                                            <h4>{stat.value}</h4>
                                            <p>{stat.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="row g-4">
                            <div className="col-lg-8">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                    <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0">My Daily Tasks</h5>
                                        <div className="btn-group shadow-sm">
                                            {['all', 'pending', 'in-progress', 'completed'].map(f => (
                                                <button
                                                    key={f}
                                                    className={`btn btn-sm ${selectedTaskFilter === f ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setSelectedTaskFilter(f)}
                                                >
                                                    {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {getFilteredTasks().length > 0 ? (
                                            <div className="d-flex flex-column gap-3">
                                                {getFilteredTasks().map((task, i) => (
                                                    <div key={i} className="card border-0 shadow-sm hover-translate" style={{ borderRadius: '12px', borderLeft: `5px solid ${task.status === 'completed' ? '#10b981' : task.status === 'in-progress' ? '#f59e0b' : '#3b82f6'}` }}>
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <div>
                                                                    <h6 className="fw-bold mb-1">{task.title}</h6>
                                                                    <p className="text-muted small mb-0">Project: {task.project || 'General'}</p>
                                                                </div>
                                                                <span className={`badge rounded-pill bg-${task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'primary'} bg-opacity-10 text-${task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'primary'}`}>
                                                                    {task.status || 'Assigned'}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex gap-3 text-muted small">
                                                                    <span><i className="far fa-calendar me-1"></i> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                                                                    <span onClick={() => openTaskNotesModal(task)} className="clickable text-primary">
                                                                        <i className="far fa-comments me-1"></i> {getTaskNoteCount(task.id || task._id)} Comments
                                                                    </span>
                                                                </div>
                                                                <button className="btn btn-sm btn-light">Details</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <i className="fas fa-tasks fa-3x text-muted mb-3 opacity-25"></i>
                                                <p className="text-muted">No tasks found for this filter.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4">
                                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                                    <div className="card-header bg-white border-0 py-3">
                                        <h5 className="fw-bold mb-0">My Projects</h5>
                                    </div>
                                    <div className="card-body">
                                        {projects.length > 0 ? projects.slice(0, 3).map((p, i) => (
                                            <div key={i} className="mb-4">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="fw-semibold small">{p.name}</span>
                                                    <span className="text-muted small">{p.progress}%</span>
                                                </div>
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div className="progress-bar bg-primary" style={{ width: `${p.progress}%` }}></div>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-muted text-center py-3">No active projects.</p>
                                        )}
                                    </div>
                                </div>

                                <ManagerNotesSection
                                    employeeId={userData?.id || userData?._id}
                                    employeeName={userData?.name}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'tasks' && (
                    <div className="tasks-view">
                        <h3 className="mb-4">My Tasks</h3>
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0">All Tasks</h5>
                                <div className="btn-group shadow-sm">
                                    {['all', 'pending', 'in-progress', 'completed'].map(f => (
                                        <button
                                            key={f}
                                            className={`btn btn-sm ${selectedTaskFilter === f ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setSelectedTaskFilter(f)}
                                        >
                                            {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="card-body">
                                {getFilteredTasks().length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {getFilteredTasks().map((task, i) => (
                                            <div key={i} className="card border-0 shadow-sm" style={{ borderLeft: `5px solid ${task.status === 'completed' ? '#10b981' : task.status === 'in-progress' ? '#f59e0b' : '#3b82f6'}` }}>
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <h6 className="fw-bold mb-1">{task.title}</h6>
                                                            <p className="text-muted small mb-0">Project: {task.project || 'General'}</p>
                                                        </div>
                                                        <span className={`badge bg-${task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'primary'}`}>
                                                            {task.status || 'Assigned'}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted small mb-2">{task.description || 'No description'}</p>
                                                    <div className="d-flex gap-3 text-muted small">
                                                        <span><i className="far fa-calendar me-1"></i> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                                                        <span><i className="fas fa-flag me-1"></i> {task.priority || 'Medium'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="fas fa-tasks fa-3x text-muted mb-3 opacity-25"></i>
                                        <p className="text-muted">No tasks found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'projects' && (
                    <div className="projects-view">
                        <h3 className="mb-4">My Projects</h3>
                        <div className="row g-4">
                            {projects.length > 0 ? projects.map((project, i) => (
                                <div key={i} className="col-md-6 col-lg-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body">
                                            <h5 className="fw-bold mb-3">{project.name}</h5>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="text-muted small">Progress</span>
                                                    <span className="fw-bold small">{project.progress}%</span>
                                                </div>
                                                <div className="progress" style={{ height: '8px' }}>
                                                    <div className="progress-bar bg-primary" style={{ width: `${project.progress}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className={`badge bg-${project.status === 'Completed' ? 'success' : project.status === 'Delayed' ? 'danger' : 'primary'}`}>
                                                    {project.status || 'Active'}
                                                </span>
                                                <small className="text-muted">{project.date || 'N/A'}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12">
                                    <div className="text-center py-5">
                                        <i className="fas fa-project-diagram fa-3x text-muted mb-3 opacity-25"></i>
                                        <p className="text-muted">No projects assigned.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'profile' && (
                    <div className="profile-view">
                        <h3 className="mb-4">My Profile</h3>
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                        {userName?.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 className="fw-bold">{userName}</h4>
                                    <p className="text-muted">{userEmail}</p>
                                </div>
                                <hr />
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="text-muted small">Name</label>
                                        <p className="fw-semibold">{userName}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="text-muted small">Email</label>
                                        <p className="fw-semibold">{userEmail}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="text-muted small">Role</label>
                                        <p className="fw-semibold">Employee</p>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="text-muted small">Department</label>
                                        <p className="fw-semibold">{userData?.department || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
