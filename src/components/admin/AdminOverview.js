import React, { useEffect } from 'react';

const AdminOverview = ({
    stats,
    recentActivities,
    projects,
    onAddProject,
    onCardClick
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
                            <button className="btn btn-light btn-sm fw-bold text-muted">
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
                        <button className="btn btn-outline-secondary btn-sm">
                            <i className="fas fa-filter me-1"></i> Filter
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
                                    <th className="ps-4">Project Name</th>
                                    <th>Project Manager</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                    <th>Deadline</th>
                                    <th className="pe-4 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects && projects.length > 0 ? projects.slice(0, 5).map((project, index) => (
                                    <tr key={index}>
                                        <td className="ps-4">
                                            <div>
                                                <div className="fw-bold text-dark">{project.name}</div>
                                                <small className="text-muted">{project.clientName || 'No client specified'}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                                    style={{ width: '28px', height: '28px', fontSize: '11px', fontWeight: 'bold' }}
                                                >
                                                    {(project.projectManager || 'N').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="small fw-semibold">{project.projectManager || 'Not Assigned'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center" style={{ width: '120px' }}>
                                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                                    <div
                                                        className={`progress-bar ${project.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                                                        role="progressbar"
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="ms-2 small fw-bold">{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill ${project.status === 'Completed' ? 'bg-success' :
                                                project.status === 'At Risk' ? 'bg-warning text-dark' :
                                                    project.status === 'Delayed' ? 'bg-danger' : 'bg-primary'
                                                }`} style={{ fontSize: '0.75rem', minWidth: '80px', padding: '8px 12px' }}>
                                                {project.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                                            </small>
                                        </td>
                                        <td className="pe-4 text-end">
                                            <button className="btn btn-sm btn-light border-0">
                                                <i className="fas fa-ellipsis-v text-muted"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
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
