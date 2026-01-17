import React, { useState, useEffect } from 'react';
import { getAllProjects } from '../../services/api';
import { formatDateShort } from '../../utils/dateUtils';
import './AdminComponents.css';

const Revenue = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('card');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const projectsData = await getAllProjects();
            const transformedProjects = (projectsData || []).map((project, index) => ({
                id: project._id || project.id || `proj-${index}`,
                name: project.name || 'Untitled Project',
                clientName: project.clientName || 'No Client',
                projectManager: project.projectManager || 'Not Assigned',
                projectCost: project.projectCost || 0,
                advancePayment: project.advancePayment || 0,
                remainingPayment: (project.projectCost || 0) - (project.advancePayment || 0),
                status: project.projectStatus === 'assigned' ? 'Assigned' :
                    project.projectStatus === 'on-track' ? 'On Track' :
                        project.projectStatus === 'at-risk' ? 'At Risk' :
                            project.projectStatus === 'delayed' ? 'Delayed' :
                                project.projectStatus === 'completed' ? 'Completed' : 'On Track',
                startDate: project.startDate,
                endDate: project.endDate,
                progress: (project.projectStatus === 'completed' || project.status === 'Completed') ? 100 : (Number(project.progress) || 0)
            }));
            setProjects(transformedProjects);
        } catch (error) {
            console.error('Error loading projects:', error);
            const cachedProjects = localStorage.getItem('projects');
            if (cachedProjects) {
                try {
                    const parsedProjects = JSON.parse(cachedProjects);
                    const transformedProjects = parsedProjects.map(project => ({
                        ...project,
                        remainingPayment: (project.projectCost || 0) - (project.advancePayment || 0)
                    }));
                    setProjects(transformedProjects);
                } catch (parseError) {
                    console.error('Error parsing cached projects:', parseError);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate total revenue statistics
    const calculateStats = () => {
        const totalRevenue = projects.reduce((sum, project) => sum + (Number(project.projectCost) || 0), 0);
        const totalAdvance = projects.reduce((sum, project) => sum + (Number(project.advancePayment) || 0), 0);
        const totalRemaining = projects.reduce((sum, project) => sum + (Number(project.remainingPayment) || 0), 0);

        return {
            totalRevenue,
            totalAdvance,
            totalRemaining
        };
    };

    const stats = calculateStats();

    // Filter projects
    const getFilteredProjects = () => {
        let filtered = [...projects];

        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.projectManager?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(project => project.status === filterStatus);
        }

        return filtered;
    };

    const filteredProjects = getFilteredProjects();

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Assigned': { bg: '#6f42c1', text: 'white' },
            'Completed': { bg: '#28a745', text: 'white' },
            'On Track': { bg: '#007bff', text: 'white' },
            'At Risk': { bg: '#ffc107', text: 'black' },
            'Delayed': { bg: '#dc3545', text: 'white' }
        };
        const config = statusConfig[status] || statusConfig['On Track'];
        return (
            <span style={{
                backgroundColor: config.bg,
                color: config.text,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="loading-state">
                <i className="fas fa-spinner fa-spin fa-3x"></i>
                <p>Loading revenue data...</p>
            </div>
        );
    }

    return (
        <div className="revenue-management">
            {/* Page Header */}
            <div className="page-header d-flex justify-content-between align-items-center">
                <h2>Revenue Management ({projects.length})</h2>
                <div className="d-flex gap-2 align-items-center">
                    <span className="text-muted small">
                        <i className="fas fa-calendar-alt me-2"></i>
                        {formatDateShort(new Date())}
                    </span>
                    <button 
                        className="btn btn-success"
                        onClick={() => {
                            const headers = ['Sr. No.', 'Project Name', 'Client', 'PM', 'Total Cost', 'Advance', 'Remaining', 'Status', 'Progress', 'Date'];
                            const rows = filteredProjects.map((project, index) => [
                                index + 1,
                                project.name,
                                project.clientName,
                                project.projectManager,
                                project.projectCost,
                                project.advancePayment,
                                project.remainingPayment,
                                project.status,
                                `${project.progress}%`,
                                formatDateShort(new Date())
                            ]);
                            const csvContent = [
                                headers.join(','),
                                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
                            ].join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            const url = URL.createObjectURL(blob);
                            link.setAttribute('href', url);
                            link.setAttribute('download', `revenue_report_${formatDateShort(new Date()).replace(/-/g, '_')}.csv`);
                            link.style.visibility = 'hidden';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            alert('Revenue report downloaded successfully!');
                        }}
                        style={{ minWidth: '140px' }}
                    >
                        <i className="fas fa-download me-2"></i>Download Report
                    </button>
                </div>
            </div>

            {/* Revenue Statistics Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="dashboard-card bg-warning text-white" style={{ borderRadius: '15px', padding: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                <i className="fas fa-rupee-sign fs-5"></i>
                            </div>
                        </div>
                        <h3 className="fw-bold mb-1">₹{stats.totalRevenue.toLocaleString()}</h3>
                        <p className="mb-0 opacity-75 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Total Revenue</p>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-card bg-success text-white" style={{ borderRadius: '15px', padding: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                <i className="fas fa-check-circle fs-5"></i>
                            </div>
                        </div>
                        <h3 className="fw-bold mb-1">₹{stats.totalAdvance.toLocaleString()}</h3>
                        <p className="mb-0 opacity-75 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Advance Received</p>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="dashboard-card bg-info text-white" style={{ borderRadius: '15px', padding: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                <i className="fas fa-clock fs-5"></i>
                            </div>
                        </div>
                        <h3 className="fw-bold mb-1">₹{stats.totalRemaining.toLocaleString()}</h3>
                        <p className="mb-0 opacity-75 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Remaining Payment</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="Assigned">Assigned</option>
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                </select>

                <div className="view-toggle">
                    <button
                        className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('card')}
                    >
                        <i className="fas fa-th"></i>
                    </button>
                    <button
                        className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('list')}
                    >
                        <i className="fas fa-list"></i>
                    </button>
                </div>
            </div>

            {/* Projects Display */}
            {filteredProjects.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-project-diagram fa-3x"></i>
                    <p>No projects found</p>
                </div>
            ) : viewMode === 'card' ? (
                <div className="projects-grid">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="project-card">
                            <div className="project-card-header">
                                <h4>{project.name}</h4>
                                {getStatusBadge(project.status)}
                            </div>
                            <div className="project-card-body">
                                <div className="project-info">
                                    <div className="info-item">
                                        <i className="fas fa-user-tie"></i>
                                        <span><strong>Client:</strong> {project.clientName}</span>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-user"></i>
                                        <span><strong>PM:</strong> {project.projectManager}</span>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-rupee-sign"></i>
                                        <span><strong>Total Cost:</strong> ₹{project.projectCost.toLocaleString()}</span>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-check-circle"></i>
                                        <span><strong>Advance:</strong> ₹{project.advancePayment.toLocaleString()}</span>
                                    </div>
                                    <div className="info-item">
                                        <i className="fas fa-clock"></i>
                                        <span><strong>Remaining:</strong> ₹{project.remainingPayment.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="progress-section">
                                    <div className="progress-header">
                                        <span>Progress</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="progress">
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <table className="projects-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Client</th>
                            <th>PM</th>
                            <th>Total Cost</th>
                            <th>Advance</th>
                            <th>Remaining</th>
                            <th>Status</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project) => (
                            <tr key={project.id}>
                                <td><strong>{project.name}</strong></td>
                                <td>{project.clientName}</td>
                                <td>{project.projectManager}</td>
                                <td>₹{project.projectCost.toLocaleString()}</td>
                                <td>₹{project.advancePayment.toLocaleString()}</td>
                                <td>₹{project.remainingPayment.toLocaleString()}</td>
                                <td>{getStatusBadge(project.status)}</td>
                                <td>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                    <small>{project.progress}%</small>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Revenue;
