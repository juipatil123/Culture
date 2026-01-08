import React, { useState, useEffect } from 'react';

const AddTaskModal = ({ show, onClose, onHide, onSave, editingTask, allUsers = [], projects = [] }) => {
  const handleClose = onClose || onHide;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'assigned', // Default status for new tasks
    priority: 'medium',
    dueDate: '',
    assignedBy: '',
    project: '',
    assignedTo: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Get current user info
  const currentUserName = localStorage.getItem('userName') || '';
  const currentUserRole = localStorage.getItem('userRole') || '';
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  // Get projects managed by current PM
  const getAvailableProjects = () => {
    if (currentUserRole === 'project-manager') {
      return projects.filter(project =>
        project.projectManager === currentUserName ||
        project.projectManager === currentUserEmail
      );
    }
    return projects;
  };

  // Get employees assigned to current PM's projects
  const getAvailableEmployees = () => {
    if (currentUserRole === 'project-manager') {
      // Get projects managed by current PM
      const pmProjects = projects.filter(project =>
        project.projectManager === currentUserName ||
        project.projectManager === currentUserEmail
      );

      // Get all employees assigned to these projects
      const employeesInProjects = new Set();
      pmProjects.forEach(project => {
        if (project.assigned && Array.isArray(project.assigned)) {
          project.assigned.forEach(member => {
            if (typeof member === 'object' && member.name) {
              employeesInProjects.add(member.name);
            } else if (typeof member === 'string') {
              employeesInProjects.add(member);
            }
          });
        }
      });

      // Filter users to only show employees in PM's projects
      return allUsers.filter(user =>
        (user.role === 'employee' || user.role === 'intern' || user.userType === 'Employee' || user.userType === 'Intern') &&
        (employeesInProjects.has(user.name) || employeesInProjects.has(user.email))
      );
    }

    // For other roles, show all employees
    return allUsers.filter(user =>
      user.role === 'employee' || user.role === 'intern' ||
      user.userType === 'Employee' || user.userType === 'Intern'
    );
  };

  // Populate form when editing or opening
  useEffect(() => {
    if (show) {
      if (editingTask) {
        // Handle both single string and array for assignedTo/Members
        const members = Array.isArray(editingTask.assignedMembers)
          ? editingTask.assignedMembers
          : (editingTask.assignedTo ? [editingTask.assignedTo] : []);

        setFormData({
          title: editingTask.title || '',
          description: editingTask.description || '',
          status: editingTask.status || 'pending',
          priority: editingTask.priority || 'medium',
          dueDate: editingTask.dueDate || '',
          assignedBy: editingTask.assignedBy || currentUserName,
          project: editingTask.project || '',
          assignedTo: editingTask.assignedTo || ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'assigned',
          priority: 'medium',
          dueDate: '',
          assignedBy: currentUserName,
          project: '',
          assignedTo: ''
        });
      }
    }
  }, [editingTask, show, currentUserName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'project') {
      // Logic could be added here to auto-filter users based on project
    }
  };

  const handleAddMember = (user) => {
    const userNameEmail = user.name;
    if (!formData.assignedMembers.includes(userNameEmail)) {
      setFormData(prev => ({
        ...prev,
        assignedMembers: [...prev.assignedMembers, userNameEmail],
        assignedTo: prev.assignedMembers.length === 0 ? userNameEmail : prev.assignedTo
      }));
    }
    setSearchTerm('');
    setShowUserDropdown(false);
  };

  const handleRemoveMember = (name) => {
    setFormData(prev => {
      const newMembers = prev.assignedMembers.filter(m => m !== name);
      return {
        ...prev,
        assignedMembers: newMembers,
        assignedTo: newMembers.length > 0 ? newMembers[0] : ''
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure assignedTo is set for legacy components (using first member)
    const dataToSave = {
      ...formData,
      assignedTo: formData.assignedMembers.join(', ')
    };
    onSave(dataToSave);
    handleClose();
  };

  if (!show) return null;

  const availableEmployees = getAvailableEmployees();

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white py-3">
            <h5 className="modal-title fw-bold">
              <i className="fas fa-tasks me-2"></i>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Task Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Project *</label>
                  <select
                    className="form-select"
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a project</option>
                    {getAvailableProjects().map((project, index) => (
                      <option key={project.id || project._id || index} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Showing your managed projects
                  </small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Priority</label>
                  <select
                    className="form-select"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="assigned">Assigned</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small">Assigned By</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={formData.assignedBy}
                    onChange={handleInputChange}
                    placeholder="Enter assigner name"
                    readOnly
                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                  />
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    Auto-filled with your name
                  </div>
                </div>
              </div>

              {/* Multiple Users Assignment */}
              <div className="mb-3">
                <label className="form-label fw-bold small">Assigned To (Multiple Select)</label>
                <div className="position-relative">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-user-plus text-primary"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Type to search and add multiple members..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                    />
                  </div>

                  {/* Selected Members Chips */}
                  <div className="d-flex flex-wrap gap-2 mt-2 mb-1">
                    {formData.assignedMembers.map((name, index) => (
                      <span key={index} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-flex align-items-center gap-2 p-2">
                        <i className="fas fa-user-circle small"></i>
                        {name}
                        <i className="fas fa-times cursor-pointer ms-1" onClick={() => handleRemoveMember(name)} style={{ cursor: 'pointer' }}></i>
                      </span>
                    ))}
                    {formData.assignedMembers.length === 0 && (
                      <small className="text-muted italic">No users assigned yet</small>
                    )}
                  </div>

                  {/* User Dropdown */}
                  {showUserDropdown && (searchTerm || showUserDropdown) && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 overflow-auto" style={{ zIndex: 1100, maxHeight: '200px' }}>
                      {availableEmployees.length > 0 ? (
                        availableEmployees.map((user, index) => (
                          <div
                            key={user.id || user._id || index}
                            className="p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center justify-content-between"
                            onClick={() => handleAddMember(user)}
                            onMouseEnter={(e) => e.target.closest('div').style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.target.closest('div').style.backgroundColor = 'transparent'}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div className="avatar-circle-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-bold small">{user.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                              </div>
                            </div>
                            {formData.assignedMembers.includes(user.name) && (
                              <i className="fas fa-check text-success"></i>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted small">No users found</div>
                      )}
                    </div>
                  )}
                </div>
                <div onClick={() => setShowUserDropdown(false)} style={{ display: showUserDropdown ? 'block' : 'none', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1090 }}></div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small">Task Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter task description"
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-primary">Task Requirement (Changes/Updates)</label>
                <textarea
                  className="form-control"
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Specify task requirements or change requests..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-success">Working Notes (What's working / Progress)</label>
                <textarea
                  className="form-control border-success border-opacity-10"
                  name="workingNotes"
                  value={formData.workingNotes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Note down current progress, what is working, logs etc."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer bg-light p-3">
              <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4">
                <i className="fas fa-save me-2"></i>
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;