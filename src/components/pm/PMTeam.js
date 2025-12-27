import React, { useState } from 'react';
import './PMComponents.css';

const PMTeam = ({ teamMembers, projects, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');

  // Filter team members
  const getFilteredMembers = () => {
    if (!searchTerm) return teamMembers;

    return teamMembers.filter(member =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredMembers = getFilteredMembers();

  return (
    <div className="pm-team">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Team</h2>
          <p className="text-muted small mb-0">Manage employees and team leaders across your projects</p>
        </div>
        <button className="btn btn-primary" onClick={onRefresh}>
          <i className="fas fa-sync me-2"></i>
          Refresh Data
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="filters-section d-flex justify-content-between align-items-center mb-4 gap-3">
        <div className="search-box flex-grow-1" style={{ maxWidth: '400px', position: 'relative' }}>
          <i className="fas fa-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderRadius: '8px' }}
          />
        </div>

        <div className="view-toggle btn-group">
          <button
            className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('card')}
          >
            <i className="fas fa-th me-1"></i> Cards
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('list')}
          >
            <i className="fas fa-list me-1"></i> List
          </button>
        </div>
      </div>

      {/* Team Members Display */}
      {filteredMembers.length === 0 ? (
        <div className="empty-state text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <p className="text-muted">No team members found matching your search</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="row g-4">
          {filteredMembers.map((member) => {
            // Get member's projects
            const memberProjects = projects.filter(p =>
              p.assigned?.some(m => m.name === member.name) ||
              p.projectManager === member.name ||
              p.projectManager === member.email
            );

            return (
              <div key={member.id || member._id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100 team-card-modern">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="member-avatar-circle me-3">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="fw-bold mb-0">{member.name}</h5>
                        <small className="text-muted d-block">{member.email}</small>
                        <span className={`badge bg-success bg-opacity-10 text-success mt-1`} style={{ fontSize: '0.7rem' }}>
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="member-info-grid mb-3">
                      <div className="info-row d-flex justify-content-between mb-2">
                        <span className="text-muted small">Department:</span>
                        <span className="fw-medium small">{member.department || 'Engineering'}</span>
                      </div>
                      <div className="info-row d-flex justify-content-between mb-2">
                        <span className="text-muted small">Role:</span>
                        <span className="badge bg-primary bg-opacity-10 text-primary small">{member.userType || member.role}</span>
                      </div>
                      <div className="info-row d-flex justify-content-between">
                        <span className="text-muted small">Phone:</span>
                        <span className="fw-medium small">{member.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="assigned-projects-section pt-3 border-top">
                      <h6 className="small fw-bold mb-2">Assigned Projects</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {memberProjects.length > 0 ? (
                          memberProjects.map((p, i) => (
                            <span key={i} className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                              {p.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small italic">No specific projects</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0 p-3 d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary flex-grow-1">View Tasks</button>
                    <button className="btn btn-sm btn-outline-secondary"><i className="fas fa-ellipsis-v"></i></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Projects</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id || member._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm me-3">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold">{member.name}</div>
                          <div className="text-muted small">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{member.department || 'Engineering'}</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">{member.userType || member.role}</span>
                    </td>
                    <td>
                      {projects.filter(p => p.assigned?.some(m => m.name === member.name)).length} Projects
                    </td>
                    <td className="pe-4 text-end">
                      <button className="btn btn-sm btn-outline-info">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMTeam;
