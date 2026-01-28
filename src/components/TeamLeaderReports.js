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

const TeamLeaderReports = ({ stats, projects = [], tasks = [], teamMembers = [] }) => {
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

    // Stats calculations
    const completedTasksCount = filteredTasks.filter(t => (t.status || '').toLowerCase() === 'completed').length;
    const inProgressTasksCount = filteredTasks.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s === 'in progress' || s === 'in-progress' || s === 'active';
    }).length;
    const pendingTasksCount = Math.max(0, filteredTasks.length - completedTasksCount - inProgressTasksCount);

    const taskCompletionRate = filteredTasks.length > 0 ? Math.round((completedTasksCount / filteredTasks.length) * 100) : 0;

    // Use full projects for breakdown, but filtered for summary
    const completedProjectsCount = projects.filter(p => {
        const s = (p.status || p.projectStatus || '').toLowerCase();
        return s.includes('completed');
    }).length;

    const onTrackProjectsCount = projects.filter(p => {
        const s = (p.status || p.projectStatus || '').toLowerCase();
        return s.includes('on track') || s.includes('on-track') || s === 'active' || s.includes('in progress') || s.includes('in-progress') || s === 'assigned';
    }).length;

    const atRiskProjectsCount = projects.filter(p => {
        const s = (p.status || p.projectStatus || '').toLowerCase();
        return s.includes('at risk') || s.includes('at-risk');
    }).length;

    const delayedProjectsCount = projects.filter(p => {
        const s = (p.status || p.projectStatus || '').toLowerCase();
        return s.includes('delayed') || s === 'overdue';
    }).length;

    // Time-filtered completed projects for the summary card
    const timeFilteredCompletedCount = filteredProjects.filter(p => {
        const s = (p.status || p.projectStatus || '').toLowerCase();
        return s.includes('completed');
    }).length;

    return (
        <div className="container-fluid p-0">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h4 className="fw-bold mb-1">Team Reports</h4>
                    <div className="d-flex align-items-center text-muted small">
                        <i className="fas fa-chart-bar me-2 text-primary"></i>
                        <span>Dynamic {timeRange} overview of team performance</span>
                    </div>
                </div>
                <div className="d-flex align-items-center bg-white p-2 rounded-3 shadow-sm border">
                    <div className="btn-group me-3" role="group">
                        {['Weekly', 'Monthly', 'All Time'].map((range) => (
                            <button
                                key={range}
                                type="button"
                                className={`btn btn-sm px-3 fw-bold ${timeRange === range ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                onClick={() => setTimeRange(range)}
                                style={{ borderRadius: '8px', transition: 'all 0.2s' }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-outline-primary btn-sm rounded-3 d-flex align-items-center fw-bold" onClick={() => window.print()}>
                        <i className="fas fa-download me-2"></i>Export
                    </button>
                </div>
            </div>

            {/* Summary Cards - Responsive Design */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', backgroundColor: '#fff' }}>
                        <div className="card-body p-4 position-relative">
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#28a745' }}>
                                    <i className="fas fa-folder-check text-white"></i>
                                </div>
                                <h6 className="text-dark mb-0 fw-bold opacity-75">Projects Completed</h6>
                            </div>
                            <h2 className="fw-bold mb-0 display-6">{timeFilteredCompletedCount}</h2>
                            <div className="position-absolute bottom-0 end-0 p-3 mb-2">
                                <small className="text-success fw-bold d-flex align-items-center">
                                    <i className="fas fa-arrow-up me-1 small"></i> Total Active: {projects.length - completedProjectsCount}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', backgroundColor: '#fff' }}>
                        <div className="card-body p-4 position-relative">
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#6f42c1' }}>
                                    <i className="fas fa-tasks text-white"></i>
                                </div>
                                <h6 className="text-dark mb-0 fw-bold opacity-75">Tasks Completed</h6>
                            </div>
                            <h2 className="fw-bold mb-0 display-6">{completedTasksCount}</h2>
                            <div className="position-absolute bottom-0 end-0 p-3 mb-2">
                                <small className="fw-bold d-flex align-items-center" style={{ color: '#6f42c1' }}>
                                    Rate: {taskCompletionRate}%
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', backgroundColor: '#fff' }}>
                        <div className="card-body p-4 position-relative">
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#ffc107' }}>
                                    <i className="fas fa-users text-white"></i>
                                </div>
                                <h6 className="text-dark mb-0 fw-bold opacity-75">Team Members</h6>
                            </div>
                            <h2 className="fw-bold mb-0 display-6">{teamMembers.length}</h2>
                            <div className="position-absolute bottom-0 end-0 p-3 mb-2">
                                <small className="text-muted fw-bold small">Total Workforce</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row - Responsive Design */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-white py-4 border-0 ps-4">
                            <h5 className="fw-bold mb-0">Project Status Breakdown</h5>
                        </div>
                        <div className="card-body px-4 pb-4 pt-0">
                            {[
                                { label: 'Completed', count: completedProjectsCount, color: '#10b981' },
                                { label: 'On Track', count: onTrackProjectsCount, color: '#3b82f6' },
                                { label: 'At Risk', count: atRiskProjectsCount, color: '#f59e0b' },
                                { label: 'Delayed', count: delayedProjectsCount, color: '#ef4444' }
                            ].map((item, idx) => (
                                <div key={idx} className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted fw-bold small">{item.label}</span>
                                        <span className="fw-bold small">{item.count} projects</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            className="progress-bar transition-all"
                                            style={{
                                                width: `${projects.length > 0 ? (item.count / projects.length) * 100 : 0}%`,
                                                backgroundColor: item.color,
                                                borderRadius: '4px'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-white py-4 border-0 ps-4">
                            <h5 className="fw-bold mb-0">Task Overview</h5>
                        </div>
                        <div className="card-body d-flex flex-column align-items-center justify-content-center p-4">
                            {/* Donut Chart with CSS */}
                            <div className="position-relative mb-4" style={{ width: '200px', height: '200px' }}>
                                <svg viewBox="0 0 36 36" className="w-100 h-100">
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="#f3f4f6" strokeWidth="3"></circle>
                                    <circle
                                        cx="18" cy="18" r="16" fill="none" stroke="#3b82f6" strokeWidth="3"
                                        strokeDasharray={`${taskCompletionRate}, 100`}
                                        strokeDashoffset="25"
                                        style={{ transition: 'stroke-dasharray 1s ease', strokeLinecap: 'round' }}
                                    ></circle>
                                </svg>
                                <div className="position-absolute top-50 start-50 translate-middle text-center">
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>{taskCompletionRate}%</h2>
                                    <small className="text-muted d-block fw-bold" style={{ fontSize: '0.75rem', marginTop: '-5px' }}>Done</small>
                                </div>
                            </div>

                            <div className="w-100 px-lg-3">
                                {[
                                    { label: 'Completed', count: completedTasksCount, color: '#10b981' },
                                    { label: 'In Progress', count: inProgressTasksCount, color: '#3b82f6' },
                                    { label: 'Pending', count: pendingTasksCount, color: '#f59e0b' }
                                ].map((item, idx) => (
                                    <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', backgroundColor: item.color }}></div>
                                            <span className="text-muted small fw-bold">{item.label}</span>
                                        </div>
                                        <span className="fw-bold small">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TeamLeaderReports;
