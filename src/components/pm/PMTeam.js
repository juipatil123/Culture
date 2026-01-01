import React, { useState } from 'react';
import './PMComponents.css';

const PMTeam = ({ teamMembers, allUsers = [], projects, onRefresh, onAddMember, onEditMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedTeamLeader, setSelectedTeamLeader] = useState(null);

  // Helper to get role label
  const getRoleLabel = (member) => {
    const role = member.role || member.userType || '';
    if (role.toLowerCase() === 'team-leader') return 'Team Leader';
    if (role.toLowerCase() === 'project-manager') return 'Project Manager';
    if (role.toLowerCase() === 'employee') return 'Employee';
    if (role.toLowerCase() === 'intern') return 'Intern';
    return role || 'Member';
  };

  // Helper to get team size
  const getTeamSize = (tl) => {
    return allUsers.filter(user =>
      user.teamLeaderId === tl._id ||
      user.teamLeaderId === tl.id ||
      user.teamLeader === tl.name ||
      (user.teamLeaderId && (tl._id === user.teamLeaderId || tl.id === user.teamLeaderId))
    ).length;
  };

  // Helper to get cumulative project count for a TL and their team
  const getCumulativeProjects = (member) => {
    if (member.role !== 'team-leader' && member.userType !== 'team-leader') {
      return projects.filter(p => (p.assignedMembers || p.assigned || []).some(m => (typeof m === 'object' ? m.name : m) === member.name)).length;
    }

    // If TL, find all their team members
    const teamMemberNames = allUsers
      .filter(u => u.teamLeaderId === member._id || u.teamLeaderId === member.id || u.teamLeader === member.name)
      .map(u => u.name);

    // Add the leader themselves to the set
    teamMemberNames.push(member.name);

    // Count projects where any team member is assigned
    return projects.filter(p => {
      const assigned = (p.assignedMembers || p.assigned || []);
      return assigned.some(m => {
        const name = typeof m === 'object' ? m.name : m;
        return teamMemberNames.includes(name);
      });
    }).length;
  };

  // Filter team members/leaders based on drill-down state
  const getDisplayMembers = () => {
    let baseList = [];

    if (selectedTeamLeader) {
      // Show members of the selected team leader
      baseList = (allUsers.length > 0 ? allUsers : teamMembers).filter(user => {
        // Strict null checks to avoid matching undefined === undefined
        const tlId = selectedTeamLeader._id || selectedTeamLeader.id;
        const tlName = selectedTeamLeader.name;

        const matchesId = tlId && (
          (user.teamLeaderId && user.teamLeaderId.toString() === tlId.toString())
        );

        const matchesName = tlName && (
          (user.teamLeader && user.teamLeader === tlName)
        );

        return matchesId || matchesName;
      });
    } else {
      // Show only team leaders initially
      baseList = (allUsers.length > 0 ? allUsers : teamMembers).filter(user =>
        user.role === 'team-leader' || user.userType === 'team-leader'
      );
    }

    if (!searchTerm) return baseList;

    return baseList.filter(member =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const displayMembers = getDisplayMembers();

  const handleRowDoubleClick = (member) => {
    if (!selectedTeamLeader && (member.role === 'team-leader' || member.userType === 'team-leader')) {
      setSelectedTeamLeader(member);
      setSearchTerm('');
    }
  };

  const handleBack = () => {
    setSelectedTeamLeader(null);
    setSearchTerm('');
  };

  return (
    <div className="pm-team">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            {selectedTeamLeader ? (
              <>
                <button className="btn btn-sm btn-link text-decoration-none ps-0" onClick={handleBack}>
                  <i className="fas fa-arrow-left me-2"></i>
                </button>
                Team: {selectedTeamLeader.name}
              </>
            ) : "My Team"}
          </h2>
          <p className="text-muted small mb-0">
            {selectedTeamLeader
              ? `Showing members under ${selectedTeamLeader.name}`
              : "Manage team leaders and their teams"}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={onRefresh}>
            <i className="fas fa-sync me-2"></i>
            Refresh
          </button>
          <button className="btn btn-primary" onClick={onAddMember}>
            <i className="fas fa-user-plus me-2"></i>
            Add Team Member
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="filters-section d-flex justify-content-between align-items-center mb-4 gap-3">
        <div className="search-box flex-grow-1" style={{ maxWidth: '400px', position: 'relative' }}>
          <i className="fas fa-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
          <input
            type="text"
            className="form-control ps-5"
            placeholder={selectedTeamLeader ? "Search members..." : "Search team leaders..."}
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
      {displayMembers.length === 0 ? (
        <div className="empty-state text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <p className="text-muted">
            {selectedTeamLeader
              ? `No members found in ${selectedTeamLeader.name}'s team`
              : "No team leaders found"}
          </p>
          {selectedTeamLeader && (
            <button className="btn btn-outline-primary mt-3" onClick={handleBack}>
              Go Back to Team Leaders
            </button>
          )}
        </div>
      ) : viewMode === 'card' ? (
        <div className="row g-4">
          {displayMembers.map((member) => {
            // Get member's projects
            const memberProjects = projects.filter(p =>
              p.assigned?.some(m => m.name === member.name) ||
              p.projectManager === member.name ||
              p.projectManager === member.email
            );

            return (
              <div
                key={member.id || member._id}
                className="col-md-6 col-lg-4"
                onDoubleClick={() => handleRowDoubleClick(member)}
                style={{ cursor: !selectedTeamLeader && (member.role === 'team-leader' || member.userType === 'team-leader') ? 'pointer' : 'default' }}
                title={!selectedTeamLeader ? "Double click to view team members" : ""}
              >
                <div className="card border-0 shadow-sm h-100 team-card-modern">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="member-avatar-circle me-3">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="fw-bold mb-0">{member.name}</h5>
                            <small className="text-muted d-block">{member.email}</small>
                          </div>
                          <span className="badge" style={{
                            backgroundColor: '#f0fdf4',
                            color: '#16a34a',
                            fontSize: '0.65rem',
                            border: '1px solid #dcfce7'
                          }}>
                            {member.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="member-info-grid mb-3">
                      <div className="info-row d-flex justify-content-between mb-2">
                        <span className="text-muted small">Department:</span>
                        <span className="fw-medium small text-truncate" style={{ maxWidth: '120px' }}>{member.department || 'Web Development'}</span>
                      </div>
                      <div className="info-row d-flex justify-content-between mb-2">
                        <span className="text-muted small">Role:</span>
                        <span className="badge" style={{
                          backgroundColor: '#eef2ff',
                          color: '#4f46e5',
                          fontSize: '0.7rem',
                          border: '1px solid #e0e7ff'
                        }}>{getRoleLabel(member)}</span>
                      </div>
                      {!selectedTeamLeader && (
                        <div className="info-row d-flex justify-content-between mb-2">
                          <span className="text-muted small">Team Size:</span>
                          <span className="fw-bold small text-primary">{getTeamSize(member)} Member(s)</span>
                        </div>
                      )}
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
                    {member.role === 'team-leader' && !selectedTeamLeader ? (
                      <button className="btn btn-sm btn-primary flex-grow-1" onClick={() => setSelectedTeamLeader(member)}>
                        <i className="fas fa-users me-1"></i> View Team
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline-primary flex-grow-1">
                        <i className="fas fa-tasks me-1"></i> View Tasks
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-info" onClick={() => onEditMember(member)} title="Edit Member">
                      <i className="fas fa-edit"></i>
                    </button>
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
                  <th className="ps-4">
                    {selectedTeamLeader ? "Team Member" : "Team Leader"}
                  </th>
                  <th>Department</th>
                  <th>Role</th>
                  {!selectedTeamLeader && <th>Team Size</th>}
                  <th>Status</th>
                  <th>Projects</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayMembers.map((member) => (
                  <tr
                    key={member.id || member._id}
                    onDoubleClick={() => handleRowDoubleClick(member)}
                    style={{ cursor: !selectedTeamLeader && (member.role === 'team-leader' || member.userType === 'team-leader') ? 'pointer' : 'default' }}
                    title={!selectedTeamLeader ? "Double click to view team members" : ""}
                  >
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
                    <td>{member.department || 'Web Development'}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: '#eef2ff',
                        color: '#4f46e5',
                        minWidth: '100px',
                        padding: '6px 12px',
                        border: '1px solid #e0e7ff',
                        fontWeight: '600'
                      }}>
                        {getRoleLabel(member)}
                      </span>
                    </td>
                    {!selectedTeamLeader && (
                      <td className="ps-3">
                        <span className="badge rounded-pill" style={{
                          backgroundColor: '#f5f3ff',
                          color: '#7c3aed',
                          border: '1px solid #ddd6fe',
                          padding: '6px 14px',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}>
                          {getTeamSize(member)}
                        </span>
                      </td>
                    )}
                    <td>
                      <span className="badge" style={{
                        backgroundColor: member.status?.toLowerCase() === 'inactive' ? '#fef2f2' : '#f0fdf4',
                        color: member.status?.toLowerCase() === 'inactive' ? '#dc2626' : '#16a34a',
                        padding: '6px 12px',
                        border: member.status?.toLowerCase() === 'inactive' ? '1px solid #fee2e2' : '1px solid #dcfce7',
                        fontWeight: '600'
                      }}>
                        {member.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <span className="badge rounded-pill" style={{
                        backgroundColor: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        padding: '6px 12px',
                        fontWeight: '600'
                      }}>
                        {getCumulativeProjects(member)}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {!selectedTeamLeader && member.role === 'team-leader' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setSelectedTeamLeader(member)}
                            title="View Team"
                          >
                            <i className="fas fa-users"></i>
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline-primary" onClick={() => onEditMember(member)} title="Edit Member">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-info" onClick={() => onEditMember(member)} title="View Details">
                          <i className="fas fa-eye"></i>
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
    </div>
  );
};

export default PMTeam;
