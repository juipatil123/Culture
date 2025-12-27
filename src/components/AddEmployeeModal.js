import React, { useState } from 'react';

const AddEmployeeModal = ({ show, onClose, onHide, onSave }) => {
  const handleClose = onClose || onHide;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    jobTitle: '',
    contractType: 'Full-time',
    joiningDate: '',
    teamLeaderId: null
  });

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
      name: '',
      email: '',
      department: '',
      role: '',
      jobTitle: '',
      contractType: 'Full-time',
      joiningDate: '',
      teamLeaderId: null
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
              <i className="fas fa-user-plus me-2"></i>
              Add New Employee
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-select"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Android Development">Android Development</option>
                    <option value="iOS Development">iOS Development</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Design">Design</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">System Role *</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select System Role</option>
                    <option value="project-manager">Project Manager</option>
                    <option value="team-leader">Team Leader</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="Enter job title"
                    required
                  />
                </div>
                {formData.role === 'employee' && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Assign to Team Leader</label>
                    <select
                      className="form-select"
                      name="teamLeaderId"
                      value={formData.teamLeaderId || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Team Leader (Optional)</option>
                      {/* Team leaders will be populated dynamically */}
                    </select>
                  </div>
                )}
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Contract Type *</label>
                  <select
                    className="form-select"
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Joining Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save me-2"></i>
                Add Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
