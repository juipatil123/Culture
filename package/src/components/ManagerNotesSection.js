import React, { useState, useEffect } from 'react';
import { getManagerNotesForEmployee, addReactionToNote, markNoteAsRead } from '../services/api';

const ManagerNotesSection = ({ employeeId, employeeName }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    if (employeeId) {
      loadManagerNotes();
    }
  }, [employeeId]);

  const loadManagerNotes = async () => {
    try {
      setLoading(true);
      const response = await getManagerNotesForEmployee(employeeId);
      setNotes(response.notes || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error loading manager notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (taskId, noteId, emoji) => {
    try {
      const userId = localStorage.getItem('userId') || employeeId;
      const userName = localStorage.getItem('userName') || employeeName;
      
      await addReactionToNote(taskId, noteId, {
        userId,
        userName,
        emoji
      });
      
      // Reload notes to get updated reactions
      await loadManagerNotes();
    } catch (error) {
      console.error('Error adding reaction:', error);
      alert('Failed to add reaction');
    }
  };

  const handleMarkAsRead = async (taskId, noteId) => {
    try {
      await markNoteAsRead(taskId, noteId);
      
      // Update local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note._id === noteId ? { ...note, isRead: true } : note
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking note as read:', error);
    }
  };

  const getFilteredNotes = () => {
    if (filter === 'unread') {
      return notes.filter(note => !note.isRead);
    } else if (filter === 'read') {
      return notes.filter(note => note.isRead);
    }
    return notes;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredNotes = getFilteredNotes();

  return (
    <div className="manager-notes-section">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-comments me-2"></i>
            Manager & Leader Notes
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount} New</span>
            )}
          </h5>
          <button 
            className="btn btn-sm btn-light"
            onClick={loadManagerNotes}
            title="Refresh"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>

        <div className="card-body">
          {/* Filter Tabs */}
          <div className="btn-group mb-3 w-100" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All ({notes.length})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'read' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('read')}
            >
              Read ({notes.length - unreadCount})
            </button>
          </div>

          {/* Notes List */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-inbox fa-3x mb-3"></i>
              <p>No {filter !== 'all' ? filter : ''} notes from managers or leaders</p>
            </div>
          ) : (
            <div className="notes-list">
              {filteredNotes.map((note) => (
                <div 
                  key={note._id} 
                  className={`note-item card mb-3 ${!note.isRead ? 'border-primary' : ''}`}
                  style={{ 
                    backgroundColor: !note.isRead ? '#f8f9ff' : 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="card-body">
                    {/* Note Header */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                          style={{ width: '36px', height: '36px', fontSize: '14px' }}
                        >
                          {note.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{note.authorName}</strong>
                          <span className="badge bg-secondary ms-2" style={{ fontSize: '10px' }}>
                            {note.authorRole.replace('-', ' ').toUpperCase()}
                          </span>
                          <br />
                          <small className="text-muted">{formatDate(note.createdAt)}</small>
                        </div>
                      </div>
                      {!note.isRead && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleMarkAsRead(note.taskId, note._id)}
                          title="Mark as read"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                    </div>

                    {/* Task Info */}
                    <div className="mb-2 p-2 bg-light rounded">
                      <small className="text-muted">
                        <i className="fas fa-tasks me-1"></i>
                        Task: <strong>{note.taskTitle}</strong>
                      </small>
                      <div className="mt-1">
                        <span className={`badge bg-${getPriorityColor(note.taskPriority)} me-2`}>
                          {note.taskPriority}
                        </span>
                        <span className={`badge bg-${getStatusColor(note.taskStatus)}`}>
                          {note.taskStatus}
                        </span>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className="note-content mb-3">
                      <p className="mb-0">{note.content}</p>
                    </div>

                    {/* Reactions */}
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <small className="text-muted me-2">React:</small>
                      {['👍', '❤️', '🎉', '👏', '🔥'].map((emoji) => {
                        const reactionCount = note.reactions?.filter(r => r.emoji === emoji).length || 0;
                        const userReacted = note.reactions?.some(
                          r => r.emoji === emoji && r.userId === (localStorage.getItem('userId') || employeeId)
                        );
                        
                        return (
                          <button
                            key={emoji}
                            className={`btn btn-sm ${userReacted ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => handleReaction(note.taskId, note._id, emoji)}
                            style={{ fontSize: '16px', padding: '2px 8px' }}
                          >
                            {emoji} {reactionCount > 0 && <span className="ms-1">{reactionCount}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerNotesSection;
