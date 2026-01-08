import React, { useState, useEffect } from 'react';
import { getAllProjects } from '../services/api';
import './RevenueView.css';

const RevenueView = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('cost-desc'); // cost-desc, cost-asc, name-asc, name-desc

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const projectsData = await getAllProjects();
            setProjects(projectsData || []);
        } catch (error) {
            console.error('Error loading projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    // Calculate total revenue
    const calculateTotalRevenue = () => {
        return projects.reduce((total, project) => {
            const cost = parseFloat(project.projectCost) || 0;
            return total + cost;
        }, 0);
    };

    // Calculate total advance payments
    const calculateTotalAdvance = () => {
        return projects.reduce((total, project) => {
            const advance = parseFloat(project.advancePayment) || 0;
            return total + advance;
        }, 0);
    };

    // Calculate pending amount
    const calculatePendingAmount = () => {
        return calculateTotalRevenue() - calculateTotalAdvance();
    };

    // Filter and sort projects
    const getFilteredAndSortedProjects = () => {
        let filtered = projects.filter(project => {
            const searchLower = searchTerm.toLowerCase();
            return (
                project.name?.toLowerCase().includes(searchLower) ||
                project.clientName?.toLowerCase().includes(searchLower)
            );
        });

        // Sort projects
        filtered.sort((a, b) => {
            const costA = parseFloat(a.projectCost) || 0;
            const costB = parseFloat(b.projectCost) || 0;
            const nameA = a.name?.toLowerCase() || '';
            const nameB = b.name?.toLowerCase() || '';

            switch (sortBy) {
                case 'cost-desc':
                    return costB - costA;
                case 'cost-asc':
                    return costA - costB;
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num?.toString() || '0';
    };

    const filteredProjects = getFilteredAndSortedProjects();
    const totalRevenue = calculateTotalRevenue();
    const totalAdvance = calculateTotalAdvance();
    const pendingAmount = calculatePendingAmount();

    return (
        <div className="revenue-view">
            <div className="revenue-header">
                {/* Revenue Summary Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-4">
                        <div className="revenue-summary-card total-revenue">
                            <div className="card-icon">
                                <i className="fas fa-coins"></i>
                            </div>
                            <div className="card-content">
                                <h4 className="card-value">{formatCurrency(totalRevenue)}</h4>
                                <p className="card-label">Total Revenue</p>
                                <div className="card-badge">
                                    <i className="fas fa-project-diagram me-1"></i>
                                    {projects.length} Projects
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="revenue-summary-card advance-received">
                            <div className="card-icon">
                                <i className="fas fa-hand-holding-usd"></i>
                            </div>
                            <div className="card-content">
                                <h4 className="card-value">{formatCurrency(totalAdvance)}</h4>
                                <p className="card-label">Advance Received</p>
                                <div className="card-badge success">
                                    <i className="fas fa-check-circle me-1"></i>
                                    {((totalAdvance / totalRevenue) * 100 || 0).toFixed(1)}% Received
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="revenue-summary-card pending-amount">
                            <div className="card-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="card-content">
                                <h4 className="card-value">{formatCurrency(pendingAmount)}</h4>
                                <p className="card-label">Pending Amount</p>
                                <div className="card-badge warning">
                                    <i className="fas fa-hourglass-half me-1"></i>
                                    {((pendingAmount / totalRevenue) * 100 || 0).toFixed(1)}% Pending
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="revenue-controls mb-4">
                <div className="row g-3 align-items-center">
                    <div className="col-md-6">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by project or client name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex justify-content-end align-items-center gap-3">
                            <label className="mb-0 text-muted small">Sort by:</label>
                            <select
                                className="form-select sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="cost-desc">Highest Cost</option>
                                <option value="cost-asc">Lowest Cost</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            <div className="revenue-projects">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3">Loading projects...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-folder-open"></i>
                        <h5>No Projects Found</h5>
                        <p className="text-muted">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No projects available yet'}
                        </p>
                    </div>
                ) : (
                    <div className="projects-table-container">
                        <table className="table revenue-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Project Name</th>
                                    <th>Client</th>
                                    <th>Project Cost</th>
                                    <th>Advance Payment</th>
                                    <th>Pending Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map((project, index) => {
                                    const projectCost = parseFloat(project.projectCost) || 0;
                                    const advancePayment = parseFloat(project.advancePayment) || 0;
                                    const pending = projectCost - advancePayment;
                                    const percentagePaid = projectCost > 0 ? (advancePayment / projectCost) * 100 : 0;

                                    return (
                                        <tr key={project._id || project.id || index}>
                                            <td className="text-muted">{index + 1}</td>
                                            <td>
                                                <div className="project-name-cell">
                                                    <i className="fas fa-project-diagram me-2 text-primary"></i>
                                                    <strong>{project.name || 'Untitled Project'}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="client-cell">
                                                    <i className="fas fa-user me-2 text-info"></i>
                                                    {project.clientName || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="cost-cell">
                                                    <strong className="text-success">{formatCurrency(projectCost)}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="advance-cell">
                                                    <span className="text-primary">{formatCurrency(advancePayment)}</span>
                                                    <div className="progress mt-1" style={{ height: '4px' }}>
                                                        <div
                                                            className="progress-bar bg-primary"
                                                            role="progressbar"
                                                            style={{ width: `${percentagePaid}%` }}
                                                            aria-valuenow={percentagePaid}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="pending-cell">
                                                    <span className={pending > 0 ? 'text-warning' : 'text-success'}>
                                                        {formatCurrency(pending)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${project.projectStatus || 'on-track'}`}>
                                                    {project.projectStatus === 'assigned' ? 'Assigned' :
                                                        project.projectStatus === 'on-track' ? 'On Track' :
                                                            project.projectStatus === 'at-risk' ? 'At Risk' :
                                                                project.projectStatus === 'delayed' ? 'Delayed' :
                                                                    project.projectStatus === 'completed' ? 'Completed' : 'On Track'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                    <td><strong className="text-success">{formatCurrency(totalRevenue)}</strong></td>
                                    <td><strong className="text-primary">{formatCurrency(totalAdvance)}</strong></td>
                                    <td><strong className="text-warning">{formatCurrency(pendingAmount)}</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueView;
