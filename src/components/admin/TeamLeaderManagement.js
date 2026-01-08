import React, { useState, useEffect } from 'react';
import { getAllTeamLeaders, createTeamLeader, updateTeamLeader, deleteTeamLeader } from '../../services/api';
import AddTeamLeaderModal from '../AddTeamLeaderModal';
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
      const leadersData = await getAllTeamLeaders();
      setTeamLeaders(leadersData);
    } catch (error) {
      console.error('Error loading team leaders:', error);
      // Fallback to localStorage if API fails
      try {
        const localTLs = JSON.parse(localStorage.getItem('teamLeaders') || '[]');
        if (localTLs.length > 0) {
          setTeamLeaders(localTLs);
          console.log('✅ Loaded team leaders from localStorage:', localTLs.length);
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
          <span className="badge bg-info p-2">Total TLs: {filteredTeamLeaders.length}</span>
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
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedTeamLeader.name}'s Dashboard
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowIndividualDashboard(false);
                    setSelectedTeamLeader(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="pm-dashboard-stats">
                  <div className="stat-card">
                    <i className="fas fa-users"></i>
                    <h3>{selectedTeamLeader.teamSize || 0}</h3>
                    <p>Team Members</p>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-project-diagram"></i>
                    <h3>{selectedTeamLeader.projectsManaged || 0}</h3>
                    <p>Projects Managed</p>
                  </div>
                </div>
                <div className="pm-projects-list">
                  <h6>Skills:</h6>
                  {selectedTeamLeader.skills && selectedTeamLeader.skills.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {Array.isArray(selectedTeamLeader.skills)
                        ? selectedTeamLeader.skills.map((skill, index) => (
                          <span key={index} className="badge bg-secondary">{skill}</span>
                        ))
                        : String(selectedTeamLeader.skills).split(',').map((skill, index) => (
                          <span key={index} className="badge bg-secondary">{skill.trim()}</span>
                        ))
                      }
                    </div>
                  ) : (
                    <p className="text-muted">No specific skills listed</p>
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

export default TeamLeaderManagement;
