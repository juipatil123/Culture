import React, { useState } from 'react';
import './AdminComponents.css';

const Reports = () => {
    const [reportType, setReportType] = useState('project-status');

    const handleDownload = () => {
        alert(`Downloading ${reportType} report...`);
    };

    return (
        <div className="reports-container">
            <div className="page-header">
                <h2>Reports</h2>
                <button className="btn btn-primary" onClick={handleDownload}>
                    <i className="fas fa-download me-2"></i>
                    Download Report
                </button>
            </div>

            <div className="reports-content">
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div
                            className={`report-card ${reportType === 'project-status' ? 'active' : ''}`}
                            onClick={() => setReportType('project-status')}
                        >
                            <div className="report-icon bg-primary text-white">
                                <i className="fas fa-chart-pie"></i>
                            </div>
                            <h4>Project Status</h4>
                            <p>Overview of all projects, their status, and progress.</p>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div
                            className={`report-card ${reportType === 'employee-performance' ? 'active' : ''}`}
                            onClick={() => setReportType('employee-performance')}
                        >
                            <div className="report-icon bg-success text-white">
                                <i className="fas fa-user-check"></i>
                            </div>
                            <h4>Employee Performance</h4>
                            <p>Detailed performance metrics for all employees.</p>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div
                            className={`report-card ${reportType === 'financial-summary' ? 'active' : ''}`}
                            onClick={() => setReportType('financial-summary')}
                        >
                            <div className="report-icon bg-warning text-dark">
                                <i className="fas fa-file-invoice-dollar"></i>
                            </div>
                            <h4>Financial Summary</h4>
                            <p>Revenue, expenses, and profit analysis.</p>
                        </div>
                    </div>
                </div>

                <div className="report-preview mt-4">
                    <div className="card">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">
                                {reportType === 'project-status' && 'Project Status Report Preview'}
                                {reportType === 'employee-performance' && 'Employee Performance Report Preview'}
                                {reportType === 'financial-summary' && 'Financial Summary Report Preview'}
                            </h5>
                        </div>
                        <div className="card-body text-center py-5">
                            <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                            <p className="text-muted">Select a date range to generate preview</p>
                            <div className="d-inline-block">
                                <input type="date" className="form-control mb-3" />
                                <button className="btn btn-outline-primary">Generate Preview</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
