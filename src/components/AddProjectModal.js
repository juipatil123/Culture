import React, { useState, useEffect } from 'react';

const AddProjectModal = ({ show, onClose, onHide, onSave, editingProject, availableEmployees = [] }) => {
  const handleClose = onClose || onHide;

  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    projectManager: '',
    projectCost: '',
    advancePayment: '',
    startDate: '',
    endDate: '',
    description: '',
    projectStatus: 'pending',
    assignmentStatus: 'available',
    progress: 0,
    assignedMembers: []
  });


  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);

  // Helper function to format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Helper function to convert project status
  const convertProjectStatus = (status) => {
    if (!status) return 'pending';
    // Convert display status back to internal status
    const lowerStatus = status.toLowerCase();
    console.log('🔄 Converting project status:', status, '→', lowerStatus);

    switch (lowerStatus) {
      case 'pending': return 'pending';
      case 'in-progress': return 'in-progress';
      case 'in progress': return 'in-progress';
      case 'completed': return 'completed';
      case 'overdue': return 'overdue';
      case 'assigned': return 'pending'; // Map old 'assigned' to 'pending'
      case 'on-track': return 'in-progress'; // Map old 'on-track' to 'in-progress'
      case 'delayed': return 'overdue'; // Map old 'delayed' to 'overdue'
      case 'at-risk': return 'at-risk';
      default:
        console.log('⚠️ Unknown status, using as-is:', status);
        return status;
    }
  };

  // Populate form when editing
  useEffect(() => {
    console.log('🚀 AddProjectModal mounted/updated with availableEmployees:', availableEmployees.length);
    console.log('📊 Available employees breakdown:', {
      total: availableEmployees.length,
      projectManagers: availableEmployees.filter(emp => emp.role === 'project-manager' || emp.userType === 'Project Manager').length,
      employees: availableEmployees.filter(emp => emp.role === 'employee').length,
      teamLeaders: availableEmployees.filter(emp => emp.role === 'team-leader').length,
      others: availableEmployees.filter(emp => !['project-manager', 'employee', 'team-leader'].includes(emp.role) && emp.userType !== 'Project Manager').length
    });

    if (editingProject) {
      console.log('🔧 Editing project data:', editingProject);

      setFormData({
        name: editingProject.name || '',
        clientName: editingProject.clientName || '',
        projectManager: editingProject.projectManager || '',
        projectCost: editingProject.projectCost || '',
        advancePayment: editingProject.advancePayment || '',
        startDate: formatDateForInput(editingProject.startDate),
        endDate: formatDateForInput(editingProject.endDate),
        description: editingProject.description || '',
        projectStatus: convertProjectStatus(editingProject.projectStatus || editingProject.status),
        assignmentStatus: editingProject.assignmentStatus || 'available',
        progress: editingProject.progress || 0,
        assignedMembers: editingProject.assignedMembers || (editingProject.assigned ? editingProject.assigned.map(member => member.name).filter(name => name !== 'Not Assigned') : [])
      });

      console.log('📝 Form populated with:', {
        name: editingProject.name,
        startDate: formatDateForInput(editingProject.startDate),
        endDate: formatDateForInput(editingProject.endDate),
        progress: editingProject.progress,
        assignedMembers: editingProject.assignedMembers || (editingProject.assigned ? editingProject.assigned.map(member => member.name).filter(name => name !== 'Not Assigned') : [])
      });
    } else {
      // Reset form for new project with auto-filled PM name
      const currentUserName = localStorage.getItem('userName') || '';
      setFormData({
        name: '',
        clientName: '',
        projectManager: currentUserName, // Auto-fill with current user's name
        projectCost: '',
        advancePayment: '',
        startDate: '',
        endDate: '',
        description: '',
        projectStatus: 'assigned', // Default status for new projects
        assignmentStatus: 'available',
        progress: 0,
        assignedMembers: []
      });
    }
    setSearchTerm('');
    setShowEmployeeDropdown(false);
    setManagerSearchTerm('');
    setShowManagerDropdown(false);
  }, [editingProject, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Apply field-specific validations
    if (name === 'name' || name === 'clientName') {
      // Only allow letters and spaces
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'projectCost' || name === 'advancePayment') {
      // Only allow positive numbers (including zero)
      processedValue = value.replace(/[^0-9]/g, '');
      if (processedValue !== '' && parseInt(processedValue) < 0) {
        processedValue = '0';
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Filter employees based on search term and exclude already assigned members
  const getFilteredEmployees = () => {
    return availableEmployees.filter(employee => {
      // Safe access to properties with fallbacks
      const name = employee?.name || '';
      const email = employee?.email || '';
      const department = employee?.department || '';
      const term = (searchTerm || '').toLowerCase();

      const matchesSearch = name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        department.toLowerCase().includes(term);

      // Ensure name exists before checking inclusion
      const notAlreadyAssigned = name && !formData.assignedMembers.includes(name);
      return matchesSearch && notAlreadyAssigned;
    });
  };

  // Filter to show only registered project managers
  const getFilteredManagers = () => {
    console.log('🔍 Available employees for manager filtering:', availableEmployees.length, availableEmployees.map(emp => ({
      name: emp.name,
      role: emp.role,
      userType: emp.userType,
      isProjectManager: emp.role === 'project-manager' || emp.userType === 'Project Manager'
    })));

    const registeredProjectManagers = availableEmployees.filter(employee => {
      // Only show users who are actually registered as project managers
      const isProjectManager = employee.role === 'project-manager' || employee.userType === 'Project Manager';

      // Safe access to properties with fallbacks
      const name = employee?.name || '';
      const email = employee?.email || '';
      const department = employee?.department || '';
      const term = (managerSearchTerm || '').toLowerCase();

      const matchesSearch = name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        department.toLowerCase().includes(term);

      return isProjectManager && matchesSearch;
    });

    console.log('🎯 Filtered project managers:', registeredProjectManagers.length, registeredProjectManagers.map(pm => ({
      name: pm.name,
      role: pm.role,
      userType: pm.userType
    })));

    // If no project managers found and search term matches "Tushar", show a helpful message
    if (registeredProjectManagers.length === 0 && managerSearchTerm.toLowerCase().includes('t')) {
      console.warn('⚠️ No project managers found. Available employees:', availableEmployees.length);
      console.warn('⚠️ Project managers in availableEmployees:', availableEmployees.filter(emp =>
        emp.role === 'project-manager' || emp.userType === 'Project Manager'
      ));
    }

    // Sort alphabetically by name
    return registeredProjectManagers.sort((a, b) => a.name.localeCompare(b.name));
  };



  const handleSelectEmployee = (employee) => {
    if (!formData.assignedMembers.includes(employee.name)) {
      setFormData(prev => ({
        ...prev,
        assignedMembers: [...prev.assignedMembers, employee.name]
      }));
      setSearchTerm(''); // Clear search term
      setShowEmployeeDropdown(false); // Hide dropdown

      // Show a brief success message
      const notification = document.createElement('div');
      notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
      notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
      notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <strong>${employee.name}</strong> added to project team
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(notification);

      // Auto remove notification after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  };

  const handleSelectManager = (employee) => {
    setFormData(prev => ({
      ...prev,
      projectManager: employee.name
    }));
    setManagerSearchTerm('');
    setShowManagerDropdown(false);
  };

  const handleRemoveMember = (memberToRemove) => {
    setFormData(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.filter(member => member !== memberToRemove)
    }));
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      name: '',
      clientName: '',
      projectManager: '',
      projectCost: '',
      advancePayment: '',
      startDate: '',
      endDate: '',
      description: '',
      projectStatus: 'assigned',
      assignmentStatus: 'available',
      progress: 0,
      assignedMembers: []
    });
    setSearchTerm('');
    setShowEmployeeDropdown(false);
    setManagerSearchTerm('');
    setShowManagerDropdown(false);
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-project-diagram me-2"></i>
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Enter client name"
                    required
                  />
                  <small className="form-text text-muted">
                    Only letters and spaces allowed.
                  </small>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Manager *</label>
                  <div className="position-relative">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-user-tie"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        value={managerSearchTerm || formData.projectManager}
                        onChange={(e) => {
                          const value = e.target.value;
                          const restrictedValue = value.replace(/[^a-zA-Z\s]/g, '');
                          setManagerSearchTerm(restrictedValue);
                          setFormData(prev => ({ ...prev, projectManager: restrictedValue }));
                          setShowManagerDropdown(restrictedValue.length > 0);
                        }}
                        onFocus={() => {
                          setManagerSearchTerm(formData.projectManager);
                          setShowManagerDropdown(true);
                        }}
                        onBlur={() => {
                          // Delay hiding dropdown to allow clicks
                          setTimeout(() => setShowManagerDropdown(false), 300);
                        }}
                        placeholder="Search and select project manager..."
                        required
                      />
                      {(managerSearchTerm || formData.projectManager) && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, projectManager: '' }));
                            setManagerSearchTerm('');
                            setShowManagerDropdown(false);
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>

                    {/* Manager Dropdown */}
                    {showManagerDropdown && (managerSearchTerm || formData.projectManager) && (
                      <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1" style={{ zIndex: 1052, maxHeight: '200px', overflowY: 'auto' }}>
                        {(() => {
                          const managers = getFilteredManagers();
                          console.log('🔍 Available managers for dropdown:', managers.length, managers.map(m => ({ name: m.name, role: m.role, userType: m.userType })));

                          // If no managers found but search term suggests looking for Tushar, show fallback
                          if (managers.length === 0 && managerSearchTerm.toLowerCase().includes('t')) {
                            const fallbackManagers = [
                              {
                                id: 'PM002',
                                name: 'Tushar Powar',
                                email: 'tushar@company.com',
                                department: 'System Administrator',
                                role: 'project-manager',
                                userType: 'Project Manager'
                              }
                            ];

                            return fallbackManagers.map((employee, index) => (
                              <div
                                key={employee.id || index}
                                className="p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectManager(employee);
                                }}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.closest('div').style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.closest('div').style.backgroundColor = 'transparent'}
                              >
                                <div className="me-3">
                                  <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">{employee.name}</div>
                                  <div className="text-muted small">{employee.email}</div>
                                  <div className="text-warning small">
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    Fallback - Data may need refresh
                                  </div>
                                </div>
                                <div className="text-end">
                                  <span className="badge bg-primary">PM</span>
                                </div>
                              </div>
                            ));
                          }

                          return managers.length > 0 ? (
                            managers.map((employee, index) => (
                              <div
                                key={employee.id || employee._id || index}
                                className="p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevent input blur
                                  handleSelectManager(employee);
                                }}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.closest('div').style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.closest('div').style.backgroundColor = 'transparent'}
                              >
                                <div className="me-3">
                                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">{employee.name}</div>
                                  <div className="text-muted small">{employee.email}</div>
                                  {employee.department && (
                                    <div className="text-muted small">
                                      <i className="fas fa-building me-1"></i>
                                      {employee.department}
                                    </div>
                                  )}
                                </div>
                                <div className="text-end">
                                  <span className={`badge ${employee.role === 'project-manager' ? 'bg-primary' :
                                    employee.role === 'team-leader' ? 'bg-info' :
                                      'bg-secondary'
                                    }`}>
                                    {employee.role === 'project-manager' ? 'PM' :
                                      employee.role === 'team-leader' ? 'TL' :
                                        employee.role || 'Employee'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-muted">
                              <i className="fas fa-search me-2"></i>
                              No registered project managers found matching your search
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Search from registered project managers only
                  </small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Cost *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="projectCost"
                    value={formData.projectCost}
                    onChange={handleInputChange}
                    placeholder="Enter project cost"
                    required
                  />
                  <small className="form-text text-muted">
                    Only positive values or zero allowed.
                  </small>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Advance Payment</label>
                  <input
                    type="text"
                    className="form-control"
                    name="advancePayment"
                    value={formData.advancePayment}
                    onChange={handleInputChange}
                    placeholder="Enter advance payment"
                  />
                  <small className="form-text text-muted">
                    Only positive values or zero allowed.
                  </small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Status</label>
                  <select
                    className="form-select"
                    name="projectStatus"
                    value={formData.projectStatus}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">
                    Project Progress: <strong>{formData.progress}%</strong>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    name="progress"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.progress}
                    onChange={handleInputChange}
                  />
                  <div className="d-flex justify-content-between text-muted small">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  <div className="progress mt-2" style={{ height: '10px' }}>
                    <div
                      className={`progress-bar ${formData.progress === 100 ? 'bg-success' :
                        formData.progress >= 70 ? 'bg-primary' :
                          formData.progress >= 40 ? 'bg-warning' : 'bg-danger'
                        }`}
                      role="progressbar"
                      style={{ width: `${formData.progress}%` }}
                      aria-valuenow={formData.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {formData.progress}%
                    </div>
                  </div>
                  <small className="text-muted">
                    Drag the slider to set the current project completion percentage
                  </small>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Project Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter project description"
                ></textarea>
              </div>

              {/* Assigned Members Section */}
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-users me-2"></i>
                  Assigned Members ({formData.assignedMembers.length})
                </label>

                {/* Employee Search and Selection */}
                <div className="mb-3">
                  <div className="position-relative">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => {
                          const restrictedValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                          setSearchTerm(restrictedValue);
                          setShowEmployeeDropdown(true);
                        }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        onBlur={() => {
                          // Delay hiding dropdown to allow clicks
                          setTimeout(() => setShowEmployeeDropdown(false), 300);
                        }}
                        placeholder="Click to see employees or type to search..."
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setSearchTerm('');
                            setShowEmployeeDropdown(false);
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>

                    {/* Employee Dropdown */}
                    {showEmployeeDropdown && (
                      <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1" style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}>
                        {searchTerm.length > 0 ? (
                          getFilteredEmployees().length > 0 ? (
                            getFilteredEmployees().map((employee, index) => (
                              <div
                                key={employee.id || employee._id || index}
                                className="p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevent input blur
                                  handleSelectEmployee(employee);
                                }}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.closest('div').style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.closest('div').style.backgroundColor = 'transparent'}
                              >
                                <div className="me-3">
                                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">{employee.name}</div>
                                  <div className="text-muted small">{employee.email}</div>
                                  {employee.department && (
                                    <div className="text-muted small">
                                      <i className="fas fa-building me-1"></i>
                                      {employee.department}
                                    </div>
                                  )}
                                </div>
                                <div className="text-end">
                                  <span className={`badge ${employee.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                                    {employee.status || 'Active'}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-muted">
                              <i className="fas fa-search me-2"></i>
                              No employees found matching your search
                            </div>
                          )
                        ) : (
                          // Show available employees when no search term
                          availableEmployees.filter(emp => !formData.assignedMembers.includes(emp.name)).slice(0, 5).map((employee, index) => (
                            <div
                              key={employee.id || employee._id || index}
                              className="p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center"
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                                handleSelectEmployee(employee);
                              }}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={(e) => e.target.closest('div').style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.target.closest('div').style.backgroundColor = 'transparent'}
                            >
                              <div className="me-3">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                                  {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-bold">{employee.name}</div>
                                <div className="text-muted small">{employee.email}</div>
                                {employee.department && (
                                  <div className="text-muted small">
                                    <i className="fas fa-building me-1"></i>
                                    {employee.department}
                                  </div>
                                )}
                              </div>
                              <div className="text-end">
                                <span className={`badge ${employee.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                                  {employee.status || 'Active'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                        {searchTerm.length === 0 && availableEmployees.filter(emp => !formData.assignedMembers.includes(emp.name)).length > 5 && (
                          <div className="p-2 text-center text-muted small border-top">
                            <i className="fas fa-info-circle me-1"></i>
                            Showing first 5 employees. Type to search for more.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Search Instructions */}
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Search and select from registered employees above. You can add multiple members to the project.
                    </small>
                  </div>
                </div>

                {/* Display assigned members */}
                {formData.assignedMembers.length > 0 && (
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">
                        <i className="fas fa-users me-1"></i>
                        {formData.assignedMembers.length} member{formData.assignedMembers.length > 1 ? 's' : ''} assigned
                      </small>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setFormData(prev => ({ ...prev, assignedMembers: [] }))}
                        title="Remove all members"
                      >
                        <i className="fas fa-trash-alt me-1"></i>
                        Clear All
                      </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {formData.assignedMembers.map((member, index) => (
                        <div key={index} className="badge bg-primary d-flex align-items-center gap-2 p-2">
                          <i className="fas fa-user"></i>
                          <span>{member}</span>
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            style={{ fontSize: '0.7em' }}
                            onClick={() => handleRemoveMember(member)}
                            title="Remove member"
                          ></button>
                        </div>
                      ))}
                    </div>
                    <small className="text-muted mt-2 d-block">
                      <i className="fas fa-info-circle me-1"></i>
                      Click the × button to remove a member
                    </small>
                  </div>
                )}

                {formData.assignedMembers.length === 0 && (
                  <div className="text-muted text-center py-3 border rounded bg-light">
                    <i className="fas fa-user-plus fa-2x mb-2 opacity-50"></i>
                    <p className="mb-0">No members assigned yet</p>
                    <small>Add team members who will work on this project</small>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save me-2"></i>
                {editingProject ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;

