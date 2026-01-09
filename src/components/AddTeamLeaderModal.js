import React, { useState, useEffect } from 'react';

const AddTeamLeaderModal = ({ show, onHide, onSave, editingLeader }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    teamSize: 0,
    projectsManaged: 0,
    skills: '',
    phone: '',
    specialization: ''
  });
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (editingLeader) {
      setFormData({
        name: editingLeader.name || '',
        email: editingLeader.email || '',
        password: '', // Don't pre-fill password
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
        password: '',
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

    // Validate email domain
    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      alert('Only @gmail.com email addresses are allowed.');
      return;
    }

    // Validate name (only letters and spaces allowed)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      alert('Name must contain only letters and spaces. Numbers and special characters are not allowed.');
      return;
    }

    // Validate password for new user
    if (!editingLeader && (!formData.password || formData.password.length < 6)) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // Validate phone number - must be exactly 10 digits if provided
    if (formData.phone && formData.phone.length !== 10) {
      alert('Mobile number must be exactly 10 digits.');
      return;
    }

    const leaderData = {
      ...formData,
      teamSize: parseInt(formData.teamSize) || 0,
      projectsManaged: parseInt(formData.projectsManaged) || 0,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
    };

    // Remove empty password if editing (so it doesn't overwrite with empty)
    if (editingLeader && !leaderData.password) {
      delete leaderData.password;
    }

    onSave(leaderData);
    onHide();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let normalizedValue = value;

    // Handle different field validations
    if (name === 'name') {
      // Only allow letters and spaces for name field
      normalizedValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'email') {
      // Auto-convert email to lowercase
      normalizedValue = value.toLowerCase();
    } else if (name === 'phone') {
      // Only allow digits, max 10 characters
      normalizedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: normalizedValue
    }));
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-users-cog me-2"></i>
              {editingLeader ? 'Edit Team Leader' : 'Add New Team Leader'}
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
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
                    pattern="[A-Za-z\s]+"
                    title="Name should only contain letters and spaces"
                  />
                  <small className="form-text text-muted">
                    Only letters and spaces allowed. Numbers and special characters are blocked.
                  </small>
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
                    autoComplete="off"
                  />
                  <small className="form-text text-muted">
                    Email will be automatically converted to lowercase.
                  </small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    {editingLeader ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={editingLeader ? "Enter new password" : "Enter password"}
                      required={!editingLeader}
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>

                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                  <small className="form-text text-muted">
                    Only digits allowed. Must be exactly 10 digits. ({formData.phone.length}/10)
                  </small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
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
