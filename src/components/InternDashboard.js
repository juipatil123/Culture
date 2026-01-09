import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import PasswordManagementModal from './PasswordManagementModal';
import ManagerNotesSection from './ManagerNotesSection';

const InternDashboard = ({
  userData,
  allUsers,
  allProjects,
  allTasks,
  showPasswordManagementModal,
  setShowPasswordManagementModal,
  handleResetPassword,
  handleDeleteUserFromPasswordModal,
  currentRole
}) => {
  // Get intern-specific data
  const getInternData = () => {
    if (!userData) return {
      assignedTasks: [],
      availableTasks: [],
      projects: [],
      completedTasks: 0,
      pendingTasks: 0,
      totalTasks: 0
    };

    // Filter tasks assigned to this intern
    const assignedTasks = allTasks ? allTasks.filter(task =>
      task.assignedTo === userData.email || task.assignedTo === userData.name
    ) : [];

    // Filter available tasks (unassigned or general)
    const availableTasks = allTasks ? allTasks.filter(task =>
      !task.assignedTo || task.assignedTo === 'Unassigned'
    ) : [];

    // Filter projects where intern is involved
    const projects = allProjects ? allProjects.filter(project =>
      project.assigned?.some(member =>
        member.email === userData.email || member.name === userData.name
      )
    ) : [];

    const completedTasks = assignedTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = assignedTasks.filter(task => task.status !== 'completed').length;

    return {
      assignedTasks,
      availableTasks,
      projects,
      completedTasks,
      pendingTasks,
      totalTasks: assignedTasks.length
    };
  };

  const internData = getInternData();

  return (
    <div>
      {/* Intern Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm" style={{ borderRadius: '12px' }}>
        <div>
          <h4 className="mb-1 fw-bold text-dark">
            <i className="fas fa-user-graduate me-2 text-primary"></i>
            Intern Dashboard
          </h4>
          <small className="text-muted">Welcome to your personalized intern dashboard</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* System Settings Button */}
          <button
            className="btn btn-outline-secondary btn-sm"
            type="button"
            title="Password Management"
            onClick={() => setShowPasswordManagementModal(true)}
          >
            <i className="fas fa-cog"></i>
          </button>

          {/* User Profile Info */}
          <div className="d-flex align-items-center ms-3">
            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2"
              style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}>
              {userData?.name?.charAt(0) || 'I'}
            </div>
            <div className="text-start">
              <small className="fw-bold d-block">{userData?.name || 'Intern'}</small>
              <small className="text-muted">Intern</small>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats Cards Row */}
      <div className="row mb-4">
        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '50px', height: '50px', backgroundColor: '#e3f2fd' }}>
                <i className="fas fa-tasks" style={{ fontSize: '20px', color: '#1976d2' }}></i>
              </div>
              <div className="text-muted small text-uppercase fw-bold mb-1">AVAILABLE TASKS</div>
              <div className="h3 mb-1 fw-bold text-dark">{internData.availableTasks.length}</div>
              <div className="text-muted small">0 Total</div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '50px', height: '50px', backgroundColor: '#fff3e0' }}>
                <i className="fas fa-project-diagram" style={{ fontSize: '20px', color: '#f57c00' }}></i>
              </div>
              <div className="text-muted small text-uppercase fw-bold mb-1">PROJECT</div>
              <div className="h3 mb-1 fw-bold text-dark">{internData.projects.length > 0 ? internData.projects[0].name : 'No Project'}</div>
              <div className="text-muted small">N/A</div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '50px', height: '50px', backgroundColor: '#e8f5e8' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '20px', color: '#4caf50' }}></i>
              </div>
              <div className="text-muted small text-uppercase fw-bold mb-1">PRIORITY</div>
              <div className="h3 mb-1 fw-bold text-dark">N/A</div>
              <div className="text-muted small">N/A</div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
            <div className="card-body p-4 text-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '50px', height: '50px', backgroundColor: '#fff3e0' }}>
                <i className="fas fa-calendar" style={{ fontSize: '20px', color: '#ff9800' }}></i>
              </div>
              <div className="text-muted small text-uppercase fw-bold mb-1">DUE DATE</div>
              <div className="h3 mb-1 fw-bold text-dark">Not Set</div>
              <div className="text-muted small">N/A</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        {/* My Daily Tasks */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3" style={{ borderRadius: '12px 12px 0 0' }}>
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-list-check me-2 text-primary"></i>My Daily Tasks
              </h5>
              <span className="badge bg-primary">{internData.assignedTasks.length} Tasks</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Task</th>
                      <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Project</th>
                      <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Deadline</th>
                      <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internData.assignedTasks.map((task, index) => (
                      <tr key={index}>
                        <td style={{ border: 'none', padding: '12px 16px' }}>
                          <div className="fw-semibold">{task.title}</div>
                          <small className="text-muted">Project: {task.project || 'No Project'}</small>
                        </td>
                        <td style={{ border: 'none', padding: '12px 16px' }}>
                          <small className="text-muted">{task.project || 'No Project'}</small>
                        </td>
                        <td style={{ border: 'none', padding: '12px 16px' }}>
                          <small className="text-muted">
                            {formatDate(task.dueDate)}
                          </small>
                        </td>
                        <td style={{ border: 'none', padding: '12px 16px' }}>
                          <span className={`badge ${task.status === 'completed' ? 'bg-success' :
                              task.status === 'in-progress' ? 'bg-info' :
                                'bg-secondary'
                            }`}>
                            {task.status === 'completed' ? 'Completed' :
                              task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {internData.assignedTasks.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-tasks fa-2x text-muted mb-2"></i>
                    <p className="text-muted">No tasks assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* My Projects */}
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3" style={{ borderRadius: '12px 12px 0 0' }}>
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-project-diagram me-2 text-success"></i>My Projects
              </h5>
            </div>
            <div className="card-body p-4">
              {internData.projects.length > 0 ? (
                internData.projects.map((project, index) => (
                  <div key={index} className="mb-3 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-1">{project.name}</h6>
                      <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
                          project.status === 'On Track' ? 'bg-primary' :
                            project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                    <small className="text-muted d-block mb-2">Client: {project.clientName}</small>
                    <div className="progress mb-2" style={{ height: '6px' }}>
                      <div className="progress-bar bg-primary" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <small className="text-muted">{project.progress}% Complete</small>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-project-diagram fa-2x text-muted mb-2"></i>
                  <p className="text-muted">No projects assigned yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create New Task Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4 text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-plus" style={{ fontSize: '24px' }}></i>
                </div>
                <h5 className="fw-bold">Create New Task</h5>
                <p className="text-muted">Add a new task and assign it to team members</p>
              </div>
              <button className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>Create Task
              </button>
              <div className="row mt-4 text-center">
                <div className="col-6">
                  <h4 className="text-warning mb-1">{internData.pendingTasks}</h4>
                  <small className="text-muted">Pending</small>
                </div>
                <div className="col-6">
                  <h4 className="text-success mb-1">{internData.completedTasks}</h4>
                  <small className="text-muted">Completed</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manager & Leader Notes Section */}
      <div className="row mt-4">
        <div className="col-12">
          <ManagerNotesSection
            employeeId={userData?.id || userData?._id}
            employeeName={userData?.name}
          />
        </div>
      </div>

      {/* Password Management Modal */}
      {showPasswordManagementModal && (
        <PasswordManagementModal
          show={showPasswordManagementModal}
          onHide={() => setShowPasswordManagementModal(false)}
          user={null} // Show all users view
          allUsers={allUsers}
          onResetPassword={handleResetPassword}
          onDeleteUser={handleDeleteUserFromPasswordModal}
          currentUserRole={currentRole}
        />
      )}
    </div>
  );
};

export default InternDashboard;