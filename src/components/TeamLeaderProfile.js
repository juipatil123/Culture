import React from 'react';

const TeamLeaderProfile = ({ userData, onUpdateProfile }) => {
    const [formData, setFormData] = React.useState(userData || {});
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
        if (userData) setFormData(userData);
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onUpdateProfile) {
            onUpdateProfile(formData);
            setIsEditing(false);
        }
    };

    if (!userData) return null;

    return (
        <div className="container-fluid p-0">
            <div className="row">
                <div className="col-lg-4 mb-4">
                    {/* Profile Card */}
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center py-5">
                            <div className="position-relative d-inline-block mb-3">
                                <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
                                    style={{ width: '120px', height: '120px', fontSize: '3rem' }}>
                                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="position-absolute bottom-0 end-0 p-2 bg-success border border-white rounded-circle"></span>
                            </div>
                            <h4 className="fw-bold mb-1">{formData.name}</h4>
                            <p className="text-muted mb-3">{formData.role || 'Team Leader'}</p>

                            <div className="d-flex justify-content-center gap-2 mb-4">
                                <button className="btn btn-primary px-4" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            </div>

                            <hr className="my-4" />

                            <div className="text-start">
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Email Address</small>
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-envelope text-primary me-2"></i>
                                        <span>{formData.email}</span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Phone</small>
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-phone text-primary me-2"></i>
                                        <span>{formData.phone || 'Not provided'}</span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Gender</small>
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-venus-mars text-primary me-2"></i>
                                        <span>{formData.gender || 'Not specified'}</span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Department</small>
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-building text-primary me-2"></i>
                                        <span>{formData.department || 'General'}</span>
                                    </div>
                                </div>
                                <div>
                                    <small className="text-muted d-block mb-1">Join Date</small>
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-calendar-alt text-primary me-2"></i>
                                        <span>{formData.joinDate ? new Date(formData.joinDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom-0 py-3">
                            <h5 className="mb-0 fw-bold">Account Settings</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email || ''}
                                            disabled
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small">Gender</label>
                                        <select
                                            className="form-select"
                                            name="gender"
                                            value={formData.gender || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted small">Department</label>
                                        <select
                                            className="form-select"
                                            name="department"
                                            value={formData.department || 'Web Development'}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        >
                                            <option>Web Development</option>
                                            <option>Design</option>
                                            <option>Marketing</option>
                                            <option>Sales</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-muted small">Bio</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            name="bio"
                                            value={formData.bio || ''}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Tell us about yourself..."
                                        ></textarea>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-light" onClick={() => {
                                            setFormData(userData);
                                            setIsEditing(false);
                                        }}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Save Changes</button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamLeaderProfile;
