import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';

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
  const [focusedField, setFocusedField] = useState(null);

  // Helper function to format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    if (editingProject && show) {
      setFormData({
        name: editingProject.name || '',
        clientName: editingProject.clientName || '',
        projectManager: editingProject.projectManager || '',
        projectCost: editingProject.projectCost || '',
        advancePayment: editingProject.advancePayment || '',
        startDate: formatDateForInput(editingProject.startDate),
        endDate: formatDateForInput(editingProject.endDate),
        description: editingProject.description || '',
        projectStatus: (editingProject.status || editingProject.projectStatus || 'pending').toLowerCase(),
        progress: editingProject.progress || 0,
        assignedMembers: editingProject.assignedMembers || []
      });
    } else if (show) {
      setFormData({
        name: '',
        clientName: '',
        projectManager: '',
        projectCost: '',
        advancePayment: '',
        startDate: '',
        endDate: '',
        description: '',
        projectStatus: 'pending',
        progress: 0,
        assignedMembers: []
      });
    }
    setSearchTerm('');
    setManagerSearchTerm('');
  }, [editingProject, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Apply field-specific validations
    if (name === 'projectCost' || name === 'advancePayment') {
      // Only allow positive numbers (including zero)
      if (value === '' || parseFloat(value) >= 0) {
        processedValue = value;
      } else {
        processedValue = '0';
      }
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const getFilteredEmployees = () => {
    const term = searchTerm.toLowerCase();
    return availableEmployees.filter(emp =>
      (emp.name?.toLowerCase().includes(term) || emp.email?.toLowerCase().includes(term)) &&
      !formData.assignedMembers.includes(emp.name)
    );
  };

  const getFilteredManagers = () => {
    console.log('🔍 Available employees for manager filtering:', availableEmployees.length, availableEmployees.map(emp => ({
      name: emp.name,
      role: emp.role,
      userType: emp.userType,
      isProjectManager: emp.role === 'project-manager' || emp.userType === 'Project Manager'
    })));

    const registeredProjectManagers = availableEmployees.filter(employee => {
      // Show project managers, and also team leaders (since they can also manage projects)
      const isProjectManager = employee.role === 'project-manager' ||
        employee.userType === 'Project Manager' ||
        employee.role === 'team-leader';

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

  const handleSelectManager = (emp) => {
    setFormData(prev => ({ ...prev, projectManager: emp.name }));
    setManagerSearchTerm('');
    setShowManagerDropdown(false);
  };

  const handleSelectEmployee = (emp) => {
    if (!formData.assignedMembers.includes(emp.name)) {
      setFormData(prev => ({
        ...prev,
        assignedMembers: [...prev.assignedMembers, emp.name]
      }));
    }
    setSearchTerm('');
    setShowEmployeeDropdown(false);
  };

  const handleRemoveMember = (name) => {
    setFormData(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.filter(m => m !== name)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{
      backgroundColor: 'rgba(0,0,0,0.6)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1050,
      overflow: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        paddingLeft: '260px', // Sidebar width
        paddingRight: '20px',
        paddingTop: '20px',
        paddingBottom: '20px'
      }}>
        <div className="modal-dialog modal-lg" style={{
          margin: '0',
          maxWidth: '900px',
          width: '100%'
        }}>
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-primary text-white p-3 border-0">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-edit me-2"></i>
                {editingProject ? 'Edit Project Details' : 'Create New Project'}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="modal-body p-4" style={{ backgroundColor: '#fff', maxHeight: '80vh', overflowY: 'auto' }}>
                <div className="row g-4">
                  {/* Basic Info */}
                  <div className="col-md-6 text-start">
                    <label className="admin-label">Project Name *</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Project Name"
                      required
                    />
                  </div>
                  <div className="col-md-6 text-start">
                    <label className="admin-label">Client Name *</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Client Name"
                      required
                    />
                  </div>

                  {/* Manager & Cost */}
                  <div className="col-md-6 text-start">
                    <label className="admin-label">Project Manager *</label>
                    <div className="position-relative">
                      <div className="d-flex align-items-center bg-white border rounded-3 px-2">
                        <i className="fas fa-user-tie text-muted me-2"></i>
                        <input
                          type="text"
                          className="admin-input border-0 shadow-none ps-0"
                          value={managerSearchTerm || formData.projectManager}
                          onChange={(e) => {
                            setManagerSearchTerm(e.target.value);
                            setFormData(prev => ({ ...prev, projectManager: e.target.value }));
                            setShowManagerDropdown(true);
                          }}
                          onFocus={() => setShowManagerDropdown(true)}
                          onBlur={() => setTimeout(() => setShowManagerDropdown(false), 300)}
                          placeholder="Assign a Manager"
                          required
                        />
                        {formData.projectManager && (
                          <i className="fas fa-times text-muted cursor-pointer" onClick={() => { setFormData(prev => ({ ...prev, projectManager: '' })); setManagerSearchTerm(''); }}></i>
                        )}
                      </div>
                      {showManagerDropdown && (
                        <div className="position-absolute w-100 bg-white border rounded-3 shadow-lg mt-1" style={{ zIndex: 1100, maxHeight: '200px', overflowY: 'auto' }}>
                          {getFilteredManagers().map((emp, i) => (
                            <div key={i} className="p-3 border-bottom hover-bg-light" style={{ cursor: 'pointer' }} onMouseDown={() => handleSelectManager(emp)}>
                              <div className="fw-bold small">{emp.name}</div>
                              <div className="text-muted small">{emp.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 text-start">
                    <label className="admin-label">Project Cost (₹) *</label>
                    <input
                      type="number"
                      className="admin-input"
                      name="projectCost"
                      value={formData.projectCost}
                      onChange={handleInputChange}
                      placeholder="Total Cost"
                      min="0"
                      step="0.01"
                      required
                    />
                    <small className="form-text text-muted">
                      Only positive values or zero allowed.
                    </small>
                  </div>

                  {/* Status & Advance */}
                  <div className="col-md-6 text-start">
                    <label className="admin-label">Advance Payment (₹)</label>
                    <input
                      type="number"
                      className="admin-input"
                      name="advancePayment"
                      value={formData.advancePayment}
                      onChange={handleInputChange}
                      placeholder="Advance Amount"
                      min="0"
                      step="0.01"
                    />
                    <small className="form-text text-muted">
                      Only positive values or zero allowed.
                    </small>
                  </div>
                  <div className="col-md-6 text-start">
                    <label className="admin-label">Current Status</label>
                    <select
                      className="admin-select"
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

                  {/* Progress */}
                  <div className="col-12 text-start">
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="d-flex justify-content-between mb-2">
                        <label className="admin-label mb-0">Project Progress</label>
                        <span className="fw-bold text-primary">{formData.progress}%</span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        name="progress"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="col-md-6 text-start">
                    <label className="admin-label">Start Date *</label>
                    <input
                      type={focusedField === 'startDate' ? 'date' : 'text'}
                      className="admin-input"
                      name="startDate"
                      value={focusedField === 'startDate' ? formData.startDate : (formData.startDate ? formatDate(formData.startDate) : '')}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('startDate')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="DD/MM/YYYY"
                      required
                    />
                  </div>
                  <div className="col-md-6 text-start">
                    <label className="admin-label">End Date *</label>
                    <input
                      type={focusedField === 'endDate' ? 'date' : 'text'}
                      className="admin-input"
                      name="endDate"
                      value={focusedField === 'endDate' ? formData.endDate : (formData.endDate ? formatDate(formData.endDate) : '')}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('endDate')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="DD/MM/YYYY"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12 text-start">
                    <label className="admin-label">Project Description</label>
                    <textarea
                      className="admin-textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter short description..."
                    ></textarea>
                  </div>

                  {/* Team Assignment */}
                  <div className="col-12 text-start">
                    <label className="admin-label">Assign Team Members</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="admin-input"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setShowEmployeeDropdown(true); }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 300)}
                        placeholder="Search to add team members..."
                      />
                      {showEmployeeDropdown && (
                        <div className="position-absolute w-100 bg-white border rounded-3 shadow-lg mt-1" style={{ zIndex: 1100, maxHeight: '150px', overflowY: 'auto' }}>
                          {getFilteredEmployees().map((emp, i) => (
                            <div key={i} className="p-2 border-bottom hover-bg-light d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onMouseDown={() => handleSelectEmployee(emp)}>
                              <div>
                                <div className="fw-bold small">{emp.name}</div>
                                <div className="text-muted small">{emp.department}</div>
                              </div>
                              <button type="button" className="btn btn-sm btn-outline-primary py-0">Add</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {formData.assignedMembers.map((member, index) => (
                        <div key={index} className="badge bg-white text-dark border d-flex align-items-center gap-2 p-2 rounded-3 shadow-sm">
                          <span>{member}</span>
                          <i className="fas fa-times-circle text-danger cursor-pointer" onClick={() => handleRemoveMember(member)}></i>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top p-3 bg-white">
                <button type="button" className="btn btn-light px-4 rounded-pill me-2" onClick={handleClose}>Cancel</button>
                <button type="submit" className="btn btn-primary px-5 rounded-pill fw-bold">
                  <i className="fas fa-check-circle me-2"></i>
                  {editingProject ? 'Update Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
