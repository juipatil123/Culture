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
    // For other roles, show all projects
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
        // Reset form for new task with auto-filled assignedBy and default status
        setFormData({
          title: '',
          description: '',
          status: 'assigned', // Default status for new tasks
          priority: 'medium',
          dueDate: '',
          assignedBy: currentUserName, // Auto-fill with current user's name
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      assignedBy: '',
      project: '',
      assignedTo: ''
    });
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-tasks me-2"></i>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Task Title *</label>
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
                  <label className="form-label">Project *</label>
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
                        {project.clientName ? ` - ${project.clientName}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    {currentUserRole === 'project-manager'
                      ? 'Showing your managed projects'
                      : 'Select a project for this task'}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Priority</label>
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
                  <label className="form-label">Status</label>
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
                    <option value="delayed">Delayed</option>
                    <option value="review">Under Review</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    {editingTask
                      ? 'Update task status as it progresses'
                      : 'New tasks default to "Assigned" status'}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Assigned By</label>
                  <input
                    type="text"
                    className="form-control"
                    name="assignedBy"
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
              <div className="mb-3">
                <label className="form-label">Assigned To</label>
                <select
                  className="form-select"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select an employee</option>
                  {getAvailableEmployees().map((employee, index) => (
                    <option key={employee.id || employee._id || index} value={employee.email || employee.name}>
                      {employee.name} {employee.email ? `(${employee.email})` : ''}
                      {employee.assignedProject ? ` - ${employee.assignedProject}` : ''}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  <i className="fas fa-info-circle me-1"></i>
                  {currentUserRole === 'project-manager'
                    ? 'Showing employees assigned to your projects'
                    : 'Select an employee to assign this task'}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Task Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter task description"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
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