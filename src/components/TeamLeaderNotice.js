import React, { useState, useEffect } from 'react';
import { subscribeToNotices, NoticeService, getAllUsers } from '../firebase/firestoreService';
import { formatDate } from '../utils/dateUtils';

const TeamLeaderNotice = ({ userData, compact = false }) => {
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // Compose related state
    const [isComposing, setIsComposing] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [composeData, setComposeData] = useState({
        recipientType: 'admin',
        recipientId: '',
        subject: '',
        message: '',
        priority: 'normal'
    });
    const [sendingCompose, setSendingCompose] = useState(false);

    useEffect(() => {
        if (!userData) return;
        const userId = userData.id || userData._id;

        // Use a flag to auto-select only on first data fetch
        let initialLoadDone = false;

        const unsubscribe = subscribeToNotices(userId, userData.role, (data) => {
            setNotices(data);
            setLoading(false);

            // Auto-select latest notice on first load if nothing is selected and we aren't composing
            if (!initialLoadDone && data.length > 0 && !selectedNotice && !isComposing) {
                setSelectedNotice(data[0]);
                initialLoadDone = true;
            }
        });

        // Fetch users for compose dropdown
        getAllUsers().then(setAllUsers).catch(err => console.error("Error loading users:", err));

        return () => unsubscribe();
    }, [userData]);

    const handleReply = async () => {
        if (!replyMessage.trim()) return;
        if (!selectedNotice) return;

        setSendingReply(true);
        try {
            const replyData = {
                senderId: userData.id || userData._id,
                senderName: userData.name,
                senderRole: userData.role,
                recipientId: selectedNotice.senderId || 'admin-id',
                recipientRole: selectedNotice.senderRole || 'admin',
                recipientName: selectedNotice.senderName || selectedNotice.sender || 'Admin',
                subject: `Re: ${selectedNotice.subject}`,
                message: replyMessage,
                priority: 'normal',
                read: false,
                date: new Date().toISOString()
            };

            await NoticeService.create(replyData);
            alert('Reply sent successfully!');
            setReplyMessage('');
        } catch (error) {
            console.error("Error sending reply:", error);
            alert('Failed to send reply: ' + error.message);
        } finally {
            setSendingReply(false);
        }
    };

    const handleComposeSubmit = async (e) => {
        e.preventDefault();
        if (!composeData.recipientId || !composeData.subject || !composeData.message) return;

        setSendingCompose(true);
        try {
            const recipient = allUsers.find(u => (u.id || u._id) === composeData.recipientId);
            const noticeData = {
                senderId: userData.id || userData._id,
                senderName: userData.name,
                senderRole: userData.role,
                recipientType: composeData.recipientType,
                recipientId: composeData.recipientId,
                recipientName: recipient?.name || 'Unknown',
                recipientRole: composeData.recipientType,
                subject: composeData.subject,
                message: composeData.message,
                read: false,
                priority: composeData.priority,
                date: new Date().toISOString()
            };

            await NoticeService.create(noticeData);
            setIsComposing(false);
            setComposeData({
                recipientType: 'admin',
                recipientId: '',
                subject: '',
                message: '',
                priority: 'normal'
            });
            alert('Notice sent successfully!');
        } catch (error) {
            console.error("Error sending compose:", error);
            alert('Failed to send message.');
        } finally {
            setSendingCompose(false);
        }
    };

    const handleNoticeClick = async (notice) => {
        if (compact) return;
        setIsComposing(false);
        setSelectedNotice(notice);
        if (!notice.read) {
            try {
                await NoticeService.update(notice.id, { read: true });
                setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, read: true } : n));
            } catch (error) {
                console.error("Error marking notice as read:", error);
            }
        }
    };

    const handleDeleteNotice = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this message?')) {
            try {
                await NoticeService.delete(id);
                setNotices(prev => prev.filter(n => n.id !== id));
                if (selectedNotice?.id === id) setSelectedNotice(null);
            } catch (error) {
                console.error("Error deleting notice:", error);
            }
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high': return <span className="badge bg-danger">High Priority</span>;
            case 'normal': return <span className="badge bg-info text-dark">Normal</span>;
            default: return <span className="badge bg-secondary">Low</span>;
        }
    };

    const getSenderIcon = (role) => {
        switch (role) {
            case 'admin': return 'fas fa-shield-alt text-danger';
            case 'project-manager': return 'fas fa-user-tie text-primary';
            case 'employee': return 'fas fa-user text-success';
            case 'team-leader': return 'fas fa-users-cog text-warning';
            default: return 'fas fa-envelope text-secondary';
        }
    };

    const getComposeRecipients = () => {
        const type = composeData.recipientType;
        return allUsers.filter(u => {
            if (type === 'admin') return u.role === 'admin';
            if (type === 'project-manager') return u.role === 'project-manager';
            if (type === 'team-leader') return u.role === 'team-leader';
            if (type === 'employee') return u.role === 'employee' || u.role === 'intern';
            return false;
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="list-group list-group-flush">
                {notices.length > 0 ? notices.slice(0, 5).map(notice => (
                    <div
                        key={notice.id}
                        className={`list-group-item p-3 border-0 border-bottom ${!notice.read ? 'bg-light bg-opacity-50 fw-bold' : ''}`}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div className="d-flex align-items-center">
                                <i className={`fas ${getSenderIcon(notice.senderRole)} me-2 small`}></i>
                                <span className="smaller text-uppercase opacity-75" style={{ fontSize: '0.65rem' }}>{notice.senderRole}</span>
                            </div>
                            <small className="text-muted smaller">{formatDate(notice.date || notice.createdAt?.seconds * 1000)}</small>
                        </div>
                        <h6 className="mb-1 text-truncate small fw-bold">{notice.subject}</h6>
                        <p className="mb-0 smaller text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{notice.message}</p>
                    </div>
                )) : (
                    <div className="text-center py-4">
                        <p className="text-muted smaller mb-0">No new notices.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container-fluid p-0">
            <div className="row h-100">
                {/* Notices List */}
                <div className="col-md-5 col-lg-4 mb-4 mb-md-0">
                    <div className="card shadow-sm border-0 h-100" style={{ maxHeight: '80vh' }}>
                        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-primary">Inbox</h5>
                            <button
                                className="btn btn-primary btn-sm rounded-circle shadow-sm"
                                title="Compose New"
                                onClick={() => {
                                    setIsComposing(true);
                                    setSelectedNotice(null);
                                }}
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                        <div className="list-group list-group-flush overflow-auto" style={{ height: '600px' }}>
                            {notices.length > 0 ? notices.map(notice => (
                                <button
                                    key={notice.id}
                                    className={`list-group-item list-group-item-action p-3 border-0 border-bottom ${selectedNotice?.id === notice.id ? 'border-start border-4 border-primary bg-light' : ''} ${!notice.read ? 'fw-bold' : ''}`}
                                    onClick={() => handleNoticeClick(notice)}
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div className="d-flex align-items-center">
                                            {notice.senderId === (userData?.id || userData?._id) ? (
                                                <>
                                                    <i className="fas fa-paper-plane text-muted me-2" style={{ fontSize: '0.8rem' }}></i>
                                                    <span className="badge bg-secondary me-2" style={{ fontSize: '0.65rem' }}>SENT</span>
                                                    <span className="small text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>To: {notice.recipientName || notice.recipientRole}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className={`${getSenderIcon(notice.senderRole)} me-2`}></i>
                                                    <span className="small text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>{notice.senderRole}</span>
                                                </>
                                            )}
                                        </div>
                                        <small className="text-muted">{formatDate(notice.date || notice.createdAt?.seconds * 1000)}</small>
                                    </div>
                                    <h6 className="mb-1 text-truncate fw-bold">{notice.subject}</h6>
                                    <p className="mb-0 small text-muted text-truncate">{notice.message}</p>
                                </button>
                            )) : (
                                <div className="text-center py-5">
                                    <i className="fas fa-inbox fa-3x text-light mb-3"></i>
                                    <p className="text-muted">No messages found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notice Detail or Compose View */}
                <div className="col-md-7 col-lg-8">
                    <div className="card shadow-sm border-0 h-100" style={{ minHeight: '60vh' }}>
                        {isComposing ? (
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <h4 className="fw-bold mb-0 text-primary">New Message</h4>
                                    <button className="btn-close" onClick={() => setIsComposing(false)}></button>
                                </div>
                                <form onSubmit={handleComposeSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6 text-start">
                                            <label className="form-label fw-bold small">Recipient Group</label>
                                            <select
                                                className="form-select bg-light border-0"
                                                value={composeData.recipientType}
                                                onChange={(e) => setComposeData({ ...composeData, recipientType: e.target.value, recipientId: '' })}
                                            >
                                                <option value="admin">Admins</option>
                                                <option value="project-manager">Project Managers</option>
                                                <option value="team-leader">Team Leaders</option>
                                                <option value="employee">Employees</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 text-start">
                                            <label className="form-label fw-bold small">Select Person</label>
                                            <select
                                                className="form-select border-primary-subtle"
                                                value={composeData.recipientId}
                                                onChange={(e) => setComposeData({ ...composeData, recipientId: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Select Recipient --</option>
                                                {getComposeRecipients().map(u => (
                                                    <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12 text-start">
                                            <label className="form-label fw-bold small">Subject</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="What is this about?"
                                                value={composeData.subject}
                                                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 text-start">
                                            <label className="form-label fw-bold small">Message</label>
                                            <textarea
                                                className="form-control"
                                                rows="8"
                                                placeholder="Type your message here..."
                                                value={composeData.message}
                                                onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="col-12 text-end mt-4">
                                            <button type="button" className="btn btn-light px-4 me-2" onClick={() => setIsComposing(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm" disabled={sendingCompose}>
                                                {sendingCompose ? 'Sending...' : 'Send Message'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : selectedNotice ? (
                            <div className="card-body p-4 d-flex flex-column text-start">
                                <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
                                    <div>
                                        <h3 className="fw-bold mb-2 text-dark">{selectedNotice.subject}</h3>
                                        <div className="d-flex align-items-center text-muted gap-3 small">
                                            {/* ... same details as before ... */}
                                            <span>
                                                {selectedNotice.senderId === (userData?.id || userData?._id) ? (
                                                    <>To: <strong>{selectedNotice.recipientName || 'Member'}</strong></>
                                                ) : (
                                                    <>From: <strong>{selectedNotice.senderName || selectedNotice.sender || 'Admin'}</strong></>
                                                )}
                                            </span>
                                            <span>|</span>
                                            <span>
                                                <i className="far fa-clock me-2"></i>
                                                {formatDate(selectedNotice.date || selectedNotice.createdAt?.seconds * 1000)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-2">
                                        {getPriorityBadge(selectedNotice.priority)}
                                        <button
                                            className="btn btn-outline-danger btn-sm rounded-circle border-0"
                                            onClick={(e) => handleDeleteNotice(selectedNotice.id, e)}
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="notice-content flex-grow-1 p-3 bg-light rounded-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                                    {selectedNotice.message}
                                </div>

                                {selectedNotice.senderId !== (userData?.id || userData?._id) && (
                                    <div className="mt-4 pt-3 border-top">
                                        <h6 className="fw-bold text-muted mb-3"><i className="fas fa-reply me-2"></i>Quick Reply</h6>
                                        <div className="input-group">
                                            <textarea
                                                className="form-control border-0 bg-light"
                                                rows="2"
                                                placeholder="Type your reply..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            ></textarea>
                                            <button
                                                className="btn btn-primary px-4 fw-bold"
                                                onClick={handleReply}
                                                disabled={sendingReply || !replyMessage.trim()}
                                            >
                                                {sendingReply ? <i className="fas fa-spinner fa-spin"></i> : 'Send'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-5">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-4 mb-3">
                                    <i className="fas fa-envelope-open-text fa-4x text-primary opacity-50"></i>
                                </div>
                                <h4 className="text-dark fw-bold mb-2">Select a notice to view</h4>
                                <p className="text-muted mb-4">Messages from Admins, PMs, and your Team will appear here.</p>
                                <button className="btn btn-primary px-4 py-2 fw-bold" onClick={() => setIsComposing(true)}>
                                    <i className="fas fa-plus me-2"></i>New Message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamLeaderNotice;
