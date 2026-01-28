import React, { useState, useEffect } from 'react';
import { getAllTasks, createTask, updateTask, deleteTask, getAllProjects, getAllUsers } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import AddTaskModal from '../AddTaskModal';
import './AdminComponents.css';

const TaskManagement = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [filterByPriority, setFilterByPriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [notificationTitle, setNotificationTitle] = useState('Success');


  // Load tasks, projects and users
  const loadInitialData = async () => {
    setLoadingTasks(true);
    try {
      const [fetchedTasks, fetchedProjects, fetchedUsers] = await Promise.all([
        getAllTasks(),
        getAllProjects(),
        getAllUsers()
      ]);
      setAssignedTasks(fetchedTasks);
      setProjects(fetchedProjects);
      setAllUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle add task
  const handleAddTask = () => {
    setEditingTask(null);
    setShowAddTaskModal(true);
  };

  // Handle save/update task
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id || editingTask._id, taskData);
        setNotificationTitle('Success');
        setNotification('Task updated successfully!');
      } else {
        await createTask(taskData);
        setNotificationTitle('Success');
        setNotification('Task added successfully!');
      }
      setShowAddTaskModal(false);
      setEditingTask(null);
      // Reload only tasks
      const tasks = await getAllTasks();
      setAssignedTasks(tasks);
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error saving task:', error);
      setNotificationTitle('Error');
      setNotification('Failed to save task. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowAddTaskModal(true);
  };

  // Handle delete task
  const handleDeleteTask = async (taskId, taskTitle) => {
    if (window.confirm(`Are you sure you want to delete task "${taskTitle}"?`)) {
      try {
        await deleteTask(taskId);
        setAssignedTasks(prev => prev.filter(t => t.id !== taskId && t._id !== taskId));
        setNotificationTitle('Success');
        setNotification(`Task "${taskTitle}" deleted successfully!`);
        setTimeout(() => setNotification(null), 5000);
      } catch (error) {
        console.error('Error deleting task:', error);
        setNotificationTitle('Error');
        setNotification('Failed to delete task. Please try again.');
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  // Filter tasks
  const getFilteredTasks = () => {
    let filtered = [...assignedTasks];

    if (taskSearchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.assignedTo?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.project?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.projectName?.toLowerCase().includes(taskSearchTerm.toLowerCase())
      );
    }

    if (filterByStatus !== 'all') {
      if (filterByStatus === 'pending') {
        filtered = filtered.filter(task => task.status === 'pending' || task.status === 'assigned');
      } else {
        filtered = filtered.filter(task => task.status === filterByStatus);
      }
    }

    if (filterByPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterByPriority);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Check if task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return today > dueDate;
  };

  // Get status badge
  const getStatusBadge = (task) => {
    const status = task.status;
    const overdue = isOverdue(task);

    if (overdue) {
      return <span className="badge bg-danger">Overdue</span>;
    }

    const statusColors = {
      'completed': 'bg-success',
      'in-progress': 'bg-warning text-dark', // Changed to warning/yellowish for in-progress usually or keep info
      'pending': 'bg-secondary',
      'overdue': 'bg-danger',
      'assigned': 'bg-primary'
    };
    const color = statusColors[status] || 'bg-secondary';
    const label = status === 'in-progress' ? 'In Progress' : status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending';

    return <span className={`badge ${color}`}>{label}</span>;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'high': 'bg-danger',
      'medium': 'bg-warning',
      'low': 'bg-info'
    };
    return priorityColors[priority] || 'bg-secondary';
  };

  return (
    <div className="task-management">
      <div className="page-header">
        <h2>Task Management</h2>
        <div className="header-stats">
          {/* <span className="badge bg-primary p-2 me-1">Total: {assignedTasks.length}</span>
          <span className="badge bg-warning text-dark p-2 me-1">Pending: {assignedTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length}</span>
          <span className="badge bg-info p-2 me-1">In Progress: {assignedTasks.filter(t => t.status === 'in-progress').length}</span>
          <span className="badge bg-success p-2">Completed: {assignedTasks.filter(t => t.status === 'completed').length}</span> */}
        </div>
        <button className="btn btn-primary" onClick={handleAddTask}>
          <i className="fas fa-plus me-2"></i>
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section d-flex justify-content-between align-items-center mb-4 gap-3 bg-white p-3 rounded-4 shadow-sm border">
        <div className="search-box flex-grow-1" style={{ maxWidth: '400px', position: 'relative' }}>
          <i className="fas fa-search position-absolute" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
          <input
            type="text"
            className="form-control ps-5 py-2"
            placeholder="Search by task, project, or assignee..."
            value={taskSearchTerm}
            onChange={(e) => setTaskSearchTerm(e.target.value)}
            style={{ borderRadius: '10px' }}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="position-relative">
            <select
              className="form-select py-2 pe-5"
              value={filterByStatus}
              onChange={(e) => setFilterByStatus(e.target.value)}
              style={{ borderRadius: '10px', minWidth: '180px', appearance: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Task Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <i className="fas fa-chevron-down position-absolute top-50 end-0 translate-middle-y me-3 text-secondary" style={{ pointerEvents: 'none', fontSize: '0.8rem' }}></i>
          </div>

          <div className="position-relative">
            <select
              className="form-select py-2 pe-5"
              value={filterByPriority}
              onChange={(e) => setFilterByPriority(e.target.value)}
              style={{ borderRadius: '10px', minWidth: '150px', appearance: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <i className="fas fa-chevron-down position-absolute top-50 end-0 translate-middle-y me-3 text-secondary" style={{ pointerEvents: 'none', fontSize: '0.8rem' }}></i>
          </div>

          <div className="view-toggle btn-group">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('grid')}
              style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('list')}
              style={{ borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Task Stats */}
      {/* Task Stats - Redesigned to match UserManagement */}
      <div className="role-stats-summary mb-4">
        <div className="row g-3">
          <div className="col-xl-2 col-md-4">
            <div className="stat-card total">
              <div className="stat-icon"><i className="fas fa-tasks"></i></div>
              <div className="stat-content">
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value">{assignedTasks.length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4">
            <div className="stat-card pending">
              <div className="stat-icon"><i className="fas fa-clock"></i></div>
              <div className="stat-content">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{assignedTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4">
            <div className="stat-card in-progress">
              <div className="stat-icon"><i className="fas fa-spinner"></i></div>
              <div className="stat-content">
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{assignedTasks.filter(t => t.status === 'in-progress').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4">
            <div className="stat-card completed">
              <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
              <div className="stat-content">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{assignedTasks.filter(t => t.status === 'completed').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-md-4">
            <div className="stat-card overdue" style={{ borderLeft: '4px solid #dc3545' }}>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Overdue</div>
                <div className="stat-value">{assignedTasks.filter(t => isOverdue(t)).length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loadingTasks ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-tasks fa-3x"></i>
          <p>No tasks found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="tasks-grid">
          {filteredTasks.map((task, index) => (
            <div key={task.id || task._id} className={`task-card priority-${(task.priority || 'medium').toLowerCase()}`}>
              <div className="task-card-header">
                <span className="badge bg-light text-dark border mb-2">#{index + 1}</span>
                <h4 style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title || 'Untitled Task'}</h4>
                <div className="task-badges">
                  {getStatusBadge(task)}
                  <span className={`badge ${getPriorityBadge(task.priority)} rounded-pill`}>
                    {task.priority || 'Medium'}
                  </span>
                </div>
              </div>
              <div className="task-card-body">
                <p className="task-description">{task.description || 'No description provided for this task.'}</p>
                <div className="task-details">
                  <div className="detail-item">
                    <i className="fas fa-user-circle"></i>
                    <span><strong>Assigned to:</strong> {task.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-project-diagram"></i>
                    <span><strong>Project:</strong> {task.project || task.projectName || 'General'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-plus"></i>
                    <span><strong>Start Date:</strong> {formatDate(task.startDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-check"></i>
                    <span><strong>Due Date:</strong> {formatDate(task.dueDate)}</span>
                  </div>
                  {task.assignedBy && (
                    <div className="detail-item">
                      <i className="fas fa-user-tie"></i>
                      <span><strong>Assigned by:</strong> {task.assignedBy}</span>
                    </div>
                  )}
                </div>
                {task.progress !== undefined && (
                  <div className="progress-section mt-4">
                    <div className="progress-header">
                      <span>Execution Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="task-card-footer">
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  onClick={() => handleEditTask(task)}
                >
                  <i className="fas fa-edit me-1"></i>
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                  onClick={() => handleDeleteTask(task.id || task._id, task.title)}
                >
                  <i className="fas fa-trash-alt me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="tasks-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Sr. No.</th>
              <th style={{ minWidth: '200px' }}>Task</th>
              <th style={{ minWidth: '150px' }}>Project</th>
              <th style={{ minWidth: '120px' }}>Assigned To</th>
              <th style={{ width: '120px' }}>Dates</th>
              <th style={{ width: '90px' }}>Priority</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => (
              <tr key={task.id || task._id}>
                <td className="text-center fw-bold">{index + 1}</td>
                <td>
                  <div className="fw-bold text-dark">{task.title || 'Untitled'}</div>
                  <small className="text-muted d-block" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.description || 'No description'}
                  </small>
                </td>
                <td>
                  <span className="text-secondary fw-semibold" style={{ display: 'block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.project || task.projectName || 'General'}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'block', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.assignedTo || 'Unassigned'}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    <div className="text-nowrap mb-1">
                      <i className="fas fa-calendar-plus me-1 text-primary" style={{ fontSize: '0.75rem' }}></i>
                      <span className="text-muted small">Start:</span> <strong>{formatDate(task.startDate)}</strong>
                    </div>
                    <div className="text-nowrap">
                      <i className="fas fa-calendar-check me-1 text-success" style={{ fontSize: '0.75rem' }}></i>
                      <span className="text-muted small">Due:</span> <strong>{formatDate(task.dueDate)}</strong>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getPriorityBadge(task.priority)} rounded-pill px-3`}>
                    {task.priority || 'Medium'}
                  </span>
                </td>
                <td>
                  {getStatusBadge(task)}
                </td>
                <td>
                  <div className="action-btn-group">
                    <button
                      className="btn-action edit"
                      onClick={() => handleEditTask(task)}
                      title="Edit Task"
                    >
                      <i className="far fa-edit"></i>
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => handleDeleteTask(task.id || task._id, task.title)}
                      title="Delete Task"
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

      {/* Add/Edit Task Modal */}
      {
        showAddTaskModal && (
          <AddTaskModal
            show={showAddTaskModal}
            onHide={() => {
              setShowAddTaskModal(false);
              setEditingTask(null);
            }}
            onSave={handleSaveTask}
            editingTask={editingTask}
            projects={projects}
            allUsers={allUsers}
          />
        )
      }
      {/* Styled Notification Popup */}
      {
        notification && (
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
        )
      }
    </div >
  );
};

export default TaskManagement;
