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
    } else if (name === 'clientName') {
      // Only allow letters and spaces
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
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
      zIndex: 1500,
      overflow: 'auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div className="modal-dialog modal-lg" style={{
          margin: '0',
          maxWidth: '800px',
          width: '100%'
        }}>
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <div className="modal-header text-white p-3 border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#7c3aed' }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                <i className="fas fa-share-alt"></i> {/* Placeholder icon to match 'Add New Project' icon roughly */}
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleClose} style={{ opacity: 1 }}></button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="modal-body p-4" style={{ backgroundColor: '#fff', maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="row g-3">
                  {/* Row 1: Project Name & Client Name */}
                  <div className="col-md-6 text-start">
                    <label className="form-label small fw-bold text-secondary">Project Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter project name"
                      required
                      style={{ borderRadius: '4px', borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                    />
                  </div>
                  <div className="col-md-6 text-start">
                    <label className="form-label small fw-bold text-secondary">Client Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Enter client name"
                      pattern="[A-Za-z\s]+"
                      title="Client name should only contain letters and spaces"
                      required
                      style={{ borderRadius: '4px', borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                    />
                    <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>Only letters and spaces allowed.</div>
                  </div>

                  {/* Row 2: Project Manager & Project Cost */}
                  <div className="col-md-6 text-start">
                    <label className="form-label small fw-bold text-secondary">Project Manager *</label>
                    <div className="position-relative">
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0" style={{ borderColor: '#e5e7eb' }}>
                          <i className="fas fa-user text-dark"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 border-end-0"
                          value={managerSearchTerm || formData.projectManager}
                          onChange={(e) => {
                            setManagerSearchTerm(e.target.value);
                            setFormData(prev => ({ ...prev, projectManager: e.target.value }));
                            setShowManagerDropdown(true);
                          }}
                          onFocus={() => setShowManagerDropdown(true)}
                          onBlur={() => setTimeout(() => setShowManagerDropdown(false), 300)}
                          placeholder="Select Manager"
                          required
                          style={{ borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                        />
                        <span className="input-group-text bg-white border-start-0" style={{ borderColor: '#e5e7eb' }}>
                          {formData.projectManager ? (
                            <i className="fas fa-times text-muted cursor-pointer" onClick={() => { setFormData(prev => ({ ...prev, projectManager: '' })); setManagerSearchTerm(''); }}></i>
                          ) : (
                            <i className="fas fa-times text-white"></i> // Spacer
                          )}
                        </span>
                      </div>
                      {showManagerDropdown && (
                        <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1100, maxHeight: '200px', overflowY: 'auto' }}>
                          {getFilteredManagers().map((emp, i) => (
                            <div key={i} className="p-2 border-bottom hover-bg-light" style={{ cursor: 'pointer', fontSize: '0.85rem' }} onMouseDown={() => handleSelectManager(emp)}>
                              <div className="fw-bold">{emp.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-text text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                      <i className="fas fa-info-circle"></i> Search from registered project managers only
                    </div>
                  </div>

                  <div className="col-md-6 text-start">
                    <label className="form-label small fw-bold text-secondary">Project Cost *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="projectCost"
                      value={formData.projectCost}
                      onChange={handleInputChange}
                      placeholder="Enter project cost"
                      min="0"
                      step="0.01"
                      required
                      style={{ borderRadius: '4px', borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                    />
                    <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>Only positive values or zero allowed.</div>
                  </div>

                  {/* Row 3: Advance Payment & Project Status */}
                  <div className="col-md-6 text-start">
                    <label className="form-label small fw-bold text-secondary">Advance Payment</label>
                    <input
                      type="number"
                      className="form-control"
                      name="advancePayment"
                      value={formData.advancePayment}
                      onChange={handleInputChange}
                      placeholder="Enter advance payment"
                      min="0"
                      step="0.01"
                      style={{ borderRadius: '4px', borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                    />
                    <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>Only positive values or zero allowed.</div>
                  </div>

                  <div className="col-md-6 text-start">
                    <label className="form-label small fw-bold text-secondary">Project Status</label>
                    <select
                      className="form-select"
                      name="projectStatus"
                      value={formData.projectStatus}
                      onChange={handleInputChange}
                      style={{ borderRadius: '4px', borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                    >
                      <option value="assigned">Assigned</option>
                      <option value="on-track">On Track</option>
                      <option value="at-risk">At Risk</option>
                      <option value="delayed">Delayed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Row 4: Project Progress Slider */}
                  <div className="col-12 text-start">
                    <label className="form-label small fw-bold text-dark mb-1">Project Progress: {formData.progress}%</label>
                    <input
                      type="range"
                      className="form-range"
                      name="progress"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={handleInputChange}
                      style={{ accentColor: '#0d6efd' }} // Standard Bootstrap Blue
                    />
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.7rem' }}>
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>Drag the slider to set the current project completion percentage</div>
                  </div>


                  {/* Row 5: Dates */}
                  <div className="col-md-6 text-start">
                    <label className="form-label small fw-bold text-secondary">Start Date *</label>
                    <div className="input-group">
                      <input
                        type="date"
                        className="form-control"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: '4px', borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6 text-start">
                    <label className="form-label small fw-bold text-secondary">End Date *</label>
                    <div className="input-group">
                      <input
                        type="date"
                        className="form-control"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        style={{ borderRadius: '4px', borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                      />
                    </div>
                  </div>

                  {/* Row 6: Description */}
                  <div className="col-12 text-start">
                    <label className="form-label small fw-bold text-secondary">Project Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter project description"
                      style={{ borderRadius: '4px', borderColor: '#e5e7eb', fontSize: '0.9rem', resize: 'none' }}
                    ></textarea>
                  </div>

                  {/* Row 7: Assigned Members */}
                  <div className="col-12 text-start">
                    <label className="form-label small fw-bold text-dark">
                      <i className="fas fa-users me-2"></i> Assigned Members ({formData.assignedMembers.length})
                    </label>
                    <div className="input-group mb-2">
                      <span className="input-group-text bg-white" style={{ borderColor: '#e5e7eb' }}>
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setShowEmployeeDropdown(true); }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 300)}
                        placeholder="Click to see employees or type to search..."
                        style={{ borderColor: '#e5e7eb', fontSize: '0.9rem', padding: '0.6rem' }}
                      />
                    </div>
                    <div className="form-text text-muted d-flex align-items-center gap-1 mb-3" style={{ fontSize: '0.75rem' }}>
                      <i className="fas fa-info-circle"></i> Search and select from registered employees above. You can add multiple members to the project.
                    </div>

                    {showEmployeeDropdown && (
                      <div className="position-absolute bg-white border rounded shadow-sm" style={{ zIndex: 1100, maxHeight: '150px', overflowY: 'auto', width: '90%', marginTop: '-15px' }}>
                        {getFilteredEmployees().map((emp, i) => (
                          <div key={i} className="p-2 border-bottom hover-bg-light position-relative" style={{ cursor: 'pointer' }} onMouseDown={() => handleSelectEmployee(emp)}>
                            <div className="fw-bold small">{emp.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{emp.department}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Member List Area */}
                    <div className="border rounded bg-white p-4 d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '120px', borderColor: '#e5e7eb' }}>
                      {formData.assignedMembers.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2 justify-content-start w-100">
                          {formData.assignedMembers.map((member, index) => (
                            <div key={index} className="badge bg-light text-dark border d-flex align-items-center gap-2 p-2 rounded fw-normal">
                              <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>{member.charAt(0)}</div>
                              <span>{member}</span>
                              <i className="fas fa-times text-muted cursor-pointer hover-text-danger" onClick={() => handleRemoveMember(member)}></i>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="text-muted mb-2">
                            <i className="fas fa-user-plus fa-2x" style={{ opacity: 0.3 }}></i>
                          </div>
                          <h6 className="text-secondary small mb-1">No members assigned yet</h6>
                          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>Add team members who will work on this project</p>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              <div className="modal-footer p-3 bg-white border-top-0 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary px-4 fw-bold"
                  onClick={handleClose}
                  style={{ backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-bold"
                  style={{ backgroundColor: '#0d6efd', border: 'none', borderRadius: '4px', fontSize: '0.9rem' }}
                >
                  <i className="fas fa-plus-circle me-1"></i> {editingProject ? 'Update Project' : 'Add Project'}
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
