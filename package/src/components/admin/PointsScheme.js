import React, { useState } from 'react';
import './AdminComponents.css';

const PointsScheme = () => {
  const [pointsSchemes, setPointsSchemes] = useState([
    { id: 1, name: 'Task Completion', points: 10, description: 'Points awarded for completing a task' },
    { id: 2, name: 'Project Milestone', points: 50, description: 'Points for completing project milestones' },
    { id: 3, name: 'Early Delivery', points: 25, description: 'Bonus points for early task completion' },
    { id: 4, name: 'Code Review', points: 15, description: 'Points for conducting code reviews' },
    { id: 5, name: 'Bug Fix', points: 20, description: 'Points for fixing bugs' }
  ]);
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [schemeName, setSchemeName] = useState('');
  const [schemePoints, setSchemePoints] = useState('');
  const [schemeDescription, setSchemeDescription] = useState('');

  // Handle add scheme
  const handleAddScheme = () => {
    setEditingScheme(null);
    setSchemeName('');
    setSchemePoints('');
    setSchemeDescription('');
    setShowAddSchemeModal(true);
  };

  // Handle edit scheme
  const handleEditScheme = (scheme) => {
    setEditingScheme(scheme);
    setSchemeName(scheme.name);
    setSchemePoints(scheme.points.toString());
    setSchemeDescription(scheme.description);
    setShowAddSchemeModal(true);
  };

  // Handle save scheme
  const handleSaveScheme = () => {
    if (!schemeName.trim() || !schemePoints) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingScheme) {
      // Update existing scheme
      setPointsSchemes(prev => prev.map(scheme =>
        scheme.id === editingScheme.id
          ? { ...scheme, name: schemeName, points: parseInt(schemePoints), description: schemeDescription }
          : scheme
      ));
      alert('Points scheme updated successfully!');
    } else {
      // Add new scheme
      const newScheme = {
        id: Date.now(),
        name: schemeName,
        points: parseInt(schemePoints),
        description: schemeDescription
      };
      setPointsSchemes(prev => [...prev, newScheme]);
      alert('Points scheme added successfully!');
    }

    setShowAddSchemeModal(false);
    setSchemeName('');
    setSchemePoints('');
    setSchemeDescription('');
    setEditingScheme(null);
  };

  // Handle delete scheme
  const handleDeleteScheme = (schemeId, schemeName) => {
    if (window.confirm(`Are you sure you want to delete "${schemeName}"?`)) {
      setPointsSchemes(prev => prev.filter(scheme => scheme.id !== schemeId));
      alert('Points scheme deleted successfully!');
    }
  };

  return (
    <div className="points-scheme">
      <div className="page-header">
        <h2>Points Scheme Management</h2>
        <button className="btn btn-primary" onClick={handleAddScheme}>
          <i className="fas fa-plus me-2"></i>
          Add Points Scheme
        </button>
      </div>

      {/* Points Schemes List */}
      <div className="schemes-grid">
        {pointsSchemes.map((scheme) => (
          <div key={scheme.id} className="scheme-card">
            <div className="scheme-header">
              <div className="scheme-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="scheme-points">
                <span className="points-value">{scheme.points}</span>
                <span className="points-label">Points</span>
              </div>
            </div>
            <div className="scheme-body p-3">
              <h4>{scheme.name}</h4>
              <p>{scheme.description}</p>
            </div>
            <div className="scheme-footer p-3 d-flex justify-content-end gap-2 border-top">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEditScheme(scheme)}
              >
                <i className="fas fa-edit me-1"></i>
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteScheme(scheme.id, scheme.name)}
              >
                <i className="fas fa-trash me-1"></i>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Scheme Modal */}
      {showAddSchemeModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingScheme ? 'Edit Points Scheme' : 'Add Points Scheme'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddSchemeModal(false);
                    setSchemeName('');
                    setSchemePoints('');
                    setSchemeDescription('');
                    setEditingScheme(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Scheme Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={schemeName}
                    onChange={(e) => {
                      // Only allow letters and spaces
                      const value = e.target.value;
                      if (/^[a-zA-Z\s]*$/.test(value)) {
                        setSchemeName(value);
                      }
                    }}
                    placeholder="Enter scheme name"
                    autoComplete="off"
                  />
                  <small className="form-text text-muted">
                    Only alphabetic characters allowed.
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Points *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={schemePoints}
                    onChange={(e) => {
                      // Only allow positive numbers
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setSchemePoints(value);
                    }}
                    placeholder="Enter points value"
                    autoComplete="off"
                  />
                  <small className="form-text text-muted">
                    Only positive values allowed.
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={schemeDescription}
                    onChange={(e) => setSchemeDescription(e.target.value)}
                    placeholder="Enter description"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddSchemeModal(false);
                    setSchemeName('');
                    setSchemePoints('');
                    setSchemeDescription('');
                    setEditingScheme(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveScheme}
                >
                  {editingScheme ? 'Update' : 'Add'} Scheme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points System Info */}
      <div className="points-info mt-4">
        <h4>About Points System</h4>
        <p>
          The points system rewards employees for completing tasks and achieving milestones.
          Points can be used for various rewards and recognition programs.
        </p>
        <div className="info-cards">
          <div className="info-card">
            <i className="fas fa-trophy"></i>
            <h5>Rewards</h5>
            <p>Employees can redeem points for rewards</p>
          </div>
          <div className="info-card">
            <i className="fas fa-chart-line"></i>
            <h5>Motivation</h5>
            <p>Encourages productivity and engagement</p>
          </div>
          <div className="info-card">
            <i className="fas fa-medal"></i>
            <h5>Recognition</h5>
            <p>Acknowledges outstanding performance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsScheme;
