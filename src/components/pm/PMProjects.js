import React, { useState } from 'react';
import { updateProject } from '../../services/api';
import './PMComponents.css';

const PMProjects = ({ projects, onRefresh, onAddProject, onEditProject, userName, userEmail }) => {


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
      'Assigned': { bg: '#6f42c1', text: 'white' },
      'Completed': { bg: '#28a745', text: 'white' },
      'On Track': { bg: '#007bff', text: 'white' },
      'At Risk': { bg: '#ffc107', text: 'black' },
      'Delayed': { bg: '#dc3545', text: 'white' }
    };
    const config = statusConfig[status] || statusConfig['On Track'];
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.text,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {status}
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
      <div className="page-header">
        <h2>My Projects</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={onRefresh}>
            <i className="fas fa-sync me-2"></i>
            Refresh
          </button>
          <button className="btn btn-primary" onClick={onAddProject}>
            <i className="fas fa-plus me-2"></i>
            Add Project
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterByStatus} onChange={(e) => setFilterByStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="Assigned">Assigned</option>
          <option value="On Track">On Track</option>
          <option value="At Risk">At Risk</option>
          <option value="Delayed">Delayed</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="view-toggle">
          <button
            className={`btn btn-sm ${projectViewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setProjectViewMode('card')}
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            className={`btn btn-sm ${projectViewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setProjectViewMode('list')}
          >
            <i className="fas fa-list"></i>
          </button>
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
                    <span><strong>Start:</strong> {project.date}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-dollar-sign"></i>
                    <span><strong>Cost:</strong> ${project.projectCost || 0}</span>
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
                {project.assigned.length > 0 && (
                  <div className="team-members">
                    <span>Team:</span>
                    <div className="member-avatars">
                      {project.assigned.slice(0, 3).map((member, index) => (
                        <div key={index} className={`member-avatar ${member.color}`} title={member.name}>
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {project.extra > 0 && (
                        <div className="member-avatar bg-secondary">
                          +{project.extra}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="projects-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Client</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Start Date</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td><strong>{project.name}</strong></td>
                <td>{project.clientName}</td>
                <td>{getStatusBadge(project.status)}</td>
                <td>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <small>{project.progress}%</small>
                </td>
                <td>{project.date}</td>
                <td>${project.projectCost || 0}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => handleViewDetails(project)}
                    title="View Details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                      <p><strong>Start Date:</strong> {selectedProject.date}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Project Cost:</strong> ${selectedProject.projectCost || 0}</p>
                      <p><strong>Advance Payment:</strong> ${selectedProject.advancePayment || 0}</p>
                      <p><strong>Progress:</strong> {selectedProject.progress}%</p>
                    </div>
                  </div>
                  {selectedProject.description && (
                    <div className="mt-3">
                      <strong>Description:</strong>
                      <p>{selectedProject.description}</p>
                    </div>
                  )}
                  {selectedProject.assigned.length > 0 && (
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
