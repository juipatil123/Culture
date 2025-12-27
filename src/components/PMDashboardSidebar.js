import React from 'react';
import PasswordManagementModal from './PasswordManagementModal';

const PMDashboardSidebar = ({
  pmActiveSection,
  setPmActiveSection,
  getProjectManagerData,
  setShowAddTaskModal,
  setShowAddProjectModal,
  setShowAddUserModal,
  getUserWorkStatus,
  allUsers,
  assignedTasks,
  showPasswordManagementModal,
  setShowPasswordManagementModal,
  handleResetPassword,
  handleDeleteUserFromPasswordModal,
  currentRole,
  // New task assignment props
  selectedEmployeeForTask,
  setSelectedEmployeeForTask,
  selectedProjectForTask,
  setSelectedProjectForTask,
  newTaskName,
  setNewTaskName,
  taskPriority,
  setTaskPriority,
  taskDueDate,
  setTaskDueDate,
  handleQuickTaskAssignment,
  updateTaskStatus,
  userData
}) => {
  // Get project manager data with safety checks
  const pmData = getProjectManagerData ? getProjectManagerData() : {
    managedProjects: [],
    relatedTasks: [],
    teamMembers: [],
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    teamSize: 0
  };

  // Calculate dynamic stats
  const totalUsers = allUsers ? allUsers.length : 0;
  const activeUsers = Array.isArray(allUsers) ? allUsers.filter(u => getUserWorkStatus && getUserWorkStatus(u).status === 'Active').length : 0;
  const activeProjects = pmData.activeProjects;
  const assignedTasksCount = Array.isArray(assignedTasks) ? assignedTasks.length : 0;

  // Dynamic Project Status Logic
  const calculateProjectStatus = (project) => {
    const currentDate = new Date();
    const endDate = project.endDate ? new Date(project.endDate) : null;

    // Check if project has assigned users
    const hasAssignedUsers = project.assigned && project.assigned.length > 0;
    const hasProjectManager = project.projectManager;

    // Check if project has tasks assigned
    const projectTasks = Array.isArray(assignedTasks) ? assignedTasks.filter(task =>
      task.project === project.name || task.projectId === project.id
    ) : [];

    // Rule 1: When project is assigned to user but no tasks yet
    if ((hasAssignedUsers || hasProjectManager) && projectTasks.length === 0) {
      return 'Assigned';
    }

    // Rule 2: When tasks are added to employees with assigned project
    if (projectTasks.length > 0 && projectTasks.some(task => task.status === 'in-progress' || task.status === 'assigned')) {
      // Check if project is delayed (exceeded end date)
      if (endDate && currentDate > endDate && project.status !== 'Completed') {
        return 'Delayed';
      }
      return 'In Progress';
    }

    // Rule 3: Project exceeded end date but still ongoing
    if (endDate && currentDate > endDate && project.status !== 'Completed') {
      return 'Delayed';
    }

    // Rule 4: Only PM can mark as completed (this is handled in UI)
    if (project.status === 'Completed') {
      return 'Completed';
    }

    // Default status 
    return project.status || 'Assigned';
  };

  // Update project status dynamically
  const getUpdatedProjects = () => {
    return Array.isArray(pmData.managedProjects) ? pmData.managedProjects.map(project => ({
      ...project,
      dynamicStatus: calculateProjectStatus(project)
    })) : [];
  };

  return (
    <div>
      {/* Main Content - Full Width */}
      <div>
        {/* Dashboard Section */}
        {pmActiveSection === 'dashboard' && (
          <div>

            {/* Recent Activity and Create Task Row */}
            <div className="row mb-4">
              <div className="col-lg-8 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3" style={{ borderRadius: '12px 12px 0 0' }}>
                    <h5 className="mb-0 fw-bold text-dark">
                      <i className="fas fa-clock me-2 text-success"></i>Recent Activity
                    </h5>
                    <button className="btn btn-outline-success btn-sm">
                      View All
                    </button>
                  </div>
                  <div className="card-body p-0">
                    <div className="activity-list">
                      {/* Task Completed Activity */}
                      <div className="d-flex align-items-start p-3 border-bottom">
                        <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                          <i className="fas fa-check"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="fw-bold mb-1 text-dark">Task Completed</h6>
                              <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                Review development team implementation has been completed
                              </p>
                              <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-user me-1"></i>
                                <span className="me-3">Jane Smith</span>
                                <i className="fas fa-flag me-1 text-primary"></i>
                                <span>E-learning Platform</span>
                              </div>
                            </div>
                            <small className="text-muted">11/23/2025</small>
                          </div>
                        </div>
                      </div>

                      {/* New Task Assigned Activity */}
                      <div className="d-flex align-items-start p-3 border-bottom">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                          <i className="fas fa-tasks"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="fw-bold mb-1 text-dark">New Task Assigned</h6>
                              <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                Review development team implementations assigned to John Doe
                              </p>
                              <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.8rem' }}>
                                <i className="fas fa-user me-1"></i>
                                <span className="me-3">John Doe</span>
                                <i className="fas fa-flag me-1 text-primary"></i>
                                <span>E-learning Platform</span>
                              </div>
                            </div>
                            <small className="text-muted">11/23/2025</small>
                          </div>
                        </div>
                      </div>

                      {/* Project Update Activity */}
                      <div className="d-flex align-items-start p-3">
                        <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                          <i className="fas fa-info"></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="fw-bold mb-1 text-dark">Project Update</h6>
                              <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                E-learning Platform - In progress
                              </p>
                              <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                                Details: Completed UI mockups for admin dashboard
                              </p>
                              <div className="progress mb-2" style={{ height: '4px' }}>
                                <div className="progress-bar bg-info" style={{ width: '75%' }}></div>
                              </div>
                            </div>
                            <small className="text-muted">11/23/2025</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)' }}>
                  <div className="card-body p-4 d-flex flex-column justify-content-center">
                    {!selectedEmployeeForTask ? (
                      // Initial State - Create New Task UI
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                            style={{
                              width: '80px',
                              height: '80px',
                              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                              border: '3px solid #ffffff',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                            <i className="fas fa-plus" style={{ fontSize: '28px', color: '#6366f1' }}></i>
                          </div>
                        </div>

                        <h4 className="fw-bold text-dark mb-2">Create New Task</h4>
                        <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                          Add a new task and assign it to team members
                        </p>

                        <div className="d-grid gap-3">
                          <button
                            className="btn btn-primary py-3 fw-bold"
                            style={{
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                              border: 'none',
                              fontSize: '1rem',
                              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
                            }}
                            onClick={() => setSelectedEmployeeForTask('select')}
                          >
                            <i className="fas fa-plus me-2"></i>Create Task
                          </button>

                          <button
                            className="btn btn-outline-primary py-2"
                            style={{ borderRadius: '12px', borderWidth: '2px' }}
                            onClick={() => setPmActiveSection('tasks')}
                          >
                            <i className="fas fa-list me-2"></i>View All Tasks
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Task Creation Form
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                          <h5 className="mb-0 fw-bold text-dark">
                            <i className="fas fa-tasks me-2 text-primary"></i>New Task Assignment
                          </h5>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              setSelectedEmployeeForTask('');
                              setSelectedProjectForTask('');
                              setNewTaskName('');
                              setTaskPriority('medium');
                              setTaskDueDate(new Date().toISOString().split('T')[0]);
                            }}
                          >
                            <i className="fas fa-arrow-left me-1"></i>Back
                          </button>
                        </div>

                        {/* Task Assignment Form */}
                        <div className="mb-3">
                          <label className="form-label fw-semibold text-dark">Select Employee(s)</label>
                          <input
                            type="text"
                            className="form-control"
                            style={{ borderRadius: '8px', border: '2px solid #e5e7eb' }}
                            placeholder="Type employee name(s) or select from dropdown..."
                            value={selectedEmployeeForTask === 'select' ? '' : selectedEmployeeForTask}
                            onChange={(e) => {
                              setSelectedEmployeeForTask(e.target.value);
                              // Auto-populate project when single employee is selected
                              const employeeNames = e.target.value.split(',').map(name => name.trim());
                              if (employeeNames.length === 1 && employeeNames[0]) {
                                const employee = Array.isArray(allUsers) ? allUsers.find(u => u.name === employeeNames[0]) : null;
                                if (employee && employee.assignedProject) {
                                  setSelectedProjectForTask(employee.assignedProject);
                                }
                              }
                            }}
                            list="employeeList"
                          />
                          <datalist id="employeeList">
                            {(Array.isArray(allUsers) ? allUsers : [])
                              .filter(user => user.role === 'employee' || user.role === 'intern')
                              .map((employee, index) => (
                                <option key={index} value={employee.name}>
                                  {employee.name} - {employee.department || 'No Dept'}
                                </option>
                              ))
                            }
                          </datalist>
                          <small className="text-muted">Tip: Type multiple names separated by commas for multiple assignments</small>
                        </div>

                        {selectedEmployeeForTask && selectedEmployeeForTask !== 'select' && (
                          <>
                            <div className="mb-3">
                              <label className="form-label fw-semibold text-dark">Project</label>
                              <input
                                type="text"
                                className="form-control"
                                style={{ borderRadius: '8px', border: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}
                                value={selectedProjectForTask || 'No project assigned'}
                                readOnly
                              />
                              <small className="text-muted">Auto-populated based on employee's current project</small>
                            </div>

                            <div className="mb-3">
                              <label className="form-label fw-semibold text-dark">Task Name</label>
                              <input
                                type="text"
                                className="form-control"
                                style={{ borderRadius: '8px', border: '2px solid #e5e7eb' }}
                                placeholder="Enter task description..."
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                              />
                            </div>

                            <div className="row mb-3">
                              <div className="col-6">
                                <label className="form-label fw-semibold text-dark">Priority</label>
                                <select
                                  className="form-select"
                                  style={{ borderRadius: '8px', border: '2px solid #e5e7eb' }}
                                  value={taskPriority}
                                  onChange={(e) => setTaskPriority(e.target.value)}
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="urgent">Urgent</option>
                                </select>
                              </div>
                              <div className="col-6">
                                <label className="form-label fw-semibold text-dark">Due Date</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  style={{ borderRadius: '8px', border: '2px solid #e5e7eb' }}
                                  value={taskDueDate}
                                  onChange={(e) => setTaskDueDate(e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                            </div>

                            <div className="d-grid gap-2 mt-4">
                              <button
                                className="btn btn-primary py-3 fw-bold"
                                style={{
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                  border: 'none',
                                  fontSize: '1rem',
                                  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
                                }}
                                onClick={handleQuickTaskAssignment}
                                disabled={!newTaskName.trim()}
                              >
                                <i className="fas fa-paper-plane me-2"></i>Assign Task
                              </button>
                            </div>
                          </>
                        )}

                        {/* Recent Task Assignments */}
                        {Array.isArray(assignedTasks) && assignedTasks.filter(task => task.assignedBy === userData?.name).length > 0 && (
                          <div className="mt-4 pt-3 border-top">
                            <h6 className="fw-semibold text-dark mb-3">Recent Assignments</h6>
                            <div className="recent-tasks" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                              {(Array.isArray(assignedTasks) ? assignedTasks : [])
                                .filter(task => task.assignedBy === userData?.name)
                                .slice(0, 2)
                                .map((task, index) => (
                                  <div key={index} className="d-flex align-items-center mb-2 p-3 rounded"
                                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <div className="flex-grow-1">
                                      <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{task.title}</div>
                                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        {task.assignedTo} • {task.status}
                                      </div>
                                    </div>
                                    <span className={`badge ${task.status === 'completed' ? 'bg-success' :
                                        task.status === 'in-progress' ? 'bg-info' :
                                          task.status === 'assigned' ? 'bg-primary' : 'bg-secondary'
                                      }`} style={{ fontSize: '0.75rem' }}>
                                      {task.status === 'assigned' ? 'Assigned' :
                                        task.status === 'completed' ? 'Completed' :
                                          task.status === 'in-progress' ? 'In Progress' :
                                            task.status === 'in-review' ? 'In Review' : 'To Do'}
                                    </span>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Projects Row */}
            <div className="row">
              <div className="col-12 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3" style={{ borderRadius: '12px 12px 0 0' }}>
                    <h5 className="mb-0 fw-bold text-dark">
                      <i className="fas fa-project-diagram me-2 text-primary"></i>Recent Projects
                    </h5>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setPmActiveSection('projects')}>
                      View All
                    </button>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Project Name</th>
                            <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Progress</th>
                            <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Status</th>
                            <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(pmData.managedProjects) ? pmData.managedProjects : []).slice(0, 4).map((project, index) => (
                            <tr key={index}>
                              <td style={{ border: 'none', padding: '12px 16px' }}>
                                <div className="fw-semibold">{project.name}</div>
                                <small className="text-muted">{project.clientName}</small>
                              </td>
                              <td style={{ border: 'none', padding: '12px 16px' }}>
                                <div className="d-flex align-items-center">
                                  <div className="progress me-2" style={{ width: '80px', height: '6px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: `${project.progress}%` }}></div>
                                  </div>
                                  <small className="fw-bold">{project.progress}%</small>
                                </div>
                              </td>
                              <td style={{ border: 'none', padding: '12px 16px' }}>
                                <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
                                    project.status === 'On Track' ? 'bg-primary' :
                                      project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
                                  }`}>
                                  {project.status}
                                </span>
                              </td>
                              <td style={{ border: 'none', padding: '12px 16px' }}>
                                <small className="text-muted">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {Array.isArray(pmData.managedProjects) && pmData.managedProjects.length === 0 && (
                        <div className="text-center py-4">
                          <i className="fas fa-project-diagram fa-2x text-muted mb-2"></i>
                          <p className="text-muted">No projects assigned yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Projects Section */}
        {pmActiveSection === 'projects' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold text-dark mb-0">
                <i className="fas fa-project-diagram me-2 text-primary"></i>My Projects
              </h4>
              <button className="btn btn-primary" onClick={() => setShowAddProjectModal(true)}>
                <i className="fas fa-plus me-2"></i>New Project
              </button>
            </div>
            <div className="row">
              {(Array.isArray(pmData.managedProjects) ? pmData.managedProjects : []).map((project, index) => (
                <div key={index} className="col-lg-6 col-md-12 mb-4">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="fw-bold mb-1">{project.name}</h5>
                          <p className="text-muted small mb-0">Client: {project.clientName}</p>
                        </div>
                        <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
                            project.status === 'On Track' ? 'bg-primary' :
                              project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
                          }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">Progress</small>
                          <small className="fw-bold">{project.progress}%</small>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div className="progress-bar bg-primary" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="row text-center">
                        <div className="col-6">
                          <small className="text-muted d-block">Start Date</small>
                          <small className="fw-bold">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</small>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Due Date</small>
                          <small className="fw-bold">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {Array.isArray(pmData.managedProjects) && pmData.managedProjects.length === 0 && (
                <div className="col-12">
                  <div className="text-center py-5">
                    <i className="fas fa-project-diagram fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Projects Yet</h5>
                    <p className="text-muted">Create your first project to get started</p>
                    <button className="btn btn-primary" onClick={() => setShowAddProjectModal(true)}>
                      <i className="fas fa-plus me-2"></i>Create Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employee Management Section */}
        {pmActiveSection === 'members' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold text-dark mb-1">
                  <i className="fas fa-users me-2 text-info"></i>Active Users Under My Projects
                </h4>
                <p className="text-muted mb-0">Employees and team leaders working on projects managed by {userData?.name || 'you'}</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPmActiveSection('dashboard')}>
                  <i className="fas fa-arrow-left me-1"></i>Back to Dashboard
                </button>
                <button className="btn btn-outline-info btn-sm" onClick={() => window.refreshPMData && window.refreshPMData()}>
                  <i className="fas fa-sync-alt me-1"></i>Refresh Data
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-list me-1"></i>List View
                </button>
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-th me-1"></i>Card View
                </button>
                <button className="btn btn-success btn-sm" onClick={() => setShowAddUserModal(true)}>
                  <i className="fas fa-plus me-1"></i>Add Employee
                </button>
              </div>
            </div>

            {/* Active Users Stats with Real-time Indicator */}
            <div className="mb-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <i className="fas fa-users"></i>
                    <span>Active Users: {Array.isArray(pmData.teamMembers) ? pmData.teamMembers.length : 0}</span>
                    <span className="badge bg-success bg-opacity-10 text-success ms-2" style={{ fontSize: '0.7rem' }}>
                      <i className="fas fa-circle fa-xs me-1" style={{ animation: 'pulse 2s infinite' }}></i>
                      LIVE
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <i className="fas fa-project-diagram"></i>
                    <span>Projects: {Array.isArray(pmData.managedProjects) ? pmData.managedProjects.length : 0}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <i className="fas fa-tasks"></i>
                    <span>Total Tasks: {Array.isArray(assignedTasks) ? assignedTasks.filter(task => task.assignedBy === userData?.name).length : 0}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <i className="fas fa-building"></i>
                    <span>Clients: {[...new Set((Array.isArray(pmData.managedProjects) ? pmData.managedProjects : []).map(p => p.clientName).filter(Boolean))].length}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Status Indicator */}
              <div className="mt-2">
                <small className="text-muted">
                  <i className="fas fa-sync-alt me-1"></i>
                  Data automatically updates when users are added or modified in admin dashboard
                </small>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="position-relative" style={{ maxWidth: '400px' }}>
                <i className="fas fa-search position-absolute"
                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by name, email, or department"
                  style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>

            {/* Column Headers */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="card bg-light border-0">
                  <div className="card-body py-2">
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        <small className="fw-bold text-muted">EMPLOYEE INFO</small>
                      </div>
                      <div className="col-md-2">
                        <small className="fw-bold text-muted">PHONE</small>
                      </div>
                      <div className="col-md-3">
                        <small className="fw-bold text-muted">PROJECTS & CLIENTS</small>
                      </div>
                      <div className="col-md-2">
                        <small className="fw-bold text-muted">TASKS ASSIGNED</small>
                      </div>
                      <div className="col-md-2">
                        <small className="fw-bold text-muted">DEPARTMENT</small>
                      </div>
                      <div className="col-md-1">
                        <small className="fw-bold text-muted">ACTIONS</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Cards */}
            <div className="row g-4">
              {(Array.isArray(pmData.teamMembers) ? pmData.teamMembers : []).map((member, index) => {
                // Get member's projects
                const memberProjects = Array.isArray(pmData.managedProjects) ? pmData.managedProjects.filter(project =>
                  project.assigned?.some(a => a.name === member.name) ||
                  project.projectManager === member.name
                ) : [];

                // Get unique client names from member's projects
                const clientNames = [...new Set(memberProjects.map(p => p.clientName).filter(Boolean))];

                return (
                  <div key={index} className="col-12">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                      <div className="card-body p-4">
                        <div className="row align-items-center">
                          {/* Avatar and Basic Info */}
                          <div className="col-md-2">
                            <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3"
                                style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}>
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1 text-dark">{member.name}</h6>
                                <small className="text-muted">{member.email || 'No email provided'}</small>
                                <div className="mt-1">
                                  <span className={`badge ${getUserWorkStatus && getUserWorkStatus(member) ? getUserWorkStatus(member).color : 'bg-success'}`}>
                                    {getUserWorkStatus && getUserWorkStatus(member) ? getUserWorkStatus(member).status : 'Active'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="col-md-2">
                            <div>
                              <small className="text-muted d-block">Phone</small>
                              <span className="fw-medium">{member.phone || member.phoneNumber || 'Not Provided'}</span>
                            </div>
                          </div>

                          {/* Projects & Clients */}
                          <div className="col-md-3">
                            <div>
                              <small className="text-muted d-block">Projects & Clients</small>
                              {memberProjects.length > 0 ? (
                                <div>
                                  {memberProjects.slice(0, 2).map((project, idx) => (
                                    <div key={idx} className="mb-1">
                                      <span className="badge bg-primary me-1" style={{ fontSize: '0.75rem' }}>
                                        {project.name}
                                      </span>
                                      {project.clientName && (
                                        <small className="text-muted">({project.clientName})</small>
                                      )}
                                    </div>
                                  ))}
                                  {memberProjects.length > 2 && (
                                    <small className="text-muted">+{memberProjects.length - 2} more projects</small>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">No projects assigned</span>
                              )}
                            </div>
                          </div>

                          {/* Tasks Assigned */}
                          <div className="col-md-2">
                            <div>
                              <small className="text-muted d-block">Tasks Assigned</small>
                              {(() => {
                                // Count tasks assigned to this member
                                const memberTasks = Array.isArray(assignedTasks) ? assignedTasks.filter(task =>
                                  task.assignedTo === member.name ||
                                  task.assignedTo === member.email ||
                                  (task.assignedMembers && task.assignedMembers.includes(member.name)) ||
                                  (task.assignedMembers && task.assignedMembers.includes(member.email))
                                ) : [];

                                const totalTasks = memberTasks.length;
                                const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
                                const pendingTasks = totalTasks - completedTasks;

                                return (
                                  <div>
                                    <div className="d-flex align-items-center mb-1">
                                      <span className="fw-bold text-primary me-2">{totalTasks}</span>
                                      <small className="text-muted">Total</small>
                                    </div>
                                    {totalTasks > 0 && (
                                      <div className="d-flex gap-2">
                                        <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                                          {completedTasks} Done
                                        </span>
                                        {pendingTasks > 0 && (
                                          <span className="badge bg-warning" style={{ fontSize: '0.7rem' }}>
                                            {pendingTasks} Pending
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Department & Role */}
                          <div className="col-md-2">
                            <div>
                              <small className="text-muted d-block">Department</small>
                              <span className="fw-medium">{member.department || member.role || 'Not Assigned'}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-md-1">
                            <div className="dropdown">
                              <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i className="fas fa-ellipsis-v"></i>
                              </button>
                              <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#"><i className="fas fa-eye me-2"></i>View Details</a></li>
                                <li><a className="dropdown-item" href="#"><i className="fas fa-tasks me-2"></i>View Tasks</a></li>
                                <li><a className="dropdown-item" href="#"><i className="fas fa-edit me-2"></i>Edit</a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item text-danger" href="#"><i className="fas fa-trash me-2"></i>Delete</a></li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex gap-3">
                                <small className="text-muted">
                                  <i className="fas fa-calendar me-1"></i>
                                  Joined: {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'Unknown'}
                                </small>
                                {member.lastActiveTime && (
                                  <small className="text-muted">
                                    <i className="fas fa-clock me-1"></i>
                                    Last Active: {new Date(member.lastActiveTime).toLocaleDateString()}
                                  </small>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                {memberProjects.length > 0 && (
                                  <small className="text-success">
                                    <i className="fas fa-project-diagram me-1"></i>
                                    {memberProjects.length} Project{memberProjects.length > 1 ? 's' : ''}
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {Array.isArray(pmData.teamMembers) && pmData.teamMembers.length === 0 && (
                <div className="col-12">
                  <div className="text-center py-5">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Employees Yet</h5>
                    <p className="text-muted">Add employees to start managing your team</p>
                    <button className="btn btn-info" onClick={() => setShowAddUserModal(true)}>
                      <i className="fas fa-user-plus me-2"></i>Add First Employee
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Task Management Section */}
        {pmActiveSection === 'tasks' && (
          <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h2 className="fw-bold text-dark mb-1">Tasks</h2>
                <p className="text-muted mb-0">Manage and track all your tasks</p>
              </div>
              <button
                className="btn btn-primary px-4 py-2"
                style={{ borderRadius: '8px' }}
                onClick={() => setShowAddTaskModal(true)}
              >
                <i className="fas fa-plus me-2"></i>Add New Task
              </button>
            </div>

            {/* Search and Controls */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative">
                  <i className="fas fa-search position-absolute"
                    style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}></i>
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search anything"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb',
                      width: '250px'
                    }}
                  />
                </div>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <i className="fas fa-calendar-alt"></i>
                  <span>November 27, 2025</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                  <i className="fas fa-sort"></i>Sort by
                </button>
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                  <i className="fas fa-filter"></i>Filter
                </button>
                <div className="btn-group" role="group">
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-th"></i>
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="mb-4">
              <ul className="nav nav-pills gap-1" style={{ borderBottom: 'none' }}>
                <li className="nav-item">
                  <button className="nav-link active d-flex align-items-center gap-2 px-3 py-2"
                    style={{ borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none' }}>
                    All
                    <span className="badge bg-white text-primary ms-1">
                      {Array.isArray(assignedTasks) ? assignedTasks.filter(task => task.assignedBy === userData?.name).length : 0}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#1f2937 !important',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                    Assigned
                    <span className="badge bg-primary text-white ms-1">
                      {Array.isArray(assignedTasks) ? assignedTasks.filter(task => task.assignedBy === userData?.name && task.status === 'assigned').length : 0}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#1f2937 !important',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                    To Do
                    <span className="badge bg-warning text-dark ms-1">
                      {Array.isArray(assignedTasks) ? assignedTasks.filter(task => task.assignedBy === userData?.name && task.status === 'pending').length : 0}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#1f2937 !important',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                    In Progress
                    <span className="badge bg-info text-white ms-1">
                      {Array.isArray(assignedTasks) ? assignedTasks.filter(task => task.assignedBy === userData?.name && task.status === 'in-progress').length : 0}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#1f2937 !important',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                    In Review
                    <span className="badge bg-info text-white ms-1">
                      {Array.isArray(assignedTasks) ? assignedTasks.filter(task => task.assignedBy === userData?.name && task.status === 'in-review').length : 0}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#1f2937 !important',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                    Done
                    <span className="badge bg-success text-white ms-1">
                      {Array.isArray(assignedTasks) ? assignedTasks.filter(task => task.assignedBy === userData?.name && task.status === 'completed').length : 0}
                    </span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Tasks List */}
            <div className="row g-3">
              {(Array.isArray(assignedTasks) ? assignedTasks : [])
                .filter(task => task.assignedBy === userData?.name)
                .map((task, index) => (
                  <div key={index} className="col-12">
                    <div className="card border-0 shadow-sm"
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>
                              {task.title}
                            </h6>
                            <div className="d-flex align-items-center gap-3 mb-3">
                              <span className="text-muted small">
                                {task.assignedDate ? new Date(task.assignedDate).toLocaleDateString() : new Date().toLocaleDateString()}
                              </span>
                              <span className="text-muted">•</span>
                              <span className="text-muted small">
                                {task.project || 'No Project'}
                              </span>
                              <span className="text-muted">•</span>
                              <span className="text-muted small">
                                {Array.isArray(task.assignedTo)
                                  ? `${task.assignedTo.length} employees`
                                  : task.assignedTo || 'Unassigned'}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="d-flex align-items-center gap-3 mb-3">
                              <div className="flex-grow-1">
                                <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                                  <div
                                    className="progress-bar"
                                    style={{
                                      width: task.status === 'completed' ? '100%' :
                                        task.status === 'in-review' ? '80%' :
                                          task.status === 'in-progress' ? '50%' :
                                            task.status === 'assigned' ? '10%' : '5%',
                                      backgroundColor: task.status === 'completed' ? '#28a745' :
                                        task.status === 'in-review' ? '#ffc107' :
                                          task.status === 'in-progress' ? '#17a2b8' :
                                            task.status === 'assigned' ? '#007bff' : '#6c757d',
                                      borderRadius: '3px'
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-muted small fw-medium">
                                {task.status === 'completed' ? '100%' :
                                  task.status === 'in-review' ? '80%' :
                                    task.status === 'in-progress' ? '50%' :
                                      task.status === 'assigned' ? '10%' : '5%'}
                              </span>
                            </div>

                            {/* Task Comments/Notes Buttons */}
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                                onClick={() => {
                                  const note = prompt('Add a note for this task:', '');
                                  if (note) {
                                    // Add note logic here - you can extend this to save to database
                                    alert(`Note added: ${note}`);
                                  }
                                }}
                              >
                                <i className="fas fa-sticky-note"></i>
                                Add note
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                                style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                                onClick={() => {
                                  // View discussion logic - you can extend this to show modal with comments
                                  alert(`Task Discussion:\n\nTask: ${task.title}\nAssigned to: ${task.assignedTo}\nProject: ${task.project}\n\nComments and discussions will be shown here.`);
                                }}
                              >
                                <i className="fas fa-comments"></i>
                                View discussion
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '6px' }}>
                                <i className="fas fa-ellipsis-h"></i>
                              </button>
                            </div>
                          </div>

                          <div className="text-end ms-3">
                            <select
                              className={`form-select form-select-sm ${task.status === 'completed' ? 'bg-success text-white' :
                                  task.status === 'in-progress' ? 'bg-info text-white' :
                                    task.status === 'assigned' ? 'bg-primary text-white' : 'bg-light text-dark'
                                }`}
                              style={{
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                border: 'none',
                                width: 'auto',
                                minWidth: '120px'
                              }}
                              value={task.status}
                              onChange={(e) => {
                                if (updateTaskStatus) {
                                  updateTaskStatus(task.id, e.target.value);
                                }
                              }}
                            >
                              <option value="assigned">Assigned</option>
                              <option value="pending">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="in-review">In Review</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }

              {Array.isArray(assignedTasks) && assignedTasks.filter(task => task.assignedBy === userData?.name).length === 0 && (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="fas fa-tasks" style={{ fontSize: '3rem', color: '#e5e7eb' }}></i>
                    </div>
                    <h5 className="text-muted mb-2">No Tasks Yet</h5>
                    <p className="text-muted mb-4">Start by creating your first task to manage your team's work</p>
                    <button
                      className="btn btn-primary px-4 py-2"
                      style={{ borderRadius: '8px' }}
                      onClick={() => setShowAddTaskModal(true)}
                    >
                      <i className="fas fa-plus me-2"></i>Create First Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* All Users Section - Employee Management View */}
      {pmActiveSection === 'all-users' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold text-dark mb-1">
                <i className="fas fa-users me-2 text-primary"></i>Employee Management
              </h4>
              <p className="text-muted small mb-0">Showing {allUsers ? allUsers.length : 0} users • Project Managers: {allUsers ? allUsers.filter(u => u.role === 'project-manager').length : 0} • Team Leaders: {allUsers ? allUsers.filter(u => u.role === 'team-leader').length : 0} • Employees: {allUsers ? allUsers.filter(u => u.role === 'employee').length : 0}</p>
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setPmActiveSection('dashboard')}
            >
              <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
            </button>
          </div>

          {/* Employee Cards Grid */}
          <div className="row">
            {Array.isArray(allUsers) && allUsers.length > 0 ? (
              allUsers.map((user, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-4">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: user.role === 'project-manager' ? '#6f42c1' :
                              user.role === 'team-leader' ? '#fd7e14' :
                                user.role === 'intern' ? '#17a2b8' : '#007bff',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold'
                          }}
                        >
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-0">{user.name}</h6>
                          <small className="text-muted">{user.email}</small>
                        </div>
                        <span className={`badge ${user.status === 'Active' || !user.status ? 'bg-success' : 'bg-secondary'
                          }`}>
                          {user.status || 'Active'}
                        </span>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted d-block">Department</small>
                        <span className="fw-semibold">{user.department || 'Not Provided'}</span>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted d-block">Role</small>
                        <span className={`badge ${user.role === 'project-manager' ? 'bg-purple' :
                            user.role === 'team-leader' ? 'bg-warning' :
                              user.role === 'intern' ? 'bg-info' : 'bg-primary'
                          }`}>
                          {user.userType || user.role || 'Employee'}
                        </span>
                      </div>

                      {user.assignedProject && (
                        <div className="mb-2">
                          <small className="text-muted d-block">Project</small>
                          <span className="badge bg-success">{user.assignedProject}</span>
                        </div>
                      )}

                      {!user.assignedProject && (
                        <div className="mb-2">
                          <small className="text-muted d-block">Project</small>
                          <span className="text-muted small">No projects assigned</span>
                        </div>
                      )}

                      {user.phone && (
                        <div className="mb-2">
                          <small className="text-muted d-block">Phone</small>
                          <span className="small">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No Users Found</h5>
                  <p className="text-muted">There are no users in the system yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

export default PMDashboardSidebar;