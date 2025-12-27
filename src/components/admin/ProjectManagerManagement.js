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
      if (editingProjectManager) {
        await updateProjectManager(editingProjectManager.id || editingProjectManager._id, pmData);
      } else {
        await createProjectManager(pmData);
      }
      setShowAddProjectManagerModal(false);
      setEditingProjectManager(null);
      loadProjectManagers();
    } catch (error) {
      console.error('Error saving project manager:', error);
      alert('Failed to save project manager. Please try again.');
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
          <option value="Mobile Development">Mobile Development</option>
          <option value="UI/UX Design">UI/UX Design</option>
        </select>
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
      ) : (
        <div className="pm-grid">
          {filteredPMs.map((pm) => (
            <div key={pm.id || pm._id} className="pm-card">
              <div className="pm-card-header">
                <div className="pm-avatar">
                  {pm.name?.charAt(0).toUpperCase()}
                </div>
                <span className="badge badge-pm">Project Manager</span>
              </div>
              <div className="pm-card-body">
                <h4>{pm.name}</h4>
                <p className="pm-email">{pm.email}</p>
                <div className="pm-details">
                  <div className="detail-item">
                    <i className="fas fa-building"></i>
                    <span>{pm.department || 'Not Assigned'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-project-diagram"></i>
                    <span>{pm.assignedProjects?.length || 0} Projects</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{pm.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="pm-card-footer">
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => handleViewPMDashboard(pm)}
                >
                  <i className="fas fa-eye me-1"></i>
                  View Dashboard
                </button>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEditProjectManager(pm)}
                >
                  <i className="fas fa-edit me-1"></i>
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteProjectManager(pm.id || pm._id, pm.name)}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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
          editingProjectManager={editingProjectManager}
        />
      )}

      {/* Individual PM Dashboard Modal */}
      {showIndividualDashboard && selectedProjectManager && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedProjectManager.name}'s Dashboard
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowIndividualDashboard(false);
                    setSelectedProjectManager(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="pm-dashboard-stats">
                  <div className="stat-card">
                    <i className="fas fa-project-diagram"></i>
                    <h3>{selectedProjectManager.assignedProjects?.length || 0}</h3>
                    <p>Assigned Projects</p>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-tasks"></i>
                    <h3>{selectedProjectManager.totalTasks || 0}</h3>
                    <p>Total Tasks</p>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-users"></i>
                    <h3>{selectedProjectManager.teamSize || 0}</h3>
                    <p>Team Members</p>
                  </div>
                </div>
                <div className="pm-projects-list">
                  <h6>Assigned Projects:</h6>
                  {selectedProjectManager.assignedProjects?.length > 0 ? (
                    <ul>
                      {selectedProjectManager.assignedProjects.map((project, index) => (
                        <li key={index}>{project}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No projects assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagerManagement;
