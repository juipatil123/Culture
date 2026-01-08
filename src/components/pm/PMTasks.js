import React, { useState } from 'react';
import { formatDate } from '../../utils/dateUtils';
import { updateTask, deleteTask } from '../../services/api';
import './PMComponents.css';

const PMTasks = ({ tasks, projects, onRefresh, onAddTask, onEditTask, userName, userEmail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [filterByPriority, setFilterByPriority] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // Default to list view as requested

  // Filter tasks
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeStatusTab !== 'all') {
      filtered = filtered.filter(task => task.status === activeStatusTab);
    }

    if (filterByPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterByPriority);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { label: 'Done', bg: '#f0fdf4', color: '#16a34a', border: '#dcfce7' },
      'in-progress': { label: 'In Progress', bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' },
      'in-review': { label: 'In Review', bg: '#fefce8', color: '#a16207', border: '#fef9c3' },
      'assigned': { label: 'Assigned', bg: '#f5f3ff', color: '#5b21b6', border: '#ede9fe' },
      'pending': { label: 'To Do', bg: '#f9fafb', color: '#374151', border: '#f3f4f6' }
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
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

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'urgent': { bg: '#fef2f2', color: '#991b1b', border: '#fee2e2' },
      'high': { bg: '#fff7ed', color: '#9a3412', border: '#ffedd5' },
      'medium': { bg: '#f0f9ff', color: '#075985', border: '#e0f2fe' },
      'low': { bg: '#f0fdfa', color: '#115e59', border: '#ccfbf1' }
    };
    const config = priorityColors[priority?.toLowerCase()] || priorityColors['medium'];
    return (
      <span className="badge rounded-pill" style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: '0.7rem',
        padding: '4px 10px',
        fontWeight: '600'
      }}>
        {priority?.toUpperCase()}
      </span>
    );
  };

  // Status Tabs Configuration
  const statusTabs = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'assigned', label: 'Assigned', icon: 'user-plus' },
    { id: 'in-progress', label: 'In Progress', icon: 'spinner' },
    { id: 'completed', label: 'Done', icon: 'check-circle' }
  ];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <div className="pm-tasks">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Task Management</h2>
          <p className="text-muted small mb-0">Track progress and manage deliverables across teams</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={onRefresh}>
            <i className="fas fa-sync me-2"></i>Refresh
          </button>
          <button className="btn btn-primary" onClick={onAddTask}>
            <i className="fas fa-plus me-2"></i>Add Task
          </button>
        </div>
      </div>

      <div className="filters-row d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        {/* Status Tabs Navigation */}
        <div className="status-tabs-nav d-flex gap-2 overflow-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 ${activeStatusTab === tab.id ? 'btn-primary shadow-sm' : 'btn-white border text-muted'}`}
              style={{ borderRadius: '8px', whiteSpace: 'nowrap' }}
              onClick={() => setActiveStatusTab(tab.id)}
            >
              <i className={`fas fa-${tab.icon}`}></i>
              <span>{tab.label}</span>
              <span className={`badge ${activeStatusTab === tab.id ? 'bg-white text-primary' : 'bg-secondary bg-opacity-10 text-muted'}`}>
                {tab.id === 'all' ? tasks.length : tasks.filter(t => t.status === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle btn-group">
          <button
            className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('card')}
            title="Grid View"
          >
            <i className="fas fa-th-large"></i>
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Search & Priority Filter */}
      <div className="row g-3 mb-4 align-items-center">
        <div className="col-md-7">
          <div className="search-box position-relative">
            <i className="fas fa-search position-absolute" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
            <input
              type="text"
              className="form-control ps-5 py-2"
              placeholder="Search by title, description, or assigned users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select py-2"
            value={filterByPriority}
            onChange={(e) => setFilterByPriority(e.target.value)}
            style={{ borderRadius: '10px' }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state text-center py-5 bg-white rounded-4 shadow-sm">
          <div className="mb-3">
            <i className="fas fa-tasks fa-3x text-muted opacity-25"></i>
          </div>
          <h5 className="fw-bold">No tasks found</h5>
          <p className="text-muted">No tasks match your current filters or search criteria.</p>
          <button className="btn btn-sm btn-outline-primary" onClick={() => { setSearchTerm(''); setActiveStatusTab('all'); setFilterByPriority('all'); }}>Clear Filters</button>
        </div>
      ) : viewMode === 'card' ? (
        <div className="row g-4">
          {filteredTasks.map((task) => (
            <div key={task.id || task._id} className="col-lg-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100 task-card-modern rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold text-dark mb-0 line-clamp-2" style={{ maxHeight: '3rem', overflow: 'hidden' }}>
                      {task.title || 'Untitled Task'}
                    </h5>
                    {getStatusBadge(task.status)}
                  </div>

                  <p className="text-muted small mb-3 line-clamp-2" style={{ height: '2.5rem', overflow: 'hidden' }}>
                    {task.description || 'No description provided.'}
                  </p>

                  <div className="task-meta-info mb-3">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="meta-item d-flex align-items-center gap-1">
                        <i className="fas fa-users text-muted small"></i>
                        <span className="small text-truncate" style={{ maxWidth: '180px' }}><strong>Members:</strong> {task.assignedTo || 'Multiple'}</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="meta-item d-flex align-items-center gap-1">
                        <i className="fas fa-project-diagram text-muted small"></i>
                        <span className="small"><strong>Proj:</strong> {task.project || 'General'}</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="date-item d-flex align-items-center gap-1 text-muted">
                        <i className="fas fa-calendar-alt small"></i>
                        <span className="small">{formatDate(task.dueDate)}</span>
                      </div>
                      {getPriorityBadge(task.priority || 'medium')}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-container pt-3 border-top">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted fw-semi-bold">Progress</small>
                      <small className="fw-bold">{task.progress || (task.status === 'completed' ? 100 : 0)}%</small>
                    </div>
                    <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                      <div
                        className={`progress-bar ${task.status === 'completed' ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${task.progress || (task.status === 'completed' ? 100 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white p-3 d-flex gap-2 border-top-0">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => onEditTask(task)}>
                    <i className="fas fa-edit me-1"></i> Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(task.id || task._id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
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
                  <th className="ps-4">Task Name</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id || task._id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{task.title}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{task.description}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{task.project || 'General'}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-users text-primary small"></i>
                        <span className="small">{task.assignedTo || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td>{getPriorityBadge(task.priority)}</td>
                    <td>{getStatusBadge(task.status)}</td>
                    <td>
                      <div className="small text-muted">
                        <i className="far fa-calendar-alt me-1"></i>
                        {formatDate(task.dueDate)}
                      </div>
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => onEditTask(task)} title="Edit Task">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(task.id || task._id)} title="Delete Task">
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
    </div>
  );
};

export default PMTasks;
