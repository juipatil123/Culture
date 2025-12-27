import React from 'react';
import '../App.css'; // Ensure app-wide styles are available

const TeamLeaderSidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
        { id: 'my-team', icon: 'fas fa-users', label: 'My Team' },
        { id: 'projects', icon: 'fas fa-project-diagram', label: 'Projects' },
        { id: 'tasks', icon: 'fas fa-tasks', label: 'Tasks' },
        { id: 'reports', icon: 'fas fa-chart-bar', label: 'Reports' },
        { id: 'profile', icon: 'fas fa-user-circle', label: 'Profile' }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isMobileOpen ? 'show' : ''}`}
                onClick={() => setIsMobileOpen(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1040,
                    display: isMobileOpen ? 'block' : 'none',
                    backdropFilter: 'blur(2px)' // Glassmorphism effect
                }}
            ></div>

            {/* Sidebar Container */}
            <div
                className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark h-100 shadow-lg sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}
                style={{
                    width: '260px',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 1050,
                    transition: 'transform 0.3s ease-in-out',
                    transform: window.innerWidth <= 768 && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
                    background: 'linear-gradient(180deg, #212529 0%, #343a40 100%)', // Gradient background
                    borderRight: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {/* Header */}
                <div className="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-white text-decoration-none pb-3 border-bottom border-secondary">
                    <div className="d-flex align-items-center gap-3 w-100 px-2">
                        <div className="bg-primary bg-gradient rounded-3 p-2 shadow-sm d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }}>
                            <i className="fas fa-user-tie fa-lg text-white"></i>
                        </div>
                        <div className="d-flex flex-column">
                            <span className="fs-5 fw-bold text-white">Team Leader</span>
                            <span className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Dashboard</span>
                        </div>
                        <button
                            className="btn btn-link text-white-50 ms-auto d-md-none"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Navigation Menu */}
                <ul className="nav nav-pills flex-column mb-auto gap-2">
                    {menuItems.map((item) => (
                        <li key={item.id} className="nav-item">
                            <button
                                className={`nav-link w-100 text-start d-flex align-items-center gap-3 ${activeView === item.id ? 'active shadow-md' : 'text-white-50'
                                    }`}
                                onClick={() => {
                                    setActiveView(item.id);
                                    if (window.innerWidth <= 768) setIsMobileOpen(false);
                                }}
                                style={{
                                    background: activeView === item.id ? 'var(--bs-primary)' : 'transparent',
                                    color: activeView === item.id ? '#fff' : 'rgba(255,255,255,0.75)',
                                    transition: 'all 0.2s ease',
                                    padding: '12px 20px',
                                    borderRadius: '10px', // More modern rounded corners
                                    fontWeight: activeView === item.id ? '600' : '400',
                                    border: '1px solid transparent',
                                    ':hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: '#fff'
                                    }
                                }}
                                onMouseOver={(e) => {
                                    if (activeView !== item.id) {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (activeView !== item.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }
                                }}
                            >
                                <i className={`${item.icon} fa-fw`} style={{ width: '20px', textAlign: 'center' }}></i>
                                <span>{item.label}</span>
                                {activeView === item.id && (
                                    <i className="fas fa-chevron-right ms-auto small opacity-75"></i>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Footer / Logout */}
                <div className="mt-auto">
                    <button
                        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={onLogout}
                        style={{
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sign out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default TeamLeaderSidebar;
