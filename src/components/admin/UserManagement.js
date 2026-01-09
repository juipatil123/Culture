import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser, updateUserPassword, getAllProjects } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import AddUserModal from '../AddUserModal';
import PasswordManagementModal from '../PasswordManagementModal';
import './AdminComponents.css';

const UserManagement = ({ onUserAdded }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterByRole, setFilterByRole] = useState('all');
  const [filterByDepartment, setFilterByDepartment] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [userViewMode, setUserViewMode] = useState('list');
  const [showPasswordManagementModal, setShowPasswordManagementModal] = useState(false);
  const [selectedUserForPasswordManagement, setSelectedUserForPasswordManagement] = useState(null);
  const [projects, setProjects] = useState([]);

  // Load users from API (Firestore only)
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const apiUsers = await getAllUsers();

      const processedUsers = (apiUsers || [])
        .map(apiUser => ({

          ...apiUser,
          id: apiUser.id || apiUser._id,
          _id: apiUser._id || apiUser.id,
          department: apiUser.department || 'Web Developer',
          projectStatus: apiUser.assignedProject ? 'Assigned' : 'Not Assigned',
          userType: apiUser.userType || (
            apiUser.role?.toLowerCase() === 'employee' ? 'Employee' :
              apiUser.role?.toLowerCase() === 'team-leader' ? 'Team Leader' :
                apiUser.role?.toLowerCase() === 'project-manager' ? 'Project Manager' :
                  apiUser.role?.toLowerCase() === 'intern' ? 'Intern' :
                    apiUser.role?.toLowerCase() === 'admin' ? 'Admin' : 'Employee'
          ),
          status: apiUser.status || 'Active',
          joinDate: apiUser.joinDate || apiUser.joiningDate || new Date().toISOString().split('T')[0]
        }));

      setAllUsers(processedUsers);
      console.log(`✅ Loaded ${processedUsers.length} users from Firestore`);
    } catch (error) {
      console.error('Error loading users from Firestore:', error);
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectsData = await getAllProjects();
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    setShowAddUserModal(true);
  };

  // Handle save/update user
  const handleSaveUser = async (userDataToSave) => {
    console.log('🚀 handleSaveUser called with:', userDataToSave);
    console.log('📝 Editing user state:', editingUser);
    try {
      let result;
      if (editingUser) {
        console.log('🔄 Updating existing user ID:', editingUser.id || editingUser._id);
        result = await updateUser(editingUser.id || editingUser._id, userDataToSave);
        console.log('✅ Update successful, result:', result);
      } else {
        console.log('➕ Creating new user...');
        result = await createUser(userDataToSave);
        console.log('✅ Creation successful, result:', result);
        if (onUserAdded) onUserAdded(userDataToSave.name);
      }
      setShowAddUserModal(false);
      setEditingUser(null);
      console.log('🔄 Reloading user list...');
      await loadUsers();
      console.log('✨ User management state updated');
    } catch (error) {
      console.error('❌ Error saving user:', error);
      if (error.response) {
        console.error('📡 Server responded with:', error.response.status, error.response.data);
      }
      alert(error.message || 'Failed to save user. Please try again.');
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUserModal(true);
  };

  // Handle delete user (Firestore only)
  const handleDeleteUser = async (userId, userName) => {
    console.log(`🗑️ Attempting to delete user: ${userName} (ID: ${userId})`);

    if (!userId) {
      console.error('❌ Error: User ID is missing or undefined!');
      alert('Cannot delete user: ID is missing.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        console.log(`📡 Sending delete request to Firestore for ID: ${userId}...`);
        await deleteUser(userId);

        console.log('✅ Delete successful in Firestore. Updating UI...');
        setAllUsers(prev => prev.filter(user => user.id !== userId && user._id !== userId));

        alert(`User ${userName} deleted successfully!`);
      } catch (error) {
        console.error('❌ FAILURE in handleDeleteUser:', error);
        console.error('Detailed Error Object:', JSON.stringify(error, null, 2));
        alert(`Failed to delete user: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Handle password management
  const handleOpenPasswordManagement = (user) => {
    setSelectedUserForPasswordManagement(user);
    setShowPasswordManagementModal(true);
  };

  const handleResetPassword = async (userId, newPassword) => {
    try {
      console.log('🔑 Resetting password for user:', userId);
      await updateUserPassword(userId, newPassword);

      // Update local state
      setAllUsers(prev => {
        const updatedUsers = prev.map(user =>
          (user.id === userId || user._id === userId)
            ? { ...user, password: newPassword, passwordUpdatedAt: new Date().toISOString() }
            : user
        );

        // Also update the currently selected user if they are the one being reset
        if (selectedUserForPasswordManagement && (selectedUserForPasswordManagement.id === userId || selectedUserForPasswordManagement._id === userId)) {
          setSelectedUserForPasswordManagement(prevSelected => ({
            ...prevSelected,
            password: newPassword,
            passwordUpdatedAt: new Date().toISOString()
          }));
        }

        return updatedUsers;
      });

      console.log('✅ Password updated successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password. Please try again.');
    }
  };

  // Filter and sort users
  const getFilteredAndSortedUsers = () => {
    let filtered = [...allUsers];

    // Search filter
    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterByRole !== 'all') {
      filtered = filtered.filter(user => user.role?.toLowerCase() === filterByRole.toLowerCase());
    }

    // Department filter
    if (filterByDepartment !== 'all') {
      filtered = filtered.filter(user => user.department === filterByDepartment);
    }

    // Status filter
    if (filterByStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterByStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const filteredUsers = getFilteredAndSortedUsers();

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  return (
    <div className="user-management">
      <div className="page-header">
        <h2>User Management ({allUsers.length})</h2>
        <button className="btn btn-primary" onClick={handleAddUser}>
          <i className="fas fa-user-plus me-2"></i>
          Add User
        </button>
      </div>

      {/* Role Statistics Summary */}
      <div className="role-stats-summary mb-4">
        {/* ... stats code remains same ... */}
        <div className="row g-3">
          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="stat-card total">
              <div className="stat-icon"><i className="fas fa-users"></i></div>
              <div className="stat-content">
                <div className="stat-label">All Users</div>
                <div className="stat-value">{allUsers.length}</div>
              </div>
            </div>
          </div>
          {/* ... other stat cards ... */}
          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="stat-card employee">
              <div className="stat-icon"><i className="fas fa-user-md"></i></div>
              <div className="stat-content">
                <div className="stat-label">Employees</div>
                <div className="stat-value">{allUsers.filter(u => u.role?.toLowerCase() === 'employee').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="stat-card team-leader">
              <div className="stat-icon"><i className="fas fa-user-tie"></i></div>
              <div className="stat-content">
                <div className="stat-label">Team Leaders</div>
                <div className="stat-value">{allUsers.filter(u => u.role?.toLowerCase() === 'team-leader').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="stat-card project-manager">
              <div className="stat-icon"><i className="fas fa-user-shield"></i></div>
              <div className="stat-content">
                <div className="stat-label">Project Managers</div>
                <div className="stat-value">{allUsers.filter(u => u.role?.toLowerCase() === 'project-manager').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="stat-card admin">
              <div className="stat-icon"><i className="fas fa-user-cog"></i></div>
              <div className="stat-content">
                <div className="stat-label">Admins</div>
                <div className="stat-value">{allUsers.filter(u => u.role?.toLowerCase() === 'admin').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="stat-card other">
              <div className="stat-icon"><i className="fas fa-ellipsis-h"></i></div>
              <div className="stat-content">
                <div className="stat-label">Other</div>
                <div className="stat-value">
                  {allUsers.filter(u => !['employee', 'team-leader', 'project-manager', 'admin'].includes(u.role?.toLowerCase())).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search users..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={filterByRole} onChange={(e) => setFilterByRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="employee">Employee</option>
            <option value="team-leader">Team Leader</option>
            <option value="project-manager">Project Manager</option>
            <option value="intern">Intern</option>
            <option value="admin">Admin</option>
          </select>


          <select value={filterByDepartment} onChange={(e) => setFilterByDepartment(e.target.value)}>
            <option value="all">All Departments</option>
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

          <select value={filterByStatus} onChange={(e) => setFilterByStatus(e.target.value)}>
            <option value="all">All Status ({allUsers.length})</option>
            <option value="Active">Active ({allUsers.filter(u => u.status === 'Active').length})</option>
            <option value="Inactive">Inactive ({allUsers.filter(u => u.status === 'Inactive').length})</option>
            <option value="On Leave">On Leave ({allUsers.filter(u => u.status === 'On Leave').length})</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="department">Sort by Department</option>
            <option value="joinDate">Sort by Join Date</option>
          </select>

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
          </button>
        </div>

        <div className="view-toggle">
          <button
            className={`btn btn-sm ${userViewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setUserViewMode('list')}
          >
            <i className="fas fa-list"></i>
          </button>
          <button
            className={`btn btn-sm ${userViewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setUserViewMode('grid')}
          >
            <i className="fas fa-th"></i>
          </button>
        </div>
      </div>

      {/* Users List */}
      {loadingUsers ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users fa-3x"></i>
          <p>No users found</p>
        </div>
      ) : (
        <div>
          {userViewMode === 'list' ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr key={user.id || user._id}>
                    <td><span className="fw-bold text-muted">{indexOfFirstUser + index + 1}</span></td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-bold">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td>{user.department}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm border-0 fw-bold status-${user.status?.toLowerCase().replace(' ', '-')}`}
                        style={{ width: 'auto', padding: '0.25rem 1.5rem 0.25rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '20px' }}
                        value={user.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await updateUser(user.id || user._id, { status: newStatus });
                            setAllUsers(prev => prev.map(u => (u.id === user.id || u._id === user._id) ? { ...u, status: newStatus } : u));
                            if (onUserAdded) onUserAdded(`Status updated to ${newStatus} for ${user.name}`);
                          } catch (err) {
                            console.error("Failed to update status", err);
                            alert("Failed to update status");
                          }
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </td>
                    <td>{formatDate(user.joinDate)}</td>
                    <td>
                      <div className="action-btn-group">
                        <button
                          className="btn-action edit"
                          onClick={() => handleEditUser(user)}
                          title="Edit"
                        >
                          <i className="far fa-edit"></i>
                        </button>
                        <button
                          className="btn-action password"
                          onClick={() => handleOpenPasswordManagement(user)}
                          title="Password Management"
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDeleteUser(user.id || user._id, user.name)}
                          title="Delete"
                        >
                          <i className="far fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="users-grid">
              {currentUsers.map((user) => (
                <div key={user.id || user._id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-avatar-large">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="user-card-body">
                    <h4>{user.name}</h4>
                    <p className="user-email">{user.email}</p>
                    <div className="user-details">
                      <span className="detail-item">
                        <i className={`fas ${user.role === 'team-leader' ? 'fa-user-tie' : user.role === 'project-manager' ? 'fa-user-shield' : 'fa-user'} me-2`}></i>
                        {user.userType}
                      </span>
                      <span className="detail-item">
                        <i className="fas fa-building me-2"></i>
                        {user.department || 'Web Development'}
                      </span>
                      <span className="detail-item">
                        <i className="fas fa-calendar-check me-2"></i>
                        Joined: {new Date(user.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="user-card-footer">
                    <button
                      className="btn-action edit"
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
                    >
                      <i className="far fa-edit"></i>
                    </button>
                    <button
                      className="btn-action password"
                      onClick={() => handleOpenPasswordManagement(user)}
                      title="Manage Password"
                    >
                      <i className="fas fa-key"></i>
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => handleDeleteUser(user.id || user._id, user.name)}
                      title="Delete User"
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredUsers.length > usersPerPage && (
            <div className="pagination-controls d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </span>
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left me-1"></i> Previous
                </button>
                <button className="btn btn-outline-primary btn-sm" disabled>
                  Page {currentPage} of {totalPages}
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  Next <i className="fas fa-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <AddUserModal
          show={showAddUserModal}
          onHide={() => {
            setShowAddUserModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          editingUser={editingUser}
          projects={projects}
          teamLeaders={allUsers.filter(u => u.role === 'team-leader')}
        />
      )}

      {/* Password Management Modal */}
      {showPasswordManagementModal && (
        <PasswordManagementModal
          show={showPasswordManagementModal}
          onHide={() => {
            setShowPasswordManagementModal(false);
            setSelectedUserForPasswordManagement(null);
          }}
          user={selectedUserForPasswordManagement}
          onResetPassword={handleResetPassword}
          onDeleteUser={handleDeleteUser}
          currentUserRole="admin"
          allUsers={allUsers}
        />
      )}
    </div>
  );
};

export default UserManagement;
