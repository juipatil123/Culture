import React from 'react';

// Simple SVG Line Chart Component
const SimpleLineChart = ({ data, color = '#4361ee' }) => {
    const max = Math.max(...data) || 100;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-100 h-100" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
            />
            {/* Area fill */}
            <polygon
                fill={color}
                fillOpacity="0.1"
                points={`0,100 ${points} 100,100`}
            />
            {/* Data points */}
            {data.map((val, i) => (
                <circle
                    key={i}
                    cx={(i / (data.length - 1)) * 100}
                    cy={100 - (val / max) * 100}
                    r="1.5"
                    fill={color}
                />
            ))}
        </svg>
    );
};

// Simple SVG Doughnut Chart Component
const SimpleDoughnutChart = ({ data, colors }) => {
    const total = data.reduce((a, b) => a + b, 0) || 1;
    let cumulative = 0;

    // Create chart segments
    const segments = data.map((value, i) => {
        const percentage = (value / total);
        const circumference = 2 * Math.PI * 15.9155; // r=15.9155 gives circumference approx 100
        const dashArray = `${percentage * 100} ${100 - percentage * 100}`;
        const offset = 25 - cumulative * 100; // Start from top (25% offset)
        cumulative += percentage;

        return (
            <circle
                key={i}
                r="15.9155"
                cx="21"
                cy="21"
                fill="transparent"
                stroke={colors[i]}
                strokeWidth="5"
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
            />
        );
    });

    return (
        <svg viewBox="0 0 42 42" className="w-100 h-100">
            <circle r="15.9155" cx="21" cy="21" fill="#fff" />
            {segments}
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="0.3rem" fill="#6c757d">
                Total: {total}
            </text>
        </svg>
    );
};

const TeamLeaderReports = ({ stats, projects = [], tasks = [] }) => {
    // Safe defaults if props are missing
    const safeStats = stats || {
        totalTasks: 0,
        completedTasks: 0,
        activeProjects: 0,
        performance: 0,
    };

    // Mock data generation
    const performanceTrends = [65, 78, 82, 75, 88, safeStats.performance || 85];

    const projectCounts = [
        projects.filter(p => p.status === 'Completed').length,
        projects.filter(p => p.status === 'In Progress').length,
        projects.filter(p => p.status === 'Overdue').length,
        projects.filter(p => p.status === 'Not Started').length
    ];

    const projectColors = [
        '#28a745', // Completed
        '#4361ee', // In Progress
        '#dc3545', // Overdue
        '#6c757d'  // Not Started
    ];

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Team Reports</h4>
                    <p className="text-muted mb-0">Overview of your team's performance metrics</p>
                </div>
                <div>
                    <div className="btn-group">
                        <button className="btn btn-outline-secondary btn-sm active">Month</button>
                        <button className="btn btn-outline-secondary btn-sm">Quarter</button>
                        <button className="btn btn-outline-secondary btn-sm">Year</button>
                    </div>
                    <button className="btn btn-primary btn-sm ms-2">
                        <i className="fas fa-download me-2"></i>Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Project Completion</h6>
                            <h3 className="fw-bold mb-0">92%</h3>
                            <small className="text-success"><i className="fas fa-arrow-up me-1"></i>+4.2%</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Task Efficiency</h6>
                            <h3 className="fw-bold mb-0">4.8h</h3>
                            <small className="text-danger"><i className="fas fa-arrow-down me-1"></i>-0.5h</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Team Velocity</h6>
                            <h3 className="fw-bold mb-0">{safeStats.completedTasks}</h3>
                            <small className="text-success"><i className="fas fa-arrow-up me-1"></i>+12%</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Hours Logged</h6>
                            <h3 className="fw-bold mb-0">164h</h3>
                            <small className="text-muted">This week</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold mb-0">Performance Trends</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '300px', width: '100%', padding: '20px' }}>
                                <SimpleLineChart data={performanceTrends} />
                                <div className="d-flex justify-content-between mt-2 text-muted small">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-0">
                            <h6 className="fw-bold mb-0">Project Distribution</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '200px', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <SimpleDoughnutChart data={projectCounts} colors={projectColors} />
                            </div>
                            <div className="mt-3">
                                <div className="d-flex align-items-center mb-1 small">
                                    <span className="badge rounded-circle me-2 p-1" style={{ background: projectColors[0] }}> </span> Completed ({projectCounts[0]})
                                </div>
                                <div className="d-flex align-items-center mb-1 small">
                                    <span className="badge rounded-circle me-2 p-1" style={{ background: projectColors[1] }}> </span> In Progress ({projectCounts[1]})
                                </div>
                                <div className="d-flex align-items-center mb-1 small">
                                    <span className="badge rounded-circle me-2 p-1" style={{ background: projectColors[2] }}> </span> Overdue ({projectCounts[2]})
                                </div>
                                <div className="d-flex align-items-center mb-1 small">
                                    <span className="badge rounded-circle me-2 p-1" style={{ background: projectColors[3] }}> </span> Not Started ({projectCounts[3]})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Completions Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-0">
                    <h6 className="fw-bold mb-0">Recent Completed Tasks</h6>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Task</th>
                                    <th>Assignee</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.filter(t => t.status === 'completed').slice(0, 5).map(task => (
                                    <tr key={task.id || Math.random()}>
                                        <td className="ps-4 fw-medium">{task.title}</td>
                                        <td>{task.assignedTo || 'Unassigned'}</td>
                                        <td>{new Date().toLocaleDateString()}</td>
                                        <td><span className="badge bg-success bg-opacity-10 text-success">Completed</span></td>
                                    </tr>
                                ))}
                                {tasks.filter(t => t.status === 'completed').length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">No recently completed tasks</td>
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

export default TeamLeaderReports;
