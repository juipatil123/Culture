import React, { useState, useEffect } from 'react';
import { NoticeService } from '../firebase/firestoreService';

const TeamLeaderSupport = ({ allUsers: propUsers = [], userData }) => {
    const [formData, setFormData] = useState({
        recipientType: 'employee', // 'admin', 'project-manager', 'employee'
        recipientId: '',
        subject: '',
        message: ''
    });
    const [allUsers, setAllUsers] = useState(propUsers);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (propUsers.length === 0) {
            import('../firebase/firestoreService').then(m => {
                m.getAllUsers().then(setAllUsers);
            });
        }
    }, [propUsers]);

    // Group users by role for recipient dropdown
    const admins = allUsers.filter(u => u.role === 'admin') || [];
    const pms = allUsers.filter(u => u.role === 'project-manager') || [];
    const employees = allUsers.filter(u => u.role === 'employee' || u.role === 'intern') || [];

    // Determine available recipients based on selected type
    const getRecipients = () => {
        switch (formData.recipientType) {
            case 'admin': return admins;
            case 'project-manager': return pms;
            case 'employee': return employees;
            default: return [];
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset recipientId if type changes
            ...(name === 'recipientType' ? { recipientId: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Find recipient name for confirmation message
        const recipients = getRecipients();
        const recipient = recipients.find(r => (r.id || r._id) === formData.recipientId);
        const recipientName = recipient ? recipient.name : formData.recipientType;

        const noticeData = {
            senderId: userData?.id || userData?._id || 'unknown',
            senderName: userData?.name || 'Unknown TL',
            senderRole: userData?.role || 'team-leader',
            recipientType: formData.recipientType,
            recipientId: formData.recipientId,
            recipientName: recipientName,
            recipientRole: formData.recipientType,
            targetUsers: [formData.recipientId], // Add targetUsers array
            subject: formData.subject,
            message: formData.message,
            read: false,
            priority: 'normal',
            date: new Date().toISOString()
        };

        try {
            await NoticeService.create(noticeData);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFormData({
                    recipientType: 'employee',
                    recipientId: '',
                    subject: '',
                    message: ''
                });
            }, 3000);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom-0 py-3">
                            <h4 className="card-title fw-bold mb-0">Support & Help</h4>
                            <p className="text-muted small mb-0 mt-1">Send a message to admins, project managers, or team members.</p>
                        </div>
                        <div className="card-body p-4">
                            {submitted ? (
                                <div className="text-center py-5">
                                    <div className="mb-3 text-success">
                                        <i className="fas fa-check-circle fa-4x"></i>
                                    </div>
                                    <h4 className="fw-bold text-success">Message Sent!</h4>
                                    <p className="text-muted">Your message has been successfully sent. We'll get back to you soon.</p>
                                    <button
                                        className="btn btn-outline-primary mt-3"
                                        onClick={() => setSubmitted(false)}
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6 text-start">
                                            <label className="form-label fw-bold small">Recipient Group</label>
                                            <select
                                                className="form-select bg-light"
                                                name="recipientType"
                                                value={formData.recipientType}
                                                onChange={handleChange}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="project-manager">Project Manager</option>
                                                <option value="employee">Team Member (Employee)</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 text-start">
                                            <label className="form-label fw-bold small">Select Person</label>
                                            <select
                                                className="form-select"
                                                name="recipientId"
                                                value={formData.recipientId}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">-- Select Recipient --</option>
                                                {getRecipients().map(user => (
                                                    <option key={user.id || user._id} value={user.id || user._id}>
                                                        {user.name} ({user.email})
                                                    </option>
                                                ))}
                                            </select>
                                            {getRecipients().length === 0 && (
                                                <div className="form-text text-warning">
                                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                                    No users found in this group.
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 text-start">
                                            <label className="form-label fw-bold small">Subject</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="Brief summary of your issue or question"
                                                required
                                            />
                                        </div>

                                        <div className="col-12 text-start">
                                            <label className="form-label fw-bold small">Message</label>
                                            <textarea
                                                className="form-control"
                                                name="message"
                                                rows="6"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Describe your issue, request, or feedback in detail..."
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="col-12 text-end mt-4">
                                            <button type="submit" className="btn btn-primary px-4 py-2">
                                                <i className="fas fa-paper-plane me-2"></i>
                                                Submit Message
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default TeamLeaderSupport;
