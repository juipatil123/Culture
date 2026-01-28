import React, { useState, useEffect } from 'react';

// UserRow component for displaying individual user in the table
const UserRow = ({ user, onResetPassword, onDeleteUser, currentUserRole }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleQuickReset = () => {
    if (isResetting) {
      if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
      }
      // Use both id and _id to ensure compatibility
      const userId = user.id || user._id;
      // console.log('🔑 Quick reset for user:', userId, 'New password:', newPassword);
      onResetPassword(userId, newPassword);
      setNewPassword('');
      setIsResetting(false);
      alert('✅ Password reset successfully!');
    } else {
      setIsResetting(true);
    }
  };

  const handleCancelReset = () => {
    setIsResetting(false);
    setNewPassword('');
  };

  return (
    <tr>
      <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
            style={{ width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold' }}
          >
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="fw-semibold" style={{ fontSize: '15px' }}>{user.name}</div>
            <small className="text-muted">{user.userType || user.role}</small>
          </div>
        </div>
      </td>
      <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
        <span className="text-muted" style={{ fontSize: '14px' }}>{user.email}</span>
      </td>
      <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
        <span className="badge bg-info" style={{ fontSize: '12px', padding: '6px 12px' }}>{user.userType || user.role}</span>
      </td>
      <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
        <div className="d-flex align-items-center">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control form-control-sm border-0 bg-transparent py-0"
            style={{ width: '100px', fontSize: '13px', color: '#555' }}
            value={showPassword ? (user.password || "(No password recorded)") : "********"}
            readOnly
          />
          <button
            className="btn btn-sm btn-outline-secondary border-0 ms-1"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
      </td>
      <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
        <div className="d-flex gap-2">
          {isResetting ? (
            <div className="d-flex align-items-center gap-1">
              <input
                type="password"
                className="form-control form-control-sm"
                style={{ width: '140px' }}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickReset()}
              />
              <button
                className="btn btn-sm btn-success"
                onClick={handleQuickReset}
                title="Save new password"
              >
                <i className="fas fa-check"></i>
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleCancelReset}
                title="Cancel"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ) : (
            <>
              {/* Edit/Reset Button - simplified to one action */}
              <button
                className="btn btn-sm btn-primary"
                onClick={handleQuickReset}
                title="Update password"
              >
                <i className="fas fa-edit"></i>
              </button>
              {currentUserRole === 'admin' && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                      onDeleteUser(user.id, user.name);
                    }
                  }}
                  title="Delete user"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const PasswordManagementModal = ({
  show,
  onHide,
  user,
  onResetPassword,
  onDeleteUser,
  currentUserRole,
  allUsers = []
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMode, setResetMode] = useState(false);

  // Debug: Log resetMode changes
  useEffect(() => {
    console.log('resetMode changed to:', resetMode);
  }, [resetMode]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      setResetMode(false);
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    }
  }, [show]);

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    onResetPassword(user.id || user._id, newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setResetMode(false);
    onHide();
    alert('✅ Password reset successfully!');
  };

  const handleDeleteUser = () => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      onDeleteUser(user.id || user._id, user.name);
      onHide();
    }
  };

  const handleViewPassword = () => {
    setShowPassword(!showPassword);
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1510,
      overflowY: 'auto'
    }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-cog me-2"></i>
              {user ? `User Management - ${user.name}` : 'Password Management - All Users'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            {user ? (
              // Single user management view
              <>
                <div className="user-info-section mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h6 className="mb-1">{user.name}</h6>
                      <p className="text-muted mb-1">{user.email}</p>
                      <span className="badge bg-info">{user.userType || user.role}</span>
                    </div>
                  </div>
                </div>

                <div className="password-section">
                  <h6 className="mb-3">
                    <i className="fas fa-key me-2"></i>
                    Password Management
                    {resetMode && <span className="badge bg-info ms-2">Reset Mode Active</span>}
                  </h6>

                  {!resetMode ? (
                    <div className="password-actions">
                      <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={showPassword ? (user.password || "(No password recorded)") : "••••••••"}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={handleViewPassword}
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        <small className="text-muted">
                          {showPassword ? 'Click eye icon to hide password' : 'Click eye icon to view password'}
                          {showPassword && !user.password && (
                            <span className="text-danger d-block mt-1">
                              <i className="fas fa-info-circle me-1"></i>
                              This user was added before password-saving was enabled. Please use "Edit Password" to set a new one.
                            </span>
                          )}
                        </small>
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            console.log('Edit Password clicked, setting resetMode to true');
                            setResetMode(true);
                          }}
                        >
                          <i className="fas fa-edit me-2"></i>
                          Edit Password
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="password-reset-form" style={{ border: '2px solid #ffc107', padding: '20px', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
                      <div className="alert alert-warning mb-3">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Password Reset Mode</strong> - Enter a new password below
                      </div>
                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (minimum 6 characters)"
                          minLength="6"
                          autoFocus
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          minLength="6"
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success flex-fill"
                          onClick={handleResetPassword}
                          disabled={!newPassword || !confirmPassword}
                        >
                          <i className="fas fa-check me-2"></i>
                          Update Password
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            console.log('Cancel clicked, setting resetMode to false');
                            setResetMode(false);
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                        >
                          <i className="fas fa-times me-2"></i>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {currentUserRole === 'admin' && (
                  <div className="danger-zone mt-4 pt-4 border-top">
                    <h6 className="text-danger mb-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Danger Zone
                    </h6>
                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteUser}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Delete User Account
                    </button>
                    <small className="d-block text-muted mt-2">
                      This action cannot be undone. The user will be permanently removed from the system.
                    </small>
                  </div>
                )}
              </>
            ) : (
              // All users table view
              <div className="all-users-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <i className="fas fa-users me-2"></i>
                    All Registered Users ({allUsers.length})
                  </h6>
                  <small className="text-muted">
                    <i className="fas fa-sync-alt me-1"></i>
                    Updates automatically
                  </small>
                </div>

                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-hover table-lg" style={{ fontSize: '14px' }}>
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Password</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((userData, index) => (
                        <UserRow
                          key={userData.id || index}
                          user={userData}
                          onResetPassword={onResetPassword}
                          onDeleteUser={onDeleteUser}
                          currentUserRole={currentUserRole}
                        />
                      ))}
                    </tbody>
                  </table>

                  {allUsers.length === 0 && (
                    <div className="text-center py-4">
                      <i className="fas fa-users fa-2x text-muted mb-2"></i>
                      <p className="text-muted">No users found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordManagementModal;