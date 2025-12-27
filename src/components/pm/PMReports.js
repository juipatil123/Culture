import React from 'react';
import './PMComponents.css';

const PMReports = ({ projects, tasks, teamMembers }) => {
  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === 'Completed').length,
    onTrackProjects: projects.filter(p => p.status === 'On Track').length,
    atRiskProjects: projects.filter(p => p.status === 'At Risk').length,
    delayedProjects: projects.filter(p => p.status === 'Delayed').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    pendingTasks: tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
    teamSize: teamMembers.length,
    avgProjectProgress: projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      : 0
  };

  return (
    <div className="pm-reports">
      <div className="page-header">
        <h2>Reports & Analytics</h2>
      </div>

      {/* Project Statistics */}
      <div className="report-section">
        <h4>Project Statistics</h4>
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-project-diagram text-primary"></i>
            <div>
              <h3>{stats.totalProjects}</h3>
              <p>Total Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-check-circle text-success"></i>
            <div>
              <h3>{stats.completedProjects}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-thumbs-up text-info"></i>
            <div>
              <h3>{stats.onTrackProjects}</h3>
              <p>On Track</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-exclamation-triangle text-warning"></i>
            <div>
              <h3>{stats.atRiskProjects}</h3>
              <p>At Risk</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-times-circle text-danger"></i>
            <div>
              <h3>{stats.delayedProjects}</h3>
              <p>Delayed</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-percentage text-primary"></i>
            <div>
              <h3>{stats.avgProjectProgress}%</h3>
              <p>Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="report-section">
        <h4>Task Statistics</h4>
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-tasks text-primary"></i>
            <div>
              <h3>{stats.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-check text-success"></i>
            <div>
              <h3>{stats.completedTasks}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-spinner text-info"></i>
            <div>
              <h3>{stats.inProgressTasks}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-clock text-warning"></i>
            <div>
              <h3>{stats.pendingTasks}</h3>
              <p>Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="report-section">
        <h4>Team Statistics</h4>
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-users text-primary"></i>
            <div>
              <h3>{stats.teamSize}</h3>
              <p>Team Members</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-chart-line text-success"></i>
            <div>
              <h3>{stats.teamSize > 0 ? Math.round(stats.totalProjects / stats.teamSize * 10) / 10 : 0}</h3>
              <p>Projects per Member</p>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-tasks text-info"></i>
            <div>
              <h3>{stats.teamSize > 0 ? Math.round(stats.totalTasks / stats.teamSize * 10) / 10 : 0}</h3>
              <p>Tasks per Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="report-section">
        <h4>Performance Overview</h4>
        <div className="performance-cards">
          <div className="performance-card">
            <h5>Project Completion Rate</h5>
            <div className="performance-bar">
              <div
                className="performance-fill bg-success"
                style={{ width: `${stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects * 100) : 0}%` }}
              ></div>
            </div>
            <p>{stats.totalProjects > 0 ? Math.round(stats.completedProjects / stats.totalProjects * 100) : 0}%</p>
          </div>
          <div className="performance-card">
            <h5>Task Completion Rate</h5>
            <div className="performance-bar">
              <div
                className="performance-fill bg-info"
                style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks * 100) : 0}%` }}
              ></div>
            </div>
            <p>{stats.totalTasks > 0 ? Math.round(stats.completedTasks / stats.totalTasks * 100) : 0}%</p>
          </div>
          <div className="performance-card">
            <h5>Average Project Progress</h5>
            <div className="performance-bar">
              <div
                className="performance-fill bg-primary"
                style={{ width: `${stats.avgProjectProgress}%` }}
              ></div>
            </div>
            <p>{stats.avgProjectProgress}%</p>
          </div>
        </div>
      </div>

      {/* Project Status Distribution */}
      <div className="report-section">
        <h4>Project Status Distribution</h4>
        <div className="distribution-chart">
          {stats.totalProjects > 0 ? (
            <>
              <div className="distribution-item">
                <span className="distribution-label">Completed</span>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill bg-success"
                    style={{ width: `${(stats.completedProjects / stats.totalProjects * 100)}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{stats.completedProjects}</span>
              </div>
              <div className="distribution-item">
                <span className="distribution-label">On Track</span>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill bg-info"
                    style={{ width: `${(stats.onTrackProjects / stats.totalProjects * 100)}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{stats.onTrackProjects}</span>
              </div>
              <div className="distribution-item">
                <span className="distribution-label">At Risk</span>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill bg-warning"
                    style={{ width: `${(stats.atRiskProjects / stats.totalProjects * 100)}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{stats.atRiskProjects}</span>
              </div>
              <div className="distribution-item">
                <span className="distribution-label">Delayed</span>
                <div className="distribution-bar">
                  <div
                    className="distribution-fill bg-danger"
                    style={{ width: `${(stats.delayedProjects / stats.totalProjects * 100)}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{stats.delayedProjects}</span>
              </div>
            </>
          ) : (
            <p className="text-muted">No project data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PMReports;
