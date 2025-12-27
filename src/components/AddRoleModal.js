import React, { useState, useEffect } from 'react';

const AddRoleModal = ({ show, onHide, onSave, editingRole }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'primary',
    icon: 'fas fa-user',
    permissions: []
  });

  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const availablePermissions = [
    { id: 'user_management', name: 'User Management', description: 'Create, edit, delete users' },
    { id: 'project_management', name: 'Project Management', description: 'Manage projects and assignments' },
    { id: 'team_management', name: 'Team Management', description: 'Manage teams and team leaders' },
    { id: 'role_management', name: 'Role Management', description: 'Create and manage roles' },
    { id: 'analytics_view', name: 'Analytics View', description: 'View reports and analytics' },
    { id: 'system_settings', name: 'System Settings', description: 'Modify system configurations' },
    { id: 'task_assignment', name: 'Task Assignment', description: 'Assign and manage tasks' },
    { id: 'budget_management', name: 'Budget Management', description: 'Manage project budgets' },
    { id: 'client_management', name: 'Client Management', description: 'Manage client relationships' },
    { id: 'reporting', name: 'Reporting', description: 'Generate and view reports' }
  ];

  const colorOptions = [
    { value: 'primary', label: 'Blue', class: 'bg-primary' },
    { value: 'success', label: 'Green', class: 'bg-success' },
    { value: 'danger', label: 'Red', class: 'bg-danger' },
    { value: 'warning', label: 'Yellow', class: 'bg-warning' },
    { value: 'info', label: 'Cyan', class: 'bg-info' },
    { value: 'secondary', label: 'Gray', class: 'bg-secondary' },
    { value: 'dark', label: 'Dark', class: 'bg-dark' }
  ];

  const iconOptions = [
    'fas fa-user', 'fas fa-user-tie', 'fas fa-users', 'fas fa-user-shield',
    'fas fa-crown', 'fas fa-star', 'fas fa-cog', 'fas fa-briefcase',
    'fas fa-graduation-cap', 'fas fa-tools', 'fas fa-chart-line', 'fas fa-handshake'
  ];

  useEffect(() => {
    if (editingRole) {
      setFormData({
        name: editingRole.name || '',
        description: editingRole.description || '',
        color: editingRole.color || 'primary',
        icon: editingRole.icon || 'fas fa-user',
        permissions: editingRole.permissions || []
      });
      setSelectedPermissions(editingRole.permissions || []);
    } else {
      setFormData({
        name: '',
        description: '',
        color: 'primary',
        icon: 'fas fa-user',
        permissions: []
      });
      setSelectedPermissions([]);
    }
  }, [editingRole, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const roleData = {
      ...formData,
      permissions: selectedPermissions
    };
    
    onSave(roleData);
    onHide();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-user-shield me-2"></i>
              {editingRole ? 'Edit Custom Role' : 'Create New Role'}
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">Role Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter role name"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Color</label>
                  <select
                    className="form-select"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  >
                    {colorOptions.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the role and its responsibilities"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Icon</label>
                <div className="row">
                  {iconOptions.map(icon => (
                    <div key={icon} className="col-3 col-md-2 mb-2">
                      <div 
                        className={`text-center p-2 border rounded cursor-pointer ${formData.icon === icon ? 'border-primary bg-light' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        style={{cursor: 'pointer'}}
                      >
                        <i className={`${icon} fa-lg`}></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Role Preview</label>
                <div className="card">
                  <div className="card-body text-center">
                    <div className={`rounded-circle bg-${formData.color} text-white d-inline-flex align-items-center justify-content-center mb-2`}
                         style={{width: '50px', height: '50px', fontSize: '20px'}}>
                      <i className={formData.icon}></i>
                    </div>
                    <h6 className="card-title">{formData.name || 'Role Name'}</h6>
                    <p className="text-muted small">{formData.description || 'Role description'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Permissions</label>
                <div className="row">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="col-md-6 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                        />
                        <label className="form-check-label" htmlFor={permission.id}>
                          <strong>{permission.name}</strong>
                          <br />
                          <small className="text-muted">{permission.description}</small>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPermissions.length > 0 && (
                <div className="alert alert-info">
                  <strong>Selected Permissions ({selectedPermissions.length}):</strong>
                  <div className="mt-2">
                    {selectedPermissions.map(permId => {
                      const perm = availablePermissions.find(p => p.id === permId);
                      return (
                        <span key={permId} className="badge bg-primary me-1 mb-1">
                          {perm?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save me-1"></i>
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoleModal;
