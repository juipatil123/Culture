/**
 * Utility functions for handling user avatars
 */

/**
 * Get clean avatar initials from user data
 * @param {string} avatar - The avatar string (could be initials or other format)
 * @param {string} name - The user's full name
 * @returns {string} Clean avatar initials
 */
export const getCleanAvatar = (avatar, name) => {
  // If avatar is provided and looks like initials, use it
  if (avatar && typeof avatar === 'string' && avatar.length <= 3) {
    return avatar.toUpperCase();
  }
  
  // Otherwise, generate initials from name
  if (name && typeof name === 'string') {
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters
  }
  
  // Fallback
  return 'U';
};

/**
 * Generate avatar initials from a full name
 * @param {string} fullName - The user's full name
 * @returns {string} Avatar initials
 */
export const generateAvatarInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return 'U';
  }
  
  return fullName
    .trim()
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get avatar color based on name
 * @param {string} name - The user's name
 * @returns {string} CSS class for avatar background color
 */
export const getAvatarColor = (name) => {
  if (!name) return 'bg-primary';
  
  const colors = [
    'bg-primary',
    'bg-success', 
    'bg-info',
    'bg-warning',
    'bg-danger',
    'bg-secondary'
  ];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};