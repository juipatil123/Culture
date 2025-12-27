import React, { useState } from 'react';
import { updateTask, deleteTask } from '../../services/api';
import './PMComponents.css';

const PMTasks = ({ tasks, projects, onRefresh, onAddTask, onEditTask, userName, userEmail }) => {


  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [filterByPriority, setFilterByPriority] = useState('all');

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
      'completed': { class: 'bg-success', label: 'Done' },
      'in-progress': { class: 'bg-info', label: 'In Progress' },
      'in-review': { class: 'bg-warning', label: 'In Review' },
      'assigned': { class: 'bg-primary', label: 'Assigned' },
      'pending': { class: 'bg-secondary', label: 'To Do' }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'high': 'bg-danger',
      'medium': 'bg-warning',
      'low': 'bg-info'
    };
    return <span className={`badge ${priorityColors[priority] || 'bg-secondary'} rounded-pill`}>{priority}</span>;
  };

  // Status Tabs Configuration
  const statusTabs = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'assigned', label: 'Assigned', icon: 'user-plus' },
    { id: 'in-progress', label: 'In Progress', icon: 'spinner' },
    { id: 'in-review', label: 'In Review', icon: 'eye' },
    { id: 'completed', label: 'Done', icon: 'check-circle' }
  ];

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

      {/* Status Tabs Navigation */}
      <div className="status-tabs-nav d-flex gap-2 mb-4 overflow-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn d-flex align-items-center gap-2 px-3 py-2 ${activeStatusTab === tab.id ? 'btn-primary' : 'btn-light border text-muted'}`}
            style={{ borderRadius: '10px', whiteSpace: 'nowrap' }}
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

      {/* Filters Section */}
      <div className="row g-3 mb-4 align-items-center">
        <div className="col-md-5">
          <div className="search-box position-relative">
            <i className="fas fa-search position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by title, description, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: '8px' }}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterByPriority}
            onChange={(e) => setFilterByPriority(e.target.value)}
            style={{ borderRadius: '8px' }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state text-center py-5 bg-white rounded-3 shadow-sm">
          <i className="fas fa-tasks fa-3x text-muted mb-3 opacity-25"></i>
          <h5 className="text-muted">No tasks found</h5>
          <p className="text-muted small">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredTasks.map((task) => (
            <div key={task.id || task._id} className="col-lg-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100 task-card-modern">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold text-dark mb-0 line-clamp-1" title={task.title}>
                      {task.title || 'Untitled Task'}
                    </h5>
                    {getStatusBadge(task.status)}
                  </div>

                  <p className="text-muted small mb-3 line-clamp-2" style={{ height: '2.5rem' }}>
                    {task.description || 'No description provided for this task.'}
                  </p>

                  <div className="task-meta-info mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="fas fa-user-circle text-muted"></i>
                      <span className="small"><strong>Owner:</strong> {task.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="fas fa-project-diagram text-muted"></i>
                      <span className="small"><strong>Project:</strong> {task.project || 'General'}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-calendar-alt text-muted"></i>
                      <span className="small"><strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                      {getPriorityBadge(task.priority || 'medium')}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="progress-container pt-3 border-top">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted fw-bold">Task Progress</small>
                      <small className="fw-bold">{task.progress || (task.status === 'completed' ? 100 : 0)}%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${task.progress || (task.status === 'completed' ? 100 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 p-3 d-flex gap-2">
                  <button className="btn btn-sm btn-outline-info flex-grow-1">Details</button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onEditTask(task)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger"><i className="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PMTasks;
