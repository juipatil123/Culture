import React, { useState, useEffect } from 'react';
import { getAllTasks, createTask, updateTask, deleteTask } from '../../services/api';
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

  // Load tasks
  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const allTasks = await getAllTasks();
      setAssignedTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
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
      } else {
        await createTask(taskData);
      }
      setShowAddTaskModal(false);
      setEditingTask(null);
      loadTasks();
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
      'in-progress': 'bg-info',
      'pending': 'bg-warning',
      'assigned': 'bg-secondary'
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
      </div>

      {/* Task Stats */}
      <div className="task-stats">
        <div className="stat-card">
          <i className="fas fa-tasks"></i>
          <div>
            <h3>{assignedTasks.length}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-clock"></i>
          <div>
            <h3>{assignedTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-spinner"></i>
          <div>
            <h3>{assignedTasks.filter(t => t.status === 'in-progress').length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle"></i>
          <div>
            <h3>{assignedTasks.filter(t => t.status === 'completed').length}</h3>
            <p>Completed</p>
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
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <div key={task.id || task._id} className="task-card">
              <div className="task-card-header">
                <h4>{task.title || 'Untitled Task'}</h4>
                <div className="task-badges">
                  <span className={`badge ${getStatusBadge(task.status)}`}>
                    {task.status || 'Pending'}
                  </span>
                  <span className={`badge ${getPriorityBadge(task.priority)}`}>
                    {task.priority || 'Medium'}
                  </span>
                </div>
              </div>
              <div className="task-card-body">
                <p className="task-description">{task.description || 'No description'}</p>
                <div className="task-details">
                  <div className="detail-item">
                    <i className="fas fa-user"></i>
                    <span><strong>Assigned to:</strong> {task.assignedTo || 'Not Assigned'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-project-diagram"></i>
                    <span><strong>Project:</strong> {task.project || task.projectName || 'General'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <span><strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  {task.assignedBy && (
                    <div className="detail-item">
                      <i className="fas fa-user-tie"></i>
                      <span><strong>Assigned by:</strong> {task.assignedBy}</span>
                    </div>
                  )}
                </div>
                {task.progress !== undefined && (
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
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
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEditTask(task)}
                >
                  <i className="fas fa-edit me-1"></i>
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteTask(task.id || task._id, task.title)}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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
        />
      )}
    </div>
  );
};

export default TaskManagement;
