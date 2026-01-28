import React, { useState, useEffect } from 'react';

const NewMessageModal = ({ show, onHide, onSend, users = [] }) => {
    const [recipientGroup, setRecipientGroup] = useState('Admins');
    const [selectedPerson, setSelectedPerson] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (show) {
            setRecipientGroup('Admins');
            setSelectedPerson('');
            setSubject('');
            setMessage('');
            setSending(false);
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPerson || !subject || !message) return;

        setSending(true);
        // Prepare data to send back to parent
        const messageData = {
            recipientGroup,
            recipientId: selectedPerson,
            subject,
            message
        };

        await onSend(messageData);
        setSending(false);
        onHide();
    };

    if (!show) return null;

    // Filter users based on group
    // Groups: Admins, Employees, Managers (Project Managers), Team Leaders
    const filteredPeople = users.filter(user => {
        if (recipientGroup === 'Admins') return user.role === 'admin';
        if (recipientGroup === 'Employees') return user.role === 'employee';
        if (recipientGroup === 'Managers') return user.role === 'project-manager';
        if (recipientGroup === 'Team Leaders') return user.role === 'team-leader';
        return true;
    });

    return (
        <div className="modal fade show d-block" style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1510,
            overflow: 'auto' // styling to match user request "popup form"
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '20px'
            }}>
                <div className="modal-dialog modal-lg" style={{
                    margin: '0',
                    maxWidth: '800px',
                    width: '100%'
                }}>
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 p-4 pb-0">
                            <h4 className="modal-title fw-bold" style={{ color: '#6610f2' }}>New Message</h4>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onHide}
                                aria-label="Close"
                            ></button>
                        </div>

                        <div className="modal-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-5">
                                        <label className="form-label fw-bold small text-muted">Recipient Group</label>
                                        <select
                                            className="form-select"
                                            value={recipientGroup}
                                            onChange={(e) => {
                                                setRecipientGroup(e.target.value);
                                                setSelectedPerson('');
                                            }}
                                        >
                                            <option value="Admins">Admins</option>
                                            <option value="Employees">Employees</option>
                                            <option value="Managers">Managers</option>
                                            <option value="Team Leaders">Team Leaders</option>
                                        </select>
                                    </div>
                                    <div className="col-md-7">
                                        <label className="form-label fw-bold small text-muted">Select Person</label>
                                        <select
                                            className="form-select"
                                            value={selectedPerson}
                                            onChange={(e) => setSelectedPerson(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Person</option>
                                            {filteredPeople.map(u => (
                                                <option key={u.id || u._id} value={u.id || u._id}>
                                                    {u.name} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Subject</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="What is this about?"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-muted">Message</label>
                                    <textarea
                                        className="form-control"
                                        rows="8"
                                        placeholder="Type your message here..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        style={{ resize: 'none' }}
                                    ></textarea>
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-light text-secondary fw-bold px-4"
                                        onClick={onHide}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary fw-bold px-4"
                                        style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
                                        disabled={sending}
                                    >
                                        {sending ? <i className="fas fa-spinner fa-spin me-2"></i> : null}
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewMessageModal;
