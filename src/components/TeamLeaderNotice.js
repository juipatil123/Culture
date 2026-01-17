import React, { useState, useEffect } from 'react';
import { subscribeToNotices, NoticeService, getAllUsers } from '../firebase/firestoreService';
import { formatDate } from '../utils/dateUtils';

const TeamLeaderNotice = ({ userData, compact = false }) => {
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'

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
        const userEmail = userData.email;
        console.log('🔍 TeamLeaderNotice - Current user:', userData.name, 'ID:', userId, 'Email:', userEmail, 'Role:', userData.role);

        // Use a flag to auto-select only on first data fetch
        let initialLoadDone = false;
        let allNotices = [];

        // Subscribe by ID
        const unsubscribeById = subscribeToNotices(userId, (dataById) => {
            console.log('📬 Notices by ID for user:', userId, 'Count:', dataById.length);
            
            // Merge with email-based notices
            const mergedNotices = [...dataById];
            
            // Remove duplicates based on notice ID
            const uniqueNotices = Array.from(
                new Map(mergedNotices.map(notice => [notice.id, notice])).values()
            );
            
            allNotices = uniqueNotices;
            setNotices(uniqueNotices);
            setLoading(false);

            // Auto-select latest notice on first load if nothing is selected and we aren't composing
            if (!initialLoadDone && uniqueNotices.length > 0 && !selectedNotice && !isComposing) {
                setSelectedNotice(uniqueNotices[0]);
                initialLoadDone = true;
            }
        });

        // Fetch users for compose dropdown
        getAllUsers().then(setAllUsers).catch(err => console.error("Error loading users:", err));

        return () => {
            unsubscribeById();
        };
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
                targetUsers: [selectedNotice.senderId], // Add targetUsers array
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
                targetUsers: [composeData.recipientId], // Add targetUsers array
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
        // Mark as read only if it's a received message
        if (!notice.read && notice.senderId !== (userData.id || userData._id)) {
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

    const formatDateDDMMYYYY = (dateVal) => {
        if (!dateVal) return 'N/A';
        const d = new Date(dateVal.seconds ? dateVal.seconds * 1000 : dateVal);
        if (isNaN(d.getTime())) return 'N/A';
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
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

    const sentNotices = notices.filter(n => n.senderId === (userData?.id || userData?._id));
    const receivedNotices = notices.filter(n => n.senderId !== (userData?.id || userData?._id));
    const unreadCount = receivedNotices.filter(n => !n.read).length;

    const currentList = activeTab === 'received' ? receivedNotices : sentNotices;
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
                        className={`list-group-item p-3 border-0 border-bottom ${!notice.read && notice.senderId !== (userData.id || userData._id) ? 'bg-light bg-opacity-50 fw-bold' : ''}`}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div className="d-flex align-items-center">
                                <i className={`fas ${getSenderIcon(notice.senderRole)} me-2 small`}></i>
                                <span className="smaller text-uppercase opacity-75" style={{ fontSize: '0.65rem' }}>{notice.senderRole}</span>
                            </div>
                            <small className="text-muted smaller">{formatDateDDMMYYYY(notice.date || notice.createdAt)}</small>
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
                {/* Notices List Sidebar */}
                <div className="col-md-5 col-lg-4 mb-4 mb-md-0">
                    <div className="card shadow-sm border-0 h-100" style={{ maxHeight: '80vh' }}>
                        {/* Header with Tabs */}
                        <div className="card-header bg-white border-bottom p-0">
                            <div className="d-flex">
                                <button
                                    className={`btn flex-grow-1 rounded-0 py-3 fw-bold ${activeTab === 'received' ? 'text-primary border-bottom border-primary border-3 bg-light' : 'text-muted'}`}
                                    onClick={() => setActiveTab('received')}
                                >
                                    Received
                                    <span className={`badge rounded-pill ms-2 ${activeTab === 'received' ? 'bg-primary' : 'bg-secondary'}`}>
                                        {receivedNotices.length}
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="badge bg-danger rounded-circle ms-1 p-1" style={{ width: '8px', height: '8px' }}> </span>
                                    )}
                                </button>
                                <button
                                    className={`btn flex-grow-1 rounded-0 py-3 fw-bold ${activeTab === 'sent' ? 'text-primary border-bottom border-primary border-3 bg-light' : 'text-muted'}`}
                                    onClick={() => setActiveTab('sent')}
                                >
                                    Sent
                                    <span className={`badge rounded-pill ms-2 ${activeTab === 'sent' ? 'bg-primary' : 'bg-secondary'}`}>
                                        {sentNotices.length}
                                    </span>
                                </button>
                            </div>
                        </div>
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

                        {/* Search/Filter Bar (Optional placeholder) */}
                        {/* <div className="p-2 bg-light border-bottom"><input ... /></div> */}

                        <div className="list-group list-group-flush overflow-auto" style={{ height: '600px' }}>
                            {currentList.length > 0 ? currentList.map(notice => (
                                <button
                                    key={notice.id}
                                    className={`list-group-item list-group-item-action p-3 border-0 border-bottom ${selectedNotice?.id === notice.id ? 'border-start border-4 border-primary bg-light' : ''} ${!notice.read ? 'fw-bold' : ''}`}
                                    onClick={() => handleNoticeClick(notice)}
                                    style={{ borderLeft: !notice.read && activeTab === 'received' ? '4px solid #0d6efd' : '4px solid transparent' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div className="d-flex align-items-center">
                                            {activeTab === 'sent' ? (
                                                <>
                                                    <i className="fas fa-paper-plane text-muted me-2" style={{ fontSize: '0.8rem' }}></i>
                                                    <span className="small text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>To: {notice.recipientRole}</span>
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
                                        <small className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>{formatDateDDMMYYYY(notice.date || notice.createdAt)}</small>
                                    </div>
                                    <h6 className="mb-1 text-truncate" style={{ color: '#2c3e50' }}>{notice.subject}</h6>
                                    <p className="mb-0 small text-muted text-truncate">{notice.message}</p>

                                    {/* Unread Indicator for Received */}
                                    {!notice.read && activeTab === 'received' && (
                                        <div className="mt-2">
                                            <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.6rem' }}>NEW</span>
                                        </div>
                                    )}
                                </button>
                            )) : (
                                <div className="text-center py-5">
                                    <div className="mb-3 opacity-25">
                                        <i className={`fas ${activeTab === 'received' ? 'fa-inbox' : 'fa-paper-plane'} fa-3x`}></i>
                                    </div>
                                    <p className="text-muted">No {activeTab} messages.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notice Detail or Compose View */}
                <div className="col-md-7 col-lg-8">
                    <div className="card shadow-sm border-0 h-100" style={{ minHeight: '60vh' }}>
                        {selectedNotice ? (
                            <div className="card-body p-4 d-flex flex-column animate__animated animate__fadeIn">
                                <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
                                    <div>
                                        <h3 className="fw-bold mb-2 text-dark">{selectedNotice.subject}</h3>
                                        <div className="d-flex align-items-center text-muted gap-3 small">
                                            {/* ... same details as before ... */}
                                            <span>
                                                {selectedNotice.senderId === (userData?.id || userData?._id) ? (
                                                    <>To: <strong>{selectedNotice.recipientName || 'Member'}</strong></>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-user me-2"></i>
                                                        From: <strong>{selectedNotice.senderName || selectedNotice.sender}</strong>
                                                        <span className="ms-2 badge bg-secondary">{selectedNotice.senderRole}</span>
                                                    </>
                                                )}
                                            </span>
                                            <span className="opacity-50">|</span>
                                            <span>
                                                <i className="far fa-clock me-2"></i>
                                                {formatDate(selectedNotice.date || selectedNotice.createdAt?.seconds * 1000)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-2">
                                        {getPriorityBadge(selectedNotice.priority)}
                                        <button
                                            className="btn btn-outline-danger btn-sm rounded-circle shadow-sm"
                                            title="Delete Notice"
                                            onClick={(e) => handleDeleteNotice(selectedNotice.id, e)}
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="notice-content flex-grow-1">
                                    <p className="lead text-dark" style={{ fontSize: '1.05rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                                        {selectedNotice.message}
                                    </p>
                                </div>

                                {/* Reply Section only for Received Messages */}
                                {selectedNotice.senderId !== (userData?.id || userData?._id) && (
                                    <div className="mt-4 pt-4 border-top">
                                        <h6 className="fw-bold text-muted mb-3"><i className="fas fa-reply me-2"></i>Quick Reply</h6>
                                        <div className="position-relative">
                                            <textarea
                                                className="form-control mb-3 shadow-none bg-light"
                                                rows="3"
                                                placeholder="Type your reply here..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                disabled={sendingReply}
                                                style={{ borderRadius: '10px' }}
                                            ></textarea>
                                            <div className="text-end">
                                                <button
                                                    className="btn btn-primary px-4 rounded-pill fw-bold"
                                                    onClick={handleReply}
                                                    disabled={sendingReply || !replyMessage.trim()}
                                                >
                                                    {sendingReply ? (
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    ) : (
                                                        <i className="fas fa-paper-plane me-2"></i>
                                                    )}
                                                    Send Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5">
                                <div className="bg-light rounded-circle p-4 mb-3 animate__animated animate__pulse animate__infinite infinite">
                                    <i className="fas fa-envelope-open-text fa-4x text-muted opacity-50"></i>
                                </div>
                                <h4 className="text-muted fw-bold">Select a message</h4>
                                <p className="text-muted">Choose a message from the list to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamLeaderNotice;
