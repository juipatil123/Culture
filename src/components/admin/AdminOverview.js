import React, { useEffect } from 'react';
import { formatDate, formatDateRange } from '../../utils/dateUtils';
import { getStatusColor, getProgressGradient } from '../../utils/projectUtils';

const AdminOverview = ({
    stats,
    recentActivities,
    projects,
    onAddProject,
    onCardClick,
    onViewProject
}) => {

    useEffect(() => {
        const ctx = document.getElementById('progressChart');
        if (ctx) {
            // Check if there's an existing chart instance and destroy it
            const existingChart = window.Chart.getChart(ctx);
            if (existingChart) {
                existingChart.destroy();
            }

            new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Project Completion Rate',
                        data: [65, 59, 80, 81, 56, 85],
                        fill: true,
                        borderColor: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                display: false
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }, []);

    return (
        <div className="admin-overview">
            <div className="row mb-4">
                {/* Overall Progress Analytics Chart */}
                <div className="col-md-12 col-lg-8 mb-4">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-header border-0 d-flex justify-content-between align-items-center bg-white py-3">
                            <h5 className="fw-bold mb-0 text-dark">Overall Progress Analytics</h5>
                            <button
                                className="btn btn-light btn-sm fw-bold text-muted"
                                onClick={() => onCardClick('Reports')}
                            >
                                <i className="fas fa-download me-2"></i> Report
                            </button>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px' }}>
                                <canvas id="progressChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Card */}
                <div className="col-md-12 col-lg-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header border-0 d-flex justify-content-between align-items-center bg-white py-3">
                            <h5 className="fw-bold mb-0 text-dark">Recent Activity</h5>
                            <span className="badge bg-soft-primary text-primary rounded-pill px-3 py-2">Latest</span>
                        </div>
                        <div className="card-body px-4">
                            {recentActivities && recentActivities.length > 0 ? (
                                <div className="activity-list">
                                    {recentActivities.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="activity-item d-flex align-items-start mb-4">
                                            <div className="activity-icon-premium me-3">
                                                <i className={`fas ${activity.icon || 'fa-info-circle'}`}></i>
                                            </div>
                                            <div className="activity-content flex-grow-1">
                                                <div className="activity-text">
                                                    <strong className="d-block mb-1 text-dark">{activity.title || activity.message}</strong>
                                                    <span className="text-muted small d-block">
                                                        <i className="far fa-clock me-1"></i> {activity.description || activity.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <div className="empty-activity-icon mb-3">
                                        <i className="fas fa-ghost fa-3x opacity-25"></i>
                                    </div>
                                    <p className="small mb-0">Everything's quiet right now</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Projects Section */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
                    <div>
                        <h5 className="fw-bold mb-0">Active Projects</h5>
                        <small className="text-muted">Track and manage project progress</small>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => onCardClick('All Projects')}
                        >
                            <i className="fas fa-list me-1"></i> List View
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={onAddProject}
                        >
                            <i className="fas fa-plus me-1"></i> New Project
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">SR. NO.</th>
                                    <th>PROJECT NAME</th>
                                    <th>CLIENT</th>
                                    <th>EMAIL ID</th>
                                    <th>STATUS</th>
                                    <th>PROGRESS</th>
                                    <th>DURATION</th>
                                    <th>COST</th>
                                    <th className="pe-4 text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects && projects.length > 0 ? projects.slice(0, 8).map((project, index) => (
                                    <tr key={index}>
                                        <td className="ps-4">
                                            <span className="fw-bold text-muted">{index + 1}</span>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{project.name}</div>
                                            <small className="text-muted">{project.clientName || 'No client'}</small>
                                        </td>
                                        <td>
                                            <span className="text-secondary">{project.clientName || 'N/A'}</span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                                                    style={{ 
                                                        width: '28px', 
                                                        height: '28px', 
                                                        fontSize: '11px', 
                                                        fontWeight: 'bold',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                    }}
                                                >
                                                    {(project.projectManager || 'N').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="small">{project.projectManager || 'Not Assigned'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span 
                                                className="badge rounded-pill" 
                                                style={{
                                                    fontSize: '0.75rem',
                                                    minWidth: '90px',
                                                    padding: '6px 12px',
                                                    fontWeight: '700',
                                                    backgroundColor: getStatusColor(project.status),
                                                    color: 'white'
                                                }}
                                            >
                                                {project.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2" style={{ minWidth: '120px' }}>
                                                <div className="progress flex-grow-1" style={{ height: '8px', background: '#f0f2f5', borderRadius: '10px' }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{ 
                                                            width: `${project.progress}%`, 
                                                            background: getProgressGradient(project.status),
                                                            borderRadius: '10px',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="small fw-bold" style={{
                                                    color: getStatusColor(project.status)
                                                }}>{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                <i className="far fa-calendar-alt me-1"></i>
                                                {formatDateRange(project.startDate, project.endDate)}
                                            </small>
                                        </td>
                                        <td className="fw-bold text-dark">
                                            ₹{project.projectCost ? Number(project.projectCost).toLocaleString() : '0'}
                                        </td>
                                        <td className="pe-4 text-center">
                                            <div className="d-flex gap-1 justify-content-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-circle"
                                                    onClick={() => onViewProject(project)}
                                                    title="Edit"
                                                    style={{ width: '32px', height: '32px', padding: '0' }}
                                                >
                                                    <i className="far fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-info rounded-circle"
                                                    onClick={() => onViewProject(project)}
                                                    title="View"
                                                    style={{ width: '32px', height: '32px', padding: '0' }}
                                                >
                                                    <i className="far fa-eye"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-circle"
                                                    title="Delete"
                                                    style={{ width: '32px', height: '32px', padding: '0' }}
                                                >
                                                    <i className="far fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <i className="fas fa-project-diagram fa-3x text-muted mb-3 opacity-25"></i>
                                            <p className="text-muted">No active projects found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
