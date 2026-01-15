import React, { useState, useEffect } from 'react';

const AddProjectManagerModal = ({ show, onHide, onSave, editingManager = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    experience: '',
    specialization: '',
    salary: '',
    projectCount: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);


  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingManager) {
      setFormData({
        name: editingManager.name || '',
        email: editingManager.email || '',
        phone: editingManager.phone || '',
        department: editingManager.department || '',
        experience: editingManager.experience || '',
        specialization: editingManager.specialization || '',
        salary: editingManager.salary || '',
        projectCount: editingManager.projectCount || '',
        joiningDate: editingManager.joiningDate || new Date().toISOString().split('T')[0],
        status: editingManager.status || 'Active',
        password: editingManager.password || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        experience: '',
        specialization: '',
        salary: '',
        projectCount: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        password: ''
      });
    }
    setErrors({});
  }, [editingManager, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name must contain only letters and spaces';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = 'Only @gmail.com email addresses are allowed';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const managerData = {
        ...formData,
        role: 'project-manager',
        id: editingManager ? editingManager.id : `PM${Date.now()}`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=4f46e5&color=fff`
      };

      // Prevent overwriting existing password with an empty string during updates
      if (editingManager && !managerData.password) {
        delete managerData.password;
      }

      onSave(managerData);
      onHide();
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Apply restrictions based on field name
    if (name === 'name') {
      // Restrict to letters and spaces only
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'email') {
      // Automatically convert to lowercase
      value = value.toLowerCase();
    } else if (name === 'phone') {
      // Block non-digits and limit to 10
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'salary' || name === 'projectCount') {
      // Block non-digits and negative values
      value = value.replace(/\D/g, '');
      if (value !== '' && parseInt(value) < 0) value = '0';
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-user-tie me-2"></i>
              {editingManager ? 'Edit Project Manager' : 'Add New Project Manager'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-user me-1"></i>Full Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-envelope me-1"></i>Email Address *
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter @gmail.com address"
                      required
                      autoComplete="off"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-phone me-1"></i>Phone Number *
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-building me-1"></i>Department *
                    </label>
                    <select
                      className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
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
                    {errors.department && <div className="invalid-feedback">{errors.department}</div>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-briefcase me-1"></i>Experience *
                    </label>
                    <select
                      className={`form-select ${errors.experience ? 'is-invalid' : ''}`}
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                    >
                      <option value="">Select Experience</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-8 years">5-8 years</option>
                      <option value="8-10 years">8-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                    {errors.experience && <div className="invalid-feedback">{errors.experience}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-star me-1"></i>Specialization
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g., Agile, Scrum, Waterfall"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-rupee-sign me-1"></i>Salary
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="Enter annual salary (numbers only)"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-project-diagram me-1"></i>Project Count
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="projectCount"
                      value={formData.projectCount || ''}
                      onChange={handleChange}
                      placeholder="Number of assigned projects"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-calendar me-1"></i>Joining Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-toggle-on me-1"></i>Status
                    </label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-lock me-1"></i>Password *
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter login password"
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
                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}

                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                <i className="fas fa-times me-1"></i>Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save me-1"></i>
                {editingManager ? 'Update Manager' : 'Add Manager'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectManagerModal;
