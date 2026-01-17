import React, { useState, useEffect } from 'react';
import { getAllTeamLeaders, createTeamLeader, updateTeamLeader, deleteTeamLeader, getAllUsers, getAllProjects } from '../../services/api';
import AddTeamLeaderModal from '../AddTeamLeaderModal';
import { formatDate } from '../../utils/dateUtils';
import './AdminComponents.css';

const TeamLeaderManagement = ({ onTLAdded }) => {
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loadingTeamLeaders, setLoadingTeamLeaders] = useState(false);
  const [showAddTeamLeaderModal, setShowAddTeamLeaderModal] = useState(false);
  const [editingTeamLeader, setEditingTeamLeader] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedTeamLeader, setSelectedTeamLeader] = useState(null);
  const [showIndividualDashboard, setShowIndividualDashboard] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Load team leaders
  const loadTeamLeaders = async () => {
    setLoadingTeamLeaders(true);
    try {
      const [leadersData, usersData, projectsData] = await Promise.all([
        getAllTeamLeaders(),
        getAllUsers().catch(err => []),
        getAllProjects().catch(err => [])
      ]);

      // Enrich TLs with calculated stats
      const enrichedLeaders = leadersData.map(leader => {
        const tlName = leader.name?.toLowerCase().trim();
        const tlEmail = leader.email?.toLowerCase().trim();
        const tlId = leader.id || leader._id;

        // Find team members (users assigned to this TL)
        const teamMembers = usersData.filter(u => {
          const uTlName = u.teamLeader?.toLowerCase().trim();
          const uTlEmail = u.teamLeaderEmail?.toLowerCase().trim();

          return (
            (uTlEmail && uTlEmail === tlEmail) ||
            (uTlName && uTlName === tlName) ||
            (u.teamLeaderId === tlId) ||
            (tlName && uTlName && (uTlName.includes(tlName) || tlName.includes(uTlName))) // Relaxed name match
          );
        });

        // Find projects
        const projectsManaged = projectsData.filter(p => {
          const pTlName = p.teamLeader?.toLowerCase().trim();
          const pTlEmail = p.teamLeaderEmail?.toLowerCase().trim();

          return (
            (pTlEmail && pTlEmail === tlEmail) ||
            (pTlName && pTlName === tlName) ||
            (tlName && pTlName && (pTlName.includes(tlName) || tlName.includes(pTlName)))
          );
        });

        return {
          ...leader,
          teamSize: teamMembers.length,
          teamMembersList: teamMembers.map(u => ({ name: u.name, email: u.email, role: u.role })),
          projectsManaged: projectsManaged.length,
          projectsList: projectsManaged.map(p => p.name)
        };
      });

      // Sort by creation date (oldest first - new members at bottom)
      const sortedLeaders = enrichedLeaders.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.joiningDate || 0);
        const dateB = new Date(b.createdAt || b.joiningDate || 0);
        return dateA - dateB;
      });

      setTeamLeaders(sortedLeaders);
    } catch (error) {
      console.error('Error loading team leaders:', error);
      // Fallback to localStorage if API fails
      try {
        const localTLs = JSON.parse(localStorage.getItem('teamLeaders') || '[]');
        if (localTLs.length > 0) {
          setTeamLeaders(localTLs);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setLoadingTeamLeaders(false);
    }
  };

  useEffect(() => {
    loadTeamLeaders();
  }, []);

  // Handle add Team Leader
  const handleAddTeamLeader = () => {
    setEditingTeamLeader(null);
    setShowAddTeamLeaderModal(true);
  };

  // Handle edit Team Leader
  const handleEditTeamLeader = (leader) => {
    setEditingTeamLeader(leader);
    setShowAddTeamLeaderModal(true);
  };

  // Handle delete Team Leader
  const handleDeleteTeamLeader = async (leaderId, leaderName) => {
    if (window.confirm(`Are you sure you want to delete ${leaderName}?`)) {
      try {
        await deleteTeamLeader(leaderId);
        setTeamLeaders(prev => prev.filter(leader => leader.id !== leaderId && leader._id !== leaderId));
        alert(`Team Leader ${leaderName} deleted successfully!`);
      } catch (error) {
        console.error('Error deleting team leader:', error);
        alert('Failed to delete team leader. Please try again.');
      }
    }
  };

  // Handle save (create/update)
  const handleSaveTeamLeader = async (leaderData) => {
    try {
      if (editingTeamLeader) {
        await updateTeamLeader(editingTeamLeader.id || editingTeamLeader._id, leaderData);
        alert('Team Leader updated successfully!');
      } else {
        await createTeamLeader(leaderData);
        if (onTLAdded) onTLAdded(leaderData.name);
      }
      setShowAddTeamLeaderModal(false);
      setEditingTeamLeader(null);
      loadTeamLeaders();
    } catch (error) {
      console.error('Error saving team leader:', error);
      alert('Failed to save team leader.');
    }
  };

  // View Team Leader dashboard
  const handleViewTLDashboard = (leader) => {
    setSelectedTeamLeader(leader);
    setShowIndividualDashboard(true);
  };

  // Filter Team Leaders
  const getFilteredTeamLeaders = () => {
    let filtered = [...teamLeaders];

    if (searchTerm) {
      filtered = filtered.filter(leader =>
        leader.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leader.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(leader => leader.department === filterDepartment);
    }

    return filtered;
  };

  const filteredTeamLeaders = getFilteredTeamLeaders();

  return (
    <div className="team-leader-management">
      <div className="page-header">
        <h2>Team Leader Management</h2>
        <div className="header-stats">
          <div className="d-flex align-items-center bg-white px-3 py-2 rounded-3 shadow-sm border border-light">
            <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <i className="fas fa-users text-info"></i>
            </div>
            <div>
              <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Total TLs</div>
              <div className="h4 fw-bold mb-0 text-dark">{filteredTeamLeaders.length}</div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleAddTeamLeader}>
          <i className="fas fa-user-plus me-2"></i>
          Add Team Leader
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search team leaders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
          <option value="all">All Departments</option>
          <option value="Web Development">Web Development</option>
          <option value="Android Development">Android Development</option>
          <option value="iOS Development">iOS Development</option>
          <option value="Quality Assurance">Quality Assurance</option>
          <option value="Design">Design</option>
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

      {/* Team Leader List */}
      {loadingTeamLeaders ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading team leaders...</p>
        </div>
      ) : filteredTeamLeaders.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users-cog fa-3x"></i>
          <p>No team leaders found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="tl-grid">
          {filteredTeamLeaders.map((leader, index) => (
            <div key={leader.id || leader._id} className="tl-card">
              <div className="tl-card-header">
                <span className="sr-no-badge">#{index + 1}</span>
                <div className="user-avatar-large" style={{ position: 'absolute', top: '77.5px', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
                  {leader.name?.charAt(0).toUpperCase()}
                </div>
                <div className="header-badge">Team Leader</div>
              </div>
              <div className="tl-card-body">
                <h4>{leader.name}</h4>
                <p className="text-muted">{leader.email}</p>
                <div className="card-detail-list">
                  <div className="card-detail-item">
                    <i className="fas fa-building"></i>
                    <span>{leader.department || 'Web Development'}</span>
                  </div>
                  <div className="card-detail-item">
                    <i className="fas fa-users"></i>
                    <span>{leader.teamSize || 0} Members</span>
                  </div>
                  <div className="card-detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{leader.phone || '9876543212'}</span>
                  </div>
                </div>
              </div>
              <div className="tl-card-footer">
                <button
                  className="btn-card-outline info"
                  onClick={() => handleViewTLDashboard(leader)}
                >
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard
                </button>
                <button
                  className="btn-card-outline primary"
                  onClick={() => handleEditTeamLeader(leader)}
                >
                  <i className="far fa-edit"></i>
                  Edit
                </button>
                <button
                  className="btn-card-outline danger"
                  onClick={() => handleDeleteTeamLeader(leader.id || leader._id, leader.name)}
                >
                  <i className="far fa-trash-alt"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="tl-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Team Size</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeamLeaders.map((leader, index) => (
              <tr key={leader.id || leader._id}>
                <td>{index + 1}</td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' }}>
                      {leader.name?.charAt(0).toUpperCase()}
                    </div>
                    <strong>{leader.name}</strong>
                  </div>
                </td>
                <td>{leader.email}</td>
                <td>{leader.department || 'Not Assigned'}</td>
                <td>{leader.teamSize || 0}</td>
                <td>{leader.phone || 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => handleViewTLDashboard(leader)}
                      title="View Dashboard"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEditTeamLeader(leader)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteTeamLeader(leader.id || leader._id, leader.name)}
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

      {/* Add/Edit Team Leader Modal */}
      {showAddTeamLeaderModal && (
        <AddTeamLeaderModal
          show={showAddTeamLeaderModal}
          onHide={() => {
            setShowAddTeamLeaderModal(false);
            setEditingTeamLeader(null);
          }}
          onSave={handleSaveTeamLeader}
          editingLeader={editingTeamLeader}
        />
      )}

      {/* Individual TL Dashboard Modal */}
      {showIndividualDashboard && selectedTeamLeader && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-users-cog me-2"></i>
                  {selectedTeamLeader.name}'s Profile & Dashboard
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowIndividualDashboard(false);
                    setSelectedTeamLeader(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-4 text-center border-end">
                    <div className="user-avatar-premium mb-3 mx-auto" style={{ width: '120px', height: '120px', fontSize: '3rem', background: '#17a2b8', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                      {selectedTeamLeader.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="fw-bold">{selectedTeamLeader.name}</h3>
                    <p className="badge bg-soft-info text-info px-3 py-2" style={{ fontSize: '0.9rem' }}>Team Leader</p>

                    <div className="details-card mt-4 text-start p-3 bg-light rounded">
                      <h6 className="text-uppercase text-muted small fw-bold mb-3">Contact Information</h6>
                      <p className="mb-2"><i className="fas fa-envelope me-2 text-info"></i> {selectedTeamLeader.email}</p>
                      <p className="mb-2"><i className="fas fa-phone me-2 text-info"></i> {selectedTeamLeader.phone || 'N/A'}</p>
                      <p className="mb-0"><i className="fas fa-building me-2 text-info"></i> {selectedTeamLeader.department || 'Not Assigned'}</p>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="row g-3">
                      <div className="col-md-12">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Work Statistics</h6>
                      </div>
                      <div className="col-md-4">
                        <div className="stat-card-premium p-3 text-center bg-white border rounded shadow-sm">
                          <i className="fas fa-users text-info mb-2 fa-2x"></i>
                          <h4 className="fw-bold mb-0">{selectedTeamLeader.teamSize || 0}</h4>
                          <p className="text-muted small mb-0">Team Members</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="stat-card-premium p-3 text-center bg-white border rounded shadow-sm">
                          <i className="fas fa-project-diagram text-success mb-2 fa-2x"></i>
                          <h4 className="fw-bold mb-0">{selectedTeamLeader.projectsManaged || 0}</h4>
                          <p className="text-muted small mb-0">Projects Managed</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="stat-card-premium p-3 text-center bg-white border rounded shadow-sm">
                          <i className="fas fa-tasks text-warning mb-2 fa-2x"></i>
                          <h4 className="fw-bold mb-0">{selectedTeamLeader.totalTasks || 0}</h4>
                          <p className="text-muted small mb-0">Total Tasks</p>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="col-md-12">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Team Members</h6>
                        {selectedTeamLeader.teamMembersList && selectedTeamLeader.teamMembersList.length > 0 ? (
                          <div className="table-responsive bg-white border rounded" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            <table className="table table-sm table-hover mb-0">
                              <thead className="bg-light sticky-top">
                                <tr>
                                  <th>Name</th>
                                  <th>Role</th>
                                  <th>Email</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedTeamLeader.teamMembersList.map((member, idx) => (
                                  <tr key={idx}>
                                    <td>{member.name}</td>
                                    <td><span className="badge bg-light text-dark border">{member.role}</span></td>
                                    <td className="text-muted small">{member.email}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="alert alert-secondary text-center small">
                            <i className="fas fa-info-circle me-2"></i>
                            No active team members assigned to {selectedTeamLeader.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="col-md-12">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">Additional Details</h6>
                        <div className="row g-3">
                          <div className="col-md-6 border-bottom pb-2">
                            <span className="text-muted small d-block">Experience</span>
                            <strong>{selectedTeamLeader.experience || 'Not Mentioned'}</strong>
                          </div>
                          <div className="col-md-6 border-bottom pb-2">
                            <span className="text-muted small d-block">Joining Date</span>
                            <strong>{selectedTeamLeader.joiningDate ? formatDate(selectedTeamLeader.joiningDate) : (selectedTeamLeader.createdAt ? formatDate(selectedTeamLeader.createdAt) : 'N/A')}</strong>
                          </div>
                          <div className="col-md-6 border-bottom pb-2">
                            <span className="text-muted small d-block">Specialization</span>
                            <strong>{selectedTeamLeader.specialization || 'Generalist'}</strong>
                          </div>
                          <div className="col-md-6 border-bottom pb-2">
                            <span className="text-muted small d-block">Annual Salary</span>
                            <strong>{selectedTeamLeader.salary ? `₹${selectedTeamLeader.salary}` : 'Confidential'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6 className="text-uppercase text-muted small fw-bold mb-2">Skills & Expertise</h6>
                      {selectedTeamLeader.skills && selectedTeamLeader.skills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {Array.isArray(selectedTeamLeader.skills)
                            ? selectedTeamLeader.skills.map((skill, index) => (
                              <span key={index} className="badge bg-info">{skill}</span>
                            ))
                            : String(selectedTeamLeader.skills).split(',').map((skill, index) => (
                              <span key={index} className="badge bg-info">{skill.trim()}</span>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-muted small">No specific skills listed</p>
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

export default TeamLeaderManagement;
