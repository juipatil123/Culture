import React, { useState, useEffect } from 'react';
import TeamLeaderNotice from './TeamLeaderNotice';
import TeamLeaderSupport from './TeamLeaderSupport';
import { subscribeToNotices } from '../firebase/firestoreService';
import './ProjectManagerDashboard.css'; // Reuse PM dashboard styles


import { updateTask, addNoteToTask } from '../services/api';

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
    const [projectViewMode, setProjectViewMode] = useState('card');
    const [taskViewMode, setTaskViewMode] = useState('card');
    const [activeView, setActiveView] = useState('dashboard');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [noteModalTask, setNoteModalTask] = useState(null);
    const [noteContent, setNoteContent] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (!userData?.id && !userData?._id) return;
        let isFirstLoad = true;
        const unsubscribe = subscribeToNotices(userData.id || userData._id, userData.role, (notices) => {
            const count = notices.filter(n => !n.read).length;

            if (!isFirstLoad && count > unreadCount) {
                const newest = notices[0];
                setNotification(`New Message from ${newest.senderName}: ${newest.subject}`);
                setTimeout(() => setNotification(null), 5000);
            }
            setUnreadCount(count);
            isFirstLoad = false;
        });
        return () => unsubscribe();
    }, [userData, unreadCount]);

    const userEmail = userData?.email || localStorage.getItem('userEmail');
    const userName = userData?.name || localStorage.getItem('userName');

    const handleStartTask = async (taskId) => {
        try {
            await updateTask(taskId, { status: 'in-progress' });
        } catch (error) {
            console.error("Error starting task:", error);
        }
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) {
            alert("Please enter a note.");
            return;
        }
        try {
            await addNoteToTask(noteModalTask.id, {
                text: noteContent,
                author: userName,
                authorId: userData?.id || userData?._id
            });
            setNoteModalTask(null);
            setNoteContent('');
            alert("Note added successfully!");
        } catch (error) {
            console.error("Error adding note:", error);
            alert("Failed to add note.");
        }
    };

    const handleCompleteTask = async (task) => {
        if (!task.notes || task.notes.length === 0) {
            alert("Please add a note before completing the task.");
            setNoteModalTask(task);
            return;
        }
        try {
            await updateTask(task.id, { status: 'completed' });
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };

    const isUserAssignedToTask = (task, email, name) => {
        if (!task) return false;

        const checkMatch = (val) => {
            if (!val) return false;
            const strVal = (typeof val === 'object' ? (val.email || val.name || '') : val).toString().toLowerCase();
            return (email && strVal === email.toLowerCase()) || (name && strVal === name.toLowerCase());
        };

        const assignedTo = task.assignedTo;
        if (Array.isArray(assignedTo)) {
            return assignedTo.some(e => checkMatch(e));
        }
        return checkMatch(assignedTo);
    };

    const myTasks = assignedTasks.filter(task => isUserAssignedToTask(task, userEmail, userName));

    const taskStats = {
        all: myTasks.length,
        completed: myTasks.filter(t => t.status === 'completed').length,
        inProgress: myTasks.filter(t => t.status === 'in-progress').length,
        pending: myTasks.filter(t => t.status === 'pending' || t.status === 'assigned' || !t.status).length
    };

    const getFilteredTasks = () => {
        switch (selectedTaskFilter) {
            case 'completed': return myTasks.filter(t => (t.status || '').toLowerCase() === 'completed');
            case 'in-progress': return myTasks.filter(t => (t.status || '').toLowerCase() === 'in-progress');
            case 'pending': return myTasks.filter(t => (t.status || '').toLowerCase() === 'pending' || (t.status || '').toLowerCase() === 'assigned');
            case 'new': return myTasks.filter(t => (t.status || '').toLowerCase() === 'new' || !t.status); // specific for 'new'
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
        } else if (menuItem === 'Notice') {
            setActiveView('notice');
        } else if (menuItem === 'Support & Help') {
            setActiveView('support-help');
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
                    {/* Logo */}
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.2rem'
                            }}
                        >
                            C
                        </div>
                        <span className="fw-bold" style={{ fontSize: '1.1rem', color: '#2c3e50' }}>Culture</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role badge bg-success">EMPLOYEE</span>
                    </div>
                </div>
            </div>

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
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>New Message</strong>
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

                    {/* Logout Button at Bottom */}
                    <div className="sidebar-footer" style={{
                        marginTop: 'auto',
                        padding: '20px 15px',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <button
                            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={handleLogout}
                            style={{
                                padding: '12px',
                                borderRadius: '10px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {activeView === 'dashboard' && (
                    <div className="dashboard-view">
                        {/* Page Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold mb-1">Dashboard Overview</h3>
                                <p className="text-muted mb-0">Welcome back, {userName}! Here's your summary.</p>
                            </div>
                            <button
                                className="btn btn-primary rounded-pill px-4"
                                onClick={manualRefreshTasks}
                                disabled={isRefreshing}
                            >
                                <i className={`fas fa-sync-alt me-2 ${isRefreshing ? 'fa-spin' : ''}`}></i>
                                Refresh
                            </button>
                        </div>

                        {/* Stats Cards Row */}
                        <div className="row g-4 mb-4">
                            {[
                                {
                                    title: 'Total Tasks',
                                    value: taskStats.all,
                                    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    icon: 'fa-list-ul',
                                    iconBg: 'rgba(255, 255, 255, 0.2)'
                                },
                                {
                                    title: 'In Progress',
                                    value: taskStats.inProgress,
                                    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    icon: 'fa-spinner',
                                    iconBg: 'rgba(255, 255, 255, 0.2)'
                                },
                                {
                                    title: 'Completed',
                                    value: taskStats.completed,
                                    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    icon: 'fa-check-circle',
                                    iconBg: 'rgba(255, 255, 255, 0.2)'
                                },
                                {
                                    title: 'Pending',
                                    value: taskStats.pending,
                                    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                    icon: 'fa-clock',
                                    iconBg: 'rgba(255, 255, 255, 0.2)'
                                }
                            ].map((stat, i) => (
                                <div key={i} className="col-md-6 col-xl-3">
                                    <div
                                        className="card border-0 shadow-sm h-100 text-white position-relative overflow-hidden"
                                        style={{
                                            background: stat.gradient,
                                            borderRadius: '16px',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                        }}
                                    >
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <p className="mb-2 opacity-75" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                                                        {stat.title}
                                                    </p>
                                                    <h2 className="fw-bold mb-0" style={{ fontSize: '2.5rem' }}>
                                                        {stat.value}
                                                    </h2>
                                                </div>
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '56px',
                                                        height: '56px',
                                                        backgroundColor: stat.iconBg
                                                    }}
                                                >
                                                    <i className={`fas ${stat.icon} fa-lg`}></i>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Decorative Circle */}
                                        <div
                                            className="position-absolute rounded-circle"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                bottom: '-30px',
                                                right: '-30px'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Content Row */}
                        <div className="row g-4">

                            <div className="col-lg-8">
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                    <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0">My Tasks</h5>
                                        {/* Filter Tabs - Scrollable on mobile */}
                                        <div className="d-flex gap-2 overflow-auto" style={{ scrollbarWidth: 'none' }}>
                                            {['all', 'new', 'pending', 'in-progress', 'completed'].map(f => (
                                                <button
                                                    key={f}
                                                    className={`btn btn-sm rounded-pill px-3 ${selectedTaskFilter === f ? 'btn-primary' : 'btn-light border'}`}
                                                    onClick={() => setSelectedTaskFilter(f)}
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="card-body bg-light" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                        {getFilteredTasks().length > 0 ? (
                                            <div className="d-flex flex-column gap-3">
                                                {getFilteredTasks().map((task, i) => (
                                                    <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                                                        <div className="card-body p-3">
                                                            {/* Header */}
                                                            <div className="mb-3">
                                                                <h6 className="fw-bold text-dark mb-0">{task.title}</h6>
                                                            </div>

                                                            {/* Assignee Info Grid */}
                                                            <div className="row g-2">
                                                                <div className="col-6">
                                                                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Assigned To:</small>
                                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                                            style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                                                                            <i className="fas fa-user"></i>
                                                                        </div>
                                                                        <span className="small fw-semibold text-dark text-truncate">
                                                                            {typeof task.assignedTo === 'object' ? task.assignedTo.name : task.assignedTo || userName}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="col-6">
                                                                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Assigned By:</small>
                                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                                        <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center"
                                                                            style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                                                                            <i className="fas fa-user-tie"></i>
                                                                        </div>
                                                                        <span className="small fw-semibold text-dark text-truncate">
                                                                            {task.assignedBy || task.createdBy || 'Manager'}
                                                                        </span>
                                                                    </div>
                                                                </div>
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

                            <div className="col-lg-4">
                                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                                    <div className="card-header bg-white border-0 py-3">
                                        <h5 className="fw-bold mb-0">
                                            <i className="fas fa-project-diagram me-2 text-primary"></i>
                                            My Projects
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {projects.length > 0 ? projects.slice(0, 3).map((p, i) => {
                                            const deadline = p.endDate || p.dueDate ?
                                                new Date(p.endDate || p.dueDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                }) : 'No deadline';

                                            return (
                                                <div key={i} className="mb-3 pb-3" style={{ borderBottom: i < Math.min(projects.length, 3) - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                                    {/* Project Name */}
                                                    <div className="d-flex align-items-start justify-content-between mb-2">
                                                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                                                            {p.name}
                                                        </h6>
                                                        <span className={`badge ${(p.progress || 0) === 100 ? 'bg-success' :
                                                            (p.progress || 0) >= 50 ? 'bg-primary' : 'bg-warning'
                                                            }`} style={{ fontSize: '0.7rem' }}>
                                                            {p.progress || 0}%
                                                        </span>
                                                    </div>

                                                    {/* Deadline */}
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="far fa-calendar-alt text-muted" style={{ fontSize: '0.8rem' }}></i>
                                                        <small className="text-muted">
                                                            <span className="fw-semibold">Deadline:</span> {deadline}
                                                        </small>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="progress" style={{ height: '8px', borderRadius: '10px', backgroundColor: '#e5e7eb' }}>
                                                        <div
                                                            className={`progress-bar ${(p.progress || 0) === 100 ? 'bg-success' :
                                                                (p.progress || 0) >= 50 ? 'bg-primary' : 'bg-warning'
                                                                }`}
                                                            style={{
                                                                width: `${p.progress || 0}%`,
                                                                borderRadius: '10px',
                                                                transition: 'width 0.6s ease'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="text-center py-4">
                                                <i className="fas fa-folder-open fa-3x text-muted mb-3 opacity-25"></i>
                                                <p className="text-muted mb-0">No active projects.</p>
                                            </div>
                                        )}

                                        {/* View All Link */}
                                        {projects.length > 0 && (
                                            <div className="text-center mt-3 pt-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-pill px-4"
                                                    onClick={() => setActiveView('projects')}
                                                >
                                                    View All Projects
                                                    <i className="fas fa-arrow-right ms-2"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>



                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'tasks' && (
                    <div className="tasks-view">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold mb-1">My Tasks</h3>
                                <p className="text-muted mb-0">Manage your assigned tasks</p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="btn-group shadow-sm rounded-pill p-1 bg-light">
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${taskViewMode === 'card' ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`}
                                        onClick={() => setTaskViewMode('card')}
                                    >
                                        <i className="fas fa-th-large me-1"></i> Card
                                    </button>
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${taskViewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`}
                                        onClick={() => setTaskViewMode('list')}
                                    >
                                        <i className="fas fa-list me-1"></i> List
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="d-flex gap-2 overflow-auto pb-3 mb-2" style={{ scrollbarWidth: 'none' }}>
                            {['all', 'new', 'pending', 'in-progress', 'completed'].map(f => (
                                <button
                                    key={f}
                                    className={`btn rounded-pill px-4 fw-500 ${selectedTaskFilter === f ? 'btn-primary' : 'btn-light bg-white border'}`}
                                    onClick={() => setSelectedTaskFilter(f)}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Tasks Grid */}
                        <div className={taskViewMode === 'card' ? "row g-3" : "d-flex flex-column gap-3"}>
                            {getFilteredTasks().length > 0 ? (
                                getFilteredTasks().map((task, i) => {
                                    if (taskViewMode === 'list') {
                                        return (
                                            <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                                                <div className="card-body py-3 px-4">
                                                    <div className="row align-items-center">
                                                        <div className="col-lg-4 mb-2 mb-lg-0">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                                                    <i className="fas fa-tasks"></i>
                                                                </div>
                                                                <div style={{ minWidth: 0 }}>
                                                                    <h6 className="fw-bold mb-0 text-dark text-truncate">{task.title}</h6>
                                                                    <small className="text-muted d-block text-truncate">{task.description || 'No description'}</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-2 mb-2 mb-lg-0">
                                                            <span className="badge px-3 py-2 rounded-pill" style={{
                                                                fontSize: '0.75rem',
                                                                backgroundColor: (task.status || '').toLowerCase() === 'completed' ? '#10b981' : // Green
                                                                    ((task.status || '').toLowerCase() === 'in-progress' || (task.status || '').toLowerCase() === 'in progress') ? '#6f42c1' : // Purple
                                                                        '#6c757d', // Grey (New/Assigned)
                                                                color: 'white'
                                                            }}>
                                                                {((task.status || '').toLowerCase() === 'assigned' || (task.status || '').toLowerCase() === 'pending' || (task.status || '').toLowerCase() === 'new' || !(task.status))
                                                                    ? 'NEW'
                                                                    : (task.status || 'NEW').toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="col-lg-2 mb-2 mb-lg-0">
                                                            <small className="text-muted">
                                                                <i className="far fa-calendar-alt me-1 text-danger"></i>
                                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date'}
                                                            </small>
                                                        </div>
                                                        <div className="col-lg-2 text-end">
                                                            <div className="d-flex justify-content-end gap-2">
                                                                {['new', 'pending', 'assigned', ''].includes((task.status || '').toLowerCase()) && (
                                                                    <button
                                                                        className="btn btn-sm btn-primary fw-bold"
                                                                        onClick={() => handleStartTask(task.id)}
                                                                        style={{ borderRadius: '6px' }}
                                                                    >
                                                                        Start
                                                                    </button>
                                                                )}
                                                                {((task.status || '').toLowerCase() === 'in-progress' || (task.status || '').toLowerCase() === 'in progress') && (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-sm fw-bold text-white"
                                                                            onClick={() => setNoteModalTask(task)}
                                                                            style={{ borderRadius: '6px', backgroundColor: '#f59e0b', border: 'none' }}
                                                                        >
                                                                            Note
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm fw-bold text-white"
                                                                            onClick={() => handleCompleteTask(task)}
                                                                            style={{ borderRadius: '6px', backgroundColor: '#10b981', border: 'none' }}
                                                                        >
                                                                            Complete
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    className="btn btn-sm fw-bold"
                                                                    onClick={() => setSelectedTask(task)}
                                                                    style={{ borderRadius: '6px', backgroundColor: '#f3e8ff', color: '#9333ea', border: 'none' }}
                                                                >
                                                                    Details
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={i} className="col-md-6 col-lg-4">
                                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                                                <div className="card-body p-4">
                                                    {/* Header: Title & Status Badge */}
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h5 className="fw-bold text-dark mb-0 me-2 text-truncate" style={{ maxWidth: '70%' }}>{task.title}</h5>
                                                        <span className="badge px-3 py-2 rounded-pill" style={{
                                                            fontSize: '0.75rem',
                                                            backgroundColor: (task.status || '').toLowerCase() === 'completed' ? '#10b981' : // Green
                                                                ((task.status || '').toLowerCase() === 'in-progress' || (task.status || '').toLowerCase() === 'in progress') ? '#6f42c1' : // Purple
                                                                    '#6c757d', // Grey (New/Assigned)
                                                            color: 'white'
                                                        }}>
                                                            {((task.status || '').toLowerCase() === 'assigned' || (task.status || '').toLowerCase() === 'pending' || (task.status || '').toLowerCase() === 'new' || !(task.status))
                                                                ? 'NEW'
                                                                : (task.status || 'NEW').toUpperCase()}
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="text-muted small mb-3" style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        minHeight: '40px',
                                                        lineHeight: '1.5'
                                                    }}>
                                                        {task.description || 'No description provided.'}
                                                    </p>

                                                    <hr className="bg-light my-3" />

                                                    {/* Middle Row: Points & Priority */}
                                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                                        <div className="d-flex align-items-center gap-1 text-warning fw-bold">
                                                            <i className="fas fa-star" style={{ fontSize: '1rem' }}></i>
                                                            <span style={{ fontSize: '1rem' }}>{task.points || 10} pts</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="dot rounded-circle" style={{
                                                                width: '10px',
                                                                height: '10px',
                                                                backgroundColor: (task.priority || '').toLowerCase() === 'high' ? '#dc3545' : (task.priority || '').toLowerCase() === 'low' ? '#10b981' : '#f59e0b'
                                                            }}></span>
                                                            <span className="fw-semibold text-dark text-capitalize">{task.priority || 'Medium'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="mt-auto">
                                                        {/* STATE 1: NEW / PENDING / ASSIGNED */}
                                                        {/* STATE 1: NEW / PENDING / ASSIGNED */}
                                                        {['new', 'pending', 'assigned', ''].includes((task.status || '').toLowerCase()) && (
                                                            <div className="d-flex flex-column gap-2">
                                                                <button
                                                                    className="btn btn-primary w-100 fw-bold py-2"
                                                                    onClick={() => handleStartTask(task.id)}
                                                                    style={{ borderRadius: '8px' }}
                                                                >
                                                                    <i className="fas fa-play me-2"></i>Start
                                                                </button>
                                                                <button
                                                                    className="btn w-100 fw-bold py-2"
                                                                    onClick={() => setSelectedTask(task)}
                                                                    style={{ borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#9333ea', border: 'none' }}
                                                                >
                                                                    <i className="fas fa-eye me-2"></i>View Details
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* STATE 2: IN PROGRESS */}
                                                        {((task.status || '').toLowerCase() === 'in-progress' || (task.status || '').toLowerCase() === 'in progress') && (
                                                            <div className="d-flex flex-column gap-2">
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        className="btn w-100 fw-bold text-white py-2"
                                                                        onClick={() => setNoteModalTask(task)}
                                                                        style={{ borderRadius: '8px', backgroundColor: '#f59e0b', border: 'none' }}
                                                                    >
                                                                        <i className="fas fa-edit me-2"></i>Note
                                                                    </button>
                                                                    <button
                                                                        className="btn w-100 fw-bold text-white py-2"
                                                                        onClick={() => handleCompleteTask(task)}
                                                                        style={{ borderRadius: '8px', backgroundColor: '#10b981', border: 'none' }}
                                                                    >
                                                                        <i className="fas fa-check me-2"></i>Complete
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    className="btn w-100 fw-bold py-2"
                                                                    onClick={() => setSelectedTask(task)}
                                                                    style={{ borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#9333ea', border: 'none' }}
                                                                >
                                                                    <i className="fas fa-eye me-2"></i>View Details
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* STATE 3: COMPLETED */}
                                                        {(task.status || '').toLowerCase() === 'completed' && (
                                                            <button
                                                                className="btn w-100 fw-bold py-2"
                                                                onClick={() => setSelectedTask(task)}
                                                                style={{ borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#9333ea', border: 'none' }}
                                                            >
                                                                <i className="fas fa-eye me-2"></i>View Details
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="fas fa-clipboard-list fa-2x text-muted opacity-50"></i>
                                    </div>
                                    <h5 className="text-muted">No tasks found</h5>
                                    <p className="text-muted small">Try selecting a different filter</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'projects' && (
                    <div className="projects-view">
                        {/* projectViewMode state */}
                        {/* This state would typically be defined at the top of the functional component */}
                        {/* For example: const [projectViewMode, setProjectViewMode] = useState('card'); */}
                        {/* Assuming it's defined elsewhere, we'll use it here. */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold mb-1">My Projects</h3>
                                <p className="text-muted mb-0">Projects assigned to you by the admin</p>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                <span className="badge bg-primary px-3 py-2" style={{ fontSize: '0.9rem' }}>
                                    {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                                </span>

                                <div className="btn-group shadow-sm rounded-pill p-1 bg-light">
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${projectViewMode === 'card' ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`}
                                        onClick={() => setProjectViewMode('card')}
                                    >
                                        <i className="fas fa-th-large me-1"></i> Card
                                    </button>
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${projectViewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted border-0'}`}
                                        onClick={() => setProjectViewMode('list')}
                                    >
                                        <i className="fas fa-list me-1"></i> List
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={projectViewMode === 'card' ? "row g-4" : "d-flex flex-column gap-3"}>
                            {projects.length > 0 ? projects.map((project, i) => {
                                // Calculate project metrics
                                const progress = project.progress || 0;
                                const status = project.status || project.projectStatus || 'Active';
                                const isCompleted = status.toLowerCase() === 'completed';
                                const isDelayed = status.toLowerCase() === 'delayed' || status.toLowerCase() === 'overdue';

                                // Get status color for badge
                                const statusBadgeColor = isCompleted ? '#10b981' : isDelayed ? '#fbbf24' : '#3b82f6';
                                const statusBadgeText = isCompleted ? 'COMPLETED' : isDelayed ? 'DELAYED' : 'ON TRACK';

                                // Format dates
                                const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : null;
                                const endDate = project.endDate || project.dueDate ? new Date(project.endDate || project.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : null;

                                // Calculate days remaining
                                const daysRemaining = project.endDate || project.dueDate ?
                                    Math.ceil((new Date(project.endDate || project.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

                                // Get team members
                                const teamMembers = project.assignedMembers || project.assigned || [];

                                if (projectViewMode === 'list') {
                                    return (
                                        <div key={i} className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                                            <div className="card-body py-3 px-4">
                                                <div className="row align-items-center">
                                                    <div className="col-lg-3 mb-2 mb-lg-0">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                                                                style={{
                                                                    width: '48px', height: '48px',
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    fontSize: '1.2rem'
                                                                }}>
                                                                {project.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h6 className="fw-bold mb-0 text-dark">{project.name}</h6>
                                                                <small className="text-muted">{project.clientName || project.client || 'WW'}</small>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-4 mb-3 mb-lg-0">
                                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                                            <small className="text-muted fw-semibold">Progress</small>
                                                            <small className="fw-bold text-primary">{progress}%</small>
                                                        </div>
                                                        <div className="progress" style={{ height: '6px', borderRadius: '10px', backgroundColor: '#f3f4f6' }}>
                                                            <div className="progress-bar" style={{
                                                                width: `${progress}%`,
                                                                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                                                borderRadius: '10px'
                                                            }}></div>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-3 mb-3 mb-lg-0 text-lg-center">
                                                        <div className="d-flex align-items-center justify-content-lg-center gap-4">
                                                            <div className="text-center">
                                                                <div className="fw-bold small">{teamMembers.length}</div>
                                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Members</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="fw-bold small">{daysRemaining > 0 ? daysRemaining : 0}</div>
                                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Days</div>
                                                            </div>
                                                            <span className="badge rounded-pill px-2 py-1" style={{
                                                                backgroundColor: statusBadgeColor + '20',
                                                                color: statusBadgeColor,
                                                                fontSize: '0.7rem'
                                                            }}>
                                                                {statusBadgeText}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-2 text-end">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                            onClick={() => setSelectedProject(project)}
                                                        >
                                                            Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={i} className="col-md-6 col-xl-4">
                                        <div className="card border-0 shadow-sm h-100" style={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-8px)';
                                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                            }}>

                                            {/* Purple Gradient Header */}
                                            <div className="card-header border-0 text-white p-4" style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                position: 'relative'
                                            }}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="flex-grow-1">
                                                        <h5 className="fw-bold mb-2 text-white">{project.name}</h5>
                                                        <div className="d-flex align-items-center gap-2" style={{ opacity: 0.95 }}>
                                                            <i className="fas fa-building" style={{ fontSize: '0.85rem' }}></i>
                                                            <span style={{ fontSize: '0.85rem' }}>{project.clientName || project.client || 'WW'}</span>
                                                        </div>
                                                    </div>
                                                    <span className="badge px-3 py-2" style={{
                                                        backgroundColor: statusBadgeColor,
                                                        color: isDelayed ? '#000' : '#fff',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '700',
                                                        letterSpacing: '0.5px',
                                                        borderRadius: '20px'
                                                    }}>
                                                        {statusBadgeText}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="card-body p-4">
                                                {/* Description */}
                                                {project.description && (
                                                    <p className="text-muted mb-4" style={{
                                                        fontSize: '0.9rem',
                                                        lineHeight: '1.5',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {project.description}
                                                    </p>
                                                )}

                                                {/* Stats Grid */}
                                                <div className="row g-3 mb-4">
                                                    {/* Members Count */}
                                                    <div className="col-6">
                                                        <div className="text-center p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
                                                            <div className="mb-2">
                                                                <i className="fas fa-users text-primary" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <div className="fw-bold text-dark" style={{ fontSize: '1.5rem' }}>
                                                                {teamMembers.length}
                                                            </div>
                                                            <small className="text-muted">Members</small>
                                                        </div>
                                                    </div>

                                                    {/* Days Remaining */}
                                                    <div className="col-6">
                                                        <div className="text-center p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
                                                            <div className="mb-2">
                                                                <i className="fas fa-clock text-warning" style={{ fontSize: '1.5rem' }}></i>
                                                            </div>
                                                            <div className="fw-bold text-dark" style={{ fontSize: '1.5rem' }}>
                                                                {daysRemaining > 0 ? daysRemaining : 0}
                                                            </div>
                                                            <small className="text-muted">Days</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Section (Renamed from Timeline) */}
                                                <div className="mb-4">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Progress</span>
                                                        <span className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{progress}%</span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="progress mb-3" style={{
                                                        height: '8px',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#e5e7eb'
                                                    }}>
                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${progress}%`,
                                                                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                                                borderRadius: '10px',
                                                                transition: 'width 0.6s ease'
                                                            }}
                                                        ></div>
                                                    </div>

                                                    {/* Start and End Dates */}
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i className="far fa-calendar text-muted" style={{ fontSize: '0.85rem' }}></i>
                                                            <small className="text-muted">{startDate || 'N/A'}</small>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i className="far fa-calendar-check text-muted" style={{ fontSize: '0.85rem' }}></i>
                                                            <small className="text-muted">{endDate || 'N/A'}</small>
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="col-12 text-center py-5">
                                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="fas fa-project-diagram fa-2x text-muted opacity-50"></i>
                                    </div>
                                    <h5 className="text-muted">No projects assigned</h5>
                                    <p className="text-muted small">Projects assigned to you will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {
                    activeView === 'profile' && (
                        <div className="profile-view">
                            <h3 className="mb-4">My Profile</h3>

                            <div className="row g-4">
                                {/* Left Sidebar - Profile Card */}
                                <div className="col-lg-4">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                        <div className="card-body p-4 text-center">
                                            {/* Avatar with Online Status */}
                                            <div className="position-relative d-inline-block mb-3">
                                                <div
                                                    className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto"
                                                    style={{
                                                        width: '120px',
                                                        height: '120px',
                                                        fontSize: '3rem',
                                                        fontWeight: '700',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                                                    }}
                                                >
                                                    {userName?.charAt(0).toUpperCase()}
                                                </div>
                                                {/* Online Status Indicator */}
                                                <div
                                                    className="position-absolute bg-success rounded-circle border border-3 border-white"
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        bottom: '8px',
                                                        right: '8px'
                                                    }}
                                                ></div>
                                            </div>

                                            {/* Name and Role */}
                                            <h4 className="fw-bold mb-1">{userName}</h4>
                                            <p className="text-muted small mb-3">{userData?.role || 'employee'}</p>

                                            {/* Edit Profile Button */}
                                            <button className="btn btn-primary w-100 rounded-pill py-2 mb-4">
                                                <i className="fas fa-edit me-2"></i>
                                                Edit Profile
                                            </button>

                                            <hr className="my-4" />

                                            {/* Profile Details List */}
                                            <div className="text-start">
                                                {/* Email */}
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                                                        <i className="fas fa-envelope" style={{ width: '16px' }}></i>
                                                        <small className="fw-semibold">Email Address</small>
                                                    </div>
                                                    <p className="mb-0 ms-4 small">{userEmail}</p>
                                                </div>

                                                {/* Phone */}
                                                {userData?.phone && (
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center gap-2 text-muted mb-1">
                                                            <i className="fas fa-phone" style={{ width: '16px' }}></i>
                                                            <small className="fw-semibold">Phone</small>
                                                        </div>
                                                        <p className="mb-0 ms-4 small">{userData.phone}</p>
                                                    </div>
                                                )}

                                                {/* Gender */}
                                                {userData?.gender && (
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center gap-2 text-muted mb-1">
                                                            <i className={`fas fa-${userData.gender.toLowerCase() === 'male' ? 'mars' : 'venus'}`} style={{ width: '16px' }}></i>
                                                            <small className="fw-semibold">Gender</small>
                                                        </div>
                                                        <p className="mb-0 ms-4 small">{userData.gender}</p>
                                                    </div>
                                                )}

                                                {/* Department */}
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center gap-2 text-muted mb-1">
                                                        <i className="fas fa-briefcase" style={{ width: '16px' }}></i>
                                                        <small className="fw-semibold">Department</small>
                                                    </div>
                                                    <p className="mb-0 ms-4 small">{userData?.department || 'N/A'}</p>
                                                </div>

                                                {/* Join Date */}
                                                {userData?.joinDate && (
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center gap-2 text-muted mb-1">
                                                            <i className="fas fa-calendar" style={{ width: '16px' }}></i>
                                                            <small className="fw-semibold">Join Date</small>
                                                        </div>
                                                        <p className="mb-0 ms-4 small">
                                                            {new Date(userData.joinDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel - Account Settings */}
                                <div className="col-lg-8">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold mb-4">Account Settings</h5>

                                            <form>
                                                <div className="row g-3">
                                                    {/* Full Name */}
                                                    <div className="col-md-6">
                                                        <label className="form-label small fw-semibold text-muted">Full Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control bg-light border-0 py-2"
                                                            defaultValue={userName}
                                                            style={{ borderRadius: '8px' }}
                                                        />
                                                    </div>

                                                    {/* Email */}
                                                    <div className="col-md-6">
                                                        <label className="form-label small fw-semibold text-muted">Email</label>
                                                        <input
                                                            type="email"
                                                            className="form-control bg-light border-0 py-2"
                                                            defaultValue={userEmail}
                                                            style={{ borderRadius: '8px' }}
                                                        />
                                                    </div>

                                                    {/* Phone Number */}
                                                    <div className="col-md-6">
                                                        <label className="form-label small fw-semibold text-muted">Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            className="form-control bg-light border-0 py-2"
                                                            defaultValue={userData?.phone || ''}
                                                            placeholder="Enter phone number"
                                                            style={{ borderRadius: '8px' }}
                                                        />
                                                    </div>

                                                    {/* Gender */}
                                                    <div className="col-md-6">
                                                        <label className="form-label small fw-semibold text-muted">Gender</label>
                                                        <select
                                                            className="form-select bg-light border-0 py-2"
                                                            defaultValue={userData?.gender || 'Male'}
                                                            style={{ borderRadius: '8px' }}
                                                        >
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>

                                                    {/* Department */}
                                                    <div className="col-12">
                                                        <label className="form-label small fw-semibold text-muted">Department</label>
                                                        <select
                                                            className="form-select bg-light border-0 py-2"
                                                            defaultValue={userData?.department || 'Marketing'}
                                                            style={{ borderRadius: '8px' }}
                                                        >
                                                            <option value="Marketing">Marketing</option>
                                                            <option value="Development">Development</option>
                                                            <option value="Design">Design</option>
                                                            <option value="Sales">Sales</option>
                                                            <option value="HR">HR</option>
                                                            <option value="Finance">Finance</option>
                                                            <option value="Operations">Operations</option>
                                                        </select>
                                                    </div>

                                                    {/* Bio */}
                                                    <div className="col-12">
                                                        <label className="form-label small fw-semibold text-muted">Bio</label>
                                                        <textarea
                                                            className="form-control bg-light border-0"
                                                            rows="4"
                                                            placeholder="Tell us about yourself..."
                                                            defaultValue={userData?.bio || ''}
                                                            style={{ borderRadius: '8px' }}
                                                        ></textarea>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="col-12 mt-4">
                                                        <div className="d-flex gap-2">
                                                            <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill">
                                                                <i className="fas fa-save me-2"></i>
                                                                Save Changes
                                                            </button>
                                                            <button type="button" className="btn btn-light px-4 py-2 rounded-pill">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    activeView === 'notice' && (
                        <TeamLeaderNotice userData={userData} />
                    )
                }

                {
                    activeView === 'support-help' && (
                        <TeamLeaderSupport allUsers={assignedTasks.map(t => t.assignedBy)} userData={userData} />
                    )
                }

                {/* Project Details Modal */}
                {selectedProject && (
                    <div className="modal-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1050,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div className="modal-content bg-white rounded-4 border-0 shadow-lg overflow-hidden animate__animated animate__fadeInUp" style={{
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Modal Header */}
                            <div className="modal-header p-4 text-white" style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                position: 'relative'
                            }}>
                                <div>
                                    <h4 className="fw-bold mb-1 text-white">{selectedProject.name}</h4>
                                    <div className="d-flex align-items-center gap-2 text-white-50">
                                        <i className="fas fa-building small"></i>
                                        <span className="small">{selectedProject.clientName || selectedProject.client || 'Client Name'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="btn-close btn-close-white position-absolute top-0 end-0 m-4"
                                    aria-label="Close"
                                ></button>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-4 overflow-auto">
                                {/* Status & Dates */}
                                <div className="row g-3 mb-4">
                                    <div className="col-sm-6">
                                        <div className="p-3 bg-light rounded-3 h-100">
                                            <small className="text-muted d-block mb-1">Status</small>
                                            <span className={`badge px-3 py-2 rounded-pill ${(selectedProject.status || 'active').toLowerCase() === 'completed' ? 'bg-success' :
                                                (selectedProject.status || 'active').toLowerCase() === 'delayed' ? 'bg-warning text-dark' :
                                                    'bg-primary'
                                                }`}>
                                                {(selectedProject.status || 'ACTIVE').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="p-3 bg-light rounded-3 h-100">
                                            <small className="text-muted d-block mb-1">Timeline</small>
                                            <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                                                <i className="far fa-calendar-alt text-primary"></i>
                                                <span>
                                                    {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'Start'}
                                                    {' - '}
                                                    {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'End'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-2">Description</h6>
                                    <p className="text-muted small" style={{ lineHeight: '1.6' }}>
                                        {selectedProject.description || 'No description provided for this project.'}
                                    </p>
                                </div>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-end mb-2">
                                        <h6 className="fw-bold mb-0">Project Progress</h6>
                                        <span className="fw-bold text-primary">{selectedProject.progress || 0}%</span>
                                    </div>
                                    <div className="progress" style={{ height: '10px', borderRadius: '10px' }}>
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${selectedProject.progress || 0}%`,
                                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Team Members */}
                                <div>
                                    <h6 className="fw-bold mb-3">Team Members</h6>
                                    {selectedProject.assignedMembers && selectedProject.assignedMembers.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {selectedProject.assignedMembers.map((member, i) => (
                                                <div key={i} className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill border">
                                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                        style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                                                        {typeof member === 'object' ? (member.name ? member.name.charAt(0) : '?') : 'U'}
                                                    </div>
                                                    <span className="small fw-semibold">
                                                        {typeof member === 'object' ? member.name : member}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted small fst-italic">No members assigned.</p>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer p-3 bg-light border-top-0">
                                <button
                                    className="btn btn-secondary px-4 rounded-pill"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Task Details Modal */}
                {selectedTask && (
                    <div className="modal-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1050,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div className="modal-content bg-white rounded-4 border-0 shadow-lg overflow-hidden animate__animated animate__fadeInUp" style={{
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div className="modal-header border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold">{selectedTask.title}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedTask(null)}></button>
                            </div>
                            <div className="modal-body p-4 pt-0 overflow-auto">
                                <div className="d-flex gap-2 mb-4">
                                    <span className={`badge px-3 py-2 rounded-pill ${(selectedTask.status || '').toLowerCase() === 'completed' ? 'bg-success' :
                                        (selectedTask.status || '').toLowerCase() === 'in-progress' ? 'bg-primary' :
                                            'bg-warning text-dark'
                                        }`}>
                                        {(selectedTask.status || 'NEW').toUpperCase()}
                                    </span>
                                    <span className={`badge border bg-transparent text-dark px-3 py-2 rounded-pill`}>
                                        {(selectedTask.priority || 'MEDIUM').toUpperCase()}
                                    </span>
                                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                                        <i className="fas fa-star me-1"></i> {selectedTask.points || 10} pts
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <label className="small text-muted fw-bold text-uppercase mb-2">Description</label>
                                    <p className="text-muted">{selectedTask.description || 'No description available.'}</p>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <label className="small text-muted fw-bold text-uppercase mb-2">Assigned To</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                <i className="fas fa-user small"></i>
                                            </div>
                                            <span className="small fw-semibold">{typeof selectedTask.assignedTo === 'object' ? selectedTask.assignedTo.name : selectedTask.assignedTo || userName}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="small text-muted fw-bold text-uppercase mb-2">Assigned By</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                <i className="fas fa-user-tie small"></i>
                                            </div>
                                            <span className="small fw-semibold">{selectedTask.assignedBy || 'Manager'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-light p-3 rounded-3">
                                    <div className="d-flex align-items-center text-muted">
                                        <i className="far fa-calendar-alt text-danger me-2"></i>
                                        <span className="small">Due Date: <strong>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No Date'}</strong></span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 p-4 pt-0">
                                <button type="button" className="btn btn-light w-100 fw-bold rounded-pill" onClick={() => setSelectedTask(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Note Modal */}
                {noteModalTask && (
                    <div className="modal-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1060,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div className="modal-content bg-white rounded-4 border-0 shadow-lg animate__animated animate__zoomIn" style={{
                            width: '100%',
                            maxWidth: '500px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div className="modal-header border-bottom-0 p-4 pb-0">
                                <h5 className="modal-title fw-bold">Add Note</h5>
                                <button type="button" className="btn-close" onClick={() => setNoteModalTask(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted small mb-3">Adding note for: <strong>{noteModalTask.title}</strong></p>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter your note here..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    style={{ borderRadius: '12px', resize: 'none' }}
                                ></textarea>
                            </div>
                            <div className="modal-footer border-top-0 p-4 pt-0 gap-2">
                                <button type="button" className="btn btn-light fw-bold rounded-pill px-4" onClick={() => setNoteModalTask(null)}>Cancel</button>
                                <button type="button" className="btn btn-primary fw-bold rounded-pill px-4" onClick={handleSaveNote}>Save Note</button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

export default EmployeeDashboard;
