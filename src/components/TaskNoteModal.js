import React, { useState, useEffect } from 'react';
import { addNoteToTask, getTaskNotes, addReactionToNote } from '../services/api';

const TaskNoteModal = ({ show, onHide, task, currentUser, onNoteAdded }) => {
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show && task) {
      loadNotes();
    }
  }, [show, task]);

  const loadNotes = async () => {
    if (!task || !task._id) return;
    
    try {
      setLoading(true);
      const response = await getTaskNotes(task._id);
      setNotes(response.notes || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      alert('Please enter a note');
      return;
    }

    try {
      setSubmitting(true);
      
      const noteData = {
        content: newNoteContent.trim(),
        authorId: currentUser.id || currentUser._id,
        authorName: currentUser.name,
        authorRole: currentUser.role || currentUser.userType?.toLowerCase().replace(' ', '-') || 'employee'
      };

      await addNoteToTask(task._id, noteData);
      
      setNewNoteContent('');
      await loadNotes();
      
      if (onNoteAdded) {
        onNoteAdded(task._id);
      }
      
      alert('✅ Note added successfully!');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (noteId, emoji) => {
    try {
      await addReactionToNote(task._id, noteId, {
        userId: currentUser.id || currentUser._id,
        userName: currentUser.name,
        emoji
      });
      
      await loadNotes();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-comments me-2"></i>
              Task Discussion - {task?.title}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          
          <div className="modal-body">
            {/* Task Info */}
            <div className="alert alert-info mb-3">
              <div className="d-flex justify-content-between">
                <div>
                  <strong>Assigned to:</strong> {task?.assignedTo}
                </div>
                <div>
                  <strong>Priority:</strong> 
                  <span className={`badge bg-${
                    task?.priority === 'high' ? 'danger' : 
                    task?.priority === 'medium' ? 'warning' : 'info'
                  } ms-2`}>
                    {task?.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Add Note Section */}
            <div className="card mb-3">
              <div className="card-header bg-light">
                <strong>Add a Note</strong>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  placeholder="Write your note here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  disabled={submitting}
                ></textarea>
                <button
                  className="btn btn-primary"
                  onClick={handleAddNote}
                  disabled={submitting || !newNoteContent.trim()}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Add Note
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="notes-list">
              <h6 className="mb-3">
                <i className="fas fa-list me-2"></i>
                Discussion ({notes.length})
              </h6>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-comments fa-3x mb-3"></i>
                  <p>No notes yet. Be the first to add one!</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note._id} className="card mb-3">
                    <div className="card-body">
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
                            <span className={`badge ${
                              ['admin', 'project-manager', 'team-leader'].includes(note.authorRole) 
                                ? 'bg-warning' 
                                : 'bg-secondary'
                            } ms-2`} style={{ fontSize: '10px' }}>
                              {note.authorRole.replace('-', ' ').toUpperCase()}
                            </span>
                            <br />
                            <small className="text-muted">{formatDate(note.createdAt)}</small>
                          </div>
                        </div>
                      </div>

                      <p className="mb-2">{note.content}</p>

                      {/* Reactions */}
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        {['👍', '❤️', '🎉', '👏', '🔥'].map((emoji) => {
                          const reactionCount = note.reactions?.filter(r => r.emoji === emoji).length || 0;
                          const userReacted = note.reactions?.some(
                            r => r.emoji === emoji && r.userId === (currentUser.id || currentUser._id)
                          );
                          
                          return (
                            <button
                              key={emoji}
                              className={`btn btn-sm ${userReacted ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => handleReaction(note._id, emoji)}
                              style={{ fontSize: '14px', padding: '2px 6px' }}
                            >
                              {emoji} {reactionCount > 0 && reactionCount}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskNoteModal;
