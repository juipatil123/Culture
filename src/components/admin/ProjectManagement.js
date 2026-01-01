import React, { useState, useEffect } from 'react';
import { getAllProjects, createProject, updateProject, deleteProject, getAllUsers } from '../../services/api';
import AddProjectModal from '../AddProjectModal';
import './AdminComponents.css';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectViewMode, setProjectViewMode] = useState('card');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [projectManagers, setProjectManagers] = useState([]);

  // Load projects and users (including PMs)
  const loadData = async () => {
    setLoadingProjects(true);
    try {
      const [projectsData, usersData] = await Promise.all([
        getAllProjects(),
        getAllUsers()
      ]);

      console.log('Admin: Loaded raw projects:', projectsData);

      const transformedProjects = (projectsData || []).map((project, index) => ({
        id: project._id || project.id || `proj-${index}`,
        name: project.name || 'Untitled Project',
        date: project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date',
        progress: project.progress || 0,
        status: project.projectStatus === 'assigned' ? 'Assigned' :
          project.projectStatus === 'on-track' ? 'On Track' :
            project.projectStatus === 'at-risk' ? 'At Risk' :
              project.projectStatus === 'delayed' ? 'Delayed' :
                project.projectStatus === 'completed' ? 'Completed' : 'On Track',
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
        description: project.description,
        projectCost: project.projectCost,
        advancePayment: project.advancePayment,
        projectManager: project.projectManager
      }));

      setProjects(transformedProjects);
      setProjectManagers(usersData || []); // Using this state to store all users for the modal
      console.log(`✅ Admin: Set ${transformedProjects.length} projects to state`);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      } else {
        await createProject(projectData);
      }
      setShowAddProjectModal(false);
      setEditingProject(null);
      loadData();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  // Handle edit project
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowAddProjectModal(true);
  };

  // Handle delete project
  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete project "${projectName}"?`)) {
      try {
        await deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        alert(`Project "${projectName}" deleted successfully!`);
        // loadData(); // Optional: if we want to refresh fully, but local update is faster
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
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
      'Assigned': { bg: '#6f42c1', text: 'white' },
      'Completed': { bg: '#28a745', text: 'white' },
      'On Track': { bg: '#007bff', text: 'white' },
      'At Risk': { bg: '#ffc107', text: 'black' },
      'Delayed': { bg: '#dc3545', text: 'white' }
    };
    const config = statusConfig[status] || statusConfig['On Track'];
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
      <div className="page-header">
        <h2>Project Management</h2>
        <button className="btn btn-primary" onClick={handleAddProject}>
          <i className="fas fa-plus me-2"></i>
          Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search projects..."
            value={projectSearchTerm}
            onChange={(e) => setProjectSearchTerm(e.target.value)}
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
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
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
                    <span><strong>Start Date:</strong> {project.date}</span>
                  </div>
                  <div className="proj-detail-item">
                    <i className="fas fa-rupee-sign"></i>
                    <span><strong>Costing:</strong> ₹{project.projectCost || 0}</span>
                  </div>
                </div>

                <div className="proj-progress-section mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold text-muted">Progress</span>
                    <span className="small fw-bold text-primary">{project.progress}%</span>
                  </div>
                  <div className="proj-progress-bar-container">
                    <div className="proj-progress-bar" style={{ width: `${project.progress}%` }}></div>
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
              <th>Project Name</th>
              <th>Client</th>
              <th>PM</th>
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
                <td><div className="fw-bold text-dark">{project.name}</div></td>
                <td><span className="text-secondary">{project.clientName}</span></td>
                <td>{project.projectManager || 'Not Assigned'}</td>
                <td>{getStatusBadge(project.status)}</td>
                <td>
                  <div className="d-flex align-items-center gap-2" style={{ minWidth: '120px' }}>
                    <div className="progress flex-grow-1" style={{ height: '6px', background: '#f0f2f5' }}>
                      <div
                        className="progress-bar"
                        style={{ width: `${project.progress}%`, background: 'linear-gradient(90deg, #4361ee, #4cc9f0)' }}
                      ></div>
                    </div>
                    <span className="small fw-bold">{project.progress}%</span>
                  </div>
                </td>
                <td><i className="far fa-calendar-alt me-1 text-muted"></i> {project.date}</td>
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
    </div>
  );
};

export default ProjectManagement;
