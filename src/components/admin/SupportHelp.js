import React, { useState, useEffect } from 'react';
import { getAllUsers, NoticeService, subscribeToAllNotices } from '../../firebase/firestoreService';

const SupportHelp = ({ adminData }) => {
    const [formData, setFormData] = useState({
        recipientType: 'project-manager', // 'project-manager', 'team-leader', 'employee', 'all'
        recipientId: '',
        subject: '',
        message: ''
    });
    const [allUsers, setAllUsers] = useState([]);
    const [recentNotices, setRecentNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const users = await getAllUsers();
                setAllUsers(users);
            } catch (error) {
                console.error("Error loading users:", error);
            }
        };
        loadUsers();

        // Subscribe to ALL notices for Admin view
        const unsubscribe = subscribeToAllNotices((data) => {
            setRecentNotices(data);
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'recipientType' ? { recipientId: '' } : {})
        }));
    };

    const getRecipients = () => {
        if (formData.recipientType === 'all') return [];
        return allUsers.filter(u => u.role === formData.recipientType);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const isRoleBroadcast = formData.recipientId === 'role-all';
            const isGlobalBroadcast = formData.recipientType === 'all';

            const recipient = getRecipients().find(r => (r.id || r._id) === formData.recipientId);

            let recipientName = 'Unknown';
            let recipientId = formData.recipientId;
            let recipientRole = formData.recipientType;

            if (isGlobalBroadcast) {
                recipientName = 'Everyone (All Roles)';
                recipientId = 'all';
                recipientRole = 'all';
            } else if (isRoleBroadcast) {
                recipientName = `All ${formData.recipientType.replace('-', ' ')}s`;
                recipientId = 'all-in-role'; // Use a specific marker
                recipientRole = formData.recipientType;
            } else {
                recipientName = recipient?.name || 'Unknown';
            }

            const noticeData = {
                senderId: adminData?.id || 'admin-id',
                senderName: adminData?.name || 'Admin',
                senderRole: 'admin',
                recipientType: formData.recipientType,
                recipientId: recipientId,
                recipientName: recipientName,
                recipientRole: recipientRole,
                subject: formData.subject,
                message: formData.message,
                read: false,
                priority: 'normal',
                date: new Date().toISOString()
            };

            await NoticeService.create(noticeData);

            setSubmitted(true);

            setTimeout(() => {
                setSubmitted(false);
                setFormData({
                    recipientType: 'project-manager',
                    recipientId: '',
                    subject: '',
                    message: ''
                });
            }, 3000);
        } catch (error) {
            console.error("Error sending notice:", error);
            alert("Failed to send message.");
        } finally {
            setLoading(false);
        }
    };

    // For Admin, show all messages without role-based filtering as requested
    const allMessagesList = recentNotices;

    return (
        <div className="container-fluid p-4">
            <div className="row">
                {/* Left Side: Create Support Message */}
                <div className="col-lg-6 mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                        <div className="card-header bg-white border-0 py-3">
                            <h4 className="fw-bold mb-0 text-primary">Support & Help</h4>
                            <p className="text-muted small mb-0">Send messages to PM, TL, or Employees</p>
                        </div>
                        <div className="card-body">
                            {submitted ? (
                                <div className="text-center py-5">
                                    <div className="mb-3 text-success">
                                        <i className="fas fa-check-circle fa-4x animate__animated animate__bounceIn"></i>
                                    </div>
                                    <h4 className="fw-bold text-success">Message Sent!</h4>
                                    <p className="text-muted">Your message has been successfully sent to the recipients.</p>
                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={() => setSubmitted(false)}
                                    >
                                        Send Another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small">Recipient Type</label>
                                        <select
                                            className="form-select border-0 bg-light shadow-sm"
                                            name="recipientType"
                                            value={formData.recipientType}
                                            onChange={handleChange}
                                        >
                                            <option value="project-manager">Project Manager</option>
                                            <option value="team-leader">Team Leader</option>
                                            <option value="employee">Employee</option>
                                            <option value="all">All Roles</option>
                                        </select>
                                    </div>

                                    {formData.recipientType !== 'all' && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold small">Select Recipient</label>
                                            <select
                                                className="form-select border-0 bg-light shadow-sm"
                                                name="recipientId"
                                                value={formData.recipientId}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">-- Select Person --</option>
                                                <option value="role-all" className="fw-bold text-primary">
                                                    📢 UNLOCK: Send to ALL {formData.recipientType.replace('-', ' ')}s
                                                </option>
                                                <hr />
                                                {getRecipients().map(user => (
                                                    <option key={user.id || user._id} value={user.id || user._id}>
                                                        {user.name} ({user.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label fw-bold small">Subject</label>
                                        <input
                                            type="text"
                                            className="form-control border-0 bg-light shadow-sm"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="Enter subject"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold small">Message</label>
                                        <textarea
                                            className="form-control border-0 bg-light shadow-sm"
                                            name="message"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Type your message here..."
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span> Sending...</>
                                        ) : (
                                            <><i className="fas fa-paper-plane me-2"></i> Send Message</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Recent Box (Recent Support/Notices) */}
                <div className="col-lg-6 mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold mb-0 text-primary">All System Messages</h4>
                            <span className="badge bg-light text-primary border">{allMessagesList.length} Total</span>
                        </div>
                        <div className="card-body p-0 overflow-auto" style={{ maxHeight: '550px' }}>
                            {allMessagesList.length > 0 ? (
                                <div className="list-group list-group-flush p-3">
                                    {allMessagesList.map((notice, index) => {
                                        const isFromAdmin = notice.senderRole === 'admin';
                                        const isToAdmin = notice.recipientRole === 'admin' || notice.recipientId === (adminData?.id || adminData?._id);

                                        let roleColor = 'secondary';
                                        let roleIcon = 'fa-user';

                                        if (notice.senderRole === 'admin') {
                                            roleColor = 'danger';
                                            roleIcon = 'fa-user-shield';
                                        } else if (notice.senderRole === 'project-manager') {
                                            roleColor = 'primary';
                                            roleIcon = 'fa-user-tie';
                                        } else if (notice.senderRole === 'team-leader') {
                                            roleColor = 'warning';
                                            roleIcon = 'fa-users-cog';
                                        } else if (notice.senderRole === 'employee') {
                                            roleColor = 'success';
                                            roleIcon = 'fa-user';
                                        }

                                        return (
                                            <div key={notice.id || index} className="card border-0 mb-3 shadow-sm" style={{ borderRadius: '12px', borderLeft: `5px solid var(--bs-${roleColor})` }}>
                                                <div className="card-body p-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <div className={`rounded-circle bg-${roleColor} bg-opacity-10 text-${roleColor} d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px' }}>
                                                                <i className={`fas ${roleIcon}`}></i>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold d-flex align-items-center flex-wrap gap-2">
                                                                    <span className={`text-${roleColor}`}>{notice.senderName}</span>
                                                                    <i className="fas fa-long-arrow-alt-right text-muted mx-1"></i>
                                                                    <span className="text-dark">{notice.recipientName || notice.recipientRole}</span>
                                                                </h6>
                                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                    <i className="far fa-clock me-1"></i>
                                                                    {new Date(notice.date).toLocaleString()}
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <span className={`badge bg-${roleColor} text-white text-uppercase px-2 py-1`} style={{ fontSize: '0.65rem' }}>
                                                            {notice.senderRole}
                                                        </span>
                                                    </div>
                                                    <div className="ms-5 ps-2 border-start border-light">
                                                        <p className="fw-bold mb-1 text-dark" style={{ fontSize: '0.9rem' }}>
                                                            {notice.subject}
                                                        </p>
                                                        <p className="mb-0 text-muted small" style={{ lineHeight: '1.4' }}>
                                                            {notice.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="fas fa-envelope-open fa-3x text-light mb-3"></i>
                                    <p className="text-muted">No recent messages found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportHelp;
