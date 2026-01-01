import React, { useState, useEffect } from 'react';
import { getAllCustomRoles, createCustomRole, deleteCustomRole } from '../../services/api';
import './AdminComponents.css';

const RoleManagement = () => {
  const [customRoles, setCustomRoles] = useState([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState([]);

  const availablePermissions = [
    { id: 'view_users', label: 'View Users' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'view_projects', label: 'View Projects' },
    { id: 'manage_projects', label: 'Manage Projects' },
    { id: 'view_tasks', label: 'View Tasks' },
    { id: 'manage_tasks', label: 'Manage Tasks' },
    { id: 'view_reports', label: 'View Reports' },
    { id: 'manage_settings', label: 'Manage Settings' }
  ];

  // Load custom roles
  const loadCustomRoles = async () => {
    try {
      const rolesData = await getAllCustomRoles();
      setCustomRoles(rolesData);
    } catch (error) {
      console.error('Error loading custom roles:', error);
    }
  };

  useEffect(() => {
    loadCustomRoles();
  }, []);

  // Handle add role
  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      alert('Please enter a role name');
      return;
    }

    try {
      const roleData = {
        name: newRoleName,
        permissions: newRolePermissions,
        createdBy: localStorage.getItem('userName') || 'Admin'
      };
      await createCustomRole(roleData);
      setShowAddRoleModal(false);
      setNewRoleName('');
      setNewRolePermissions([]);
      loadCustomRoles();
      alert('Custom role created successfully!');
    } catch (error) {
      console.error('Error adding custom role:', error);
      alert('Failed to add custom role. Please try again.');
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the "${roleName}" role?`)) {
      try {
        await deleteCustomRole(roleId);
        setCustomRoles(prev => prev.filter(role => role.id !== roleId));
        alert(`Role "${roleName}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting custom role:', error);
        alert('Failed to delete custom role. Please try again.');
      }
    }
  };

  // Toggle permission
  const togglePermission = (permissionId) => {
    setNewRolePermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="role-management">
      <div className="page-header">
        <h2>Role Management</h2>
        <button className="btn btn-primary" onClick={() => setShowAddRoleModal(true)}>
          <i className="fas fa-plus me-2"></i>
          Add Custom Role
        </button>
      </div>

      {/* Default Roles */}
      <div className="default-roles-section">
        <h4>Default Roles</h4>
        <div className="roles-grid">
          <div className="role-card default-role">
            <div className="role-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            <h5>Admin</h5>
            <p>Full system access and control</p>
            <span className="badge bg-danger">System Role</span>
          </div>
          <div className="role-card default-role">
            <div className="role-icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <h5>Project Manager</h5>
            <p>Manage projects and teams</p>
            <span className="badge bg-primary">System Role</span>
          </div>
          <div className="role-card default-role">
            <div className="role-icon">
              <i className="fas fa-users-cog"></i>
            </div>
            <h5>Team Leader</h5>
            <p>Lead and manage team members</p>
            <span className="badge bg-info">System Role</span>
          </div>
          <div className="role-card default-role">
            <div className="role-icon">
              <i className="fas fa-user"></i>
            </div>
            <h5>Employee</h5>
            <p>Standard employee access</p>
            <span className="badge bg-success">System Role</span>
          </div>
          <div className="role-card default-role">
            <div className="role-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <h5>Intern</h5>
            <p>Limited access for interns</p>
            <span className="badge bg-warning">System Role</span>
          </div>
        </div>
      </div>

      {/* Custom Roles */}
      <div className="custom-roles-section">
        <h4>Custom Roles</h4>
        {customRoles.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-cog fa-3x"></i>
            <p>No custom roles created yet</p>
          </div>
        ) : (
          <div className="roles-grid">
            {customRoles.map((role) => (
              <div key={role.id} className="role-card custom-role">
                <div className="role-icon">
                  <i className="fas fa-user-cog"></i>
                </div>
                <h5>{role.name}</h5>
                <div className="role-permissions">
                  <strong>Permissions:</strong>
                  <ul>
                    {role.permissions?.map((perm, index) => (
                      <li key={index}>{perm}</li>
                    ))}
                  </ul>
                </div>
                <div className="role-meta">
                  <small>Created by: {role.createdBy || 'Admin'}</small>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={() => handleDeleteRole(role.id, role.name)}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Custom Role</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddRoleModal(false);
                    setNewRoleName('');
                    setNewRolePermissions([]);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Role Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Enter role name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Permissions</label>
                  <div className="permissions-grid">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={permission.id}
                          checked={newRolePermissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <label className="form-check-label" htmlFor={permission.id}>
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddRoleModal(false);
                    setNewRoleName('');
                    setNewRolePermissions([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddRole}
                >
                  Add Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
