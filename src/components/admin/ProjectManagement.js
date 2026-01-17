import React, { useState, useEffect } from 'react';
import { getAllProjects, createProject, updateProject, deleteProject, getAllUsers } from '../../services/api';
import { formatDate, formatDateRange, formatDateTime } from '../../utils/dateUtils';
import { calculateProjectStatus } from '../../utils/projectUtils';
import AddProjectModal from '../AddProjectModal';
import './AdminComponents.css';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectViewMode, setProjectViewMode] = useState('card');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [projectManagers, setProjectManagers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [notificationTitle, setNotificationTitle] = useState('Success');

  // Load projects and users (including PMs)
  const loadData = async () => {
    setLoadingProjects(true);
    try {
      const [projectsData, usersData] = await Promise.all([
        getAllProjects(),
        getAllUsers()
      ]);

      console.log('Admin: Loaded raw projects:', projectsData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const transformedProjects = (projectsData || []).map((project, index) => {
        // Use shared utility function for consistent status calculation
        const calculatedStatus = calculateProjectStatus(project);

        return {
          id: project._id || project.id || `proj-${index}`,
          name: project.name || 'Untitled Project',
          date: formatDate(project.startDate),
          progress: project.progress || 0,
          status: calculatedStatus,
          assigned: project.assignedMembers && project.assignedMembers.length > 0
            ? project.assignedMembers.map((member, i) => ({
              name: typeof member === 'object' ? member.name : member,
              color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][i % 5]
            }))
            : [],
          extra: project.assignedMembers && project.assignedMembers.length > 3 ? project.assignedMembers.length - 3 : 0,
          clientName: project.clientName || 'No Client',
          startDate: project.startDate,
          endDate: project.endDate,
          createdAt: formatDateTime(project.createdAt || project.created_at || project.timestamp || project.date || new Date()),
          updatedAt: formatDateTime(project.updatedAt || project.updated_at || project.timestamp || project.date || new Date()),
          description: project.description,
          projectCost: project.projectCost,
          advancePayment: project.advancePayment,
          projectManager: project.projectManager
        };
      });

      setProjects(transformedProjects);
      setProjectManagers(usersData || []); // Using this state to store all users for the modal

      if (projectsData && projectsData.length > 0) {
        console.log('🔍 Debug Project Data Keys:', Object.keys(projectsData[0]));
        console.log('🔍 Debug Project Data Sample:', projectsData[0]);
      }

      console.log(`✅ Admin: Set ${transformedProjects.length} projects to state`);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []); // Only run once on mount

  // Separate useEffect for checking overdue projects
  useEffect(() => {
    if (projects.length === 0) return; // Don't run if no projects loaded yet
    
    const checkOverdueProjects = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      projects.forEach(project => {
        if (project.endDate && project.status !== 'Completed') {
          const endDate = new Date(project.endDate);
          endDate.setHours(0, 0, 0, 0);
          
          if (endDate < today && project.status !== 'Overdue') {
            // Auto-update to overdue
            updateProject(project.id, { projectStatus: 'overdue' })
              .then(() => {
                setProjects(prev => prev.map(p => 
                  p.id === project.id ? { ...p, status: 'Overdue' } : p
                ));
                setNotificationTitle('Overdue Alert');
                setNotification(`Project "${project.name}" is overdue!`);
                setTimeout(() => setNotification(null), 5000);
              })
              .catch(err => console.error('Error updating overdue status:', err));
          }
        }
      });
    };
    
    // Check immediately on mount and when projects first load
    checkOverdueProjects();
    
    // Then check every hour
    const interval = setInterval(checkOverdueProjects, 3600000);
    
    return () => clearInterval(interval);
  }, []); // Only run once on mount, not when projects change

  // Handle add project
  const handleAddProject = () => {
    setEditingProject(null);
    setShowAddProjectModal(true);
  };

  // Handle save/update project
  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id || editingProject._id, projectData);
        setNotificationTitle('Success');
        setNotification('Project updated successfully!');
      } else {
        await createProject(projectData);
        setNotificationTitle('Success');
        setNotification('Project added successfully!');
      }
      setShowAddProjectModal(false);
      setEditingProject(null);
      loadData();
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error saving project:', error);
      setNotificationTitle('Error');
      setNotification('Failed to save project. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Handle edit project
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowAddProjectModal(true);
  };

  // Handle view project
  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  // Handle delete project
  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete project "${projectName}"?`)) {
      try {
        await deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setNotificationTitle('Success');
        setNotification(`Project "${projectName}" deleted successfully!`);
        setTimeout(() => setNotification(null), 5000);
      } catch (error) {
        console.error('Error deleting project:', error);
        setNotificationTitle('Error');
        setNotification('Failed to delete project. Please try again.');
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  // Filter projects
  const getFilteredProjects = () => {
    let filtered = [...projects];

    if (projectSearchTerm) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
        project.clientName?.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
        project.projectManager?.toLowerCase().includes(projectSearchTerm.toLowerCase())
      );
    }

    if (filterByStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterByStatus);
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: '#6f42c1', text: 'white' },
      'Assigned': { bg: '#6f42c1', text: 'white' }, // Support legacy
      'Completed': { bg: '#28a745', text: 'white' },
      'In Progress': { bg: '#007bff', text: 'white' },
      'Overdue': { bg: '#dc3545', text: 'white' },
      'On Track': { bg: '#007bff', text: 'white' }, // Support legacy
      'At Risk': { bg: '#dc3545', text: 'white' }, // Support legacy
      'Delayed': { bg: '#dc3545', text: 'white' }  // Support legacy
    };
    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <span className="badge rounded-pill" style={{
        backgroundColor: config.bg,
        color: config.text,
        padding: '6px 14px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div className="project-management">
      <div className="page-header d-flex justify-content-between align-items-center bg-white p-4 rounded-4 shadow-sm mb-4">
        <div>
          <h2 className="mb-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>Project Management</h2>
          <p className="text-muted small mb-0">Manage and track your organization's projects</p>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="d-flex align-items-center bg-light px-3 py-2 rounded-pill border border-white shadow-sm">
            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3" style={{ width: '38px', height: '38px' }}>
              <i className="fas fa-project-diagram text-primary" style={{ fontSize: '0.9rem' }}></i>
            </div>
            <div className="pe-2">
              <div className="text-muted fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Projects</div>
              <div className="h5 fw-bold mb-0 text-dark" style={{ lineHeight: '1' }}>{filteredProjects.length}</div>
            </div>
          </div>

          <button className="btn btn-primary d-flex align-items-center px-4 py-2 rounded-pill shadow-sm hover-elevate" onClick={handleAddProject}>
            <i className="fas fa-plus-circle me-2"></i>
            <span className="fw-bold">Create New</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section bg-white p-3 rounded-4 shadow-sm mb-4 border-0">
        <div className="row g-3 align-items-stretch">
          <div className="col-md-5 col-lg-7">
            <div className="search-box position-relative h-100">
              <i className="fas fa-search position-absolute" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }}></i>
              <input
                type="text"
                className="admin-input ps-5 h-100"
                placeholder="Search projects, clients or managers..."
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3 col-lg-2">
            <select
              className="admin-select h-100"
              value={filterByStatus}
              onChange={(e) => setFilterByStatus(e.target.value)}
            >
              <option value="all">Status: All</option>
              <option value="Pending">Status: Pending</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Overdue">Status: Overdue</option>
              <option value="Completed">Status: Completed</option>
            </select>
          </div>

          <div className="col-md-4 col-lg-3">
            <div className="view-toggle">
              <button
                className={`btn-toggle ${projectViewMode === 'card' ? 'active' : ''}`}
                onClick={() => setProjectViewMode('card')}
              >
                <i className="fas fa-th-large"></i> <span>Card View</span>
              </button>
              <button
                className={`btn-toggle ${projectViewMode === 'list' ? 'active' : ''}`}
                onClick={() => setProjectViewMode('list')}
              >
                <i className="fas fa-list"></i> <span>List View</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {loadingProjects ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-project-diagram fa-3x"></i>
          <p>No projects found</p>
        </div>
      ) : projectViewMode === 'card' ? (
        <div className="projects-grid">
          {filteredProjects.map((project, index) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <span className="badge bg-light text-dark border mb-2">#{index + 1}</span>
                <h4>{project.name}</h4>
                <div className="status-label">{project.status}</div>
              </div>
              <div className="project-card-body">
                <div className="proj-detail-list">
                  <div className="proj-detail-item">
                    <i className="fas fa-user"></i>
                    <span><strong>Client:</strong> {project.clientName}</span>
                  </div>
                  <div className="proj-detail-item">
                    <i className="fas fa-user-circle"></i>
                    <span><strong>Manager:</strong> {project.projectManager || 'Not Assigned'}</span>
                  </div>
                  <div className="proj-detail-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span><strong>Duration:</strong> {formatDateRange(project.startDate, project.endDate)}</span>
                  </div>
                  <div className="proj-detail-item">
                    <i className="fas fa-calendar-plus"></i>
                    <span><strong>Created:</strong> {project.createdAt || 'N/A'}</span>
                  </div>
                  <div className="proj-detail-item">
                    <i className="fas fa-history"></i>
                    <span><strong>Updated:</strong> {project.updatedAt || 'N/A'}</span>
                  </div>
                </div>

                <div className="proj-progress-section mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold text-muted">Progress</span>
                    <span className="small fw-bold" style={{
                      color: 
                        project.status === 'Completed' ? '#28a745' :
                        project.status === 'In Progress' ? '#007bff' :
                        project.status === 'Overdue' ? '#dc3545' : '#6f42c1'
                    }}>{project.progress}%</span>
                  </div>
                  <div className="proj-progress-bar-container" style={{ height: '8px', background: '#f0f2f5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div 
                      className="proj-progress-bar" 
                      style={{ 
                        width: `${project.progress}%`,
                        background: 
                          project.status === 'Completed' ? 'linear-gradient(90deg, #28a745, #20c997)' :
                          project.status === 'In Progress' ? 'linear-gradient(90deg, #4361ee, #4cc9f0)' :
                          project.status === 'Overdue' ? 'linear-gradient(90deg, #dc3545, #f72585)' :
                          'linear-gradient(90deg, #6f42c1, #9d4edd)',
                        transition: 'all 0.3s ease'
                      }}
                    ></div>
                  </div>
                </div>

                {project.assigned && project.assigned.length > 0 && (
                  <div className="team-section mt-3">
                    <span className="small fw-bold text-muted">Team Members:</span>
                    <div className="avatar-stack ms-2">
                      {project.assigned.slice(0, 4).map((member, index) => (
                        <div key={index} className="stack-avatar" title={member.name}>
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {project.assigned.length > 4 && (
                        <div className="stack-avatar more">
                          +{project.assigned.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="project-card-footer">
                <button
                  className="btn btn-sm btn-outline-info rounded-pill px-3"
                  onClick={() => handleViewProject(project)}
                >
                  <i className="far fa-eye me-1"></i>
                  View
                </button>
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  onClick={() => handleEditProject(project)}
                >
                  <i className="far fa-edit me-1"></i>
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                  onClick={() => handleDeleteProject(project.id, project.name)}
                >
                  <i className="far fa-trash-alt me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="projects-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Project Name</th>
              <th>Client</th>
              <th>Email Id</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Duration</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, index) => (
              <tr key={project.id}>
                <td>{index + 1}</td>
                <td><div className="fw-bold text-dark">{project.name}</div></td>
                <td><span className="text-secondary">{project.clientName}</span></td>
                <td>{project.projectManagerEmail || project.projectManager || 'Not Assigned'}</td>
                <td>
                  <span 
                    className="badge rounded-pill" 
                    style={{
                      fontSize: '0.75rem',
                      minWidth: '90px',
                      padding: '6px 12px',
                      fontWeight: '700',
                      backgroundColor: 
                        project.status === 'Completed' ? '#28a745' :
                        project.status === 'In Progress' ? '#007bff' :
                        project.status === 'Overdue' ? '#dc3545' : '#6f42c1',
                      color: 'white'
                    }}
                  >
                    {project.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2" style={{ minWidth: '120px' }}>
                    <div className="progress flex-grow-1" style={{ height: '8px', background: '#f0f2f5', borderRadius: '10px' }}>
                      <div
                        className="progress-bar"
                        style={{ 
                          width: `${project.progress}%`, 
                          background: 
                            project.status === 'Completed' ? 'linear-gradient(90deg, #28a745, #20c997)' :
                            project.status === 'In Progress' ? 'linear-gradient(90deg, #4361ee, #4cc9f0)' :
                            project.status === 'Overdue' ? 'linear-gradient(90deg, #dc3545, #f72585)' :
                            'linear-gradient(90deg, #6f42c1, #9d4edd)',
                          borderRadius: '10px',
                          transition: 'all 0.3s ease'
                        }}
                      ></div>
                    </div>
                    <span className="small fw-bold" style={{
                      color: 
                        project.status === 'Completed' ? '#28a745' :
                        project.status === 'In Progress' ? '#007bff' :
                        project.status === 'Overdue' ? '#dc3545' : '#6f42c1'
                    }}>{project.progress}%</span>
                  </div>
                </td>
                <td><i className="far fa-calendar-alt me-1 text-muted"></i> {formatDateRange(project.startDate, project.endDate)}</td>
                <td className="fw-bold text-dark">₹{project.projectCost || 0}</td>
                <td>
                  <div className="action-btn-group">
                    <button
                      className="btn-action edit"
                      onClick={() => handleEditProject(project)}
                      title="Edit Project"
                    >
                      <i className="far fa-edit"></i>
                    </button>
                    <button
                      className="btn-action view"
                      onClick={() => handleViewProject(project)}
                      title="View Details"
                    >
                      <i className="far fa-eye"></i>
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      title="Delete Project"
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add/Edit Project Modal */}
      {showAddProjectModal && (
        <AddProjectModal
          show={showAddProjectModal}
          onHide={() => {
            setShowAddProjectModal(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          editingProject={editingProject}
          availableEmployees={projectManagers}
        />
      )}

      {/* View Project Modal */}
      {showViewModal && selectedProject && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-project-diagram me-2"></i>
                  {selectedProject.name}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100 border">
                      <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Project Details</h6>
                      <div className="mb-2"><strong>Client:</strong> {selectedProject.clientName}</div>
                      <div className="mb-2"><strong>Manager:</strong> {selectedProject.projectManager || 'Not Assigned'}</div>
                      <div className="mb-2"><strong>Status:</strong> {getStatusBadge(selectedProject.status)}</div>
                      <div className="mb-2"><strong>Progress:</strong> {selectedProject.progress}%</div>
                      <div className="mb-2"><strong>Cost:</strong> ₹{selectedProject.projectCost || 0}</div>
                      <div className="mb-2"><strong>Advance:</strong> ₹{selectedProject.advancePayment || 0}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100 border">
                      <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Timeline</h6>
                      <div className="mb-2"><strong>Duration:</strong> {formatDateRange(selectedProject.startDate, selectedProject.endDate)}</div>
                      <div className="mb-2"><strong>Start Date:</strong> {formatDate(selectedProject.startDate)}</div>
                      <div className="mb-2"><strong>End Date:</strong> {formatDate(selectedProject.endDate)}</div>
                      <div className="mb-2"><strong>Created At:</strong> {selectedProject.createdAt}</div>
                      <div className="mb-2"><strong>Last Updated:</strong> {selectedProject.updatedAt}</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Description</h6>
                      <p className="text-muted mb-0">{selectedProject.description || 'No description available.'}</p>
                    </div>
                  </div>
                  {selectedProject.assigned && selectedProject.assigned.length > 0 && (
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3 border">
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Team Members</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedProject.assigned.map((member, i) => (
                            <span key={i} className="badge bg-secondary p-2">{member.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled Notification Popup */}
      {notification && (
        <div className="notification-pop animate__animated animate__fadeInDown" style={{
          position: 'fixed',
          top: '20px',
          right: '50%',
          transform: 'translateX(50%)',
          backgroundColor: notificationTitle === 'Success' ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px'
        }}>
          <i className={`fas ${notificationTitle === 'Success' ? 'fa-check-circle' : 'fa-exclamation-circle'} fa-lg`}></i>
          <div>
            <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{notificationTitle}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{notification}</div>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              marginLeft: 'auto',
              cursor: 'pointer',
              padding: '0 0 0 10px'
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
