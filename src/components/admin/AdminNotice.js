import React, { useState, useEffect } from 'react';
import { getAllUsers, NoticeService } from '../../firebase/firestoreService';
import { formatDate } from '../../utils/dateUtils';

const AdminNotice = ({ userData }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [severity, setSeverity] = useState('info'); // info, warning, danger
    const [sending, setSending] = useState(false);
    const [sentNotices, setSentNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
        fetchSentNotices();
    }, []);

    const fetchEmployees = async () => {
        try {
            const users = await getAllUsers();
            const filtered = users.filter(u => ['employee', 'team-leader', 'project-manager', 'intern'].includes(u.role));
            setEmployees(filtered);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchSentNotices = async () => {
        try {
            const notices = await NoticeService.getAll();
            // Filter notices sent by admin to show in history
            const adminSent = notices.filter(n => n.senderRole === 'admin' || n.sender === 'Admin');
            setSentNotices(adminSent);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notices:', error);
            setLoading(false);
        }
    };

    const handleSendNotice = async (e) => {
        e.preventDefault();
        if (!selectedEmployee || !message || !subject) return;

        setSending(true);
        try {
            const selectedEmpData = employees.find(e => (e.id || e._id) === selectedEmployee);

            const noticeData = {
                recipientId: selectedEmployee,
                recipientName: selectedEmpData?.name || 'Unknown',
                recipientEmail: selectedEmpData?.email || 'Unknown',
                recipientRole: selectedEmpData?.role || 'employee',
                subject,
                message,
                severity,
                priority: severity === 'danger' ? 'high' : 'normal',
                sender: 'Admin',
                senderId: userData?.id || userData?._id || 'admin-id',
                senderName: userData?.name || 'Admin',
                senderRole: 'admin',
                date: new Date().toISOString(),
                read: false
            };

            await NoticeService.create(noticeData);

            setMessage('');
            setSubject('');
            setSeverity('info');
            setSelectedEmployee('');
            fetchSentNotices();
            alert('Notice sent successfully!');
        } catch (error) {
            console.error('Error sending notice:', error);
            alert('Failed to send notice.');
        } finally {
            setSending(false);
        }
    };

    const handleDownloadHistory = () => {
        const headers = ['Recipient', 'Subject', 'Type', 'Date', 'Read Status'];
        const rows = sentNotices.map(notice => [
            notice.recipientName || 'Unknown',
            notice.subject || '',
            notice.severity || 'info',
            notice.createdAt?.seconds ? formatDate(new Date(notice.createdAt.seconds * 1000)) : formatDate(new Date()),
            notice.read ? 'Read' : 'Unread'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `notice_history_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="container-fluid p-4">
            <h3 className="mb-4 fw-bold">Send Warning / Personal Notice</h3>

            <div className="row">
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">Compose Notice</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSendNotice}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Recipient</label>
                                    <select
                                        className="form-select"
                                        value={selectedEmployee}
                                        onChange={(e) => setSelectedEmployee(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Notice Type</label>
                                    <select
                                        className="form-select"
                                        value={severity}
                                        onChange={(e) => setSeverity(e.target.value)}
                                    >
                                        <option value="info">General Info (Blue)</option>
                                        <option value="warning">Warning (Yellow)</option>
                                        <option value="danger">Critical / Urgent (Red)</option>
                                        <option value="success">Appreciation (Green)</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Subject</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Enter notice subject"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Message</label>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your personal message or warning here..."
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
                                    disabled={sending}
                                >
                                    {sending ? <i className="fas fa-spinner fa-spin me-2"></i> : <i className="fas fa-paper-plane me-2"></i>}
                                    Send Notice
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Sent History</h5>
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={handleDownloadHistory}
                                disabled={sentNotices.length === 0}
                            >
                                <i className="fas fa-download me-2"></i>Export CSV
                            </button>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : sentNotices.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 py-3">Sent To</th>
                                                <th className="py-3">Subject</th>
                                                <th className="py-3">Type</th>
                                                <th className="py-3">Date</th>
                                                <th className="py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sentNotices.map((notice) => (
                                                <tr key={notice.id}>
                                                    <td className="ps-4 fw-semibold">{notice.recipientName}</td>
                                                    <td>{notice.subject}</td>
                                                    <td>
                                                        <span className={`badge bg-${notice.severity === 'danger' ? 'danger' : notice.severity === 'warning' ? 'warning text-dark' : notice.severity === 'success' ? 'success' : 'info'}`}>
                                                            {(notice.severity || 'info').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="small text-muted">
                                                        {notice.createdAt?.seconds ? formatDate(new Date(notice.createdAt.seconds * 1000)) : 'Just now'}
                                                    </td>
                                                    <td>
                                                        {notice.read ? (
                                                            <span className="badge bg-success-subtle text-success border border-success-subtle">Read</span>
                                                        ) : (
                                                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Unread</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <i className="fas fa-inbox fa-3x mb-3 opacity-25"></i>
                                    <p>No notices sent yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotice;
