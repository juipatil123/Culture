import React, { useState } from 'react';
import { formatDate, formatDateRange } from '../../utils/dateUtils';
import './PMComponents.css';

const PMProjects = ({ projects, onRefresh, onAddProject, onEditProject, onDeleteProject, userName, userEmail }) => {
  const [projectViewMode, setProjectViewMode] = useState('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);

  // Filter projects
  const getFilteredProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
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
      'assigned': { bg: '#fef2f2', color: '#991b1b', border: '#fee2e2', label: 'Assigned' },
      'completed': { bg: '#f0fdf4', color: '#16a34a', border: '#dcfce7', label: 'Completed' },
      'on track': { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe', label: 'On Track' },
      'at risk': { bg: '#fff7ed', color: '#9a3412', border: '#ffedd5', label: 'At Risk' },
      'delayed': { bg: '#fef2f2', color: '#991b1b', border: '#fee2e2', label: 'Delayed' }
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig['on track'];
    return (
      <span className="badge" style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: '0.75rem',
        padding: '6px 12px',
        fontWeight: '600'
      }}>
        {config.label}
      </span>
    );
  };

  // View project details
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  return (
    <div className="pm-projects">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Projects</h2>
          <p className="text-muted small mb-0">Overview of all initiatives and client deliverables</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={onRefresh}>
            <i className="fas fa-sync me-2"></i>Refresh
          </button>
          <button className="btn btn-primary" onClick={onAddProject}>
            <i className="fas fa-plus me-2"></i>Add Project
          </button>
        </div>
      </div>

      <div className="filters-section d-flex justify-content-between align-items-center mb-4 gap-3 bg-white p-3 rounded-4 shadow-sm border">
        <div className="search-box flex-grow-1" style={{ maxWidth: '400px', position: 'relative' }}>
          <i className="fas fa-search position-absolute" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
          <input
            type="text"
            className="ps-5 py-2"
            placeholder="Search project name or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderRadius: '10px' }}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select py-2"
            value={filterByStatus}
            onChange={(e) => setFilterByStatus(e.target.value)}
            style={{ borderRadius: '10px', minWidth: '150px' }}
          >
            <option value="all">All Project Status</option>
            <option value="Assigned">Assigned</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="view-toggle btn-group">
            <button
              className={`btn btn-sm ${projectViewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setProjectViewMode('card')}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              className={`btn btn-sm ${projectViewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setProjectViewMode('list')}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-project-diagram fa-3x"></i>
          <p>No projects found</p>
        </div>
      ) : projectViewMode === 'card' ? (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h4>{project.name}</h4>
                {getStatusBadge(project.status)}
              </div>
              <div className="project-card-body">
                <div className="project-info">
                  <div className="info-item">
                    <i className="fas fa-user-tie"></i>
                    <span><strong>Client:</strong> {project.clientName}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-calendar"></i>
                    <span><strong>Duration:</strong> {formatDateRange(project.startDate, project.endDate)}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-rupee-sign"></i>
                    <span><strong>Cost:</strong> ₹{project.projectCost || 0}</span>
                  </div>
                </div>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                {project.assigned && project.assigned.length > 0 && (
                  <div className="team-members">
                    <span>Team:</span>
                    <div className="member-avatars">
                      {project.assigned.slice(0, 3).map((member, index) => (
                        <div key={index} className={`member-avatar ${member.color}`} title={member.name}>
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {project.assigned.length > 3 && (
                        <div className="member-avatar bg-secondary">
                          +{project.assigned.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="project-card-footer">
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => handleViewDetails(project)}
                >
                  <i className="fas fa-eye me-1"></i>
                  View Details
                </button>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onEditProject(project)}
                >
                  <i className="fas fa-edit me-1"></i>
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDeleteProject(project.id || project._id)}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Project Details</th>
                  <th>Client</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Dates</th>
                  <th>Budget</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id || project._id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{project.name}</div>
                      <small className="text-muted">ID: {(project.id || project._id)?.substring(0, 8)}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-building text-muted small"></i>
                        <span className="small">{project.clientName || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="member-avatars d-flex align-items-center">
                        {(() => {
                          const assignedList = project.assignedMembers || project.assigned || [];
                          const manager = project.projectManager;
                          const uniqueMembers = [...new Set([
                            ...assignedList.map(m => typeof m === 'object' ? m.name : m),
                            ...(manager ? [manager] : [])
                          ])].filter(Boolean);

                          if (uniqueMembers.length > 0) {
                            return (
                              <>
                                <div className="d-flex anonym-avatars" style={{ marginRight: '8px' }}>
                                  {uniqueMembers.slice(0, 3).map((name, index) => (
                                    <div key={index}
                                      className="avatar-circle-sm bg-primary text-white border border-white rounded-circle d-flex align-items-center justify-content-center"
                                      style={{ width: '28px', height: '28px', fontSize: '10px', marginLeft: index > 0 ? '-10px' : '0', zIndex: 10 - index }}
                                      title={name}>
                                      {name.charAt(0)}
                                    </div>
                                  ))}
                                </div>
                                {uniqueMembers.length > 3 && (
                                  <span className="smaller text-muted" style={{ fontSize: '0.75rem', fontWeight: '500' }}>+{uniqueMembers.length - 3} others</span>
                                )}
                              </>
                            );
                          }
                          return <span className="text-muted smaller italic" style={{ fontSize: '0.75rem' }}>Not Assigned</span>;
                        })()}
                      </div>
                    </td>
                    <td>{getStatusBadge(project.status)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '6px', width: '60px', borderRadius: '10px' }}>
                          <div
                            className={`progress-bar ${project.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="small fw-bold">{project.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="smaller">
                        <i className="far fa-calendar me-1"></i> {formatDateRange(project.startDate, project.endDate)}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold small text-dark">₹{(project.projectCost || 0).toLocaleString()}</div>
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-xs btn-outline-info" onClick={() => handleViewDetails(project)} title="View Details">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn btn-xs btn-outline-primary" onClick={() => onEditProject(project)} title="Edit Project">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-xs btn-outline-danger" onClick={() => onDeleteProject(project.id || project._id)} title="Delete Project">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetail && selectedProject && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedProject.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowProjectDetail(false);
                    setSelectedProject(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="project-detail-info">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Client:</strong> {selectedProject.clientName}</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedProject.status)}</p>
                      <p><strong>Duration:</strong> {formatDateRange(selectedProject.startDate, selectedProject.endDate)}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Project Cost:</strong> ₹{selectedProject.projectCost || 0}</p>
                      <p><strong>Advance Payment:</strong> ₹{selectedProject.advancePayment || 0}</p>
                      <p><strong>Progress:</strong> {selectedProject.progress}%</p>
                    </div>
                  </div>
                  {selectedProject.description && (
                    <div className="mt-3">
                      <strong>Description:</strong>
                      <p>{selectedProject.description}</p>
                    </div>
                  )}
                  {selectedProject.assigned && selectedProject.assigned.length > 0 && (
                    <div className="mt-3">
                      <strong>Team Members:</strong>
                      <div className="team-list mt-2">
                        {selectedProject.assigned.map((member, index) => (
                          <span key={index} className="badge bg-primary me-2 mb-2">
                            {member.name}
                          </span>
                        ))}
                      </div>
                    </div>
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

export default PMProjects;

