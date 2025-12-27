import React, { useState, useEffect } from 'react';
import { getTaskNotes, addReactionToNote } from '../services/api';

const TaskNotesWidget = ({ taskId, taskTitle, employeeId, employeeName }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (taskId && showNotes) {
      loadNotes();
    }
  }, [taskId, showNotes]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await getTaskNotes(taskId);
      const taskNotes = response.notes || [];
      
      // Filter only manager/leader notes
      const managerNotes = taskNotes.filter(note => 
        ['admin', 'project-manager', 'team-leader'].includes(note.authorRole)
      );
      
      setNotes(managerNotes);
      
      // Count unread notes
      const unread = managerNotes.filter(note => !note.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading task notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (noteId, emoji) => {
    try {
      await addReactionToNote(taskId, noteId, {
        userId: employeeId,
        userName: employeeName,
        emoji
      });
      
      await loadNotes();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!taskId) return null;

  return (
    <div className="task-notes-widget">
      <button
        className={`btn btn-sm ${unreadCount > 0 ? 'btn-warning' : 'btn-outline-secondary'} w-100`}
        onClick={() => setShowNotes(!showNotes)}
      >
        <i className="fas fa-comments me-2"></i>
        Manager Notes
        {unreadCount > 0 && (
          <span className="badge bg-danger ms-2">{unreadCount}</span>
        )}
        <i className={`fas fa-chevron-${showNotes ? 'up' : 'down'} ms-2`}></i>
      </button>

      {showNotes && (
        <div className="mt-2">
          {loading ? (
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="alert alert-info py-2 mb-0">
              <small>
                <i className="fas fa-info-circle me-2"></i>
                No notes from managers yet
              </small>
            </div>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <div key={note._id} className="card mb-2 border-start border-3 border-warning">
                  <div className="card-body p-2">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <strong className="text-primary" style={{ fontSize: '13px' }}>
                          {note.authorName}
                        </strong>
                        <span className="badge bg-warning ms-2" style={{ fontSize: '9px' }}>
                          {note.authorRole.replace('-', ' ').toUpperCase()}
                        </span>
                        {note.recipientRole && note.recipientRole !== 'all' && (
                          <span className="badge bg-info ms-1" style={{ fontSize: '9px' }}>
                            → {note.recipientName || 'You'}
                          </span>
                        )}
                      </div>
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        {formatDate(note.createdAt)}
                      </small>
                    </div>

                    <p className="mb-2" style={{ fontSize: '13px' }}>
                      {note.content}
                    </p>

                    {/* Reactions */}
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                      {['👍', '❤️', '🎉'].map((emoji) => {
                        const reactionCount = note.reactions?.filter(r => r.emoji === emoji).length || 0;
                        const userReacted = note.reactions?.some(
                          r => r.emoji === emoji && r.userId === employeeId
                        );
                        
                        return (
                          <button
                            key={emoji}
                            className={`btn btn-sm ${userReacted ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => handleReaction(note._id, emoji)}
                            style={{ fontSize: '12px', padding: '1px 4px' }}
                          >
                            {emoji} {reactionCount > 0 && reactionCount}
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
      )}
    </div>
  );
};

export default TaskNotesWidget;
