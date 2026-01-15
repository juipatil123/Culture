import React, { useState, useEffect } from 'react';
import { getAllProjects, getAllUsers, updateProject, getAllTasks } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import AddProjectModal from '../AddProjectModal';
import './Reports.css';

const Reports = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('cost-desc');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [projectsData, usersData, tasksData] = await Promise.all([
                getAllProjects(),
                getAllUsers(),
                getAllTasks()
            ]);
            setProjects(projectsData || []);
            setUsers(usersData || []);
            setTasks(tasksData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setProjects([]);
            setUsers([]);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // Format currency in INR
    const formatCurrency = (amount) => {
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Get team members for a project
    const getProjectTeamMembers = (project) => {
        if (!project.assignedMembers || project.assignedMembers.length === 0) {
            return [];
        }

        return project.assignedMembers.map(memberName => {
            // Find user details
            const user = users.find(u =>
                u.name === memberName ||
                u.email === memberName ||
                (typeof memberName === 'object' && (u.name === memberName.name || u.email === memberName.email))
            );

            return {
                name: typeof memberName === 'object' ? memberName.name : memberName,
                role: user?.role || user?.userType || 'Team Member',
                email: user?.email || ''
            };
        });
    };

    // Filter and sort projects
    const getFilteredAndSortedProjects = () => {
        let filtered = projects.filter(project => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                project.name?.toLowerCase().includes(searchLower) ||
                project.clientName?.toLowerCase().includes(searchLower) ||
                project.projectManager?.toLowerCase().includes(searchLower);

            const matchesStatus = filterStatus === 'all' ||
                project.projectStatus === filterStatus;

            return matchesSearch && matchesStatus;
        });

        // Sort projects
        filtered.sort((a, b) => {
            const costA = parseFloat(a.projectCost) || 0;
            const costB = parseFloat(b.projectCost) || 0;
            const nameA = a.name?.toLowerCase() || '';
            const nameB = b.name?.toLowerCase() || '';

            switch (sortBy) {
                case 'cost-desc':
                    return costB - costA;
                case 'cost-asc':
                    return costA - costB;
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Calculate statistics
    const calculateStats = () => {
        const totalProjects = projects.length;
        const totalCost = projects.reduce((sum, p) => sum + (parseFloat(p.projectCost) || 0), 0);
        const totalAdvance = projects.reduce((sum, p) => sum + (parseFloat(p.advancePayment) || 0), 0);
        const totalTeamMembers = new Set(
            projects.flatMap(p => p.assignedMembers || [])
        ).size;

        const totalTasksCount = tasks.length;
        const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
        const tasksProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

        return { totalProjects, totalCost, totalAdvance, totalTeamMembers, totalTasksCount, completedTasksCount, tasksProgress };
    };

    const filteredProjects = getFilteredAndSortedProjects();
    const stats = calculateStats();

    // Get task stats for a project
    const getProjectTaskStats = (projectName) => {
        const projectTasks = tasks.filter(t =>
            t.project === projectName ||
            t.projectName === projectName ||
            (typeof projectName === 'string' && t.project?.toLowerCase() === projectName.toLowerCase())
        );
        const completed = projectTasks.filter(t => t.status === 'completed').length;
        const count = projectTasks.length;
        const progress = count > 0 ? Math.round((completed / count) * 100) : 0;

        return { count, completed, progress };
    };

    // Handle Edit Project
    const handleEditProject = (project) => {
        setEditingProject(project);
        setShowEditModal(true);
    };

    // Handle Save Project
    const handleSaveProject = async (projectData) => {
        try {
            await updateProject(editingProject.id || editingProject._id, projectData);
            alert('Project updated successfully!');
            setShowEditModal(false);
            setEditingProject(null);
            loadData();
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project. Please try again.');
        }
    };

    // Handle Download Report
    const handleDownloadReport = () => {
        // Define CSV headers
        const headers = ['Project Name', 'Client', 'Manager', 'Status', 'Cost', 'Advance', 'Tasks Total', 'Tasks Done', 'Execution %', 'Start Date', 'End Date'];

        // Map project data to CSV rows


        const rows = filteredProjects.map(p => {
            const taskStats = getProjectTaskStats(p.name);
            return [
                p.name || '',
                p.clientName || '',
                p.projectManager || '',
                p.projectStatus || '',
                p.projectCost || '0',
                p.advancePayment || '0',
                taskStats.count,
                taskStats.completed,
                `${taskStats.progress}%`,
                formatDate(p.startDate),
                formatDate(p.endDate)
            ];
        });


        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...(filteredProjects.map(p => [
                p.name || '',
                p.clientName || '',
                p.projectManager || '',
                (p.projectStatus === 'assigned' ? 'Pending' :
                    p.projectStatus === 'on-track' ? 'In Progress' :
                        p.projectStatus === 'at-risk' || p.projectStatus === 'delayed' ? 'Overdue' :
                            p.projectStatus) || '',
                p.projectCost || '0',
                p.advancePayment || '0',
                formatDate(p.startDate),
                formatDate(p.endDate)
            ])).map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `project_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0">
                        <i className="fas fa-chart-bar me-2 text-primary"></i>
                        Project Assignment Reports
                    </h3>
                    <div className="text-muted small">
                        <i className="fas fa-calendar-alt me-2"></i>
                        {formatDate(new Date())}
                    </div>
                    <button className="btn btn-outline-success ms-3" onClick={handleDownloadReport}>
                        <i className="fas fa-download me-2"></i>
                        Download Report
                    </button>
                </div>

                {/* Statistics Cards */}
                < div className="row g-4 mb-4" >
                    <div className="col-md-3">
                        <div className="summary-card bg-grad-purple shadow-sm">
                            <div className="summary-card-circle"></div>
                            <div className="summary-card-title">Active Projects</div>
                            <div className="summary-card-value text-white">{stats.totalProjects}</div>
                            <div className="summary-card-pill">Total Projects</div>
                        </div>
                    </div >
                    <div className="col-md-3">
                        <div className="summary-card bg-grad-pink shadow-sm">
                            <div className="summary-card-circle"></div>
                            <div className="summary-card-title">Total Project Value</div>
                            <div className="summary-card-value text-white" style={{ fontSize: '1.8rem' }}>{formatCurrency(stats.totalCost)}</div>
                            <div className="summary-card-pill">Gross Value</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="summary-card bg-grad-blue shadow-sm">
                            <div className="summary-card-circle"></div>
                            <div className="summary-card-title">Advance Received</div>
                            <div className="summary-card-value text-white" style={{ fontSize: '1.8rem' }}>{formatCurrency(stats.totalAdvance)}</div>
                            <div className="summary-card-pill">Payments In</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="summary-card bg-grad-yellow shadow-sm">
                            <div className="summary-card-circle"></div>
                            <div className="summary-card-title">Task Completion</div>
                            <div className="summary-card-value text-white">{stats.tasksProgress}%</div>
                            <div className="summary-card-pill">{stats.completedTasksCount}/{stats.totalTasksCount} Tasks Done</div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Filters and Search */}
            < div className="reports-controls mb-4" >
                <div className="row g-3 align-items-center">
                    <div className="col-md-4">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search projects, clients, or managers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="overdue">Overdue</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="cost-desc">Highest Cost</option>
                            <option value="cost-asc">Lowest Cost</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div >

            {/* Projects List */}
            < div className="reports-content" >
                {
                    loading ? (
                        <div className="text-center py-5" >
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-3">Loading project reports...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-folder-open"></i>
                            <h5>No Projects Found</h5>
                            <p className="text-muted">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'No projects available yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="projects-grid">
                            {filteredProjects.map((project, index) => {
                                const teamMembers = getProjectTeamMembers(project);
                                const projectCost = parseFloat(project.projectCost) || 0;
                                const advancePayment = parseFloat(project.advancePayment) || 0;
                                const pending = projectCost - advancePayment;



                                return (
                                    <div key={project._id || project.id || index} className="project-report-card">
                                        <div className="project-header">
                                            <div className="project-title-section">
                                                <h5 className="project-name">
                                                    <i className="fas fa-project-diagram me-2"></i>
                                                    {project.name || 'Untitled Project'}
                                                </h5>
                                                <span className={`status-badge status-${project.projectStatus || 'on-track'}`}>
                                                    {project.projectStatus === 'assigned' ? 'Assigned' :
                                                        project.projectStatus === 'on-track' ? 'On Track' :
                                                            project.projectStatus === 'at-risk' ? 'At Risk' :
                                                                project.projectStatus === 'delayed' ? 'Delayed' :
                                                                    project.projectStatus === 'completed' ? 'Completed' : 'On Track'}
                                                </span>
                                            </div>
                                            <div className="project-cost-badge">
                                                <i className="fas fa-rupee-sign me-1"></i>
                                                {formatCurrency(projectCost)}
                                            </div>

                                        </div>
                                        <div className="border-bottom pb-2 mb-2 d-flex justify-content-end">
                                            <button
                                                className="btn btn-sm btn-link text-primary text-decoration-none"
                                                onClick={() => handleEditProject(project)}
                                            >
                                                <i className="fas fa-edit me-1"></i> Edit Details
                                            </button>
                                        </div>



                                        <div className="project-details">
                                            <div className="detail-row">
                                                <span className="detail-label">
                                                    <i className="fas fa-user me-2"></i>Client:
                                                </span>
                                                <span className="detail-value">{project.clientName || 'N/A'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">
                                                    <i className="fas fa-user-tie me-2"></i>Project Manager:
                                                </span>
                                                <span className="detail-value">{project.projectManager || 'Not Assigned'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">
                                                    <i className="fas fa-calendar me-2"></i>Duration:
                                                </span>
                                                <span className="detail-value">
                                                    {formatDate(project.startDate)} -
                                                    {formatDate(project.endDate)}
                                                </span >
                                            </div >


                                            {/* Task Management Sync */}
                                            {(() => {
                                                const taskStats = getProjectTaskStats(project.name);
                                                return (
                                                    <div className="task-sync-stats mt-3 p-3 bg-light rounded-3">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="small fw-bold text-muted">Execution Progress</span>
                                                            <span className="badge bg-primary rounded-pill">{taskStats.progress}%</span>
                                                        </div>
                                                        <div className="progress mb-2" style={{ height: '8px' }}>
                                                            <div
                                                                className={`progress-bar bg-primary ${taskStats.progress === 100 ? 'bg-success' : ''}`}
                                                                role="progressbar"
                                                                style={{ width: `${taskStats.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="d-flex justify-content-between small text-muted">
                                                            <span>Tasks Completed:</span>
                                                            <span className="fw-bold">{taskStats.completed} / {taskStats.count}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div >

                                        <div className="financial-summary">
                                            <div className="financial-item">
                                                <span className="financial-label">Project Cost</span>
                                                <span className="financial-value text-success">{formatCurrency(projectCost)}</span>
                                            </div>
                                            <div className="financial-item">
                                                <span className="financial-label">Advance</span>
                                                <span className="financial-value text-primary">{formatCurrency(advancePayment)}</span>
                                            </div>
                                            <div className="financial-item">
                                                <span className="financial-label">Pending</span>
                                                <span className="financial-value text-warning">{formatCurrency(pending)}</span>
                                            </div>
                                        </div>

                                        <div className="team-members-section">
                                            <h6 className="team-title">
                                                <i className="fas fa-users me-2"></i>
                                                Team Members ({teamMembers.length})
                                            </h6>
                                            {teamMembers.length === 0 ? (
                                                <p className="text-muted small mb-0">No team members assigned</p>
                                            ) : (
                                                <div className="team-members-list">
                                                    {teamMembers.map((member, idx) => (
                                                        <div key={idx} className="team-member-item">
                                                            <div className="member-avatar">
                                                                {member.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div className="member-info">
                                                                <div className="member-name">{member.name}</div>
                                                                <div className="member-role">{member.role}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </div>

            {/* Add/Edit Project Modal - Reused from Project Management */}
            {
                showEditModal && (
                    <AddProjectModal
                        show={showEditModal}
                        onHide={() => {
                            setShowEditModal(false);
                            setEditingProject(null);
                        }}
                        onSave={handleSaveProject}
                        editingProject={editingProject}
                        availableEmployees={users}
                    />
                )
            }
        </div>
    );
};

export default Reports;
