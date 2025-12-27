import React, { useState, useEffect } from 'react';

const AddTeamLeaderModal = ({ show, onHide, onSave, editingLeader }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    teamSize: 0,
    projectsManaged: 0,
    skills: '',
    phone: '',
    specialization: ''
  });

  useEffect(() => {
    if (editingLeader) {
      setFormData({
        name: editingLeader.name || '',
        email: editingLeader.email || '',
        department: editingLeader.department || '',
        teamSize: editingLeader.teamSize || 0,
        projectsManaged: editingLeader.projectsManaged || 0,
        skills: editingLeader.skills ? editingLeader.skills.join(', ') : '',
        phone: editingLeader.phone || '',
        specialization: editingLeader.specialization || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: '',
        teamSize: 0,
        projectsManaged: 0,
        skills: '',
        phone: '',
        specialization: ''
      });
    }
  }, [editingLeader, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const leaderData = {
      ...formData,
      teamSize: parseInt(formData.teamSize) || 0,
      projectsManaged: parseInt(formData.projectsManaged) || 0,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
    };
    
    onSave(leaderData);
    onHide();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-users-cog me-2"></i>
              {editingLeader ? 'Edit Team Leader' : 'Add New Team Leader'}
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
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
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
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
                    onChange={handleChange}
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
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Team Size</label>
                  <input
                    type="number"
                    className="form-control"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    min="0"
                    placeholder="Number of team members"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Skills</label>
                <textarea
                  className="form-control"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter skills separated by commas (e.g., React, Node.js, Team Management)"
                />
                <small className="form-text text-muted">
                  Separate multiple skills with commas
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save me-1"></i>
                {editingLeader ? 'Update Team Leader' : 'Add Team Leader'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeamLeaderModal;
