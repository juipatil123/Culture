import React, { useState } from 'react';
import './PMComponents.css';

const PMReports = ({ projects, tasks, teamMembers }) => {
  const [reportType, setReportType] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'all'

  // Filter helper functions
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= oneWeekAgo && d <= now;
  };

  const isThisMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return d >= oneMonthAgo && d <= now;
  };

  // Get filtered data based on report type
  const getFilteredData = () => {
    if (reportType === 'all') return { filteredProjects: projects, filteredTasks: tasks };

    const filteredProjects = projects.filter(p => {
      const date = p.startDate || p.createdAt;
      if (reportType === 'daily') return isToday(date);
      if (reportType === 'weekly') return isThisWeek(date);
      if (reportType === 'monthly') return isThisMonth(date);
      return true;
    });

    const filteredTasks = tasks.filter(t => {
      const date = t.dueDate || t.createdAt;
      if (reportType === 'daily') return isToday(date);
      if (reportType === 'weekly') return isThisWeek(date);
      if (reportType === 'monthly') return isThisMonth(date);
      return true;
    });

    return { filteredProjects, filteredTasks };
  };

  const { filteredProjects, filteredTasks } = getFilteredData();

  // Calculate statistics for filtered data
  const stats = {
    totalProjects: filteredProjects.length,
    completedProjects: filteredProjects.filter(p => p.status === 'Completed').length,
    inProgressProjects: filteredProjects.filter(p => p.status === 'In Progress' || p.status === 'On Track').length,
    pendingProjects: filteredProjects.filter(p => p.status === 'Pending' || p.status === 'Assigned').length,
    overdueProjects: filteredProjects.filter(p => p.status === 'Overdue' || p.status === 'At Risk' || p.status === 'Delayed').length,
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
    inProgressTasks: filteredTasks.filter(t => t.status === 'in-progress').length,
    pendingTasks: filteredTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
    teamSize: teamMembers.length,
    avgProjectProgress: filteredProjects.length > 0
      ? Math.round(filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / filteredProjects.length)
      : 0
  };

  return (
    <div className="pm-reports">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Reports & Analytics</h2>
          <p className="text-muted small mb-0">Track performance metrics and project status</p>
        </div>

        <div className="report-filter-toggle btn-group bg-white p-1 rounded-3 shadow-sm border">
          <button
            className={`btn btn-sm px-3 ${reportType === 'daily' ? 'btn-primary' : 'btn-white text-muted border-0'}`}
            onClick={() => setReportType('daily')}
          >Daily</button>
          <button
            className={`btn btn-sm px-3 ${reportType === 'weekly' ? 'btn-primary' : 'btn-white text-muted border-0'}`}
            onClick={() => setReportType('weekly')}
          >Weekly</button>
          <button
            className={`btn btn-sm px-3 ${reportType === 'monthly' ? 'btn-primary' : 'btn-white text-muted border-0'}`}
            onClick={() => setReportType('monthly')}
          >Monthly</button>
          <button
            className={`btn btn-sm px-3 ${reportType === 'all' ? 'btn-primary' : 'btn-white text-muted border-0'}`}
            onClick={() => setReportType('all')}
          >All Time</button>
        </div>
      </div>

      {stats.totalProjects === 0 && stats.totalTasks === 0 ? (
        <div className="empty-state text-center py-5 bg-white rounded-4 shadow-sm border mb-4">
          <i className="fas fa-chart-bar fa-3x text-muted opacity-25 mb-3"></i>
          <h5 className="fw-bold">No data for this period</h5>
          <p className="text-muted">There are no projects or tasks recorded in the {reportType} view.</p>
          <button className="btn btn-sm btn-outline-primary" onClick={() => setReportType('all')}>View All Time</button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-gradient-primary text-white" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-0 opacity-75 small">Active Projects</p>
                    <h2 className="fw-bold mb-0">{stats.totalProjects}</h2>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <i className="fas fa-project-diagram fa-lg"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-gradient-success text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-0 opacity-75 small">Tasks Completed</p>
                    <h2 className="fw-bold mb-0">{stats.completedTasks}</h2>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <i className="fas fa-check-double fa-lg"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-gradient-info text-white" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-0 opacity-75 small">Team Members</p>
                    <h2 className="fw-bold mb-0">{stats.teamSize}</h2>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <i className="fas fa-users fa-lg"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Project Status Charts */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-4">Project Status Breakdown</h5>
                <div className="status-distribution">
                  {[
                    { label: 'Completed', count: stats.completedProjects, color: 'bg-success' },
                    { label: 'In Progress', count: stats.inProgressProjects, color: 'bg-info' },
                    { label: 'Pending', count: stats.pendingProjects, color: 'bg-warning' },
                    { label: 'Overdue', count: stats.overdueProjects, color: 'bg-danger' }
                  ].map((item, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-muted small fw-bold">{item.label}</span>
                        <span className="fw-bold small">{item.count} projects</span>
                      </div>
                      <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                        <div
                          className={`progress-bar ${item.color}`}
                          style={{ width: `${stats.totalProjects > 0 ? (item.count / stats.totalProjects * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-4">Task Overview</h5>
                <div className="text-center mb-4">
                  <div className="circular-progress-placeholder position-relative d-inline-block">
                    <svg width="120" height="120" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#f0f0f0" strokeWidth="3"></circle>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#6366f1" strokeWidth="3"
                        strokeDasharray={`${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks * 100) : 0}, 100`}
                      ></circle>
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <h4 className="fw-bold mb-0">{stats.totalTasks > 0 ? Math.round(stats.completedTasks / stats.totalTasks * 100) : 0}%</h4>
                      <p className="text-muted smaller mb-0" style={{ fontSize: '0.6rem' }}>Done</p>
                    </div>
                  </div>
                </div>
                <div className="task-mini-stats">
                  <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span className="text-muted"><i className="fas fa-check-circle text-success me-2"></i>Completed</span>
                    <span className="fw-bold">{stats.completedTasks}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span className="text-muted"><i className="fas fa-spinner text-info me-2"></i>In Progress</span>
                    <span className="fw-bold">{stats.inProgressTasks}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted"><i className="fas fa-clock text-warning me-2"></i>Pending</span>
                    <span className="fw-bold">{stats.pendingTasks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="card-header bg-white p-3 border-0">
              <h5 className="fw-bold mb-0">Team Productivity ({reportType})</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Member</th>
                    <th>Projects Assigned</th>
                    <th>Avg. Project Progress</th>
                    <th>Tasks (Total)</th>
                    <th>Tasks Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.slice(0, 5).map((member, idx) => {
                    const memberTasks = filteredTasks.filter(t => t.assignedTo?.includes(member.name) || t.assignedTo?.includes(member.email));
                    const doneTasks = memberTasks.filter(t => t.status === 'completed').length;

                    const memberAssignedProjects = projects.filter(p => (p.assignedMembers || p.assigned || []).some(m => (typeof m === 'object' ? m.name : m) === member.name));
                    const avgProjectProgress = memberAssignedProjects.length > 0
                      ? Math.round(memberAssignedProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / memberAssignedProjects.length)
                      : 0;

                    return (
                      <tr key={idx}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-circle-sm bg-light text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                              {member.name?.charAt(0)}
                            </div>
                            <span className="small fw-bold">{member.name}</span>
                          </div>
                        </td>
                        <td>{memberAssignedProjects.length}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '60px' }}>
                              <div className="progress-bar bg-primary" style={{ width: `${avgProjectProgress}%` }}></div>
                            </div>
                            <span className="small fw-bold">{avgProjectProgress}%</span>
                          </div>
                        </td>
                        <td>{memberTasks.length}</td>
                        <td className="fw-bold">{doneTasks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PMReports;
