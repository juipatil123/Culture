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
        alert('Task updated successfully!');
      } else {
        await createTask(taskData);
        alert('Task added successfully!');
      }
      setShowAddTaskModal(false);
      setEditingTask(null);
      // Reload only tasks to be faster, or use loadInitialData to sync all
      const tasks = await getAllTasks();
      setAssignedTasks(tasks);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
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
        alert(`Task "${taskTitle}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
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
        task.assignedTo?.toLowerCase().includes(taskSearchTerm.toLowerCase())
      );
    }

    if (filterByStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterByStatus);
    }

    if (filterByPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterByPriority);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Get status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      'completed': 'bg-success',
      'in-progress': 'bg-warning text-dark', // Changed to warning/yellowish for in-progress usually or keep info
      'pending': 'bg-secondary',
      'overdue': 'bg-danger',
      'assigned': 'bg-primary'
    };
    return statusColors[status] || 'bg-secondary';
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
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search tasks..."
            value={taskSearchTerm}
            onChange={(e) => setTaskSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterByStatus} onChange={(e) => setFilterByStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select value={filterByPriority} onChange={(e) => setFilterByPriority(e.target.value)}>
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
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

      {/* Task Stats */}
      {/* Task Stats - Redesigned to match UserManagement */}
      <div className="role-stats-summary mb-4">
        <div className="row g-3">
          <div className="col-xl-3 col-md-6">
            <div className="stat-card total">
              <div className="stat-icon"><i className="fas fa-tasks"></i></div>
              <div className="stat-content">
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value">{assignedTasks.length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="stat-card pending">
              <div className="stat-icon"><i className="fas fa-clock"></i></div>
              <div className="stat-content">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{assignedTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="stat-card in-progress">
              <div className="stat-icon"><i className="fas fa-spinner"></i></div>
              <div className="stat-content">
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{assignedTasks.filter(t => t.status === 'in-progress').length}</div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="stat-card completed">
              <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
              <div className="stat-content">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{assignedTasks.filter(t => t.status === 'completed').length}</div>
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
                  <span className={`badge ${getStatusBadge(task.status)} rounded-pill`}>
                    {task.status || 'Pending'}
                  </span>
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
                    <i className="fas fa-calendar-alt"></i>
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
              <th style={{ width: '100px' }}>Due Date</th>
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
                <td><i className="far fa-calendar-alt me-1 text-muted"></i> {formatDate(task.dueDate)}</td>
                <td>
                  <span className={`badge ${getPriorityBadge(task.priority)} rounded-pill px-3`}>
                    {task.priority || 'Medium'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusBadge(task.status)} rounded-pill px-3`}>
                    {task.status || 'Pending'}
                  </span>
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
      {showAddTaskModal && (
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
      )}
    </div>
  );
};

export default TaskManagement;
