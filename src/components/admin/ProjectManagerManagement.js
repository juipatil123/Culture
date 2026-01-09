import React, { useState, useEffect } from 'react';
import { getAllProjectManagers, createProjectManager, updateProjectManager, deleteProjectManager } from '../../services/api';
import AddProjectManagerModal from '../AddProjectManagerModal';
import './AdminComponents.css';

const ProjectManagerManagement = () => {
  const [projectManagers, setProjectManagers] = useState([]);
  const [loadingProjectManagers, setLoadingProjectManagers] = useState(false);
  const [showAddProjectManagerModal, setShowAddProjectManagerModal] = useState(false);
  const [editingProjectManager, setEditingProjectManager] = useState(null);
  const [pmSearchTerm, setPmSearchTerm] = useState('');
  const [pmFilterDepartment, setPmFilterDepartment] = useState('all');
  const [selectedProjectManager, setSelectedProjectManager] = useState(null);
  const [showIndividualDashboard, setShowIndividualDashboard] = useState(false);
  const [viewMode, setViewMode] = useState('grid');



  // Load project managers
  const loadProjectManagers = async () => {
    setLoadingProjectManagers(true);
    try {
      // Fetch both dedicated PMs and Users to find everyone with PM role
      const [managersData, usersData] = await Promise.all([
        getAllProjectManagers().catch(err => {
          console.warn('Failed to fetch /project-managers', err);
          return [];
        }),
        import('../../services/api').then(module => module.getAllUsers()).catch(err => {
          console.warn('Failed to fetch /users', err);
          return [];
        })
      ]);

      const directPMs = Array.isArray(managersData) ? managersData : [];
      const usersPMs = Array.isArray(usersData) ? usersData.filter(u =>
        u.role === 'project-manager' || u.userType === 'Project Manager' || u.role === 'Project Manager'
      ) : [];

      // Merge and remove duplicates based on email or ID
      const mergedPMs = [...directPMs];

      usersPMs.forEach(userPM => {
        const exists = mergedPMs.some(pm =>
          (pm.id && pm.id === userPM.id) ||
          (pm._id && pm._id === userPM._id) ||
          (pm.email && userPM.email && pm.email.toLowerCase() === userPM.email.toLowerCase())
        );
        if (!exists) {
          mergedPMs.push(userPM);
        }
      });

      console.log('Final merged PM list:', mergedPMs.length);

      if (mergedPMs.length > 0) {
        setProjectManagers(mergedPMs);
        localStorage.setItem('projectManagers', JSON.stringify(mergedPMs));
      } else {
        // If totally empty, try local storage as last resort
        const localPMs = JSON.parse(localStorage.getItem('projectManagers') || '[]');
        if (localPMs.length > 0) {
          setProjectManagers(localPMs);
        } else {
          setProjectManagers([]);
        }
      }

    } catch (error) {
      console.error('Error loading project managers:', error);
      // Fallback to localStorage if API totally fails
      try {
        const localPMs = JSON.parse(localStorage.getItem('projectManagers') || '[]');
        if (localPMs.length > 0) {
          setProjectManagers(localPMs);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setLoadingProjectManagers(false);
    }
  };

  useEffect(() => {
    loadProjectManagers();
  }, []);


  // Handle add PM
  const handleAddProjectManager = () => {
    setEditingProjectManager(null);
    setShowAddProjectManagerModal(true);
  };

  // Handle edit PM
  const handleEditProjectManager = (pm) => {
    setEditingProjectManager(pm);
    setShowAddProjectManagerModal(true);
  };

  // Handle save/update PM
  const handleSaveProjectManager = async (pmData) => {
    try {
      setLoadingProjectManagers(true);
      if (editingProjectManager) {
        await updateProjectManager(editingProjectManager.id || editingProjectManager._id, pmData);
        alert('Project Manager updated successfully!');
      } else {
        // Ensure email is trimmed and lowercase for consistency
        const processedData = {
          ...pmData,
          email: pmData.email.trim().toLowerCase()
        };
        await createProjectManager(processedData);
        alert('Project Manager added successfully!');
      }
      setShowAddProjectManagerModal(false);
      setEditingProjectManager(null);
      await loadProjectManagers(); // Refresh list to show changes
    } catch (error) {
      console.error('Error saving project manager:', error);

      let errorMsg = 'Failed to save project manager. Please try again.';
      if (error.message.includes('already registered')) {
        errorMsg = 'This email address is already in use by another account.';
      } else if (error.message.includes('too weak')) {
        errorMsg = 'The password is too weak. Please use at least 6 characters.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      alert(errorMsg);
    } finally {
      setLoadingProjectManagers(false);
    }
  };

  // Handle delete PM
  const handleDeleteProjectManager = async (pmId, pmName) => {
    if (window.confirm(`Are you sure you want to delete ${pmName}?`)) {
      try {
        await deleteProjectManager(pmId);
        setProjectManagers(prev => prev.filter(pm => pm.id !== pmId && pm._id !== pmId));
        alert(`Project Manager ${pmName} deleted successfully!`);
      } catch (error) {
        console.error('Error deleting project manager:', error);
        alert('Failed to delete project manager. Please try again.');
      }
    }
  };

  // View PM dashboard
  const handleViewPMDashboard = (pm) => {
    setSelectedProjectManager(pm);
    setShowIndividualDashboard(true);
  };

  // Filter PMs
  const getFilteredPMs = () => {
    let filtered = [...projectManagers];

    if (pmSearchTerm) {
      filtered = filtered.filter(pm =>
        pm.name?.toLowerCase().includes(pmSearchTerm.toLowerCase()) ||
        pm.email?.toLowerCase().includes(pmSearchTerm.toLowerCase())
      );
    }

    if (pmFilterDepartment !== 'all') {
      filtered = filtered.filter(pm => pm.department === pmFilterDepartment);
    }

    return filtered;
  };

  const filteredPMs = getFilteredPMs();

  return (
    <div className="project-manager-management">
      <div className="page-header">
        <h2>Project Manager Management</h2>
        <div className="header-stats">
          <div className="d-flex align-items-center bg-white px-3 py-2 rounded-3 shadow-sm border border-light">
            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <i className="fas fa-user-tie text-primary"></i>
            </div>
            <div>
              <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Total PMs</div>
              <div className="h4 fw-bold mb-0 text-dark">{filteredPMs.length}</div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleAddProjectManager}>
          <i className="fas fa-user-tie me-2"></i>
          Add Project Manager
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search project managers..."
            value={pmSearchTerm}
            onChange={(e) => setPmSearchTerm(e.target.value)}
          />
        </div>

        <select value={pmFilterDepartment} onChange={(e) => setPmFilterDepartment(e.target.value)}>
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

        <div className="view-toggle">
          <button
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('list')}
          >
            <i className="fas fa-list"></i>
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('grid')}
          >
            <i className="fas fa-th"></i>
          </button>
        </div>
      </div>

      {/* PM List */}
      {loadingProjectManagers ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading project managers...</p>
        </div>
      ) : filteredPMs.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-user-tie fa-3x"></i>
          <p>No project managers found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="pm-grid">
          {filteredPMs.map((pm, index) => (
            <div key={pm.id || pm._id} className="pm-card">
              <div className="pm-card-header">
                <span className="sr-no-badge">#{index + 1}</span>
                <div className="user-avatar-large" style={{ position: 'absolute', top: '77.5px', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
                  {pm.name?.charAt(0).toUpperCase()}
                </div>
                <div className="header-badge">Project Manager</div>
              </div>
              <div className="pm-card-body">
                <h4>{pm.name}</h4>
                <p className="text-muted">{pm.email}</p>
                <div className="card-detail-list">
                  <div className="card-detail-item">
                    <i className="fas fa-building"></i>
                    <span>{pm.department || 'Not Assigned'}</span>
                  </div>
                  <div className="card-detail-item mt-2">
                    <i className="fas fa-project-diagram text-primary"></i>
                    <div className="project-count-control flex-grow-1">
                      <label className="small text-muted mb-1 d-block">Manage Project Count</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="number"
                          className="form-control border-primary"
                          title="Click to update project count"
                          defaultValue={pm.projectCount || pm.assignedProjects?.length || 0}
                          onBlur={async (e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              try {
                                await updateProjectManager(pm.id || pm._id, { projectCount: val });
                                pm.projectCount = val;
                                // Optional logic to show success
                              } catch (err) {
                                console.error('Failed to update project count', err);
                              }
                            }
                          }}
                        />
                        <span className="input-group-text bg-primary text-white border-primary">
                          <i className="fas fa-check-circle"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="card-detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{pm.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="pm-card-footer">
                <button
                  className="btn-card-outline info"
                  onClick={() => handleViewPMDashboard(pm)}
                >
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard
                </button>
                <button
                  className="btn-card-outline primary"
                  onClick={() => handleEditProjectManager(pm)}
                >
                  <i className="far fa-edit"></i>
                  Edit
                </button>
                <button
                  className="btn-card-outline danger"
                  onClick={() => handleDeleteProjectManager(pm.id || pm._id, pm.name)}
                >
                  <i className="far fa-trash-alt"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="pm-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Projects</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPMs.map((pm, index) => (
              <tr key={pm.id || pm._id}>
                <td>{index + 1}</td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {pm.name?.charAt(0).toUpperCase()}
                    </div>
                    <strong>{pm.name}</strong>
                  </div>
                </td>
                <td>{pm.email}</td>
                <td>{pm.department || 'Not Assigned'}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control form-control-sm border-primary"
                      style={{ width: '80px' }}
                      title="Edit project count"
                      defaultValue={pm.projectCount || pm.assignedProjects?.length || 0}
                      onBlur={async (e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          try {
                            await updateProjectManager(pm.id || pm._id, { projectCount: val });
                            pm.projectCount = val;
                          } catch (err) {
                            console.error('Failed to update project count', err);
                          }
                        }
                      }}
                    />
                    <small className="text-muted">Proj.</small>
                  </div>
                </td>
                <td>{pm.phone || 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => handleViewPMDashboard(pm)}
                      title="View Dashboard"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEditProjectManager(pm)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteProjectManager(pm.id || pm._id, pm.name)}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add/Edit PM Modal */}
      {showAddProjectManagerModal && (
        <AddProjectManagerModal
          show={showAddProjectManagerModal}
          onHide={() => {
            setShowAddProjectManagerModal(false);
            setEditingProjectManager(null);
          }}
          onSave={handleSaveProjectManager}
          editingManager={editingProjectManager}
        />
      )}

      {/* Individual PM Dashboard Modal */}
      {showIndividualDashboard && selectedProjectManager && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user-tie me-2"></i>
                  {selectedProjectManager.name}'s Profile & Dashboard
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowIndividualDashboard(false);
                    setSelectedProjectManager(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-4 text-center border-end">
                    <div className="user-avatar-premium mb-3 mx-auto" style={{ width: '120px', height: '120px', fontSize: '3rem', background: '#6366f1', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                      {selectedProjectManager.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="fw-bold">{selectedProjectManager.name}</h3>
                    <p className="badge bg-soft-primary text-primary px-3 py-2" style={{ fontSize: '0.9rem' }}>Project Manager</p>

                    <div className="details-card mt-4 text-start p-3 bg-light rounded">
                      <h6 className="text-uppercase text-muted small fw-bold mb-3">Contact Information</h6>
                      <p className="mb-2"><i className="fas fa-envelope me-2 text-primary"></i> {selectedProjectManager.email}</p>
                      <p className="mb-2"><i className="fas fa-phone me-2 text-primary"></i> {selectedProjectManager.phone || 'N/A'}</p>
                      <p className="mb-0"><i className="fas fa-building me-2 text-primary"></i> {selectedProjectManager.department || 'Not Assigned'}</p>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="row g-3">
                      <div className="col-md-12">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Work Statistics</h6>
                      </div>
                      <div className="col-md-4">
                        <div className="stat-card-premium p-3 text-center bg-white border rounded shadow-sm">
                          <i className="fas fa-project-diagram text-primary mb-2 fa-2x"></i>
                          <h4 className="fw-bold mb-0">{selectedProjectManager.projectCount || selectedProjectManager.assignedProjects?.length || 0}</h4>
                          <p className="text-muted small mb-0">Projects Managed</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="stat-card-premium p-3 text-center bg-white border rounded shadow-sm">
                          <i className="fas fa-tasks text-success mb-2 fa-2x"></i>
                          <h4 className="fw-bold mb-0">{selectedProjectManager.totalTasks || 0}</h4>
                          <p className="text-muted small mb-0">Total Tasks</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="stat-card-premium p-3 text-center bg-white border rounded shadow-sm">
                          <i className="fas fa-users text-info mb-2 fa-2x"></i>
                          <h4 className="fw-bold mb-0">{selectedProjectManager.teamSize || 0}</h4>
                          <p className="text-muted small mb-0">Team Size</p>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="col-md-12">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Additional Details</h6>
                        <div className="row g-3">
                          <div className="col-md-6 border-bottom pb-2">
                            <span className="text-muted small d-block">Experience</span>
                            <strong>{selectedProjectManager.experience || 'Not Mentioned'}</strong>
                          </div>
                          <div className="col-md-6 border-bottom pb-2">
                            <span className="text-muted small d-block">Joining Date</span>
                            <strong>{selectedProjectManager.joiningDate || selectedProjectManager.createdAt?.split('T')[0] || 'N/A'}</strong>
                          </div>
                          <div className="col-md-6 border-bottom pb-2">
                            <span className="text-muted small d-block">Specialization</span>
                            <strong>{selectedProjectManager.specialization || 'Generalist'}</strong>
                          </div>
                          <div className="col-md-6 border-bottom pb-2">
                            <span className="text-muted small d-block">Annual Salary</span>
                            <strong>{selectedProjectManager.salary ? `₹${selectedProjectManager.salary}` : 'Confidential'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6 className="text-uppercase text-muted small fw-bold mb-2">Assigned Project List</h6>
                      {selectedProjectManager.assignedProjects?.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {selectedProjectManager.assignedProjects.map((project, index) => (
                            <span key={index} className="badge bg-secondary">{project}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted small">No active projects assigned yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={() => setShowIndividualDashboard(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagerManagement;
