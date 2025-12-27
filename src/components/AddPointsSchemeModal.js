import React, { useState } from 'react';

const AddPointsSchemeModal = ({ show, onClose, onSave, editingScheme }) => {
  const [formData, setFormData] = useState({
    name: '',
    points: '',
    description: '',
    category: 'Performance'
  });

  // Update form data when editing scheme changes
  React.useEffect(() => {
    if (editingScheme) {
      setFormData({
        name: editingScheme.name,
        points: editingScheme.points.toString(),
        description: editingScheme.description,
        category: editingScheme.category
      });
    } else {
      setFormData({
        name: '',
        points: '',
        description: '',
        category: 'Performance'
      });
    }
  }, [editingScheme]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      points: parseInt(formData.points)
    });
    setFormData({
      name: '',
      points: '',
      description: '',
      category: 'Performance'
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-trophy me-2"></i>
              {editingScheme ? 'Edit Points Scheme' : 'Add New Points Scheme'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">Scheme Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Zero Late Marks (Monthly)"
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Points *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    placeholder="25"
                    min="1"
                    max="1000"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Performance">Performance</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Business">Business</option>
                  <option value="Quality">Quality</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Innovation">Innovation</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe when and how employees can earn these points..."
                  required
                />
              </div>
              
              {/* Preview Section */}
              <div className="alert alert-light border">
                <h6 className="alert-heading">Preview</h6>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{formData.name || 'Scheme Name'}</strong>
                    <p className="text-muted mb-1">{formData.description || 'Description will appear here...'}</p>
                    <span className="badge bg-light text-dark">{formData.category}</span>
                  </div>
                  <span className="badge bg-primary">{formData.points || '0'} pts</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save me-2"></i>
                {editingScheme ? 'Update Points Scheme' : 'Add Points Scheme'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPointsSchemeModal;
