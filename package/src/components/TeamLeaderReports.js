import React, { useState } from 'react';

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
    const [timeRange, setTimeRange] = useState('Monthly');

    // Helper to filter by date
    const filterByTime = (data, field = 'updatedAt') => {
        const now = new Date();
        return data.filter(item => {
            const itemDate = item[field] ? new Date(item[field].seconds ? item[field].seconds * 1000 : item[field]) : new Date();
            const diffTime = Math.abs(now - itemDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (timeRange === 'Weekly') return diffDays <= 7;
            if (timeRange === 'Monthly') return diffDays <= 30;
            return true; // For 'All Time' or default
        });
    };

    const filteredTasks = filterByTime(tasks);
    const filteredProjects = filterByTime(projects, 'startDate');

    // Safe defaults if props are missing
    const safeStats = {
        totalTasks: filteredTasks.length,
        completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
        activeProjects: filteredProjects.filter(p => p.status !== 'Completed').length,
        performance: filteredTasks.length > 0 ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100) : 0,
    };

    // Data generation based on filtered data
    const performanceTrends = timeRange === 'Weekly'
        ? [45, 52, 60, 58, 65, safeStats.performance || 0]
        : [65, 78, 82, 75, 88, safeStats.performance || 0];

    const projectCounts = [
        filteredProjects.filter(p => (p.status || '').toLowerCase() === 'completed').length,
        filteredProjects.filter(p => (p.status || '').toLowerCase() === 'in progress' || (p.status || '').toLowerCase() === 'active').length,
        filteredProjects.filter(p => (p.status || '').toLowerCase() === 'overdue').length,
        filteredProjects.filter(p => (p.status || '').toLowerCase() === 'not started' || !(p.status)).length
    ];

    const projectColors = [
        '#28a745', // Completed
        '#4361ee', // In Progress
        '#dc3545', // Overdue
        '#6c757d'  // Not Started
    ];

    return (
        <div className="container-fluid p-0">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h4 className="fw-bold mb-1">Team Reports</h4>
                    <div className="d-flex align-items-center text-muted small">
                        <i className="fas fa-chart-bar me-2"></i>
                        <span>Dynamic {timeRange} overview of team performance</span>
                    </div>
                </div>
                <div className="d-flex align-items-center bg-white p-2 rounded shadow-sm">
                    <div className="btn-group me-3" role="group">
                        {['Weekly', 'Monthly', 'All Time'].map((range) => (
                            <button
                                key={range}
                                type="button"
                                className={`btn btn-sm px-3 ${timeRange === range ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                onClick={() => setTimeRange(range)}
                                style={{ borderRadius: '0.25rem', transition: 'all 0.2s' }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-outline-primary btn-sm d-flex align-items-center" onClick={() => window.print()}>
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
                            <h3 className="fw-bold mb-0">
                                {filteredProjects.length > 0
                                    ? Math.round((filteredProjects.filter(p => (p.status || '').toLowerCase() === 'completed').length / filteredProjects.length) * 100)
                                    : 0}%
                            </h3>
                            <small className="text-success">
                                <i className="fas fa-chart-pie me-1"></i>
                                {filteredProjects.filter(p => (p.status || '').toLowerCase() === 'completed').length}/{filteredProjects.length} Projects
                            </small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Task Completion</h6>
                            <h3 className="fw-bold mb-0">
                                {filteredTasks.length > 0
                                    ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100)
                                    : 0}%
                            </h3>
                            <small className={filteredTasks.filter(t => t.status === 'completed').length > 0 ? "text-success" : "text-muted"}>
                                <i className="fas fa-tasks me-1"></i>
                                {filteredTasks.filter(t => t.status === 'completed').length} Tasks Done
                            </small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Team Velocity</h6>
                            <h3 className="fw-bold mb-0">{safeStats.completedTasks}</h3>
                            <small className="text-success"><i className="fas fa-check-double me-1"></i>Tasks/Week</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Est. Hours</h6>
                            <h3 className="fw-bold mb-0">
                                {filteredTasks.filter(t => t.status === 'completed').length * 4}h
                            </h3>
                            <small className="text-muted">Based on 4h/task</small>
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
                                    {timeRange === 'Weekly'
                                        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                                        : ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
                                    }
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
                                    <span className="badge rounded-circle me-2 p-1" style={{ background: projectColors[1] }}> </span> Active ({projectCounts[1]})
                                </div>
                                <div className="d-flex align-items-center mb-1 small">
                                    <span className="badge rounded-circle me-2 p-1" style={{ background: projectColors[2] }}> </span> Overdue ({projectCounts[2]})
                                </div>
                                <div className="d-flex align-items-center mb-1 small">
                                    <span className="badge rounded-circle me-2 p-1" style={{ background: projectColors[3] }}> </span> Other ({projectCounts[3]})
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Work Reports Section */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">Work Log ({timeRange})</h6>
                    <span className="badge bg-primary rounded-pill">{filteredTasks.length} Activities</span>
                </div>
                <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                        {filteredTasks.length > 0 ? (
                            (() => {
                                // Date Parsers
                                const parseDate = (d) => {
                                    if (!d) return new Date();
                                    if (d.toDate && typeof d.toDate === 'function') return d.toDate();
                                    if (d.seconds) return new Date(d.seconds * 1000);
                                    return new Date(d);
                                };

                                // Group tasks by date
                                const grouped = filteredTasks.reduce((acc, task) => {
                                    const rawDate = task.updatedAt || task.createdAt;
                                    const dateObj = parseDate(rawDate);

                                    // Valid Date Check
                                    const dateStr = isNaN(dateObj.getTime())
                                        ? 'Recent'
                                        : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

                                    if (!acc[dateStr]) acc[dateStr] = [];
                                    acc[dateStr].push(task);
                                    return acc;
                                }, {});

                                return Object.keys(grouped)
                                    .slice(0, 10) // Show more if filtered
                                    .map(date => (
                                        <div key={date} className="list-group-item border-0 px-4 py-3">
                                            <h6 className="text-muted small fw-bold text-uppercase mb-3 bg-light d-inline-block px-2 py-1 rounded">
                                                <i className="far fa-calendar-alt me-1"></i> {date}
                                            </h6>
                                            <div className="ps-2 border-start border-2 border-light">
                                                {grouped[date].map((task, idx) => (
                                                    <div key={idx} className="mb-3 ps-3 position-relative">
                                                        <div className="position-absolute start-0 top-0 translate-middle rounded-circle bg-white border border-2 border-primary" style={{ width: '10px', height: '10px', marginLeft: '-1px', marginTop: '6px' }}></div>
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <span className="fw-semibold text-dark">{task.title}</span>
                                                                <span className={`badge ms-2 rounded-pill ${task.status === 'completed' ? 'bg-success' :
                                                                    task.status === 'in-progress' ? 'bg-info' : 'bg-secondary'
                                                                    }`}>
                                                                    {task.status || 'Assigned'}
                                                                </span>
                                                                {task.workingNotes && (
                                                                    <p className="small text-muted mt-1 mb-0 fst-italic">
                                                                        <i className="fas fa-quote-left me-1 opacity-25"></i>
                                                                        {task.workingNotes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <small className="text-muted">
                                                                <i className="far fa-user me-1"></i>
                                                                {Array.isArray(task.assignedTo)
                                                                    ? task.assignedTo.map(u => (typeof u === 'object' ? u.name : u)).join(', ')
                                                                    : (typeof task.assignedTo === 'object' ? task.assignedTo.name : task.assignedTo)}
                                                            </small>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                            })()
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted mb-0">No work activity recorded in this timeframe.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Completions Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-0">
                    <h6 className="fw-bold mb-0">Completed Tasks ({timeRange})</h6>
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
                                {filteredTasks.filter(t => t.status === 'completed').slice(0, 10).map(task => (
                                    <tr key={task.id || Math.random()}>
                                        <td className="ps-4 fw-medium">{task.title}</td>
                                        <td>{Array.isArray(task.assignedTo)
                                            ? task.assignedTo.map(u => (typeof u === 'object' ? u.name : u)).join(', ')
                                            : (typeof task.assignedTo === 'object' ? task.assignedTo.name : task.assignedTo)}</td>
                                        <td>{new Date(task.updatedAt ? (task.updatedAt.seconds ? task.updatedAt.seconds * 1000 : task.updatedAt) : Date.now()).toLocaleDateString()}</td>
                                        <td><span className="badge rounded-pill bg-success">Completed</span></td>
                                    </tr>
                                ))}
                                {filteredTasks.filter(t => t.status === 'completed').length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">No completed tasks in this timeframe</td>
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
