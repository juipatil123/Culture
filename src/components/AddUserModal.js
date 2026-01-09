import React, { useState, useEffect } from 'react';

const AddUserModal = ({ show, onClose, onHide, onSave, editingUser, projects = [], teamLeaders = [] }) => {
  const handleClose = onClose || onHide;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    password: '',
    assignedProject: '',
    teamLeaderId: '',
    gender: '',
    status: 'Active'
  });

  const [showPassword, setShowPassword] = useState(false);


  // Populate form when editing or reset when opening for new user
  useEffect(() => {
    if (show) {
      if (editingUser) {
        setFormData({
          name: editingUser.name || '',
          email: editingUser.email || '',
          phone: editingUser.phone || '',
          department: editingUser.department || '',
          role: editingUser.role || '',
          password: editingUser.password || '', // Pre-fill password so it's visible with eye icon
          assignedProject: editingUser.assignedProject || '',
          teamLeaderId: editingUser.teamLeaderId || '',
          gender: editingUser.gender || '',
          status: editingUser.status || 'Active',
          joinDate: editingUser.joinDate || editingUser.joiningDate || new Date().toISOString().split('T')[0]
        });

      } else {
        // Reset form completely for new user
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: '',
          role: '',
          password: '', // Explicitly blank for new users
          assignedProject: '',
          teamLeaderId: '',
          gender: '',
          status: 'Active',
          joinDate: new Date().toISOString().split('T')[0]
        });

      }
      setShowPassword(false);
    }
  }, [editingUser, show]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'email' ? value.toLowerCase() : value;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: normalizedValue
      };

      // Clear project assignment if role is changed to project-manager or employee
      if (name === 'role' && (normalizedValue === 'project-manager' || normalizedValue === 'employee')) {
        newData.assignedProject = '';
      }

      return newData;
    });
  };

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

    // Validate phone number
    if (formData.phone && formData.phone.length !== 10) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    // Validate password for new users
    if (!editingUser && !formData.password) {
      alert('Password is required for new users. Please enter a password.');
      return;
    }

    // Validate password length
    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // Normalize "none" values to empty strings for database consistency
    const dataToSave = { ...formData };
    if (dataToSave.assignedProject === 'none') dataToSave.assignedProject = '';
    if (dataToSave.teamLeaderId === 'none') dataToSave.teamLeaderId = '';

    // Prevent overwriting existing password with an empty string during updates
    if (editingUser && !dataToSave.password) {
      delete dataToSave.password;
    }

    onSave(dataToSave);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      password: '',
      assignedProject: '',
      teamLeaderId: '',
      status: 'Active'
    });

    handleClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className={`fas ${editingUser ? 'fa-user-edit' : 'fa-user-plus'} me-2`}></i>
              {editingUser ? 'Edit User' : 'Add New User'}
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
                    pattern="[A-Za-z\s]+"
                    title="Name should only contain letters and spaces"
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
                  <label className="form-label">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setFormData(prev => ({ ...prev, phone: value }));
                      }
                    }}
                    placeholder="Enter 10-digit number"
                    pattern="[0-9]{10}"
                    required
                  />
                  <small className="text-muted">Must be exactly 10 digits (e.g. 9876543210)</small>
                </div>
                <div className="col-md-6 mb-3">
                  {/* Empty column for spacing */}
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
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="intern">Intern</option>
                    <option value="employee">Employee</option>
                    <option value="project-manager">Project Manager</option>
                    <option value="team-leader">Team Leader</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Join Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>


              {/* Show project assignment for interns, employees, and team leaders */}
              {formData.role && formData.role !== 'project-manager' && formData.role !== 'admin' && (
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Assign to Project</label>
                    <select
                      className="form-select"
                      name="assignedProject"
                      value={formData.assignedProject}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Project</option>
                      <option value="none">No project assigned</option>
                      {projects && projects.length > 0 ? (
                        projects.map((project) => (
                          <option key={project.id} value={project.name}>
                            {project.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No projects available</option>
                      )}
                    </select>
                    <small className="text-muted">
                      Select a project or choose "No project assigned".
                    </small>
                  </div>
                </div>
              )}

              {/* Team Leader assignment for employees and interns */}
              {(formData.role === 'employee' || formData.role === 'intern') && (
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Assign to Team Leader</label>
                    <select
                      className="form-select"
                      name="teamLeaderId"
                      value={formData.teamLeaderId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Team Leader</option>
                      <option value="none">No Team Leader assigned</option>
                      {teamLeaders && teamLeaders.length > 0 ? (
                        teamLeaders.map((tl) => (
                          <option key={tl.id || tl._id} value={tl.id || tl._id}>
                            {tl.name} ({tl.department})
                          </option>
                        ))
                      ) : (
                        <option disabled>No Team Leaders available</option>
                      )}
                    </select>
                    <small className="text-muted">
                      Assign this member to a team leader or choose "No Team Leader".
                    </small>
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">
                    Password {!editingUser && <span className="text-danger">*</span>}
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={editingUser ? "Leave blank to keep current password" : "Enter password for the user"}
                      required={!editingUser} // Required only for new users
                      minLength="6"
                      autoComplete="new-password"
                      data-lpignore="true"
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
                  <small className="text-muted">
                    {editingUser
                      ? 'Leave blank to keep current password. Enter new password to change it.'
                      : 'Minimum 6 characters required. This field is mandatory for new users.'}
                  </small>

                </div>
              </div>




            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className={`fas ${editingUser ? 'fa-save' : 'fa-user-plus'} me-2`}></i>
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
