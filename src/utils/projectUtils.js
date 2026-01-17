/**
 * Calculate project status dynamically based on progress and dates
 * @param {Object} project - Project object with progress, endDate, and projectStatus
 * @returns {string} - Calculated status: 'Completed', 'In Progress', 'Overdue', or 'Pending'
 */
export const calculateProjectStatus = (project) => {
  // Convert progress to number, handling both string and number types
  const progress = Number(project.progress) || 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log(`📊 ${project.name}: progress=${progress}% (raw: ${project.progress}, type: ${typeof project.progress}), endDate=${project.endDate}`);

  // FIRST PRIORITY: Check if completed (100% progress or explicitly completed)
  // This should override any date-based status
  if (progress >= 100 || project.projectStatus === 'completed') {
    console.log(`   ✅ Status: Completed (progress >= 100)`);
    return 'Completed';
  }

  // SECOND PRIORITY: Check if overdue (end date passed and not completed)
  if (project.endDate) {
    const endDate = new Date(project.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
      console.log(`   ⚠️ Status: Overdue (${endDate} < ${today})`);
      return 'Overdue';
    }

    // Check if in progress (has some progress and within deadline)
    if (progress > 0) {
      console.log(`   🔄 Status: In Progress`);
      return 'In Progress';
    }
  }

  // If no end date but has progress, mark as in progress
  if (progress > 0) {
    console.log(`   🔄 Status: In Progress (no end date)`);
    return 'In Progress';
  }

  // Default status
  console.log(`   ⏸️ Status: Pending`);
  return 'Pending';
};

/**
 * Get status badge color based on status
 * @param {string} status - Project status
 * @returns {string} - Color code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#28a745';
    case 'In Progress':
      return '#007bff';
    case 'Overdue':
      return '#dc3545';
    case 'Pending':
    default:
      return '#6f42c1';
  }
};

/**
 * Get progress bar gradient based on status
 * @param {string} status - Project status
 * @returns {string} - CSS gradient
 */
export const getProgressGradient = (status) => {
  switch (status) {
    case 'Completed':
      return 'linear-gradient(90deg, #28a745, #20c997)';
    case 'In Progress':
      return 'linear-gradient(90deg, #4361ee, #4cc9f0)';
    case 'Overdue':
      return 'linear-gradient(90deg, #dc3545, #f72585)';
    case 'Pending':
    default:
      return 'linear-gradient(90deg, #6f42c1, #9d4edd)';
  }
};
