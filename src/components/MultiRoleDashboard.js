// import React, { useState, useEffect } from 'react';
// import AddProjectManagerModal from './AddProjectManagerModal';
// import AddUserModal from './AddUserModal';
// import AddTaskModal from './AddTaskModal';
// import AddProjectModal from './AddProjectModal';
// import AddPointsSchemeModal from './AddPointsSchemeModal';
// import AddEmployeeModal from './AddEmployeeModal';
// import AddTeamLeaderModal from './AddTeamLeaderModal';
// import AddRoleModal from './AddRoleModal';
// import PMDashboardSidebar from './PMDashboardSidebar';
// import PasswordManagementModal from './PasswordManagementModal';
// import TeamLeaderDashboard from './TeamLeaderDashboard';
// import { getCleanAvatar } from '../utils/avatarUtils';
// import {
//   getAllProjectManagers,
//   createProjectManager,
//   updateProjectManager,
//   deleteProjectManager,
//   getAllProjects,
//   createProject,
//   updateProject,
//   deleteProject,
//   getAllUsers,
//   createUser,
//   updateUser,
//   updateUserPassword,
//   deleteUser,
//   getAllTasks,
//   createTask,
//   updateTask,
//   deleteTask,
//   getTasksByUser,
//   getAllTeamLeaders,
//   createTeamLeader,
//   updateTeamLeader,
//   deleteTeamLeader,
//   getAllCustomRoles,
//   createCustomRole,
//   deleteCustomRole,
//   getDashboardStats,
//   getProgressData,
//   assignProjectToManager,
//   removeProjectFromManager
// } from '../services/api';

// // Global project status configuration
// const PROJECT_STATUS_CONFIG = {
//   'Assigned': { bg: '#6f42c1', text: 'white', label: 'Assigned' },
//   'Completed': { bg: '#28a745', text: 'white', label: 'Completed' },
//   'On Track': { bg: '#007bff', text: 'white', label: 'On Track' },
//   'At Risk': { bg: '#ffc107', text: 'black', label: 'At Risk' },
//   'Delayed': { bg: '#dc3545', text: 'white', label: 'Delayed' }
// };

// const MultiRoleDashboard = ({ userRole, userData, selectedProfile, onLogout }) => {
//   // Safety checks for props
//   const safeUserRole = userRole || 'admin';
//   const safeUserData = userData || {};
//   const safeSelectedProfile = selectedProfile || {};
//   const safeOnLogout = onLogout || (() => { });

//   const [currentRole, setCurrentRole] = useState(safeUserRole); // Current dashboard view
//   const [originalUserRole, setOriginalUserRole] = useState(safeUserRole); // User's actual role
//   const [userName, setUserName] = useState(safeUserData?.name || safeSelectedProfile?.name || 'User');

//   // Helper function to get project status badge
//   const getProjectStatusBadge = (status) => {
//     const config = PROJECT_STATUS_CONFIG[status] || PROJECT_STATUS_CONFIG['On Track'];
//     return (
//       <span style={{
//         backgroundColor: config.bg,
//         color: config.text,
//         padding: '4px 8px',
//         borderRadius: '4px',
//         fontSize: '12px',
//         fontWeight: 'bold'
//       }}>
//         {config.label}
//       </span>
//     );
//   };
//   const [activeView, setActiveView] = useState('dashboard');
//   const [selectedTaskFilter, setSelectedTaskFilter] = useState('all'); // 'all', 'assigned', 'completed', 'in-progress', 'pending'
//   const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
//   const [showAddPointsModal, setShowAddPointsModal] = useState(false);
//   const [editingPointsScheme, setEditingPointsScheme] = useState(null);
//   const [showAddProjectModal, setShowAddProjectModal] = useState(false);
//   const [showAddUserModal, setShowAddUserModal] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [showAddTaskModal, setShowAddTaskModal] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [showAddProjectManagerModal, setShowAddProjectManagerModal] = useState(false);
//   const [editingProjectManager, setEditingProjectManager] = useState(null);
//   const [selectedProjectManager, setSelectedProjectManager] = useState(null);
//   const [showIndividualDashboard, setShowIndividualDashboard] = useState(false);
//   const [activeDetailView, setActiveDetailView] = useState(null); // 'projects', 'members', 'tasks'
//   const [projectManagers, setProjectManagers] = useState([]);
//   const [pmSearchTerm, setPmSearchTerm] = useState('');

//   // Filter and sort states for user management
//   const [userSearchTerm, setUserSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('name');
//   const [sortOrder, setSortOrder] = useState('asc');
//   const [filterByRole, setFilterByRole] = useState('all');
//   const [filterByDepartment, setFilterByDepartment] = useState('all');
//   const [filterByStatus, setFilterByStatus] = useState('all');
//   const [filterByProject, setFilterByProject] = useState('all');
//   const [filterByTeam, setFilterByTeam] = useState('all');
//   const [showFilterDropdown, setShowFilterDropdown] = useState(false);
//   const [pmFilterDepartment, setPmFilterDepartment] = useState('all');
//   const [customRoles, setCustomRoles] = useState([]);
//   const [showAddRoleModal, setShowAddRoleModal] = useState(false);
//   const [showPasswordManagementModal, setShowPasswordManagementModal] = useState(false);
//   const [selectedUserForPasswordManagement, setSelectedUserForPasswordManagement] = useState(null);
//   const [projectUpdates, setProjectUpdates] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [loadingProjects, setLoadingProjects] = useState(false);
//   const [editingProject, setEditingProject] = useState(null);
//   const [allUsers, setAllUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);

//   // Derived state for team leaders (replacing individual state) - MUST come after allUsers
//   const teamLeaders = allUsers.filter(u => u.role === 'team-leader');

//   const [showAddTeamLeaderModal, setShowAddTeamLeaderModal] = useState(false);
//   const [editingTeamLeader, setEditingTeamLeader] = useState(null);
//   const [teamLeaderSearchTerm, setTeamLeaderSearchTerm] = useState('');
//   const [teamLeaderViewMode, setTeamLeaderViewMode] = useState('card'); // 'card' or 'list'
//   const [pointsSchemes, setPointsSchemes] = useState([]);
//   const [assignedTasks, setAssignedTasks] = useState([]);
//   const [loadingTasks, setLoadingTasks] = useState(false);
//   const [progressData, setProgressData] = useState({
//     projectCompletion: [],
//     teamProductivity: [],
//     monthlyTarget: {
//       percentage: 0,
//       comparison: 0,
//       earnings: 0,
//       target: 0,
//       revenue: 0,
//       today: 0
//     }
//   });
//   const [dashboardStats, setDashboardStats] = useState({
//     totalUsers: 0,
//     activeProjects: 0,
//     totalClients: 0,
//     totalRevenue: 0
//   });
//   const [teamAssignments, setTeamAssignments] = useState([]);
//   const [loadingStats, setLoadingStats] = useState(false);
//   const [loadingProjectManagers, setLoadingProjectManagers] = useState(false);
//   const [showTaskAssignModal, setShowTaskAssignModal] = useState(false);
//   const [selectedProjectForTask, setSelectedProjectForTask] = useState('');
//   const [showProjectUpdateModal, setShowProjectUpdateModal] = useState(false);
//   const [projectViewMode, setProjectViewMode] = useState('card'); // 'card' or 'list'
//   const [showProjectTasksModal, setShowProjectTasksModal] = useState(false);
//   const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);
//   const [taskFilterTab, setTaskFilterTab] = useState('all'); // 'all', 'assigned', 'completed'
//   const [currentWorkingTask, setCurrentWorkingTask] = useState(null); // Track which task employee is working on
//   const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown menu is open
//   const [selectedTeamLeader, setSelectedTeamLeader] = useState(null); // Track selected team leader for detail view
//   const [showTeamLeaderDetail, setShowTeamLeaderDetail] = useState(false);
//   const [teamMemberViewMode, setTeamMemberViewMode] = useState('card'); // 'card' or 'list'
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showEmployeeDashboard, setShowEmployeeDashboard] = useState(false);
//   const [showTaskSelectionModal, setShowTaskSelectionModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [employeeTasksLoaded, setEmployeeTasksLoaded] = useState(true); // Set to true to prevent modal
//   const [showAddMemberModal, setShowAddMemberModal] = useState(false);
//   const [selectedMembersForTeam, setSelectedMembersForTeam] = useState([]);
//   const [selectedTeamLeaderForMember, setSelectedTeamLeaderForMember] = useState(null);
//   const [memberSearchTerm, setMemberSearchTerm] = useState('');
//   const [notifications, setNotifications] = useState([]);
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [userViewMode, setUserViewMode] = useState('list'); // Always list view
//   const [employeeViewMode, setEmployeeViewMode] = useState('card'); // 'card' or 'list'
//   const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
//   const [dynamicTasks, setDynamicTasks] = useState([]);
//   const [taskRefreshInterval, setTaskRefreshInterval] = useState(null);
//   const [pmActiveSection, setPmActiveSection] = useState('dashboard'); // 'dashboard', 'projects', 'tasks'

//   // Task Assignment States
//   const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState('');
//   const [newTaskName, setNewTaskName] = useState('');
//   const [taskPriority, setTaskPriority] = useState('medium');
//   const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

//   // Real-time Task Assignment States
//   const [realTimeTaskInterval, setRealTimeTaskInterval] = useState(null);
//   const [lastTaskUpdate, setLastTaskUpdate] = useState(Date.now());
//   const [taskUpdateQueue, setTaskUpdateQueue] = useState([]);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [taskStats, setTaskStats] = useState({
//     assigned: 0,
//     completed: 0,
//     inProgress: 0,
//     pending: 0
//   });
//   const [toastNotifications, setToastNotifications] = useState([]);

//   // Task Notes/Discussion States
//   const [taskNotes, setTaskNotes] = useState({});
//   const [showTaskNotesModal, setShowTaskNotesModal] = useState(false);
//   const [selectedTaskForNotes, setSelectedTaskForNotes] = useState(null);
//   const [newNote, setNewNote] = useState('');
//   const [taskDiscussions, setTaskDiscussions] = useState({});

//   // Employee Task Management Modals
//   const [showEmployeeTaskListModal, setShowEmployeeTaskListModal] = useState(false);
//   const [showEmployeeCreateTaskModal, setShowEmployeeCreateTaskModal] = useState(false);

//   // Mobile sidebar state
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

//   const getUserWorkStatus = (user) => {
//     const userEmail = user.email;
//     const userName = user.name;

//     // Check stored work status first
//     const userStatusData = JSON.parse(localStorage.getItem('userWorkStatus') || '{}');
//     const storedStatus = userStatusData[userEmail] || userStatusData[userName];

//     // Check if user is currently working on a task
//     const activeTask = assignedTasks.find(task =>
//       (task.assignedTo === userEmail || task.assignedTo === userName) &&
//       task.status === 'in-progress'
//     );

//     // Check if user has selected a task (for current logged-in employee)
//     const savedTask = localStorage.getItem('selectedTask');
//     let isCurrentUserWorking = false;

//     if (savedTask) {
//       try {
//         const parsedTask = JSON.parse(savedTask);
//         const currentUserEmail = localStorage.getItem('userEmail');
//         const currentUserName = localStorage.getItem('userName');

//         if ((parsedTask.assignedTo === userEmail || parsedTask.assignedTo === userName) &&
//           (userEmail === currentUserEmail || userName === currentUserName)) {
//           isCurrentUserWorking = true;
//         }
//       } catch (error) {
//         console.error('Error parsing selected task:', error);
//       }
//     }

//     // Determine status based on various factors
//     if (activeTask || isCurrentUserWorking || (storedStatus && storedStatus.status === 'Active')) {
//       return { status: 'Active', color: 'bg-success' };
//     }

//     // Check if user has any assigned tasks (but not working)
//     const hasAssignedTasks = assignedTasks.some(task =>
//       (task.assignedTo === userEmail || task.assignedTo === userName) &&
//       task.status !== 'completed'
//     );

//     // Check if user is on leave (you can extend this logic)
//     if (user.isOnLeave || (storedStatus && storedStatus.status === 'On Leave')) {
//       return { status: 'On Leave', color: 'bg-warning' };
//     }

//     if (hasAssignedTasks) {
//       return { status: 'Inactive', color: 'bg-secondary' };
//     }

//     // Default to inactive if no tasks
//     return { status: 'Inactive', color: 'bg-secondary' };
//   };

//   // Function to update user status when they start a task
//   const updateUserStatusToActive = (userEmail, userName) => {
//     // Update in allUsers state
//     setAllUsers(prev => prev.map(user => {
//       if (user.email === userEmail || user.name === userName) {
//         return { ...user, workStatus: 'Active', lastActiveTime: new Date().toISOString() };
//       }
//       return user;
//     }));

//     // Store in localStorage for persistence
//     const userStatusData = JSON.parse(localStorage.getItem('userWorkStatus') || '{}');
//     userStatusData[userEmail || userName] = {
//       status: 'Active',
//       lastActiveTime: new Date().toISOString()
//     };
//     localStorage.setItem('userWorkStatus', JSON.stringify(userStatusData));
//   };

//   // Function to update user status to inactive
//   const updateUserStatusToInactive = (userEmail, userName) => {
//     const userStatusData = JSON.parse(localStorage.getItem('userWorkStatus') || '{}');
//     userStatusData[userEmail || userName] = {
//       status: 'Inactive',
//       lastActiveTime: new Date().toISOString()
//     };
//     localStorage.setItem('userWorkStatus', JSON.stringify(userStatusData));
//   };

//   // Function to set user on leave
//   const setUserOnLeave = (userEmail, userName) => {
//     const userStatusData = JSON.parse(localStorage.getItem('userWorkStatus') || '{}');
//     userStatusData[userEmail || userName] = {
//       status: 'On Leave',
//       lastActiveTime: new Date().toISOString()
//     };
//     localStorage.setItem('userWorkStatus', JSON.stringify(userStatusData));

//     // Force re-render
//     setAllUsers(prev => [...prev]);
//   };

//   // Comprehensive data persistence functions with unique key generation
//   const saveUsersToLocalStorage = (users) => {
//     try {
//       // Create a unique save key to prevent conflicts
//       const saveKey = `users_${Date.now()}`;

//       const dataToSave = users.map((user, index) => ({
//         // Ensure all critical fields are preserved with fallbacks
//         id: user.id || user._id || `USER_${Date.now()}_${index}`,
//         _id: user._id || user.id || `USER_${Date.now()}_${index}`,
//         name: user.name || 'Unknown User',
//         email: user.email || '',
//         department: user.department || 'Web Developer',
//         role: user.role || 'employee',
//         userType: user.userType || (
//           user.role === 'intern' ? 'Intern' :
//             user.role === 'employee' ? 'Employee' :
//               user.role === 'team-leader' ? 'Team Leader' :
//                 user.role === 'project-manager' ? 'Project Manager' : 'Employee'
//         ),
//         assignedProject: user.assignedProject || null,
//         projectStatus: user.assignedProject ? 'Assigned' : 'Not Assigned',
//         status: user.status || 'Active',
//         joinDate: user.joinDate || new Date().toISOString().split('T')[0],
//         phone: user.phone || null,
//         teamLeaderId: user.teamLeaderId || null,
//         teamLeaderName: user.teamLeaderName || null,
//         password: user.password || 'defaultPassword123',
//         // Add metadata for tracking
//         savedAt: new Date().toISOString(),
//         saveVersion: Date.now()
//       }));

//       // Save with multiple keys for redundancy
//       localStorage.setItem('users', JSON.stringify(dataToSave));
//       localStorage.setItem('users_current', JSON.stringify(dataToSave));
//       localStorage.setItem('users_backup', JSON.stringify(dataToSave));
//       localStorage.setItem('users_timestamp', Date.now().toString());
//       localStorage.setItem('users_count', dataToSave.length.toString());

//       console.log(`✅ SAVED ${dataToSave.length} users to localStorage with multiple keys`);
//       console.log('📝 Saved users:', dataToSave.map(u => ({ name: u.name, role: u.role, dept: u.department, project: u.assignedProject, id: u.id })));

//       // Trigger team leader update event for cross-tab communication
//       const teamLeaderUpdateEvent = {
//         type: 'TEAM_DATA_UPDATED',
//         timestamp: Date.now(),
//         updateType: 'user_data_change',
//         userCount: dataToSave.length
//       };

//       localStorage.setItem('teamLeaderUpdateEvent', JSON.stringify(teamLeaderUpdateEvent));

//       // Remove the event after a short delay
//       setTimeout(() => {
//         localStorage.removeItem('teamLeaderUpdateEvent');
//       }, 2000);

//       // Also save a simple version for debugging
//       const simpleUsers = dataToSave.map(u => ({
//         id: u.id,
//         name: u.name,
//         email: u.email,
//         role: u.role,
//         department: u.department,
//         assignedProject: u.assignedProject
//       }));
//       localStorage.setItem('users_debug', JSON.stringify(simpleUsers));

//       // Immediate verification
//       const verification = localStorage.getItem('users');
//       if (verification) {
//         const parsed = JSON.parse(verification);
//         console.log(`✅ VERIFICATION: ${parsed.length} users confirmed in storage`);
//       } else {
//         throw new Error('LocalStorage save verification failed');
//       }

//     } catch (error) {
//       console.error('❌ Error saving users to localStorage:', error);
//       // Emergency fallback - save to sessionStorage
//       try {
//         sessionStorage.setItem('users_emergency', JSON.stringify(users));
//         console.log('🆘 Emergency save to sessionStorage completed');
//       } catch (emergencyError) {
//         console.error('❌ Emergency save also failed:', emergencyError);
//       }
//     }
//   };

//   const saveProjectsToLocalStorage = (projects) => {
//     try {
//       const dataToSave = projects.map(project => ({
//         ...project,
//         // Ensure all critical fields are preserved
//         id: project.id || project._id,
//         name: project.name,
//         clientName: project.clientName,
//         projectManager: project.projectManager,
//         assigned: project.assigned,
//         assignedMembers: project.assigned ? project.assigned.map(member => member.name) : [],
//         progress: project.progress,
//         status: project.status,
//         startDate: project.startDate,
//         endDate: project.endDate,
//         projectCost: project.projectCost,
//         advancePayment: project.advancePayment
//       }));

//       localStorage.setItem('projects', JSON.stringify(dataToSave));
//       localStorage.setItem('projects_timestamp', Date.now().toString());
//       console.log(`✅ Saved ${dataToSave.length} projects to localStorage with timestamp`);

//       // Debug: Log a sample project to verify data structure
//       if (dataToSave.length > 0) {
//         console.log('Sample project data:', dataToSave[0]);
//       }
//     } catch (error) {
//       console.error('❌ Error saving projects to localStorage:', error);
//     }
//   };

//   // Function to force sync project assignments
//   const forceSyncProjectAssignments = () => {
//     console.log('🔄 Force syncing project assignments...');
//     console.log('Current users count:', allUsers.length);
//     console.log('Current projects count:', projects.length);

//     if (allUsers.length === 0 || projects.length === 0) {
//       console.log('⚠️ Skipping sync - missing data');
//       return;
//     }

//     setAllUsers(prev => {
//       const updatedUsers = prev.map(user => {
//         // Find if user is assigned to any project
//         const assignedProject = projects.find(project =>
//           project.projectManager === user.name ||
//           (project.assigned && project.assigned.some(member => member.name === user.name))
//         );

//         const updatedUser = {
//           ...user,
//           projectStatus: assignedProject ? 'Assigned' : 'Not Assigned',
//           assignedProject: assignedProject ? assignedProject.name : null
//         };

//         // Log changes for debugging
//         if (user.assignedProject !== updatedUser.assignedProject) {
//           console.log(`📝 Updated ${user.name}: ${user.assignedProject || 'None'} → ${updatedUser.assignedProject || 'None'}`);
//         }

//         return updatedUser;
//       });

//       // Save updated users immediately
//       saveUsersToLocalStorage(updatedUsers);
//       return updatedUsers;
//     });
//   };

//   // Function to ensure data consistency after role changes
//   const ensureDataConsistency = () => {
//     // This function ensures users exist in the right places after role changes
//     const allUserIds = new Set(allUsers.map(u => u.id || u._id));
//     const pmIds = projectManagers.map(pm => pm.id || pm._id).filter(id => !allUserIds.has(id));

//     // If there are inconsistencies, we could fix them here
//     if (pmIds.length > 0) {
//       // Force a re-render to ensure UI consistency
//       setAllUsers(prev => [...prev]);
//     }
//   };

//   // Load project managers from database - API is the single source of truth
//   const loadProjectManagers = async () => {
//     setLoadingProjectManagers(true);
//     const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');

//     try {
//       // First show localStorage data for fast UI
//       const localPMs = localStorage.getItem('projectManagers');
//       if (localPMs) {
//         try {
//           const parsedPMs = JSON.parse(localPMs);
//           if (Array.isArray(parsedPMs) && parsedPMs.length > 0) {
//             const filteredPMs = parsedPMs.filter(pm =>
//               !deletedUsers.includes(pm.id) && !deletedUsers.includes(pm._id)
//             );
//             setProjectManagers(filteredPMs);
//             console.log('📱 Showing project managers from cache:', filteredPMs.length);
//           }
//         } catch (parseError) {
//           console.error('Error parsing localStorage project managers:', parseError);
//         }
//       }

//       // Fetch from API - this is the authoritative source
//       console.log('🌐 Fetching project managers from API...');
//       const managersData = await getAllProjectManagers();

//       if (managersData && managersData.length > 0) {
//         // Filter out deleted users
//         const filteredManagers = managersData.filter(pm =>
//           !deletedUsers.includes(pm.id) && !deletedUsers.includes(pm._id)
//         );

//         console.log(`✅ Loaded ${filteredManagers.length} project managers from API`);

//         // Update state with API data (authoritative)
//         setProjectManagers(filteredManagers);

//         // Save to localStorage as backup
//         localStorage.setItem('projectManagers', JSON.stringify(filteredManagers));

//         // Add project managers to allUsers for unified user management
//         const pmUsers = filteredManagers.map(pm => ({
//           ...pm,
//           id: pm.id || pm._id,
//           _id: pm._id || pm.id,
//           role: 'project-manager',
//           userType: 'Project Manager',
//           payroll: pm.payroll || `PM${(pm.id || pm._id)?.slice(-3) || '001'}`
//         }));

//         // Update allUsers to include project managers (avoid duplicates)
//         setAllUsers(prev => {
//           // Remove existing PMs first to avoid duplicates
//           const withoutPMs = prev.filter(user => user.role !== 'project-manager');
//           const updatedUsers = [...withoutPMs, ...pmUsers];
//           console.log('👥 Updated allUsers with project managers. Total users:', updatedUsers.length);
//           return updatedUsers;
//         });

//       } else {
//         console.log('⚠️ No project managers found in API');
//         // If API returns empty, clear the state
//         setProjectManagers([]);
//         localStorage.setItem('projectManagers', JSON.stringify([]));
//       }
//     } catch (error) {
//       console.error('❌ Error loading project managers:', error);
//       // Keep localStorage data on error
//       console.log('⚠️ Using localStorage backup due to API error');
//     } finally {
//       setLoadingProjectManagers(false);
//     }
//   };

//   // Load all data from database - API is the single source of truth
//   const loadUsers = async () => {
//     setLoadingUsers(true);

//     const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');

//     // First, show localStorage data immediately for fast UI (but mark it as temporary)
//     const localUsers = localStorage.getItem('users');
//     if (localUsers) {
//       try {
//         const parsedUsers = JSON.parse(localUsers);
//         const filteredUsers = parsedUsers.filter(user =>
//           !deletedUsers.includes(user.id) && !deletedUsers.includes(user._id)
//         );
//         console.log(`📱 Showing ${filteredUsers.length} users from cache (will be replaced by API data)`);
//         setAllUsers(filteredUsers);
//       } catch (error) {
//         console.error('Error parsing localStorage users:', error);
//       }
//     }

//     // Then fetch from API - API is the SINGLE SOURCE OF TRUTH
//     try {
//       console.log('🌐 Fetching users from API (primary source)...');
//       const apiUsers = await getAllUsers();
//       console.log(`📡 Received ${apiUsers.length} users from API`);

//       if (!apiUsers || apiUsers.length === 0) {
//         console.log('⚠️ API returned no users - keeping localStorage data if available');
//         setLoadingUsers(false);
//         return;
//       }

//       // Process API users (API is the source of truth)
//       const processedUsers = apiUsers.map(apiUser => ({
//         ...apiUser,
//         id: apiUser.id || apiUser._id,
//         _id: apiUser._id || apiUser.id,
//         department: apiUser.department || 'Web Developer',
//         projectStatus: apiUser.assignedProject ? 'Assigned' : 'Not Assigned',
//         userType: apiUser.userType || (
//           apiUser.role === 'intern' ? 'Intern' :
//             apiUser.role === 'employee' ? 'Employee' :
//               apiUser.role === 'team-leader' ? 'Team Leader' :
//                 apiUser.role === 'project-manager' ? 'Project Manager' : 'Employee'
//         ),
//         status: apiUser.status || 'Active',
//         joinDate: apiUser.joinDate || apiUser.joiningDate || new Date().toISOString().split('T')[0]
//       }));

//       // Filter out deleted users
//       let finalUsers = processedUsers.filter(user =>
//         !deletedUsers.includes(user.id) && !deletedUsers.includes(user._id)
//       );

//       // Remove duplicates based on email (email is unique identifier)
//       const seenEmails = new Set();
//       const seenIds = new Set();
//       const uniqueUsers = [];

//       finalUsers.forEach(user => {
//         const email = user.email?.toLowerCase().trim();
//         const userId = user.id || user._id;

//         // Skip if we've seen this email or ID before
//         if (email && seenEmails.has(email)) {
//           console.log(`⚠️ Duplicate email found: ${email} - skipping`);
//           return;
//         }
//         if (userId && seenIds.has(userId)) {
//           console.log(`⚠️ Duplicate ID found: ${userId} - skipping`);
//           return;
//         }

//         // Add to seen sets
//         if (email) seenEmails.add(email);
//         if (userId) seenIds.add(userId);

//         uniqueUsers.push(user);
//       });

//       finalUsers = uniqueUsers;

//       console.log(`✅ Loaded ${finalUsers.length} unique users from API (removed ${processedUsers.length - finalUsers.length} duplicates)`);

//       // Update state with API data (this is the authoritative data)
//       setAllUsers(finalUsers);

//       // Save to localStorage as backup only
//       saveUsersToLocalStorage(finalUsers);

//       // Also update the user count in localStorage for consistency
//       localStorage.setItem('users_count', finalUsers.length.toString());
//       localStorage.setItem('users_last_sync', Date.now().toString());

//     } catch (error) {
//       console.error('❌ API fetch failed:', error);

//       // Only if API fails, keep localStorage data
//       if (!localUsers) {
//         console.log('⚠️ No localStorage backup available, setting empty array');
//         setAllUsers([]);
//       } else {
//         console.log('⚠️ Using localStorage backup due to API failure');
//       }
//     } finally {
//       setLoadingUsers(false);
//     }
//   };

//   const loadTasks = async () => {
//     setLoadingTasks(true);
//     try {
//       const userEmail = localStorage.getItem('userEmail');
//       const userName = localStorage.getItem('userName');

//       console.log('🔍 Loading tasks for:', { userEmail, userName, currentRole });

//       // Clear any existing sample tasks
//       clearSampleTasks();

//       // Fetch all tasks from API first
//       const allTasks = await getAllTasks();
//       console.log(`📋 Received ${allTasks.length} total tasks from API`);

//       // Filter tasks based on user role
//       let filteredTasks = [];

//       if ((currentRole === 'employee' || currentRole === 'intern') && userEmail) {
//         // For employees/interns: fetch only their assigned tasks
//         filteredTasks = allTasks.filter(task => isUserAssignedToTask(task, userEmail));
//         console.log(`✅ Filtered ${filteredTasks.length} tasks for employee ${userEmail}`);
//       } else if (currentRole === 'project-manager' && (userEmail || userName)) {
//         // For project managers: fetch tasks related to their projects
//         const pmProjects = projects.filter(project =>
//           project.projectManager === userName || project.projectManager === userEmail
//         );
//         filteredTasks = allTasks.filter(task =>
//           pmProjects.some(project => project.name === task.project || project.name === task.projectName) ||
//           task.assignedBy === userEmail ||
//           task.assignedBy === userName
//         );
//         console.log(`✅ Filtered ${filteredTasks.length} tasks for project manager`);
//       } else {
//         // For other roles, load all tasks
//         filteredTasks = allTasks;
//         console.log(`✅ Loaded ${filteredTasks.length} tasks for admin/other roles`);
//       }

//       // Only update state if we have tasks or if we're sure there are none
//       if (filteredTasks.length > 0 || allTasks.length === 0) {
//         setAssignedTasks(filteredTasks);
//         console.log(`✅ Updated assignedTasks state with ${filteredTasks.length} tasks`);
//       } else {
//         console.log('⚠️ No filtered tasks but API has tasks - keeping existing state');
//       }

//     } catch (error) {
//       console.error('❌ Error loading tasks:', error);
//       // Don't clear existing tasks on error - maintain stable state
//       console.log('⚠️ Keeping existing tasks due to error');
//     } finally {
//       setLoadingTasks(false);
//     }
//   };

//   // Clean up any existing sample tasks from localStorage
//   const clearSampleTasks = () => {
//     localStorage.removeItem('sampleTasks');
//     console.log('🧹 Cleared sample tasks from localStorage');
//   };

//   // Clear all tasks (for debugging)
//   const clearAllTasks = () => {
//     setAssignedTasks([]);
//     clearSampleTasks();
//     updateTaskStats([]);
//     console.log('🧹 Cleared all tasks');
//   };

//   const loadDashboardStats = async () => {
//     setLoadingStats(true);
//     try {
//       const [statsData, progressDataResponse] = await Promise.all([
//         getDashboardStats(),
//         getProgressData()
//       ]);
//       setDashboardStats(statsData || {
//         totalUsers: 0,
//         activeProjects: 0,
//         totalClients: 0,
//         totalRevenue: 0
//       });
//       setProgressData(progressDataResponse);
//     } catch (error) {
//       console.error('Error loading dashboard stats:', error);
//       // Continue with default values if stats fail to load
//     } finally {
//       setLoadingStats(false);
//     }
//   };

//   // Load projects from database
//   const loadProjects = async () => {
//     setLoadingProjects(true);
//     try {
//       const userEmail = localStorage.getItem('userEmail');
//       const userName = localStorage.getItem('userName');
//       const projectsData = await getAllProjects();

//       // Filter projects based on user role
//       let filteredProjects = projectsData;

//       if ((currentRole === 'employee' || currentRole === 'intern') && (userEmail || userName)) {
//         // For employees/interns: show only projects they're assigned to
//         filteredProjects = projectsData.filter(project =>
//           project.projectManager === userName ||
//           (project.assignedMembers && project.assignedMembers.some(member =>
//             member === userEmail ||
//             member === userName ||
//             (typeof member === 'object' && (member.email === userEmail || member.name === userName))
//           ))
//         );
//       } else if (currentRole === 'project-manager' && (userEmail || userName)) {
//         // For project managers: show only projects they manage
//         filteredProjects = projectsData.filter(project =>
//           project.projectManager === userName ||
//           project.projectManager === userEmail
//         );
//       }

//       // Transform the data to match the expected format
//       const transformedProjects = filteredProjects.map(project => ({
//         id: project._id,
//         name: project.name,
//         date: new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
//         progress: project.progress || 0,
//         status: project.projectStatus === 'assigned' ? 'Assigned' :
//           project.projectStatus === 'on-track' ? 'On Track' :
//             project.projectStatus === 'at-risk' ? 'At Risk' :
//               project.projectStatus === 'delayed' ? 'Delayed' :
//                 project.projectStatus === 'completed' ? 'Completed' : 'On Track',
//         assigned: project.assignedMembers && project.assignedMembers.length > 0
//           ? project.assignedMembers.map((member, index) => ({
//             name: typeof member === 'object' ? member.name : member,
//             color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][index % 5]
//           }))
//           : [], // Empty array instead of "Not Assigned"
//         extra: project.assignedMembers && project.assignedMembers.length > 3 ? project.assignedMembers.length - 3 : 0,
//         clientName: project.clientName,
//         startDate: project.startDate,
//         endDate: project.endDate,
//         description: project.description,
//         projectCost: project.projectCost,
//         advancePayment: project.advancePayment,
//         projectManager: project.projectManager
//       }));
//       setProjects(transformedProjects);

//       // Save projects to localStorage as backup
//       localStorage.setItem('projects', JSON.stringify(transformedProjects));

//       // Sync user assignments with loaded projects (will also be handled by useEffect)
//       if (currentRole !== 'employee' && currentRole !== 'intern') {
//         syncUserProjectAssignments(projectsData);
//       }
//     } catch (error) {
//       console.error('Error loading projects:', error);
//       // Try to load from localStorage as fallback
//       const cachedProjects = localStorage.getItem('projects');
//       if (cachedProjects) {
//         try {
//           const parsedProjects = JSON.parse(cachedProjects);
//           setProjects(parsedProjects);
//           console.log('Loaded projects from cache');
//         } catch (parseError) {
//           console.error('Error parsing cached projects:', parseError);
//           setProjects([]);
//         }
//       } else {
//         setProjects([]);
//       }
//       // Don't show alert, just log the error
//       console.warn('Using cached or empty projects due to API error');
//     } finally {
//       setLoadingProjects(false);
//     }
//   };

//   // Function to sync user project assignments
//   const syncUserProjectAssignments = (projectsData) => {
//     setAllUsers(prev => prev.map(user => {
//       // Find if user is assigned to any project
//       const assignedProject = projectsData.find(project =>
//         project.projectManager === user.name ||
//         (project.assignedMembers && project.assignedMembers.includes(user.name))
//       );

//       if (assignedProject) {
//         return {
//           ...user,
//           projectStatus: 'Assigned',
//           assignedProject: assignedProject.name
//         };
//       } else {
//         return {
//           ...user,
//           projectStatus: 'Not Assigned',
//           assignedProject: null
//         };
//       }
//     }));
//   };

//   useEffect(() => {
//     // Use props if provided, otherwise fall back to localStorage
//     const storedRole = userRole || localStorage.getItem('userRole') || 'admin';
//     const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || '{}');

//     setCurrentRole(storedRole);
//     setOriginalUserRole(storedRole);

//     // Set user name from props or localStorage
//     if (safeUserData?.name || safeSelectedProfile?.name) {
//       setUserName(safeUserData.name || safeSelectedProfile.name);
//     } else if (adminAuth.admin) {
//       setUserName(adminAuth.admin.username || 'Admin User');
//     } else {
//       const email = localStorage.getItem('userEmail') || 'user@company.com';
//       const name = email.split('@')[0];
//       setUserName(name.charAt(0).toUpperCase() + name.slice(1));
//     }

//     // Load critical data immediately from localStorage as backup
//     const immediateLoadData = () => {
//       try {
//         console.log('Starting immediate data load from localStorage...');

//         // Get deleted users list
//         const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');

//         // Load project managers
//         const localPMs = localStorage.getItem('projectManagers');
//         console.log('Raw localStorage projectManagers:', localPMs);

//         if (localPMs && localPMs !== 'null' && localPMs !== 'undefined') {
//           try {
//             const parsedPMs = JSON.parse(localPMs);
//             console.log('Parsed project managers:', parsedPMs);

//             if (Array.isArray(parsedPMs) && parsedPMs.length > 0) {
//               // Filter out deleted users
//               const filteredPMs = parsedPMs.filter(pm =>
//                 !deletedUsers.includes(pm.id) && !deletedUsers.includes(pm._id)
//               );
//               console.log('Loading', filteredPMs.length, 'project managers from localStorage (after filtering deleted)');
//               setProjectManagers(filteredPMs);
//             } else {
//               console.log('Project managers array is empty or invalid');
//             }
//           } catch (parseError) {
//             console.error('Error parsing project managers from localStorage:', parseError);
//           }
//         } else {
//           console.log('No project managers found in localStorage');
//         }

//         // Load users with enhanced validation and multiple fallbacks
//         console.log('📂 LOADING USERS FROM LOCALSTORAGE...');

//         // Try multiple storage locations in order of preference
//         const storageKeys = ['users_current', 'users', 'users_backup', 'users_simple'];
//         let localUsers = null;
//         let usedKey = null;

//         for (const key of storageKeys) {
//           const data = localStorage.getItem(key);
//           if (data && data !== 'null' && data !== 'undefined') {
//             localUsers = data;
//             usedKey = key;
//             console.log(`✅ Found users data in: ${key}`);
//             break;
//           }
//         }

//         // Try sessionStorage as emergency fallback
//         if (!localUsers) {
//           const emergencyData = sessionStorage.getItem('users_emergency');
//           if (emergencyData) {
//             localUsers = emergencyData;
//             usedKey = 'sessionStorage:users_emergency';
//             console.log('🆘 Using emergency data from sessionStorage');
//           }
//         }

//         const usersTimestamp = localStorage.getItem('users_timestamp');
//         const usersCount = localStorage.getItem('users_count');

//         console.log('📊 Storage info:', {
//           dataExists: !!localUsers,
//           usedKey: usedKey,
//           timestamp: usersTimestamp ? new Date(parseInt(usersTimestamp)).toLocaleString() : 'None',
//           expectedCount: usersCount
//         });

//         if (localUsers) {
//           try {
//             const parsedUsers = JSON.parse(localUsers);
//             console.log(`📥 Parsed ${parsedUsers.length} users from ${usedKey}`);

//             if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
//               // Filter out deleted users and ensure data consistency
//               const filteredUsers = parsedUsers.filter(user =>
//                 user && user.name && // Ensure user has basic data
//                 !deletedUsers.includes(user.id) && !deletedUsers.includes(user._id)
//               ).map((user, index) => ({
//                 ...user,
//                 id: user.id || user._id || `USER_LOADED_${Date.now()}_${index}`,
//                 department: user.department || 'Web Developer',
//                 projectStatus: user.assignedProject ? 'Assigned' : 'Not Assigned',
//                 userType: user.userType || (
//                   user.role === 'intern' ? 'Intern' :
//                     user.role === 'employee' ? 'Employee' :
//                       user.role === 'team-leader' ? 'Team Leader' :
//                         user.role === 'project-manager' ? 'Project Manager' : 'Employee'
//                 ),
//                 status: user.status || 'Active',
//                 assignedProject: user.assignedProject || null
//               }));

//               console.log(`✅ LOADED ${filteredUsers.length} users successfully`);
//               console.log('👥 Loaded users:', filteredUsers.map(u => ({
//                 name: u.name,
//                 role: u.role,
//                 dept: u.department,
//                 project: u.assignedProject,
//                 id: u.id
//               })));

//               setAllUsers(filteredUsers);
//             } else {
//               console.log('⚠️ No valid users array found');
//             }
//           } catch (parseError) {
//             console.error('❌ Error parsing users from localStorage:', parseError);
//             console.error('Raw data that failed to parse:', localUsers.substring(0, 200));
//           }
//         } else {
//           console.log('⚠️ No users data found in any storage location');
//         }

//         // Load projects with enhanced validation
//         const localProjects = localStorage.getItem('projects');
//         const projectsTimestamp = localStorage.getItem('projects_timestamp');

//         console.log('📂 Loading projects from localStorage...');
//         console.log('Projects data exists:', !!localProjects);
//         console.log('Projects timestamp:', projectsTimestamp ? new Date(parseInt(projectsTimestamp)).toLocaleString() : 'None');

//         if (localProjects && localProjects !== 'null' && localProjects !== 'undefined') {
//           try {
//             const parsedProjects = JSON.parse(localProjects);
//             if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
//               console.log(`✅ Loaded ${parsedProjects.length} projects from localStorage`);
//               console.log('Sample project:', parsedProjects[0]);
//               setProjects(parsedProjects);
//             } else {
//               console.log('⚠️ No valid projects array in localStorage');
//             }
//           } catch (parseError) {
//             console.error('❌ Error parsing projects from localStorage:', parseError);
//           }
//         } else {
//           console.log('⚠️ No projects data in localStorage');
//         }



//         // Load points schemes
//         const localPointsSchemes = localStorage.getItem('pointsSchemes');
//         console.log('📂 Loading points schemes from localStorage...');
//         console.log('Points schemes data exists:', !!localPointsSchemes);

//         if (localPointsSchemes && localPointsSchemes !== 'null' && localPointsSchemes !== 'undefined') {
//           try {
//             const parsedPointsSchemes = JSON.parse(localPointsSchemes);
//             if (Array.isArray(parsedPointsSchemes) && parsedPointsSchemes.length > 0) {
//               console.log(`✅ Loaded ${parsedPointsSchemes.length} points schemes from localStorage`);
//               console.log('Sample points scheme:', parsedPointsSchemes[0]);
//               setPointsSchemes(parsedPointsSchemes);
//             } else {
//               console.log('⚠️ No valid points schemes array in localStorage');
//               setPointsSchemes([]);
//             }
//           } catch (parseError) {
//             console.error('❌ Error parsing points schemes from localStorage:', parseError);
//             setPointsSchemes([]);
//           }
//         } else {
//           console.log('⚠️ No points schemes data in localStorage');
//           setPointsSchemes([]);
//         }
//       } catch (error) {
//         console.error('Error loading immediate data:', error);
//       }
//     };

//     // Load immediately first
//     immediateLoadData();

//     // Load recent activities from localStorage (no sample data)
//     const existingActivities = localStorage.getItem('recentActivities');
//     if (existingActivities) {
//       try {
//         setRecentActivities(JSON.parse(existingActivities));
//       } catch (error) {
//         console.error('Error parsing recent activities:', error);
//         setRecentActivities([]);
//       }
//     } else {
//       setRecentActivities([]);
//     }

//     // Initialize default passwords for users who don't have them
//     const initializeDefaultPasswords = () => {
//       // Initialize passwords for all users
//       setAllUsers(prev => prev.map(user => ({
//         ...user,
//         password: user.password || 'defaultPassword123'
//       })));

//       // Initialize passwords for project managers
//       setProjectManagers(prev => prev.map(pm => ({
//         ...pm,
//         password: pm.password || 'defaultPassword123'
//       })));
//     };

//     // Initialize missing joinDates for existing users
//     const initializeMissingJoinDates = () => {
//       // Update allUsers with missing joinDates
//       setAllUsers(prev => prev.map(user => ({
//         ...user,
//         joinDate: user.joinDate || user.joiningDate || new Date().toISOString().split('T')[0]
//       })));

//       // Update projectManagers with missing joinDates
//       setProjectManagers(prev => prev.map(pm => ({
//         ...pm,
//         joinDate: pm.joinDate || pm.joiningDate || new Date().toISOString().split('T')[0]
//       })));
//     };

//     // Removed: No sample data creation - all data comes from API only

//     // Function to clear stale cache data
//     const clearStaleCache = () => {
//       const lastSync = localStorage.getItem('users_last_sync');
//       const now = Date.now();

//       // If last sync was more than 5 minutes ago, clear cache to force fresh load
//       if (lastSync && (now - parseInt(lastSync)) > 5 * 60 * 1000) {
//         console.log('🧹 Clearing stale cache (last sync > 5 minutes ago)');
//         localStorage.removeItem('users');
//         localStorage.removeItem('users_backup');
//         localStorage.removeItem('users_current');
//         localStorage.removeItem('projectManagers');
//       }
//     };

//     // Load all data from database - API is the single source of truth
//     const loadAllData = async () => {
//       console.log('🚀 Starting data load sequence...');

//       // Clear stale cache first
//       clearStaleCache();

//       // Show cached data immediately for fast UI (will be replaced by API data)
//       const hasLocalUsers = localStorage.getItem('users');
//       const hasLocalProjects = localStorage.getItem('projects');

//       if (hasLocalUsers || hasLocalProjects) {
//         console.log('⚡ Showing cached data (will be replaced by fresh API data)...');
//         immediateLoadData();
//       }

//       // Load from API - this is the authoritative source
//       try {
//         console.log('🌐 Loading fresh data from API (authoritative source)...');

//         await Promise.all([
//           loadUsers(),           // API is source of truth
//           loadProjectManagers(), // API is source of truth
//           loadProjects(),
//           loadTasks(),
//           loadDashboardStats()
//         ]);

//         // Immediate task loading for employees to prevent blinking
//         if (currentRole === 'employee') {
//           setTimeout(async () => {
//             await loadEmployeeDynamicTasks();
//           }, 500);
//         }

//         console.log('✅ API data load completed - all data is now fresh and consistent');

//       } catch (error) {
//         console.error('❌ API data load failed, using cached data:', error);
//       }

//       // Load workflow data after projects and users are loaded
//       await loadWorkflowData();
//       // Initialize missing join dates for existing data
//       setTimeout(initializeMissingJoinDates, 500);
//       // Initialize default passwords for existing data
//       setTimeout(initializeDefaultPasswords, 1000);
//     };

//     loadAllData();

//     loadCustomRoles();
//   }, []);

//   // Initialize user role from localStorage
//   useEffect(() => {
//     const storedUserRole = localStorage.getItem('userRole') || 'admin';
//     setOriginalUserRole(storedUserRole);
//     setCurrentRole(storedUserRole); // Start with user's actual role
//   }, []);

//   // Refresh data when role changes to employee/intern/project-manager
//   useEffect(() => {
//     const refreshUserSpecificData = async () => {
//       if (currentRole === 'employee' || currentRole === 'intern' || currentRole === 'project-manager') {
//         console.log(`🔄 Refreshing data for ${currentRole} dashboard...`);
//         try {
//           // Reload tasks and projects with user filtering
//           await Promise.all([
//             loadTasks(),
//             loadProjects()
//           ]);

//           // For employees, also load dynamic tasks
//           if (currentRole === 'employee' || currentRole === 'intern') {
//             await loadEmployeeDynamicTasks();
//           }

//           console.log(`✅ ${currentRole} data refresh completed`);
//         } catch (error) {
//           console.error(`❌ ${currentRole} data refresh failed:`, error);
//         }
//       }
//     };

//     refreshUserSpecificData();
//   }, [currentRole]);

//   // Real-time data refresh when projects or tasks are updated
//   useEffect(() => {
//     const refreshDataOnChanges = async () => {
//       // Only refresh for role-specific users when data changes
//       if (currentRole === 'employee' || currentRole === 'intern' || currentRole === 'project-manager') {
//         console.log(`🔄 Data changed, refreshing ${currentRole} view...`);
//         // Small delay to ensure data is saved first
//         setTimeout(async () => {
//           try {
//             await Promise.all([
//               loadTasks(),
//               loadProjects()
//             ]);
//           } catch (error) {
//             console.error('❌ Real-time refresh failed:', error);
//           }
//         }, 500);
//       }
//     };

//     refreshDataOnChanges();
//   }, [projects.length, assignedTasks.length]); // Trigger when data count changes

//   // Save users to localStorage whenever allUsers changes
//   useEffect(() => {
//     if (allUsers.length > 0) {
//       console.log('🔄 Auto-saving users due to state change...');
//       saveUsersToLocalStorage(allUsers);
//     }
//   }, [allUsers]);

//   // Save projects to localStorage whenever projects change
//   useEffect(() => {
//     if (projects.length > 0) {
//       console.log('🔄 Auto-saving projects due to state change...');
//       saveProjectsToLocalStorage(projects);
//     }
//   }, [projects]);

//   // Save points schemes to localStorage whenever they change
//   useEffect(() => {
//     if (pointsSchemes.length > 0) {
//       console.log('🔄 Auto-saving points schemes due to state change...');
//       try {
//         localStorage.setItem('pointsSchemes', JSON.stringify(pointsSchemes));
//         console.log('✅ Points schemes auto-saved to localStorage:', pointsSchemes.length, 'schemes');
//       } catch (error) {
//         console.error('❌ Error auto-saving points schemes to localStorage:', error);
//       }
//     }
//   }, [pointsSchemes]);

//   // Force save data every 10 seconds as backup
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (allUsers.length > 0 || projects.length > 0 || pointsSchemes.length > 0) {
//         console.log('⏰ Periodic backup save...');
//         if (allUsers.length > 0) saveUsersToLocalStorage(allUsers);
//         if (projects.length > 0) saveProjectsToLocalStorage(projects);
//         if (pointsSchemes.length > 0) {
//           try {
//             localStorage.setItem('pointsSchemes', JSON.stringify(pointsSchemes));
//             console.log('✅ Points schemes periodic backup saved');
//           } catch (error) {
//             console.error('❌ Error in periodic backup of points schemes:', error);
//           }
//         }
//       }
//     }, 10000); // Every 10 seconds

//     return () => clearInterval(interval);
//   }, [allUsers, projects, pointsSchemes]);

//   // Save data before page unload/refresh
//   useEffect(() => {
//     const handleBeforeUnload = (event) => {
//       console.log('💾 Saving data before page unload...');
//       if (allUsers.length > 0) {
//         saveUsersToLocalStorage(allUsers);
//         console.log('✅ Users saved before unload');
//       }
//       if (projects.length > 0) {
//         saveProjectsToLocalStorage(projects);
//         console.log('✅ Projects saved before unload');
//       }
//       if (pointsSchemes.length > 0) {
//         try {
//           localStorage.setItem('pointsSchemes', JSON.stringify(pointsSchemes));
//           console.log('✅ Points schemes saved before unload');
//         } catch (error) {
//           console.error('❌ Error saving points schemes before unload:', error);
//         }
//       }
//     };

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'hidden') {
//         console.log('👁️ Page hidden, saving data...');
//         if (allUsers.length > 0) saveUsersToLocalStorage(allUsers);
//         if (projects.length > 0) saveProjectsToLocalStorage(projects);
//         if (pointsSchemes.length > 0) {
//           try {
//             localStorage.setItem('pointsSchemes', JSON.stringify(pointsSchemes));
//             console.log('✅ Points schemes saved on page hidden');
//           } catch (error) {
//             console.error('❌ Error saving points schemes on page hidden:', error);
//           }
//         }
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     document.addEventListener('visibilitychange', handleVisibilityChange);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, [allUsers, projects, pointsSchemes]);

//   // Sync project assignments when both users and projects are loaded
//   useEffect(() => {
//     if (allUsers.length > 0 && projects.length > 0) {
//       console.log('🔄 Auto-syncing project assignments...');
//       // Use a timeout to ensure state has settled
//       const timeoutId = setTimeout(() => {
//         forceSyncProjectAssignments();
//       }, 500);

//       return () => clearTimeout(timeoutId);
//     }
//   }, [allUsers.length, projects.length]); // Only run when both arrays have data

//   // Debug: Monitor projectManagers state changes and ensure localStorage sync
//   useEffect(() => {
//     console.log('ProjectManagers state changed:', projectManagers.length, 'managers');
//     if (projectManagers.length > 0) {
//       console.log('Project managers:', projectManagers.map(pm => pm.name));
//       // Ensure localStorage is always in sync
//       const currentLocalStorage = localStorage.getItem('projectManagers');
//       const currentParsed = currentLocalStorage ? JSON.parse(currentLocalStorage) : [];

//       if (currentParsed.length !== projectManagers.length) {
//         console.log('localStorage out of sync, updating...');
//         localStorage.setItem('projectManagers', JSON.stringify(projectManagers));
//       }
//     }
//   }, [projectManagers]);

//   // Add beforeunload event to save data before page refresh
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       if (projectManagers.length > 0) {
//         localStorage.setItem('projectManagers', JSON.stringify(projectManagers));
//         console.log('Saved project managers before page unload');
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//     };
//   }, [projectManagers]);

//   // Periodic auto-save to localStorage every 30 seconds
//   useEffect(() => {
//     const autoSave = setInterval(() => {
//       if (projectManagers.length > 0) {
//         localStorage.setItem('projectManagers', JSON.stringify(projectManagers));
//         console.log('Auto-saved project managers to localStorage');
//       }
//     }, 30000); // 30 seconds

//     return () => clearInterval(autoSave);
//   }, [projectManagers]);



//   // Load task discussions from localStorage
//   useEffect(() => {
//     const savedDiscussions = localStorage.getItem('taskDiscussions');
//     if (savedDiscussions) {
//       try {
//         setTaskDiscussions(JSON.parse(savedDiscussions));
//       } catch (error) {
//         console.error('Error loading task discussions:', error);
//       }
//     }
//   }, []);

//   // Initialize Real-time Task Assignment System
//   useEffect(() => {
//     console.log('🔧 Setting up real-time task assignment system...');

//     // Request notification permission
//     requestNotificationPermission();

//     // Initialize real-time system for all roles
//     initializeRealTimeTaskSystem();

//     // Force initial refresh for employees
//     if (currentRole === 'employee' || currentRole === 'intern') {
//       setTimeout(() => {
//         console.log('🚀 Initial force refresh for employee...');
//         forceRefreshEmployeeTasks();
//       }, 1000);
//     }

//     // Cleanup on unmount
//     return () => {
//       if (realTimeTaskInterval) {
//         clearInterval(realTimeTaskInterval);
//         console.log('🧹 Real-time task system cleaned up');
//       }
//       if (taskRefreshInterval) {
//         clearInterval(taskRefreshInterval);
//         console.log('🧹 Task refresh interval cleaned up');
//       }
//     };
//   }, []);

//   // Cleanup intervals on role change
//   useEffect(() => {
//     return () => {
//       if (realTimeTaskInterval) {
//         clearInterval(realTimeTaskInterval);
//       }
//       if (taskRefreshInterval) {
//         clearInterval(taskRefreshInterval);
//       }
//     };
//   }, [currentRole]);

//   // Real-time synchronization for Project Manager data
//   useEffect(() => {
//     if (currentRole === 'project-manager') {
//       console.log('🔄 Project Manager data updated - refreshing team members and projects');

//       // Force re-render of PM dashboard when users or projects change
//       const currentPMData = getProjectManagerData();
//       console.log('📊 Updated PM Data:', {
//         teamMembers: currentPMData.teamMembers.length,
//         managedProjects: currentPMData.managedProjects.length,
//         totalTasks: currentPMData.totalTasks
//       });

//       // If we're in the members section, the data will automatically update
//       // because getProjectManagerData is called on every render
//     }
//   }, [allUsers, projects, assignedTasks, currentRole]);

//   // Auto-refresh project assignments when data changes
//   useEffect(() => {
//     if (currentRole === 'project-manager' && (allUsers.length > 0 || projects.length > 0)) {
//       console.log('🔄 Auto-refreshing project manager assignments...');

//       // Small delay to ensure all state updates are complete
//       setTimeout(() => {
//         // Force sync project assignments for all users
//         forceSyncProjectAssignments();
//       }, 500);
//     }
//   }, [allUsers.length, projects.length, currentRole]);



//   // Load selected task from localStorage and set up dynamic task loading
//   useEffect(() => {
//     if (currentRole === 'employee') {
//       const savedTask = localStorage.getItem('selectedTask');
//       if (savedTask) {
//         try {
//           const parsedTask = JSON.parse(savedTask);
//           setSelectedTask(parsedTask);
//           setCurrentWorkingTask(parsedTask);
//         } catch (error) {
//           console.error('Error parsing saved task:', error);
//           localStorage.removeItem('selectedTask');
//         }
//       }

//       // Initial load only
//       loadEmployeeDynamicTasks();

//       // Set up MINIMAL refresh interval to prevent blinking
//       const interval = setInterval(async () => {
//         // Only refresh if not currently refreshing AND significant time has passed
//         if (!isRefreshing) {
//           const lastUpdate = localStorage.getItem('lastTaskUpdate');
//           const currentTime = Date.now();
//           // Only refresh if more than 30 seconds have passed since last update
//           if (!lastUpdate || (currentTime - parseInt(lastUpdate)) > 30000) {
//             console.log('🔄 Minimal scheduled refresh...');
//             try {
//               await loadEmployeeDynamicTasks();
//               localStorage.setItem('lastTaskUpdate', currentTime.toString());
//             } catch (error) {
//               console.error('❌ Scheduled refresh failed:', error);
//             }
//           }
//         }
//       }, 30000); // Increased to 30 seconds to minimize blinking
//       setTaskRefreshInterval(interval);

//       // Simplified localStorage event listener (only for immediate task assignments)
//       const handleTaskAssignmentEvent = (event) => {
//         if (event.key === 'taskAssignmentEvent' && event.newValue) {
//           try {
//             const assignmentEvent = JSON.parse(event.newValue);
//             const userEmail = localStorage.getItem('userEmail');
//             const userName = localStorage.getItem('userName');

//             // Check if this employee is assigned to the new task
//             if (assignmentEvent.assignedUsers.includes(userEmail) ||
//               assignmentEvent.assignedUsers.includes(userName)) {
//               console.log('🚨 New task assigned - single refresh triggered');

//               // Single immediate refresh with debouncing
//               setTimeout(async () => {
//                 if (!isRefreshing) {
//                   await loadEmployeeDynamicTasks();
//                   localStorage.setItem('lastTaskUpdate', Date.now().toString());
//                 }
//               }, 1000);

//               // Show notification
//               const notification = {
//                 id: `task_${Date.now()}`,
//                 type: 'task',
//                 title: '⚡ New Task Assigned!',
//                 message: `"${assignmentEvent.taskData.title}" has been assigned to you`,
//                 time: 'Just now',
//                 read: false
//               };

//               setNotifications(prev => [notification, ...prev]);
//             }
//           } catch (error) {
//             console.error('Error handling task assignment event:', error);
//           }
//         }
//       };

//       // Add event listener for localStorage changes
//       window.addEventListener('storage', handleTaskAssignmentEvent);

//       // Add team leader update event listener
//       const handleTeamLeaderUpdateEvent = (event) => {
//         if (event.key === 'teamLeaderUpdateEvent' && event.newValue && currentRole === 'team-leader') {
//           try {
//             const updateEvent = JSON.parse(event.newValue);
//             console.log('👥 Team data update detected for team leader:', updateEvent);

//             // Force refresh team leader data
//             setTimeout(async () => {
//               console.log('🔄 Refreshing team leader data due to team update...');
//               try {
//                 await loadUsers();
//                 await loadTasks();
//                 console.log('✅ Team leader data refreshed');
//               } catch (error) {
//                 console.error('❌ Team leader refresh failed:', error);
//               }
//             }, 500);

//           } catch (error) {
//             console.error('Error handling team leader update event:', error);
//           }
//         }
//       };

//       window.addEventListener('storage', handleTeamLeaderUpdateEvent);

//       // Removed visibility and focus handlers to prevent excessive refreshing

//       return () => {
//         if (interval) clearInterval(interval);
//         window.removeEventListener('storage', handleTaskAssignmentEvent);
//         window.removeEventListener('storage', handleTeamLeaderUpdateEvent);
//       };
//     }
//   }, [currentRole]);

//   // Update task statistics function
//   const updateTaskStats = (tasks) => {
//     const userEmail = localStorage.getItem('userEmail');
//     const userName = localStorage.getItem('userName');

//     // Filter tasks for current user
//     const userTasks = tasks.filter(task =>
//       task.assignedTo === userEmail ||
//       task.assignedTo === userName ||
//       task.assignedMembers?.includes(userEmail) ||
//       task.assignedMembers?.includes(userName)
//     );

//     const stats = {
//       assigned: userTasks.filter(task => task.status === 'assigned' || task.status === 'pending' || !task.status).length,
//       completed: userTasks.filter(task => task.status === 'completed').length,
//       inProgress: userTasks.filter(task => task.status === 'in-progress').length,
//       pending: userTasks.filter(task => task.status === 'pending' || !task.status).length
//     };

//     setTaskStats(stats);
//     setLastTaskUpdate(Date.now());
//   };

//   // Force refresh function for immediate updates
//   const forceRefreshEmployeeTasks = async () => {
//     console.log('🚀 Force refreshing employee tasks...');
//     setIsRefreshing(true);

//     try {
//       // Force reload from API
//       const userEmail = localStorage.getItem('userEmail');
//       const userName = localStorage.getItem('userName');

//       console.log('📡 Fetching fresh task data from API...');
//       const allTasks = await getAllTasks();
//       console.log(`📋 Received ${allTasks.length} total tasks from API`);

//       // Filter tasks for current employee
//       const employeeTasks = allTasks.filter(task => isUserAssignedToTask(task, userEmail));
//       console.log(`✅ Found ${employeeTasks.length} tasks assigned to ${userEmail}`);
//       console.log('📝 Task titles:', employeeTasks.map(t => t.title));

//       // Force update state immediately
//       setAssignedTasks(employeeTasks);
//       setDynamicTasks(employeeTasks);
//       updateTaskStats(employeeTasks);

//       // Update last refresh time
//       localStorage.setItem('lastTaskUpdate', Date.now().toString());

//       console.log('✅ Force refresh completed successfully');

//       // Show success notification
//       showToastNotification('✅ Tasks refreshed successfully!', 'success', 3000);

//     } catch (error) {
//       console.error('❌ Force refresh failed:', error);
//       showToastNotification('❌ Failed to refresh tasks', 'error', 3000);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   // Dynamic task loading for employees with MAXIMUM anti-flicker logic
//   const loadEmployeeDynamicTasks = async () => {
//     if (currentRole !== 'employee' || isRefreshing) return;

//     try {
//       setIsRefreshing(true);
//       const userEmail = localStorage.getItem('userEmail') || safeUserData?.email;
//       const userName = localStorage.getItem('userName') || safeUserData?.name;

//       if (!userEmail && !userName) {
//         setIsRefreshing(false);
//         return;
//       }

//       console.log('📡 Loading employee tasks from API...');
//       const allTasks = await getAllTasks();
//       console.log(`📋 Received ${allTasks.length} total tasks from API`);

//       // Filter tasks assigned to current employee using improved function
//       const employeeTasks = allTasks.filter(task =>
//         isUserAssignedToTask(task, userEmail)
//       );

//       console.log(`✅ Filtered ${employeeTasks.length} tasks for employee ${userEmail}`);
//       console.log('📝 Task titles:', employeeTasks.map(t => t.title));

//       // ENHANCED: More comprehensive change detection
//       const currentTasksHash = JSON.stringify(assignedTasks.map(t => ({
//         id: t.id || t._id,
//         title: t.title,
//         status: t.status,
//         assignedTo: t.assignedTo,
//         assignedMembers: t.assignedMembers,
//         priority: t.priority,
//         dueDate: t.dueDate
//       })).sort((a, b) => (a.id || '').localeCompare(b.id || '')));

//       const newTasksHash = JSON.stringify(employeeTasks.map(t => ({
//         id: t.id || t._id,
//         title: t.title,
//         status: t.status,
//         assignedTo: t.assignedTo,
//         assignedMembers: t.assignedMembers,
//         priority: t.priority,
//         dueDate: t.dueDate
//       })).sort((a, b) => (a.id || '').localeCompare(b.id || '')));

//       // Always update if we have tasks from API (even if hash is same, ensure UI shows data)
//       if (employeeTasks.length > 0) {
//         // Only log if there's an actual change
//         if (currentTasksHash !== newTasksHash) {
//           console.log(`🔄 Tasks changed - updating: ${employeeTasks.length} tasks`);
//         } else {
//           console.log(`📋 Tasks unchanged but ensuring UI is updated: ${employeeTasks.length} tasks`);
//         }

//         // Update state immediately - no setTimeout to prevent delay
//         setAssignedTasks(employeeTasks);
//         setDynamicTasks(employeeTasks);
//         updateTaskStats(employeeTasks);
//       } else if (assignedTasks.length > 0 && employeeTasks.length === 0) {
//         // Only clear if we're sure there are no tasks
//         console.log('⚠️ No tasks found for employee - clearing state');
//         setAssignedTasks([]);
//         setDynamicTasks([]);
//         updateTaskStats([]);
//       } else {
//         console.log('📋 No tasks found and state already empty');
//       }

//     } catch (error) {
//       console.error('❌ Error loading dynamic tasks:', error);
//       // Don't clear existing tasks on error - maintain stable state
//       console.log('⚠️ Keeping existing tasks due to error');
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   // Real-time Task Assignment Functions (Event-driven, no polling)
//   const initializeRealTimeTaskSystem = () => {
//     console.log('🚀 Initializing Event-driven Task Assignment System...');

//     // Initialize task stats with current data
//     updateTaskStats(assignedTasks);

//     // Initialize enhanced debug function
//     window.debugTaskAssignment = () => {
//       console.log('🔍 Task Assignment Debug Info:');
//       console.log('Current Role:', currentRole);
//       console.log('User Email:', localStorage.getItem('userEmail'));
//       console.log('User Name:', localStorage.getItem('userName'));
//       console.log('Assigned Tasks:', assignedTasks.length);
//       console.log('Task Stats:', taskStats);
//       console.log('Last Update:', new Date(lastTaskUpdate).toLocaleString());
//       console.log('Update Queue:', taskUpdateQueue);
//       console.log('Is Refreshing:', isRefreshing);

//       // Show detailed task breakdown
//       const userEmail = localStorage.getItem('userEmail');
//       const userTasks = Array.isArray(assignedTasks) ? assignedTasks.filter(task =>
//         task.assignedTo === userEmail || task.assignedTo === localStorage.getItem('userName')
//       ) : [];

//       console.log('User Tasks Breakdown:', {
//         total: userTasks.length,
//         assigned: userTasks.filter(t => t.status === 'assigned' || t.status === 'pending').length,
//         inProgress: userTasks.filter(t => t.status === 'in-progress').length,
//         completed: userTasks.filter(t => t.status === 'completed').length,
//         pending: userTasks.filter(t => !t.status || t.status === 'pending').length
//       });

//       // Show task assignment history
//       const assignmentEvents = JSON.parse(localStorage.getItem('taskAssignmentEvents') || '[]');
//       console.log('Task Assignment History:', assignmentEvents.slice(-10)); // Last 10 events

//       // Show real-time system status
//       console.log('Real-time System Status:', {
//         intervalActive: !!realTimeTaskInterval,
//         lastCheck: new Date(lastTaskUpdate).toLocaleString(),
//         notificationPermission: 'Notification' in window ? Notification.permission : 'Not supported',
//         updateQueueLength: taskUpdateQueue.length
//       });

//       return {
//         currentRole,
//         userEmail: localStorage.getItem('userEmail'),
//         userName: localStorage.getItem('userName'),
//         assignedTasks: assignedTasks.length,
//         taskStats,
//         lastUpdate: new Date(lastTaskUpdate).toLocaleString(),
//         userTasks: userTasks,
//         assignmentHistory: assignmentEvents.slice(-10),
//         systemStatus: {
//           intervalActive: !!realTimeTaskInterval,
//           notificationPermission: 'Notification' in window ? Notification.permission : 'Not supported',
//           updateQueueLength: taskUpdateQueue.length
//         }
//       };
//     };

//     // Add comprehensive test function
//     window.testRealTimeTaskSystem = () => {
//       console.log('🧪 Testing Real-time Task Assignment System...');

//       const testResults = {
//         systemInitialized: !!realTimeTaskInterval,
//         notificationPermission: 'Notification' in window ? Notification.permission : 'Not supported',
//         userIdentification: {
//           email: localStorage.getItem('userEmail'),
//           name: localStorage.getItem('userName'),
//           role: currentRole
//         },
//         taskStats: taskStats,
//         lastUpdate: new Date(lastTaskUpdate).toLocaleString(),
//         features: {
//           immediateTaskDisplay: '✅ Tasks appear in "My Daily Tasks" within seconds',
//           statsCardUpdates: '✅ ASSIGNED, COMPLETED, IN PROGRESS, PENDING cards show accurate counts',
//           realTimeNotifications: '✅ Instant notifications when tasks are assigned',
//           manualRefresh: '✅ Refresh button for manual task updates',
//           debugCapabilities: '✅ window.debugTaskAssignment() function available',
//           soundNotifications: '❌ Audio alerts disabled (removed to prevent noise)',
//           browserNotifications: '✅ Desktop notifications (if permission granted)',
//           taskTracking: '✅ Assignment history tracking',
//           countdownTimer: '✅ Visual countdown to next check'
//         }
//       };

//       console.table(testResults.features);
//       console.log('📊 System Status:', testResults);

//       return testResults;
//     };

//     // Add clear tasks function to window for debugging
//     window.clearAllTasks = clearAllTasks;

//     // Add PM data refresh function for debugging
//     window.refreshPMData = () => {
//       if (currentRole === 'project-manager') {
//         const pmData = getProjectManagerData();
//         console.log('🔄 Manual PM Data Refresh:', pmData);
//         console.log('👥 Team Members:', pmData.teamMembers.map(m => ({
//           name: m.name,
//           email: m.email,
//           role: m.role,
//           assignedProject: m.assignedProject,
//           department: m.department
//         })));
//         return pmData;
//       } else {
//         console.log('⚠️ Not in project manager role');
//         return null;
//       }
//     };

//     // Add force refresh function to window for debugging
//     window.forceRefreshTasks = forceRefreshEmployeeTasks;

//     // Add team leader data refresh function
//     window.refreshTeamLeaderData = () => {
//       if (currentRole === 'team-leader') {
//         const currentTLEmail = localStorage.getItem('userEmail');
//         const currentTLName = localStorage.getItem('userName');

//         const tlTeamMembers = allUsers.filter(user =>
//           user.role === 'employee' && (
//             user.teamLeaderId === currentTLEmail ||
//             user.teamLeaderName === currentTLName ||
//             user.teamLeader === currentTLName
//           )
//         );

//         console.log('🔄 Team Leader Data Refresh:', {
//           teamLeaderEmail: currentTLEmail,
//           teamLeaderName: currentTLName,
//           totalUsers: allUsers.length,
//           employees: allUsers.filter(u => u.role === 'employee'),
//           teamMembers: tlTeamMembers.length,
//           memberNames: tlTeamMembers.map(m => m.name),
//           allUsersSample: allUsers.slice(0, 3).map(u => ({
//             name: u.name,
//             role: u.role,
//             teamLeaderId: u.teamLeaderId,
//             teamLeaderName: u.teamLeaderName,
//             teamLeader: u.teamLeader
//           }))
//         });

//         return {
//           teamLeaderEmail: currentTLEmail,
//           teamLeaderName: currentTLName,
//           teamMembers: tlTeamMembers,
//           totalTasks: assignedTasks.filter(task =>
//             tlTeamMembers.some(member =>
//               task.assignedTo === member.name || task.assignedTo === member.email
//             )
//           ).length
//         };
//       } else {
//         console.log('⚠️ Not in team leader role');
//         return null;
//       }
//     };

//     // Add debug function for team assignment
//     window.debugTeamAssignment = (employeeName, teamLeaderName) => {
//       console.log('🔍 Debug Team Assignment:');

//       const employee = allUsers.find(u => u.name === employeeName);
//       const teamLeader = allUsers.find(u => u.name === teamLeaderName);

//       if (employee) {
//         console.log('Employee found:', {
//           name: employee.name,
//           email: employee.email,
//           role: employee.role,
//           teamLeaderId: employee.teamLeaderId,
//           teamLeaderName: employee.teamLeaderName,
//           teamLeader: employee.teamLeader
//         });
//       } else {
//         console.log('Employee not found:', employeeName);
//       }

//       if (teamLeader) {
//         console.log('Team Leader found:', {
//           name: teamLeader.name,
//           email: teamLeader.email,
//           role: teamLeader.role
//         });
//       } else {
//         console.log('Team Leader not found:', teamLeaderName);
//       }

//       return { employee, teamLeader };
//     };

//     // Add function to manually assign team member for testing
//     window.assignTeamMember = (employeeName, teamLeaderName) => {
//       console.log(`🔧 Manually assigning ${employeeName} to team leader ${teamLeaderName}`);

//       setAllUsers(prev => prev.map(user => {
//         if (user.name === employeeName && user.role === 'employee') {
//           const teamLeader = prev.find(u => u.name === teamLeaderName);
//           return {
//             ...user,
//             teamLeader: teamLeaderName,
//             teamLeaderName: teamLeaderName,
//             teamLeaderId: teamLeader?.email || teamLeader?.id
//           };
//         }
//         return user;
//       }));

//       console.log(`✅ Assigned ${employeeName} to ${teamLeaderName}'s team`);
//     };

//     // Add task assignment debug function
//     window.debugEmployeeTasks = () => {
//       const userEmail = localStorage.getItem('userEmail');
//       const userName = localStorage.getItem('userName');

//       console.log('🔍 Employee Task Debug Info:');
//       console.log('User Email:', userEmail);
//       console.log('User Name:', userName);
//       console.log('Current Role:', currentRole);
//       console.log('Total Tasks:', assignedTasks.length);

//       console.log('All Tasks:');
//       assignedTasks.forEach((task, index) => {
//         const isAssigned = isUserAssignedToTask(task, userEmail);
//         console.log(`${index + 1}. "${task.title}"`);
//         console.log(`   - Assigned to: "${task.assignedTo}"`);
//         console.log(`   - Assigned members: ${JSON.stringify(task.assignedMembers)}`);
//         console.log(`   - Match: ${isAssigned}`);
//         console.log(`   - Status: ${task.status}`);
//       });

//       const userTasks = assignedTasks.filter(task => isUserAssignedToTask(task, userEmail));

//       console.log(`User has ${userTasks.length} assigned tasks:`, userTasks.map(t => t.title));

//       return {
//         userEmail,
//         userName,
//         totalTasks: assignedTasks.length,
//         userTasks: userTasks.length,
//         taskTitles: userTasks.map(t => t.title),
//         allTasks: assignedTasks.map(t => ({
//           title: t.title,
//           assignedTo: t.assignedTo,
//           assignedMembers: t.assignedMembers,
//           isAssigned: isUserAssignedToTask(t, userEmail)
//         }))
//       };
//     };

//     // Add function to force refresh all user data from API
//     window.forceRefreshAllUsers = async () => {
//       console.log('🔄 Force refreshing all user data from API...');

//       // Clear all user-related cache
//       localStorage.removeItem('users');
//       localStorage.removeItem('users_backup');
//       localStorage.removeItem('users_current');
//       localStorage.removeItem('users_timestamp');
//       localStorage.removeItem('users_last_sync');
//       localStorage.removeItem('projectManagers');

//       console.log('🧹 Cleared all user cache');

//       // Reload from API
//       try {
//         await loadUsers();
//         await loadProjectManagers();
//         console.log('✅ User data refreshed from API');
//         console.log(`📊 Total users now: ${allUsers.length}`);
//         return {
//           success: true,
//           totalUsers: allUsers.length,
//           message: 'User data refreshed successfully'
//         };
//       } catch (error) {
//         console.error('❌ Failed to refresh user data:', error);
//         return {
//           success: false,
//           error: error.message
//         };
//       }
//     };

//     // Add function to check data consistency
//     window.checkDataConsistency = () => {
//       const localUsers = localStorage.getItem('users');
//       const localPMs = localStorage.getItem('projectManagers');
//       const lastSync = localStorage.getItem('users_last_sync');

//       let localUserCount = 0;
//       let localPMCount = 0;

//       if (localUsers) {
//         try {
//           localUserCount = JSON.parse(localUsers).length;
//         } catch (e) {
//           console.error('Error parsing local users:', e);
//         }
//       }

//       if (localPMs) {
//         try {
//           localPMCount = JSON.parse(localPMs).length;
//         } catch (e) {
//           console.error('Error parsing local PMs:', e);
//         }
//       }

//       const report = {
//         stateUsers: allUsers.length,
//         statePMs: projectManagers.length,
//         localStorageUsers: localUserCount,
//         localStoragePMs: localPMCount,
//         lastSync: lastSync ? new Date(parseInt(lastSync)).toLocaleString() : 'Never',
//         consistent: (allUsers.length === localUserCount) && (projectManagers.length === localPMCount)
//       };

//       console.log('📊 Data Consistency Report:');
//       console.table(report);

//       if (!report.consistent) {
//         console.warn('⚠️ Data inconsistency detected! Use window.forceRefreshAllUsers() to fix.');
//       } else {
//         console.log('✅ Data is consistent');
//       }

//       return report;
//     };

//     // Add function to clear all system data
//     window.clearAllSystemData = () => {
//       if (!window.confirm('⚠️ WARNING: This will delete ALL data from the system including users, projects, tasks, and settings. This action cannot be undone. Are you sure?')) {
//         return { success: false, message: 'Operation cancelled by user' };
//       }

//       console.log('🧹 Clearing all system data...');

//       try {
//         // Clear all localStorage data
//         const keysToRemove = [
//           'users', 'users_backup', 'users_current', 'users_timestamp', 'users_count', 'users_last_sync',
//           'users_debug', 'users_emergency',
//           'projectManagers',
//           'teamLeaders',
//           'projects', 'projects_timestamp',
//           'pointsSchemes',
//           'tasks', 'sampleTasks',
//           'recentActivities',
//           'taskDiscussions',
//           'taskAssignmentEvents',
//           'userWorkStatus',
//           'selectedTask',
//           'lastTaskUpdate',
//           'deletedUsers',
//           'teamLeaderUpdateEvent',
//           'taskAssignmentEvent'
//         ];

//         keysToRemove.forEach(key => {
//           localStorage.removeItem(key);
//           console.log(`✅ Removed: ${key}`);
//         });

//         // Clear sessionStorage
//         sessionStorage.clear();
//         console.log('✅ Cleared sessionStorage');

//         // Reset all state
//         setAllUsers([]);
//         setProjectManagers([]);
//         setProjects([]);
//         setAssignedTasks([]);
//         setDynamicTasks([]);
//         setPointsSchemes([]);
//         setRecentActivities([]);
//         setNotifications([]);
//         setTaskDiscussions({});

//         console.log('✅ All state reset');

//         const result = {
//           success: true,
//           message: 'All system data has been cleared successfully',
//           clearedKeys: keysToRemove.length,
//           timestamp: new Date().toISOString()
//         };

//         console.log('🎉 System data cleared successfully!');
//         console.table(result);

//         alert('✅ All system data has been cleared successfully! The page will reload.');

//         // Reload page to reset everything
//         setTimeout(() => {
//           window.location.reload();
//         }, 1000);

//         return result;
//       } catch (error) {
//         console.error('❌ Error clearing system data:', error);
//         return {
//           success: false,
//           message: 'Failed to clear system data',
//           error: error.message
//         };
//       }
//     };

//     console.log('✅ Real-time Task Assignment System initialized');
//     console.log('💡 Use window.debugTaskAssignment() to debug task assignment issues');
//     console.log('🧪 Use window.testRealTimeTaskSystem() to test all features');
//     console.log('🧹 Use window.clearAllTasks() to clear all tasks');
//     console.log('🔄 Use window.refreshPMData() to refresh project manager data');
//     console.log('🔄 Use window.forceRefreshAllUsers() to force refresh user data from API');
//     console.log('📊 Use window.checkDataConsistency() to check data consistency');
//     console.log('🗑️ Use window.clearAllSystemData() to clear ALL system data (WARNING: Cannot be undone!)');
//   };

//   const checkForNewTasks = async (showFeedback = false) => {
//     if (isRefreshing) return; // Prevent multiple simultaneous checks

//     try {
//       setIsRefreshing(true);
//       const userEmail = localStorage.getItem('userEmail');
//       const userName = localStorage.getItem('userName');

//       if (!userEmail && !userName) return;

//       // Get latest tasks from server (only when manually triggered)
//       const latestTasks = await getAllTasks();

//       // Filter tasks for current user based on role
//       let userTasks = [];
//       if (currentRole === 'employee' || currentRole === 'intern') {
//         userTasks = latestTasks.filter(task =>
//           task.assignedTo === userEmail ||
//           task.assignedTo === userName ||
//           (task.assignedMembers && task.assignedMembers.includes(userEmail)) ||
//           (task.assignedMembers && task.assignedMembers.includes(userName))
//         );
//       } else if (currentRole === 'project-manager') {
//         const pmProjects = projects.filter(project =>
//           project.projectManager === userName || project.projectManager === userEmail
//         );
//         userTasks = latestTasks.filter(task =>
//           pmProjects.some(project => project.name === task.project || project.name === task.projectName) ||
//           task.assignedBy === userEmail ||
//           task.assignedBy === userName
//         );
//       } else {
//         userTasks = latestTasks;
//       }

//       // Check for new tasks
//       const currentTaskIds = new Set(assignedTasks.map(task => task.id || task._id));
//       const newTasks = userTasks.filter(task => !currentTaskIds.has(task.id || task._id));

//       if (newTasks.length > 0) {
//         console.log(`🆕 Found ${newTasks.length} new tasks for ${userName || userEmail}`);

//         // Update assigned tasks immediately
//         setAssignedTasks(userTasks);

//         // Create notifications for new tasks
//         const newTaskNotifications = newTasks.map((task, index) => ({
//           id: `realtime_task_${Date.now()}_${index}`,
//           type: 'task',
//           title: 'New Task Assigned',
//           message: `"${task.title}" has been assigned to you`,
//           time: 'Just now',
//           read: false,
//           taskId: task.id || task._id,
//           priority: task.priority || 'medium',
//           dueDate: task.dueDate,
//           assignedTo: task.assignedTo,
//           isRealTime: true
//         }));

//         setNotifications(prev => [...newTaskNotifications, ...prev]);

//         // Update task stats
//         updateTaskStats(userTasks);

//         // Add to update queue for tracking
//         setTaskUpdateQueue(prev => [...prev, {
//           timestamp: Date.now(),
//           type: 'new_tasks',
//           count: newTasks.length,
//           tasks: newTasks.map(t => ({ id: t.id, title: t.title }))
//         }]);

//         // Show browser notification if supported
//         if ('Notification' in window && Notification.permission === 'granted') {
//           new Notification('New Task Assigned', {
//             body: `You have ${newTasks.length} new task${newTasks.length > 1 ? 's' : ''} assigned`,
//             icon: '/favicon.ico',
//             tag: 'task-assignment',
//             silent: true
//           });
//         }

//         // Audio notifications removed to prevent noise
//         const hasHighPriorityTask = newTasks.some(task => task.priority === 'high');

//         // Show toast notification only if feedback is requested (manual refresh)
//         if (showFeedback) {
//           showToastNotification(
//             `🆕 ${newTasks.length} new task${newTasks.length > 1 ? 's' : ''} found!`,
//             hasHighPriorityTask ? 'warning' : 'success',
//             4000
//           );
//         }

//         setLastTaskUpdate(Date.now());
//       }

//       // Check for task status updates
//       const updatedTasks = userTasks.filter(latestTask => {
//         const currentTask = assignedTasks.find(task =>
//           (task.id || task._id) === (latestTask.id || latestTask._id)
//         );
//         return currentTask && currentTask.status !== latestTask.status;
//       });

//       if (updatedTasks.length > 0) {
//         console.log(`🔄 Found ${updatedTasks.length} task status updates`);
//         setAssignedTasks(userTasks);
//         updateTaskStats(userTasks);
//         setLastTaskUpdate(Date.now());
//       }

//       // Update task stats even if no new tasks (for accurate counts)
//       updateTaskStats(userTasks);

//     } catch (error) {
//       console.error('❌ Error checking for new tasks:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };



//   const manualRefreshTasks = async () => {
//     console.log('🔄 Manual task refresh triggered...');
//     setIsRefreshing(true);

//     try {
//       const userEmail = localStorage.getItem('userEmail');
//       const userName = localStorage.getItem('userName');

//       console.log('📡 Fetching fresh task data from API...');

//       // Directly fetch from API without clearing existing data first
//       const allTasks = await getAllTasks();
//       console.log(`📋 Received ${allTasks.length} total tasks from API`);

//       // Filter tasks based on role
//       let filteredTasks = [];

//       if (currentRole === 'employee' || currentRole === 'intern') {
//         // For employees: only their assigned tasks
//         filteredTasks = allTasks.filter(task => isUserAssignedToTask(task, userEmail));
//         console.log(`✅ Found ${filteredTasks.length} tasks assigned to ${userEmail}`);
//       } else if (currentRole === 'project-manager') {
//         // For project managers: tasks related to their projects
//         const pmProjects = projects.filter(project =>
//           project.projectManager === userName || project.projectManager === userEmail
//         );
//         filteredTasks = allTasks.filter(task =>
//           pmProjects.some(project => project.name === task.project || project.name === task.projectName) ||
//           task.assignedBy === userEmail ||
//           task.assignedBy === userName
//         );
//         console.log(`✅ Found ${filteredTasks.length} tasks for project manager`);
//       } else {
//         // For admin: all tasks
//         filteredTasks = allTasks;
//         console.log(`✅ Loaded ${filteredTasks.length} tasks for admin`);
//       }

//       // Update state with filtered tasks
//       setAssignedTasks(filteredTasks);
//       setDynamicTasks(filteredTasks);
//       updateTaskStats(filteredTasks);

//       // Update last refresh time
//       localStorage.setItem('lastTaskUpdate', Date.now().toString());

//       // Show success toast notification
//       showToastNotification(
//         `✅ Tasks refreshed! Found ${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}`,
//         'success',
//         3000
//       );

//       console.log('✅ Manual task refresh completed successfully');
//     } catch (error) {
//       console.error('❌ Manual task refresh failed:', error);

//       // Show error toast notification
//       showToastNotification(
//         '❌ Failed to refresh tasks. Please try again.',
//         'error',
//         4000
//       );
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const requestNotificationPermission = async () => {
//     if ('Notification' in window && Notification.permission === 'default') {
//       const permission = await Notification.requestPermission();
//       if (permission === 'granted') {
//         console.log('✅ Notification permission granted');
//       }
//     }
//   };


//   // Enhanced task assignment tracking
//   const trackTaskAssignment = (taskData, assignedUsers) => {
//     const assignmentEvent = {
//       timestamp: Date.now(),
//       taskId: taskData.id,
//       taskTitle: taskData.title,
//       assignedBy: userName,
//       assignedTo: assignedUsers,
//       priority: taskData.priority,
//       project: taskData.project,
//       dueDate: taskData.dueDate,
//       type: 'task_assignment'
//     };

//     // Store in localStorage for persistence
//     const existingEvents = JSON.parse(localStorage.getItem('taskAssignmentEvents') || '[]');
//     existingEvents.push(assignmentEvent);

//     // Keep only last 100 events
//     if (existingEvents.length > 100) {
//       existingEvents.splice(0, existingEvents.length - 100);
//     }

//     localStorage.setItem('taskAssignmentEvents', JSON.stringify(existingEvents));

//     console.log('📊 Task assignment tracked:', assignmentEvent);
//   };


//   // Toast notification system for real-time feedback
//   const showToastNotification = (message, type = 'success', duration = 3000) => {
//     const toast = {
//       id: Date.now(),
//       message,
//       type, // success, info, warning, error
//       timestamp: Date.now()
//     };

//     setToastNotifications(prev => [...prev, toast]);

//     // Auto remove after duration
//     setTimeout(() => {
//       setToastNotifications(prev => prev.filter(t => t.id !== toast.id));
//     }, duration);
//   };

//   const removeToastNotification = (toastId) => {
//     setToastNotifications(prev => prev.filter(t => t.id !== toastId));
//   };

//   // Load team leaders


//   // Load custom roles
//   const loadCustomRoles = async () => {
//     try {
//       const customRolesData = await getAllCustomRoles();

//       // Filter out sample/static roles
//       const sampleRoleNames = ['DevOps Engineer', 'Senior Developer', 'QA Lead'];
//       const filteredRoles = customRolesData.filter(role =>
//         !sampleRoleNames.includes(role.name) && !sampleRoleNames.includes(role.roleName)
//       );

//       setCustomRoles(filteredRoles);
//       console.log(`✅ Loaded ${filteredRoles.length} custom roles (filtered out ${customRolesData.length - filteredRoles.length} sample roles)`);
//     } catch (error) {
//       console.error('Error loading custom roles:', error);
//       // Initialize with empty array if loading fails
//       setCustomRoles([]);
//     }
//   };

//   // Utility function to format numbers
//   const formatNumber = (num) => {
//     if (num === null || num === undefined || isNaN(num)) return '0';
//     const numValue = Number(num);
//     if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`;
//     if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}K`;
//     return numValue.toString();
//   };

//   // Utility function to format percentage
//   const formatPercentage = (num) => {
//     return `${Math.round(num * 10) / 10}%`;
//   };

//   // Helper function to get consistent role badge colors
//   const getRoleBadgeClass = (role) => {
//     const roleType = typeof role === 'string' ? role.toLowerCase() : '';

//     if (roleType.includes('intern')) {
//       return 'bg-info'; // Cyan for Intern
//     } else if (roleType.includes('team') && roleType.includes('leader')) {
//       return 'bg-warning'; // Yellow/Orange for Team Leader
//     } else if (roleType.includes('project') && roleType.includes('manager')) {
//       return 'bg-primary'; // Blue for Project Manager  
//     } else if (roleType.includes('employee')) {
//       return 'bg-success'; // Green for Employee
//     } else if (roleType.includes('admin')) {
//       return 'bg-danger'; // Red for Admin
//     }
//     return 'bg-secondary'; // Default gray
//   };

//   // Helper function to check if a user is assigned to a task (handles both string and array formats)
//   const isUserAssignedToTask = (task, userIdentifier) => {
//     if (!task || !userIdentifier) return false;

//     const userEmail = localStorage.getItem('userEmail');
//     const userName = localStorage.getItem('userName');

//     // Check assignedTo field (string or array)
//     if (task.assignedTo) {
//       if (Array.isArray(task.assignedTo)) {
//         if (task.assignedTo.includes(userIdentifier) ||
//           task.assignedTo.includes(userEmail) ||
//           task.assignedTo.includes(userName)) {
//           return true;
//         }
//       } else {
//         if (task.assignedTo === userIdentifier ||
//           task.assignedTo === userEmail ||
//           task.assignedTo === userName) {
//           return true;
//         }
//       }
//     }

//     // Check assignedMembers field (array)
//     if (task.assignedMembers && Array.isArray(task.assignedMembers)) {
//       if (task.assignedMembers.includes(userIdentifier) ||
//         task.assignedMembers.includes(userEmail) ||
//         task.assignedMembers.includes(userName)) {
//         return true;
//       }
//     }

//     return false;
//   };

//   // Helper function to get employee projects
//   const getEmployeeProjects = (userEmail) => {
//     const userName = localStorage.getItem('userName');

//     return projects.filter(project =>
//       project.projectManager === userName ||
//       project.projectManager === userEmail ||
//       (project.assigned && project.assigned.some(member =>
//         member.name === userName ||
//         member.name === userEmail ||
//         (typeof member === 'object' && (member.email === userEmail || member.name === userName))
//       ))
//     );
//   };

//   // Task notes functions
//   const openTaskNotesModal = (task) => {
//     setSelectedTaskForNotes(task);
//     setShowTaskNotesModal(true);
//   };

//   const getTaskNoteCount = (taskId) => {
//     const discussions = taskDiscussions[taskId] || [];
//     return discussions.length;
//   };

//   // Load workflow data function
//   const loadWorkflowData = async () => {
//     try {
//       // Load any workflow-related data here
//       console.log('Loading workflow data...');
//     } catch (error) {
//       console.error('Error loading workflow data:', error);
//     }
//   };

//   // Duplicate validation functions
//   const checkForDuplicates = (userData, excludeId = null) => {
//     const errors = [];

//     // Get all users from different sources
//     const allExistingUsers = [
//       ...allUsers,
//       ...projectManagers
//     ];

//     // Filter out the user being edited (for update operations)
//     const usersToCheck = excludeId
//       ? allExistingUsers.filter(user => user.id !== excludeId && user._id !== excludeId)
//       : allExistingUsers;

//     // Check for duplicate name
//     const duplicateName = usersToCheck.find(user =>
//       user.name && user.name.toLowerCase().trim() === userData.name.toLowerCase().trim()
//     );
//     if (duplicateName) {
//       errors.push(`Name "${userData.name}" already exists for ${duplicateName.role || 'user'}: ${duplicateName.email || 'No email'}`);
//     }

//     // Check for duplicate email
//     if (userData.email) {
//       const duplicateEmail = usersToCheck.find(user =>
//         user.email && user.email.toLowerCase().trim() === userData.email.toLowerCase().trim()
//       );
//       if (duplicateEmail) {
//         errors.push(`Email "${userData.email}" already exists for: ${duplicateEmail.name || 'Unknown user'}`);
//       }
//     }

//     // Check for duplicate phone
//     if (userData.phone) {
//       const duplicatePhone = usersToCheck.find(user =>
//         user.phone && user.phone.trim() === userData.phone.trim()
//       );
//       if (duplicatePhone) {
//         errors.push(`Phone number "${userData.phone}" already exists for: ${duplicatePhone.name || 'Unknown user'}`);
//       }
//     }

//     return errors;
//   };

//   const validateUniqueData = (userData, excludeId = null) => {
//     const duplicateErrors = checkForDuplicates(userData, excludeId);

//     if (duplicateErrors.length > 0) {
//       const errorMessage = 'Duplicate data found:\n' + duplicateErrors.join('\n');
//       alert(errorMessage);
//       return false;
//     }

//     return true;
//   };

//   // Function to clean up existing duplicates
//   const cleanupDuplicates = () => {
//     if (!window.confirm('This will remove duplicate users based on email addresses. Are you sure you want to continue?')) {
//       return;
//     }

//     const seenEmails = new Set();
//     const seenNames = new Set();
//     const seenPhones = new Set();
//     const duplicatesToRemove = [];

//     // Check allUsers for duplicates
//     allUsers.forEach((user, index) => {
//       let isDuplicate = false;

//       // Check email duplicates
//       if (user.email) {
//         const emailKey = user.email.toLowerCase().trim();
//         if (seenEmails.has(emailKey)) {
//           isDuplicate = true;
//         } else {
//           seenEmails.add(emailKey);
//         }
//       }

//       // Check name duplicates
//       if (user.name) {
//         const nameKey = user.name.toLowerCase().trim();
//         if (seenNames.has(nameKey)) {
//           isDuplicate = true;
//         } else {
//           seenNames.add(nameKey);
//         }
//       }

//       // Check phone duplicates
//       if (user.phone) {
//         const phoneKey = user.phone.trim();
//         if (seenPhones.has(phoneKey)) {
//           isDuplicate = true;
//         } else {
//           seenPhones.add(phoneKey);
//         }
//       }

//       if (isDuplicate) {
//         duplicatesToRemove.push({ type: 'user', index, user });
//       }
//     });

//     if (duplicatesToRemove.length === 0) {
//       alert('No duplicates found!');
//       return;
//     }

//     // Remove duplicates
//     const cleanedUsers = allUsers.filter((user, index) =>
//       !duplicatesToRemove.some(dup => dup.type === 'user' && dup.index === index)
//     );

//     setAllUsers(cleanedUsers);
//     saveUsersToLocalStorage(cleanedUsers);

//     alert(`Removed ${duplicatesToRemove.length} duplicate entries:\n${duplicatesToRemove.map(dup => `- ${dup.user.name} (${dup.user.email})`).join('\n')}`);
//   };

//   // Function to force sync deletions with MongoDB
//   const forceSyncDeletions = async () => {
//     if (!window.confirm('This will attempt to sync all pending deletions with MongoDB. Continue?')) {
//       return;
//     }

//     console.log('🔄 Starting force sync with MongoDB...');

//     const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
//     console.log('📋 Users marked as deleted locally:', deletedUsers);

//     if (deletedUsers.length === 0) {
//       alert('No pending deletions found.');
//       return;
//     }

//     let successCount = 0;
//     let failCount = 0;
//     const results = [];

//     for (const userId of deletedUsers) {
//       try {
//         console.log(`🗑️ Attempting to delete user ID: ${userId} from MongoDB...`);

//         // Try all possible endpoints
//         try {
//           await deleteUser(userId);
//           console.log(`✅ Successfully deleted user ${userId} as employee`);
//           successCount++;
//           results.push(`✅ ${userId} - Deleted as employee`);
//         } catch (e1) {
//           try {
//             await deleteProjectManager(userId);
//             console.log(`✅ Successfully deleted user ${userId} as project manager`);
//             successCount++;
//             results.push(`✅ ${userId} - Deleted as project manager`);
//           } catch (e2) {
//             try {
//               await deleteTeamLeader(userId);
//               console.log(`✅ Successfully deleted user ${userId} as team leader`);
//               successCount++;
//               results.push(`✅ ${userId} - Deleted as team leader`);
//             } catch (e3) {
//               console.log(`❌ Failed to delete user ${userId} from all endpoints`);
//               failCount++;
//               results.push(`❌ ${userId} - Failed to delete`);
//             }
//           }
//         }
//       } catch (error) {
//         console.error(`❌ Error deleting user ${userId}:`, error);
//         failCount++;
//         results.push(`❌ ${userId} - Error: ${error.message}`);
//       }
//     }

//     console.log('🏁 Force sync completed:', { successCount, failCount });

//     const message = `Force Sync Results:\n\n` +
//       `✅ Successfully synced: ${successCount}\n` +
//       `❌ Failed to sync: ${failCount}\n\n` +
//       `Details:\n${results.join('\n')}`;

//     alert(message);

//     // Clear successfully deleted users from the deletedUsers list
//     if (successCount > 0) {
//       const remainingDeleted = deletedUsers.filter((userId, index) =>
//         results[index].startsWith('❌')
//       );
//       localStorage.setItem('deletedUsers', JSON.stringify(remainingDeleted));
//       console.log('🧹 Updated deletedUsers list:', remainingDeleted);
//     }
//   };

//   // Get recent activity for project manager dashboard - Dynamic for each PM
//   const getRecentActivity = () => {
//     const activities = [];
//     const currentUserEmail = localStorage.getItem('userEmail') || safeUserData?.email;
//     const currentUserName = localStorage.getItem('userName') || safeUserData?.name || userName;

//     // Add project updates (show all for now, can be filtered by PM's projects later)
//     projectUpdates.forEach(update => {
//       activities.push({
//         type: 'project_update',
//         title: 'Project Update',
//         description: `${update.projectName} - ${update.status}`,
//         details: update.description,
//         employeeName: update.employeeName,
//         project: update.projectName,
//         progress: update.completionPercentage,
//         time: new Date(update.updateDate).toLocaleDateString(),
//         timestamp: new Date(update.updateDate).getTime()
//       });
//     });

//     // Add task completions
//     (Array.isArray(assignedTasks) ? assignedTasks : []).filter(task => task.status === 'completed').forEach(task => {
//       activities.push({
//         type: 'task_completed',
//         title: 'Task Completed',
//         description: `${task.title} has been completed`,
//         employeeName: task.assignedTo,
//         project: task.project,
//         time: new Date().toLocaleDateString(),
//         timestamp: new Date().getTime()
//       });
//     });

//     // Add new task assignments
//     (Array.isArray(assignedTasks) ? assignedTasks : []).filter(task => task.status === 'pending').forEach(task => {
//       activities.push({
//         type: 'task_assigned',
//         title: 'New Task Assigned',
//         description: `${task.title} assigned to ${task.assignedTo}`,
//         employeeName: task.assignedTo,
//         project: task.project,
//         priority: task.priority,
//         time: new Date().toLocaleDateString(),
//         timestamp: new Date().getTime()
//       });
//     });

//     // Add team member updates
//     allUsers.forEach(user => {
//       if (user.role === 'employee' && user.recentActivity) {
//         user.recentActivity.forEach(activity => {
//           activities.push({
//             type: 'team_update',
//             title: 'Team Member Update',
//             description: activity.description,
//             employeeName: user.name,
//             time: activity.timestamp,
//             timestamp: new Date(activity.timestamp).getTime()
//           });
//         });
//       }
//     });

//     // Sort by timestamp (newest first) and return latest 10
//     return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
//   };

//   // Get project manager specific data
//   const getProjectManagerData = () => {
//     const currentUserEmail = localStorage.getItem('userEmail') || safeUserData?.email;
//     const currentUserName = localStorage.getItem('userName') || safeUserData?.name || userName;

//     // Get projects managed by current PM
//     const managedProjects = projects.filter(project =>
//       project.projectManager === currentUserName ||
//       project.projectManager === currentUserEmail
//     );

//     // Get tasks assigned by current PM or related to their projects
//     const relatedTasks = Array.isArray(assignedTasks) ? assignedTasks.filter(task =>
//       managedProjects.some(project => project.name === task.project) ||
//       task.assignedBy === currentUserEmail ||
//       task.assignedBy === currentUserName
//     ) : [];

//     // Get team members under current PM (employees and team leaders)
//     const teamMembers = allUsers.filter(user =>
//       (user.role === 'employee' || user.role === 'team-leader' || user.role === 'intern') && (
//         // Check if user is assigned to any of the PM's projects
//         managedProjects.some(project =>
//           project.assigned?.some(member =>
//             member.name === user.name ||
//             member === user.name ||
//             (typeof member === 'object' && member.name === user.name)
//           ) ||
//           // Also include users whose assignedProject matches the PM's projects
//           project.name === user.assignedProject
//         ) ||
//         // Include users who have tasks assigned by this PM
//         relatedTasks.some(task =>
//           task.assignedTo === user.name ||
//           task.assignedTo === user.email ||
//           (task.assignedMembers && (
//             task.assignedMembers.includes(user.name) ||
//             task.assignedMembers.includes(user.email)
//           ))
//         )
//       )
//     );

//     return {
//       managedProjects,
//       relatedTasks,
//       teamMembers,
//       totalProjects: managedProjects.length,
//       activeProjects: managedProjects.filter(p => p.status !== 'Completed').length,
//       totalTasks: relatedTasks.length,
//       pendingTasks: relatedTasks.filter(t => t.status === 'pending').length,
//       completedTasks: relatedTasks.filter(t => t.status === 'completed').length,
//       teamSize: teamMembers.length
//     };
//   };

//   // Role configurations with improved KPI design
//   const roles = {
//     'admin': {
//       title: 'Admin Panel',
//       menu: [
//         {
//           icon: 'fas fa-home',
//           text: 'Dashboard',
//           active: true
//         },
//         { icon: 'fas fa-users', text: 'User Management' },
//         { icon: 'fas fa-user-shield', text: 'Role Management' },
//         { icon: 'fas fa-tasks', text: 'All Projects' },
//         { icon: 'fas fa-trophy', text: 'Points Scheme' }
//       ],
//       stats: [
//         {
//           title: 'Active Users',
//           value: formatNumber(allUsers.length),
//           icon: 'fas fa-users',
//           color: 'success',
//           trend: '+12%',
//           clickable: true,
//           ariaLabel: `${allUsers.length} active users in system`
//         },
//         {
//           title: 'Active Projects',
//           value: formatNumber(projects.length),
//           icon: 'fas fa-project-diagram',
//           color: 'success',
//           trend: '+8%',
//           clickable: true,
//           ariaLabel: `${projects.length} active projects`
//         },
//         {
//           title: 'Total Clients',
//           value: formatNumber(dashboardStats.totalClients),
//           icon: 'fas fa-user-friends',
//           color: 'success',
//           trend: '+5%',
//           clickable: true,
//           ariaLabel: `${dashboardStats.totalClients} total clients`
//         },
//         {
//           title: 'Revenue',
//           value: `$${formatNumber(dashboardStats.totalRevenue)}`,
//           icon: 'fas fa-dollar-sign',
//           color: 'success',
//           trend: '+15%',
//           clickable: true,
//           ariaLabel: `$${(dashboardStats.totalRevenue || 0).toLocaleString()} total revenue`
//         }
//       ]
//     },
//     'project-manager': (() => {
//       // Get current PM's data dynamically
//       const currentPMEmail = localStorage.getItem('userEmail') || safeUserData?.email;
//       const currentPMName = localStorage.getItem('userName') || safeUserData?.name || userName;

//       // Get projects managed by current PM
//       const pmProjects = projects.filter(project =>
//         project.projectManager === currentPMName ||
//         project.projectManager === currentPMEmail
//       );

//       // Get tasks related to PM's projects
//       const pmTasks = assignedTasks.filter(task =>
//         pmProjects.some(project => project.name === task.project) ||
//         task.assignedBy === currentPMEmail ||
//         task.assignedBy === currentPMName
//       );

//       // Get team members under current PM's projects (matching getProjectManagerData logic)
//       const pmTeamMembers = allUsers.filter(user =>
//         (user.role === 'employee' || user.role === 'team-leader' || user.role === 'intern') && (
//           // Check if user is assigned to any of the PM's projects
//           pmProjects.some(project =>
//             project.assigned?.some(member =>
//               member.name === user.name ||
//               member === user.name ||
//               (typeof member === 'object' && member.name === user.name)
//             ) ||
//             // Also include users whose assignedProject matches the PM's projects
//             project.name === user.assignedProject
//           ) ||
//           // Include users who have tasks assigned by this PM
//           pmTasks.some(task =>
//             task.assignedTo === user.name ||
//             task.assignedTo === user.email ||
//             (task.assignedMembers && (
//               task.assignedMembers.includes(user.name) ||
//               task.assignedMembers.includes(user.email)
//             ))
//           )
//         )
//       );

//       return {
//         title: `${currentPMName || 'Project Manager'} Dashboard`,
//         menu: [
//           { icon: 'fas fa-home', text: 'Dashboard', active: true },
//           { icon: 'fas fa-plus-circle', text: 'Add Task' },
//           { icon: 'fas fa-project-diagram', text: 'My Projects' },
//           { icon: 'fas fa-users-cog', text: 'Team Leader Management' },
//           { icon: 'fas fa-tasks', text: 'Task Assignment' }
//         ],
//         stats: [
//           {
//             title: 'Total Users',
//             value: formatNumber(allUsers.length),
//             icon: 'fas fa-users',
//             color: 'success',
//             trend: '+3%',
//             clickable: true,
//             ariaLabel: `${allUsers.length} total users in the system`
//           },
//           {
//             title: 'Active Projects',
//             value: formatNumber(pmProjects.filter(project => project.status === 'On Track' || project.status === 'At Risk').length),
//             icon: 'fas fa-project-diagram',
//             color: 'primary',
//             trend: '+2%',
//             clickable: true,
//             ariaLabel: `${pmProjects.filter(project => project.status === 'On Track' || project.status === 'At Risk').length} active projects`
//           },
//           {
//             title: 'Active Users',
//             value: formatNumber(pmTeamMembers.length),
//             icon: 'fas fa-user-check',
//             color: 'warning',
//             trend: '+10%',
//             clickable: true,
//             ariaLabel: `${pmTeamMembers.length} active users under your projects`
//           },
//           {
//             title: 'Assigned Tasks',
//             value: formatNumber(pmTasks.filter(task => task.status === 'assigned' || task.status === 'pending' || task.status === 'in-progress').length),
//             icon: 'fas fa-tasks',
//             color: 'success',
//             trend: '+18%',
//             clickable: true,
//             ariaLabel: `${pmTasks.filter(task => task.status === 'assigned' || task.status === 'pending' || task.status === 'in-progress').length} assigned tasks`
//           }
//         ]
//       };
//     })(),
//     'team-leader': {
//       title: 'Team Leader Dashboard',
//       menu: [
//         { icon: 'fas fa-home', text: 'Dashboard', active: true },
//         { icon: 'fas fa-users', text: 'My Team' },
//         { icon: 'fas fa-tasks', text: 'Task Management' },
//         { icon: 'fas fa-chart-bar', text: 'Performance' },
//         { icon: 'fas fa-file-alt', text: 'Work Report' }
//       ],
//       stats: []
//     },
//     'employee': {
//       title: 'Employee Dashboard',
//       menu: [
//         { icon: 'fas fa-home', text: 'Dashboard', active: true },
//         { icon: 'fas fa-briefcase', text: 'Daily Work' },
//         { icon: 'fas fa-tasks', text: 'My Tasks' },
//         { icon: 'fas fa-exchange-alt', text: 'Switch Task' }
//       ],
//       stats: (() => {
//         // Use real-time task stats for immediate updates
//         const stats = taskStats;

//         return [
//           {
//             title: 'ASSIGNED',
//             value: formatNumber(stats.assigned),
//             icon: 'fas fa-clipboard-list',
//             color: 'primary',
//             trend: stats.assigned > 0 ? `+${stats.assigned}` : '0',
//             clickable: true,
//             ariaLabel: `${stats.assigned} assigned tasks`,
//             isRealTime: true,
//             lastUpdate: new Date(lastTaskUpdate).toLocaleTimeString()
//           },
//           {
//             title: 'COMPLETED',
//             value: formatNumber(stats.completed),
//             icon: 'fas fa-check-circle',
//             color: 'success',
//             trend: stats.completed > 0 ? `+${stats.completed}` : '0',
//             clickable: true,
//             ariaLabel: `${stats.completed} completed tasks`,
//             isRealTime: true,
//             lastUpdate: new Date(lastTaskUpdate).toLocaleTimeString()
//           },
//           {
//             title: 'IN PROGRESS',
//             value: formatNumber(stats.inProgress),
//             icon: 'fas fa-clock',
//             color: 'warning',
//             trend: stats.inProgress > 0 ? `+${stats.inProgress}` : '0',
//             clickable: true,
//             ariaLabel: `${stats.inProgress} tasks in progress`,
//             isRealTime: true,
//             lastUpdate: new Date(lastTaskUpdate).toLocaleTimeString()
//           },
//           {
//             title: 'PENDING',
//             value: formatNumber(stats.pending),
//             icon: 'fas fa-times-circle',
//             color: 'danger',
//             trend: stats.pending > 0 ? `${stats.pending}` : '0',
//             clickable: true,
//             ariaLabel: `${stats.pending} pending tasks`,
//             isRealTime: true,
//             lastUpdate: new Date(lastTaskUpdate).toLocaleTimeString()
//           }
//         ];
//       })()
//     },
//     'intern': {
//       title: 'Employee Dashboard', // Changed from 'Intern Dashboard'
//       menu: [
//         { icon: 'fas fa-home', text: 'Dashboard', active: true },
//         { icon: 'fas fa-briefcase', text: 'Daily Work' },
//         { icon: 'fas fa-tasks', text: 'My Tasks' },
//         { icon: 'fas fa-exchange-alt', text: 'Switch Task' }
//       ],
//       stats: (() => {
//         // Use real-time task stats for immediate updates
//         const stats = taskStats;

//         return [
//           {
//             title: 'ASSIGNED',
//             value: formatNumber(stats.assigned),
//             icon: 'fas fa-clipboard-list',
//             color: 'primary',
//             trend: stats.assigned > 0 ? `+${stats.assigned}` : '0',
//             clickable: true,
//             ariaLabel: `${stats.assigned} assigned tasks`,
//             isRealTime: true,
//             lastUpdate: new Date(lastTaskUpdate).toLocaleTimeString()
//           },
//           {
//             title: 'COMPLETED',
//             value: formatNumber(stats.completed),
//             icon: 'fas fa-check-circle',
//             color: 'success',
//             trend: stats.completed > 0 ? `+${stats.completed}` : '0',
//             clickable: true,
//             ariaLabel: `${stats.completed} completed tasks`,
//             isRealTime: true,
//             lastUpdate: new Date(lastTaskUpdate).toLocaleTimeString()
//           },
//           {
//             title: 'IN PROGRESS',
//             value: formatNumber(stats.inProgress),
//             icon: 'fas fa-clock',
//             color: 'warning',
//             trend: stats.inProgress > 0 ? `+${stats.inProgress}` : '0',
//             clickable: true,
//             ariaLabel: `${stats.inProgress} tasks in progress`,
//             isRealTime: true,
//             lastUpdate: new Date(lastTaskUpdate).toLocaleTimeString()
//           },
//           {
//             title: 'PENDING',
//             value: formatNumber(stats.pending),
//             icon: 'fas fa-times-circle',
//             color: 'danger',
//             trend: stats.pending > 0 ? `${stats.pending}` : '0',
//             clickable: true,
//             ariaLabel: `${stats.pending} pending tasks`,
//             isRealTime: true,
//             lastUpdate: new Date(lastTaskUpdate).toLocaleTimeString()
//           }
//         ];
//       })()
//     }
//   };

//   const handleLogout = () => {
//     // Use provided logout function if available
//     if (safeOnLogout) {
//       safeOnLogout();
//       return;
//     }

//     // Clear all authentication data for all user types
//     localStorage.removeItem('adminToken');
//     localStorage.removeItem('adminAuth');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('userName');
//     localStorage.removeItem('pmToken');
//     localStorage.removeItem('employeeToken');
//     localStorage.removeItem('teamLeaderToken');
//     localStorage.removeItem('isAuthenticated');
//     localStorage.removeItem('selectedTask');
//     localStorage.removeItem('selectedProfile');
//     localStorage.removeItem('currentTaskId');
//     localStorage.removeItem('currentProjectName');
//     localStorage.removeItem('userData');

//     // Clear task refresh interval
//     if (taskRefreshInterval) {
//       clearInterval(taskRefreshInterval);
//     }

//     // Reset component state
//     setCurrentRole('admin');
//     setUserName('Admin User');
//     setActiveView('dashboard');

//     // Redirect to login
//     window.location.href = '/login';
//   };

//   // Role switching functionality removed - each user now has their own dedicated dashboard

//   const handleCardClick = (cardTitle) => {
//     // Employee task filter cards
//     if (cardTitle === 'ASSIGNED' && (currentRole === 'employee' || currentRole === 'intern')) {
//       setSelectedTaskFilter('assigned');
//       console.log('🔍 Filtering tasks: ASSIGNED');
//     } else if (cardTitle === 'COMPLETED' && (currentRole === 'employee' || currentRole === 'intern')) {
//       setSelectedTaskFilter('completed');
//       console.log('🔍 Filtering tasks: COMPLETED');
//     } else if (cardTitle === 'IN PROGRESS' && (currentRole === 'employee' || currentRole === 'intern')) {
//       setSelectedTaskFilter('in-progress');
//       console.log('🔍 Filtering tasks: IN PROGRESS');
//     } else if (cardTitle === 'PENDING' && (currentRole === 'employee' || currentRole === 'intern')) {
//       setSelectedTaskFilter('pending');
//       console.log('🔍 Filtering tasks: PENDING');
//     } else if (cardTitle === 'Total Employees') {
//       setActiveView('employees');
//     } else if (cardTitle === 'Total Users') {
//       // For Project Manager role, show all users from admin dashboard
//       if (currentRole === 'project-manager') {
//         setPmActiveSection('all-users');
//       } else {
//         setActiveView('employees');
//       }
//     } else if (cardTitle === 'Active Users') {
//       // For Project Manager role, show the PM's active users section
//       if (currentRole === 'project-manager') {
//         setPmActiveSection('members');
//       } else {
//         setActiveView('employees');
//       }
//     } else if (cardTitle === 'Active Projects') {
//       setActiveView('projects');
//     } else if (cardTitle === 'Total Projects') {
//       setActiveView('projects');
//     } else if (cardTitle === 'Total Clients') {
//       setActiveView('client-dashboard');
//     } else if (cardTitle === 'Total Revenue') {
//       setActiveView('revenue');
//     } else if (cardTitle === 'Recent Activity') {
//       setActiveView('recent-activity');
//     } else if (cardTitle === 'Assigned Tasks') {
//       // For Project Manager role, show the PM task management section
//       if (currentRole === 'project-manager') {
//         setPmActiveSection('tasks');
//       } else {
//         setActiveView('assigned-tasks');
//       }
//     } else if (cardTitle === 'Tasks') {
//       setActiveView('all-tasks');
//     } else if (cardTitle === 'Team Size') {
//       setActiveView('employees');
//     } else if (cardTitle === 'Projects') {
//       setActiveView('projects');
//     } else if (cardTitle === 'Current Task') {
//       setShowTaskSelectionModal(true);
//     } else if (cardTitle === 'Assigned') {
//       setActiveView('employee-tasks');
//     } else if (cardTitle === 'Team Members') {
//       // For Team Leader role, navigate to My Team section
//       if (currentRole === 'team-leader') {
//         setActiveView('my-team');
//       }
//     }
//   };

//   const handleCardDoubleClick = (cardTitle) => {
//     if (cardTitle === 'Assigned Tasks' && currentRole === 'project-manager') {
//       // Double-click on Assigned Tasks navigates to Task Assignment section
//       setActiveView('dashboard'); // Ensure we're in dashboard view
//       setPmActiveSection('dashboard'); // Reset to dashboard first
//       // Small delay to ensure state is updated, then navigate to task assignment
//       setTimeout(() => {
//         // Navigate to Task Assignment menu item
//         handleMenuClick('Task Assignment');
//       }, 100);
//     }
//   };

//   const handleMenuClick = (menuItem) => {
//     if (menuItem === 'Dashboard') {
//       setActiveView('dashboard');
//     } else if (menuItem === 'Add Task') {
//       // Open the task creation modal
//       setEditingTask(null);
//       setShowAddTaskModal(true);
//       // Close mobile sidebar if open
//       setIsMobileSidebarOpen(false);
//     } else if (menuItem === 'Project Manager') {
//       // Switch to Project Manager dashboard view
//       setActiveView('pm-dashboard-view');
//     } else if (menuItem === 'Team Leader') {
//       // Switch to Team Leader dashboard view
//       setActiveView('tl-dashboard-view');
//     } else if (menuItem === 'Employee') {
//       // Switch to Employee dashboard view
//       setActiveView('employee-dashboard-view');
//     } else if (menuItem === 'Points Scheme') {
//       setActiveView('points-scheme');
//     } else if (menuItem === 'User Management') {
//       setActiveView('employees');
//     } else if (menuItem === 'Project Manager Management') {
//       setActiveView('project-managers');
//     } else if (menuItem === 'User Management') {
//       setActiveView('employees');
//     } else if (menuItem === 'Team Leader Management') {
//       setActiveView('team-leaders');
//     } else if (menuItem === 'Role Management') {
//       setActiveView('role-management');
//     } else if (menuItem === 'All Projects') {
//       setActiveView('projects');
//     } else if (menuItem === 'My Projects') {
//       setActiveView('projects');
//     } else if (menuItem === 'My Tasks') {
//       setActiveView('employee-tasks');
//     } else if (menuItem === 'Switch Task') {
//       setShowTaskSelectionModal(true);
//     } else if (menuItem === 'Daily Work') {
//       setActiveView('daily-work');
//     } else if (menuItem === 'My Team') {
//       setActiveView('my-team');
//     } else if (menuItem === 'Task Management') {
//       setActiveView('task-management');
//     } else if (menuItem === 'Task Assignment') {
//       // For Project Manager role, show the PM task management section
//       if (currentRole === 'project-manager') {
//         // Keep PM in their own dashboard, just switch to tasks section
//         setActiveView('dashboard');
//         setPmActiveSection('tasks');
//       } else {
//         setActiveView('assigned-tasks');
//       }
//     } else if (menuItem === 'Performance') {
//       setActiveView('performance');
//     } else if (menuItem === 'Work Report') {
//       setActiveView('work-report');
//     }
//   };

//   const handleAddPointsScheme = () => {
//     setEditingPointsScheme(null);
//     setShowAddPointsModal(true);
//   };

//   const handleEditPointsScheme = (scheme) => {
//     setEditingPointsScheme(scheme);
//     setShowAddPointsModal(true);
//   };

//   const handleDeletePointsScheme = (schemeId) => {
//     if (window.confirm('Are you sure you want to delete this points scheme?')) {
//       const updatedSchemes = pointsSchemes.filter(scheme => scheme.id !== schemeId);
//       setPointsSchemes(updatedSchemes);

//       // Save to localStorage
//       try {
//         localStorage.setItem('pointsSchemes', JSON.stringify(updatedSchemes));
//         console.log('✅ Points schemes updated in localStorage after deletion:', updatedSchemes.length, 'schemes');
//       } catch (error) {
//         console.error('❌ Error updating points schemes in localStorage:', error);
//       }
//     }
//   };


//   const handleSavePointsScheme = (schemeData) => {
//     let updatedSchemes;

//     if (editingPointsScheme) {
//       // Update existing scheme
//       updatedSchemes = pointsSchemes.map(scheme =>
//         scheme.id === editingPointsScheme.id
//           ? { ...schemeData, id: editingPointsScheme.id }
//           : scheme
//       );
//       setPointsSchemes(updatedSchemes);
//     } else {
//       // Add new scheme
//       const newId = Math.max(...pointsSchemes.map(p => p.id), 0) + 1;
//       const schemeToAdd = {
//         ...schemeData,
//         id: newId
//       };
//       updatedSchemes = [...pointsSchemes, schemeToAdd];
//       setPointsSchemes(updatedSchemes);
//     }

//     // Save to localStorage
//     try {
//       localStorage.setItem('pointsSchemes', JSON.stringify(updatedSchemes));
//       console.log('✅ Points schemes saved to localStorage:', updatedSchemes.length, 'schemes');
//     } catch (error) {
//       console.error('❌ Error saving points schemes to localStorage:', error);
//     }

//     setEditingPointsScheme(null);
//   };

//   const handleAddEmployee = async (employeeData) => {
//     // Validate that name exists and is a string
//     if (!employeeData.name || typeof employeeData.name !== 'string') {
//       console.error('Employee name is required and must be a string');
//       alert('Employee name is required and must be a valid string');
//       return;
//     }

//     // Check for duplicates before adding
//     if (!validateUniqueData(employeeData)) {
//       return; // Stop if duplicates found
//     }

//     const newUser = {
//       ...employeeData,
//       role: employeeData.role || 'employee', // Ensure role is set, default to 'employee'
//       payroll: `EMP${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
//       avatar: employeeData.name.trim().split(' ').map(n => n[0]).join('').toUpperCase(),
//       projectIds: [],
//       status: 'Active',
//       projectStatus: 'Not Assigned',
//       joinDate: employeeData.joinDate || new Date().toISOString().split('T')[0] // Ensure joinDate is set
//     };

//     try {
//       // Save to database
//       const savedUser = await createUser(newUser);

//       // Update local state with the saved user
//       const userWithId = {
//         ...newUser,
//         ...savedUser,
//         id: savedUser.id || savedUser._id || `EMP${String(allUsers.length + 1).padStart(3, '0')}`,
//         assignedProject: employeeData.assignedProject || null,
//         projectStatus: employeeData.assignedProject ? 'Assigned' : 'Not Assigned',
//         userType: 'Employee'
//       };

//       setAllUsers(prev => [...prev, userWithId]);

//       // Add notification for admin
//       notifyNewEmployeeAdded(userWithId.name, userWithId.department, userWithId.teamLeaderName);
//       setEmployees(prev => [...prev, userWithId]);

//       // Notify relevant project managers if user is assigned to a project
//       if (userWithId.assignedProject) {
//         const relatedProject = projects.find(p => p.name === userWithId.assignedProject);
//         if (relatedProject && relatedProject.projectManager) {
//           const pmNotification = {
//             id: `pm_notif_${Date.now()}`,
//             type: 'info',
//             title: 'New Team Member Added',
//             message: `${userWithId.name} has been assigned to your project "${relatedProject.name}"`,
//             time: 'Just now',
//             read: false,
//             projectName: relatedProject.name,
//             employeeName: userWithId.name,
//             targetPM: relatedProject.projectManager
//           };
//           setNotifications(prev => [pmNotification, ...prev]);

//           console.log(`📢 Notified PM ${relatedProject.projectManager} about new team member ${userWithId.name}`);
//         }
//       }

//       // Show success notification
//       const notification = {
//         id: `notif${Date.now()}`,
//         type: 'success',
//         title: 'Employee Added',
//         message: `${newUser.name} has been successfully added as ${newUser.role}`,
//         time: 'Just now',
//         read: false
//       };
//       setNotifications(prev => [notification, ...prev]);

//       // Force refresh PM data if current user is a PM
//       if (currentRole === 'project-manager') {
//         setTimeout(() => {
//           console.log('🔄 Refreshing PM data after user addition');
//           const updatedPMData = getProjectManagerData();
//           console.log('📊 Updated team members count:', updatedPMData.teamMembers.length);
//         }, 1000);
//       }

//     } catch (apiError) {
//       console.warn('API call failed, using local fallback:', apiError);
//       const userWithId = {
//         ...newUser,
//         id: `EMP${String(allUsers.length + 1).padStart(3, '0')}`,
//         _id: Date.now()
//       };
//       setAllUsers(prev => [...prev, userWithId]);
//       setEmployees(prev => [...prev, userWithId]);
//     }
//   };

//   const getEmployeesByRole = (role) => {
//     return employees.filter(emp => emp.role === role);
//   };

//   const getVisibleEmployees = () => {
//     if (currentRole === 'admin') {
//       return employees; // Admin sees all employees
//     } else if (currentRole === 'project-manager') {
//       return employees; // PM sees all employees and team leaders
//     } else if (currentRole === 'team-leader') {
//       // Team leader sees only their team members
//       const currentUser = employees.find(emp => emp.email === localStorage.getItem('userEmail'));
//       if (currentUser) {
//         return employees.filter(emp =>
//           emp.teamLeaderId === currentUser.id || emp.id === currentUser.id
//         );
//       }
//       return [];
//     }
//     return [];
//   };

//   const handleAssignToTeam = (employeeId, teamLeaderId) => {
//     setEmployees(prev => prev.map(emp =>
//       emp.id === employeeId
//         ? { ...emp, teamLeaderId }
//         : emp
//     ));
//   };

//   // Project Management Functions
//   const handleOpenAddProjectModal = async () => {
//     // Ensure project managers are loaded before opening modal
//     if (projectManagers.length === 0) {
//       console.log('🔄 No project managers found, reloading...');
//       await loadProjectManagers();
//     }

//     setEditingProject(null);
//     setShowAddProjectModal(true);
//   };

//   const handleEditProject = (project) => {
//     setEditingProject(project);
//     setShowAddProjectModal(true);
//   };

//   const handleDeleteProject = async (projectId, projectName) => {
//     if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
//       try {
//         await deleteProject(projectId);
//         setProjects(prev => prev.filter(p => p.id !== projectId));

//         // Unassign users from the deleted project
//         setAllUsers(prev => prev.map(user => {
//           if (user.assignedProject === projectName) {
//             return {
//               ...user,
//               projectStatus: 'Not Assigned',
//               assignedProject: null
//             };
//           }
//           return user;
//         }));

//         alert(`Project "${projectName}" has been deleted successfully!`);
//       } catch (error) {
//         console.error('Error deleting project:', error);
//         alert('Failed to delete project. Please try again.');
//       }
//     }
//   };

//   const handleViewProject = (project) => {
//     alert(`Project Details:\n\nName: ${project.name}\nClient: ${project.clientName}\nManager: ${project.projectManager}\nProgress: ${project.progress}%\nStatus: ${project.status}\nCost: $${project.projectCost}\nStart: ${project.startDate}\nEnd: ${project.endDate}\nDescription: ${project.description || 'No description'}`);
//   };

//   const handleAddProject = async (projectData) => {
//     try {
//       console.log('🚀 Creating project with data:', projectData);

//       // Transform data to match backend API expectations
//       const transformedData = {
//         name: projectData.name,
//         description: projectData.description || '',
//         clientName: projectData.clientName,
//         projectManager: projectData.projectManager,
//         assignedMembers: projectData.assignedMembers || [],
//         startDate: projectData.startDate,
//         endDate: projectData.endDate,
//         projectCost: parseFloat(projectData.projectCost) || 0,
//         advancePayment: parseFloat(projectData.advancePayment) || 0,
//         progress: parseInt(projectData.progress) || 0,
//         projectStatus: projectData.projectStatus === 'available' ? 'on-track' : projectData.projectStatus || 'assigned'
//       };

//       console.log('📝 Transformed data for backend:', transformedData);

//       // Validate required fields
//       if (!transformedData.name || !transformedData.clientName || !transformedData.projectManager ||
//         !transformedData.startDate || !transformedData.endDate || !transformedData.projectCost) {
//         throw new Error('Missing required fields. Please fill in all required fields.');
//       }

//       // Validate dates
//       if (new Date(transformedData.startDate) >= new Date(transformedData.endDate)) {
//         throw new Error('End date must be after start date.');
//       }

//       // Save to MongoDB
//       const savedProject = await createProject(transformedData);


//       // Transform and add to projects (for active projects view)
//       const newProject = {
//         id: savedProject._id,
//         name: savedProject.name,
//         date: new Date(savedProject.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
//         progress: savedProject.progress || 0,
//         status: savedProject.projectStatus === 'assigned' ? 'Assigned' :
//           savedProject.projectStatus === 'on-track' ? 'On Track' :
//             savedProject.projectStatus === 'at-risk' ? 'At Risk' :
//               savedProject.projectStatus === 'delayed' ? 'Delayed' :
//                 savedProject.projectStatus === 'completed' ? 'Completed' : 'On Track',
//         assigned: savedProject.assignedMembers && savedProject.assignedMembers.length > 0
//           ? savedProject.assignedMembers.map((member, index) => ({
//             name: member,
//             color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][index % 5]
//           }))
//           : [], // Empty array instead of "Not Assigned"
//         extra: 0,
//         clientName: savedProject.clientName,
//         startDate: savedProject.startDate,
//         endDate: savedProject.endDate,
//         description: savedProject.description,
//         projectCost: savedProject.projectCost,
//         advancePayment: savedProject.advancePayment,
//         projectManager: savedProject.projectManager
//       };
//       setProjects(prev => [...prev, newProject]);

//       // Update user assignments if project manager is assigned
//       if (savedProject.projectManager) {
//         setAllUsers(prev => prev.map(user => {
//           if (user.name === savedProject.projectManager) {
//             return {
//               ...user,
//               projectStatus: 'Assigned',
//               assignedProject: savedProject.name
//             };
//           }
//           return user;
//         }));
//       }

//       // Update assigned members if any
//       if (savedProject.assignedMembers && savedProject.assignedMembers.length > 0) {
//         setAllUsers(prev => prev.map(user => {
//           if (savedProject.assignedMembers.includes(user.name)) {
//             return {
//               ...user,
//               projectStatus: 'Assigned',
//               assignedProject: savedProject.name
//             };
//           }
//           return user;
//         }));
//       }

//       // Send notifications to assigned project manager and team members
//       const projectAssignees = [transformedData.projectManager, ...(transformedData.assignedMembers || [])];
//       const projectNotifications = projectAssignees.filter(Boolean).map((assignedUser, index) => ({
//         id: `project_notif${Date.now()}_${index}`,
//         type: 'project',
//         title: 'New Project Assignment',
//         message: `You have been assigned to project "${transformedData.name}" for client ${transformedData.clientName}`,
//         time: 'Just now',
//         read: false,
//         projectName: transformedData.name,
//         clientName: transformedData.clientName,
//         targetUser: assignedUser
//       }));

//       setNotifications(prev => [...projectNotifications, ...prev]);

//       // Trigger real-time refresh for affected users
//       console.log(`📢 Sent ${projectNotifications.length} project assignment notifications`);

//       // Show success message
//       const notification = {
//         id: `notif${Date.now()}`,
//         type: 'success',
//         title: 'Project Added',
//         message: `Project "${transformedData.name}" has been added successfully`,
//         time: 'Just now',
//         read: false
//       };
//       setNotifications(prev => [notification, ...prev]);

//       // Add to recent activity
//       addRecentActivity({
//         title: 'New Project Created',
//         description: `Project "${transformedData.name}" was created`,
//         icon: 'fa-project-diagram',
//         iconBg: 'bg-info',
//         timeAgo: 'Just now',
//         details: `Client: ${transformedData.clientName} | Manager: ${transformedData.projectManager} | Budget: $${(transformedData.projectCost || 0).toLocaleString()}`
//       });

//       // Notify admin about new project
//       notifyNewProjectAdded(transformedData.name, transformedData.clientName, transformedData.projectManager);

//       // Check if advance payment was made
//       if (transformedData.advancePayment && transformedData.advancePayment > 0) {
//         notifyAdvancePaymentReceived(transformedData.advancePayment, transformedData.name, transformedData.clientName);
//       }

//       // Trigger real-time refresh for affected users
//       setTimeout(async () => {
//         await Promise.all([
//           loadProjects(),
//           loadTasks()
//         ]);
//       }, 500);

//       alert(`Project "${transformedData.name}" has been added successfully and assigned users have been notified!`);
//     } catch (error) {
//       console.error('❌ Error adding project:', error);
//       console.error('❌ Error details:', error.response?.data || error.message);
//       console.error('❌ Full error object:', error);

//       const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
//       alert(`Failed to add project: ${errorMessage}`);
//     }
//   };

//   // Handle dynamic project assignment with real-time updates
//   const handleDynamicProjectAssignment = async (managerId, projectId, projectName, managerName) => {
//     try {
//       // Assign project to manager via API
//       await assignProjectToManager(managerId, projectId);

//       // Send notification to the project manager
//       const notification = {
//         id: `assign_notif${Date.now()}`,
//         type: 'project',
//         title: 'New Project Assignment',
//         message: `You have been assigned as manager for project "${projectName}"`,
//         time: 'Just now',
//         read: false,
//         projectId: projectId,
//         projectName: projectName,
//         assignedTo: managerName
//       };

//       setNotifications(prev => [notification, ...prev]);

//       // Trigger real-time refresh for the project manager
//       setTimeout(async () => {
//         await Promise.all([
//           loadProjects(),
//           loadTasks(),
//           loadProjectManagers()
//         ]);
//       }, 500);

//       // Add to recent activity
//       addRecentActivity({
//         title: 'Project Assignment',
//         description: `Project "${projectName}" assigned to ${managerName}`,
//         icon: 'fa-user-tie',
//         iconBg: 'bg-success',
//         timeAgo: 'Just now',
//         details: `Manager: ${managerName} | Project: ${projectName}`
//       });

//       console.log(`✅ Project "${projectName}" assigned to ${managerName} with real-time updates`);

//     } catch (error) {
//       console.error('Error assigning project:', error);
//       alert('Failed to assign project. Please try again.');
//     }
//   };

//   const handleUpdateProject = async (projectData) => {
//     try {
//       const projectId = editingProject.id || editingProject._id;

//       // Transform data to match backend API expectations
//       const transformedData = {
//         name: projectData.name,
//         description: projectData.description || '',
//         clientName: projectData.clientName,
//         projectManager: projectData.projectManager,
//         assignedMembers: projectData.assignedMembers || [],
//         startDate: projectData.startDate,
//         endDate: projectData.endDate,
//         projectCost: parseFloat(projectData.projectCost) || 0,
//         advancePayment: parseFloat(projectData.advancePayment) || 0,
//         progress: parseInt(projectData.progress) || 0,
//         projectStatus: projectData.projectStatus === 'available' ? 'on-track' : projectData.projectStatus || 'on-track'
//       };

//       // Update in MongoDB
//       const updatedProject = await updateProject(projectId, transformedData);

//       // Transform and update in projects array
//       const updatedProjectData = {
//         id: updatedProject._id || projectId,
//         name: updatedProject.name,
//         date: new Date(updatedProject.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
//         progress: updatedProject.progress || 0,
//         status: updatedProject.projectStatus === 'assigned' ? 'Assigned' :
//           updatedProject.projectStatus === 'on-track' ? 'On Track' :
//             updatedProject.projectStatus === 'at-risk' ? 'At Risk' :
//               updatedProject.projectStatus === 'delayed' ? 'Delayed' :
//                 updatedProject.projectStatus === 'completed' ? 'Completed' : 'On Track',
//         assigned: updatedProject.assignedMembers && updatedProject.assignedMembers.length > 0
//           ? updatedProject.assignedMembers.map((member, index) => ({
//             name: member,
//             color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][index % 5]
//           }))
//           : [], // Empty array instead of "Not Assigned"
//         extra: 0,
//         clientName: updatedProject.clientName,
//         startDate: updatedProject.startDate,
//         endDate: updatedProject.endDate,
//         description: updatedProject.description,
//         projectCost: updatedProject.projectCost,
//         advancePayment: updatedProject.advancePayment,
//         projectManager: updatedProject.projectManager
//       };

//       // Update the project in the projects array
//       setProjects(prev => {
//         const updatedProjects = prev.map(project => {
//           if (project.id === projectId || project._id === projectId) {
//             // Check if project is being completed (progress reaches 100%)
//             if (updatedProjectData.progress >= 100 && project.progress < 100) {
//               const currentUser = localStorage.getItem('userName') || 'System';
//               notifyProjectCompleted(updatedProjectData.name, currentUser);
//             }
//             return updatedProjectData;
//           }
//           return project;
//         });
//         // Save to localStorage immediately
//         saveProjectsToLocalStorage(updatedProjects);
//         return updatedProjects;
//       });

//       // Update user assignments - first remove old assignments for this project
//       setAllUsers(prev => prev.map(user => {
//         if (user.assignedProject === editingProject.name) {
//           return {
//             ...user,
//             projectStatus: 'Not Assigned',
//             assignedProject: null
//           };
//         }
//         return user;
//       }));

//       // Then assign new project manager and members
//       if (updatedProject.projectManager) {
//         setAllUsers(prev => prev.map(user => {
//           if (user.name === updatedProject.projectManager) {
//             return {
//               ...user,
//               projectStatus: 'Assigned',
//               assignedProject: updatedProject.name
//             };
//           }
//           return user;
//         }));
//       }

//       if (updatedProject.assignedMembers && updatedProject.assignedMembers.length > 0) {
//         setAllUsers(prev => prev.map(user => {
//           if (updatedProject.assignedMembers.includes(user.name)) {
//             return {
//               ...user,
//               projectStatus: 'Assigned',
//               assignedProject: updatedProject.name
//             };
//           }
//           return user;
//         }));
//       }

//       // Show success message
//       const notification = {
//         id: `notif${Date.now()}`,
//         type: 'success',
//         title: 'Project Updated',
//         message: `Project "${transformedData.name}" has been updated successfully`,
//         time: 'Just now',
//         read: false
//       };
//       setNotifications(prev => [notification, ...prev]);

//       // Add to recent activity
//       addRecentActivity({
//         title: 'Project Updated',
//         description: `Project "${transformedData.name}" was updated`,
//         icon: 'fa-edit',
//         iconBg: 'bg-warning',
//         timeAgo: 'Just now',
//         details: `Client: ${transformedData.clientName} | Manager: ${transformedData.projectManager} | Budget: $${(transformedData.projectCost || 0).toLocaleString()}`
//       });

//       alert(`Project "${transformedData.name}" has been updated successfully!`);
//     } catch (error) {
//       console.error('Error updating project:', error);
//       console.error('Error details:', error.response?.data || error.message);

//       const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
//       alert(`Failed to update project: ${errorMessage}`);
//     }
//   };

//   const handleSaveProject = (projectData) => {
//     if (editingProject) {
//       handleUpdateProject(projectData);
//     } else {
//       handleAddProject(projectData);
//     }
//     setShowAddProjectModal(false);
//     setEditingProject(null);
//   };

//   // User Management Functions
//   const handleAddUser = async (userData) => {
//     // Check for duplicate email
//     const existingUserByEmail = allUsers.find(user =>
//       user.email && user.email.toLowerCase().trim() === userData.email.toLowerCase().trim()
//     );

//     if (existingUserByEmail) {
//       alert(`❌ Email "${userData.email}" already exists!\n\nUser: ${existingUserByEmail.name}\nRole: ${existingUserByEmail.role}\n\nPlease use a different email address.`);
//       return;
//     }

//     // Check for duplicate phone number (if provided)
//     if (userData.phone && userData.phone.trim()) {
//       const existingUserByPhone = allUsers.find(user =>
//         user.phone && user.phone.trim() === userData.phone.trim()
//       );

//       if (existingUserByPhone) {
//         alert(`❌ Phone number "${userData.phone}" already exists!\n\nUser: ${existingUserByPhone.name}\nEmail: ${existingUserByPhone.email}\n\nPlease use a different phone number.`);
//         return;
//       }
//     }

//     // Check for duplicate name (warning only, not blocking)
//     const existingUserByName = allUsers.find(user =>
//       user.name && user.name.toLowerCase().trim() === userData.name.toLowerCase().trim()
//     );

//     if (existingUserByName) {
//       const confirmAdd = window.confirm(`⚠️ Warning: A user with name "${userData.name}" already exists!\n\nExisting user:\nEmail: ${existingUserByName.email}\nRole: ${existingUserByName.role}\n\nDo you still want to add this user?`);
//       if (!confirmAdd) {
//         return;
//       }
//     }

//     // Generate appropriate ID based on role
//     const generateUserId = (role) => {
//       const count = allUsers.length + 1;
//       switch (role) {
//         case 'project-manager':
//           return `PM${String(count).padStart(3, '0')}`;
//         case 'team-leader':
//           return `TL${String(count).padStart(3, '0')}`;
//         case 'intern':
//           return `INT${String(count).padStart(3, '0')}`;
//         default:
//           return `EMP${String(count).padStart(3, '0')}`;
//       }
//     };

//     try {
//       const newUser = {
//         name: userData.name,
//         role: userData.role || userData.department, // Use role or department
//         userType: userData.role === 'intern' ? 'Intern' :
//           userData.role === 'employee' ? 'Employee' :
//             userData.role === 'team-leader' ? 'Team Leader' :
//               userData.role === 'project-manager' ? 'Project Manager' : 'Employee', // Set userType for consistency
//         email: userData.email,
//         phone: userData.phone || null, // Add phone number
//         password: userData.password || 'defaultPassword123', // Add default password
//         avatar: userData.name.charAt(0).toUpperCase(),
//         manager: null, // No specific manager for admin-created users
//         attendance: {
//           present: 0,
//           absent: 0,
//           late: 0,
//           percentage: 0
//         },
//         meetingAttendance: {
//           attended: 0,
//           missed: 0,
//           percentage: 0
//         },
//         recentActivity: [],
//         dailyPerformance: {
//           overallRating: 0,
//           tasksCompleted: 0,
//           codeQuality: 0,
//           collaboration: 0,
//           innovation: 0,
//           recentScores: []
//         },
//         projectUpdates: [],
//         // Keep the original fields for compatibility
//         department: userData.department,
//         projectStatus: userData.assignedProject ? 'Assigned' : 'Not Assigned',
//         assignedProject: userData.assignedProject || null,
//         joinDate: new Date().toISOString().split('T')[0],
//         status: 'Active'
//       };


//       // Clean the data for API - only send essential fields
//       const cleanUserData = {
//         name: newUser.name,
//         email: newUser.email,
//         phone: newUser.phone,
//         role: newUser.role,
//         department: newUser.department,
//         password: newUser.password,
//         assignedProject: newUser.assignedProject,
//         projectStatus: newUser.projectStatus,
//         status: newUser.status,
//         joinDate: newUser.joinDate
//       };

//       try {
//         console.log('📤 Sending user data to API:', cleanUserData);
//         const savedUser = await createUser(cleanUserData);
//         // Ensure the user has an ID for display and preserve all fields
//         const userWithId = {
//           ...newUser,
//           ...savedUser,
//           id: savedUser.id || savedUser._id || generateUserId(userData.role),
//           assignedProject: userData.assignedProject || null,
//           projectStatus: userData.assignedProject ? 'Assigned' : 'Not Assigned',
//           teamLeaderId: userData.teamLeaderId || null,
//           teamLeaderName: userData.teamLeaderId ? teamLeaders.find(tl => (tl.id || tl._id) === userData.teamLeaderId)?.name : null
//         };
//         setAllUsers(prev => {
//           const updatedUsers = [...prev, userWithId];
//           console.log('💾 Saving user after successful API call:', userWithId.name);
//           saveUsersToLocalStorage(updatedUsers);
//           return updatedUsers;
//         });

//         // Add to specific role arrays if applicable
//         if (userData.role === 'team-leader') {
//           // State update removed as teamLeaders is now derived
//           /*
//           setTeamLeaders(prev => [...prev, {
//             ...userWithId,
//             teamSize: 0,
//             projectsAssigned: 0,
//             status: 'Active'
//           }]);
//           */
//         } else if (userData.role === 'project-manager') {
//           setProjectManagers(prev => [...prev, {
//             ...userWithId,
//             assignedProjects: [],
//             teamSize: 0,
//             projectsAssigned: 0,
//             status: 'Active'
//           }]);
//         }

//         // Update project if user is assigned to one
//         if (userData.assignedProject) {
//           console.log('🔄 Updating project assignment for user:', userData.name, 'to project:', userData.assignedProject);
//           setProjects(prev => {
//             console.log('📋 Current projects:', prev.map(p => p.name));
//             const updatedProjects = prev.map(project => {
//               console.log('🔍 Checking project:', project.name, 'against:', userData.assignedProject);
//               if (project.name === userData.assignedProject || project.name.toLowerCase() === userData.assignedProject.toLowerCase()) {
//                 console.log('✅ Found matching project, updating...');
//                 // Add user to project's assigned members
//                 const currentAssigned = project.assigned || [];
//                 const isAlreadyAssigned = currentAssigned.some(member => member.name === userData.name);

//                 console.log('👥 Current assigned members:', currentAssigned.map(m => m.name));
//                 console.log('🔍 Is already assigned?', isAlreadyAssigned);

//                 if (!isAlreadyAssigned) {
//                   const newMember = {
//                     name: userData.name,
//                     color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][currentAssigned.length % 5]
//                   };

//                   console.log('➕ Adding new member:', newMember);

//                   const updatedProject = {
//                     ...project,
//                     assigned: [...currentAssigned, newMember],
//                     assignedMembers: [...(project.assignedMembers || []), userData.name]
//                   };

//                   console.log('📝 Updated project:', updatedProject.name, 'assigned:', updatedProject.assigned.map(m => m.name));
//                   return updatedProject;
//                 }
//               }
//               return project;
//             });
//             // Save updated projects to localStorage
//             saveProjectsToLocalStorage(updatedProjects);
//             console.log('💾 Saved updated projects to localStorage');
//             return updatedProjects;
//           });
//         }

//         // Add to recent activity
//         addRecentActivity({
//           title: 'New User Added',
//           description: `${userData.name} was added to the system`,
//           icon: 'fa-user-plus',
//           iconBg: 'bg-success',
//           timeAgo: 'Just now',
//           details: `Role: ${userData.role || userData.department} | Email: ${userData.email}${userData.assignedProject ? ` | Project: ${userData.assignedProject}` : ''}`
//         });

//         // Force sync project assignments after adding user
//         setTimeout(() => {
//           console.log('🔄 Force syncing project assignments after API user creation');
//           forceSyncProjectAssignments();

//           // Additional force update for projects
//           if (userData.assignedProject) {
//             console.log('🔄 Additional project sync for:', userData.assignedProject);
//             setProjects(prev => {
//               const updated = prev.map(project => {
//                 if (project.name === userData.assignedProject || project.name.toLowerCase() === userData.assignedProject.toLowerCase()) {
//                   const currentAssigned = project.assigned || [];
//                   const isAlreadyAssigned = currentAssigned.some(member => member.name === userData.name);

//                   if (!isAlreadyAssigned) {
//                     const newMember = {
//                       name: userData.name,
//                       color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][currentAssigned.length % 5]
//                     };

//                     return {
//                       ...project,
//                       assigned: [...currentAssigned, newMember],
//                       assignedMembers: [...(project.assignedMembers || []), userData.name]
//                     };
//                   }
//                 }
//                 return project;
//               });
//               saveProjectsToLocalStorage(updated);
//               return updated;
//             });
//           }
//         }, 100);

//         // Notify admin about new user
//         const currentUser = localStorage.getItem('userName') || 'System';
//         notifyNewUserAdded(userData.name, userData.role || userData.department, currentUser);

//         alert(`User "${userData.name}" has been added successfully and saved to database!`);
//         setShowAddUserModal(false);
//       } catch (apiError) {
//         // Enhanced error logging
//         console.error('❌ API call failed with details:');
//         console.error('Error message:', apiError.message);
//         console.error('Status:', apiError.response?.status);
//         console.error('Status text:', apiError.response?.statusText);
//         console.error('Response data:', apiError.response?.data);
//         console.error('Sent data:', cleanUserData);
//         console.error('Full error object:', apiError);

//         // Check if it's a duplicate email error
//         const isDuplicateEmail = apiError.response?.data?.message?.includes('email already exists');
//         if (isDuplicateEmail) {
//           console.log('⚠️ Duplicate email detected - user will be saved locally only');
//         }

//         // Fallback: Add to local state with generated ID
//         console.warn('🔄 Using local fallback for user creation');
//         const userWithId = {
//           ...newUser,
//           id: generateUserId(userData.role),
//           _id: Date.now(),
//           teamLeaderId: userData.teamLeaderId || null,
//           teamLeaderName: userData.teamLeaderId ? teamLeaders.find(tl => (tl.id || tl._id) === userData.teamLeaderId)?.name : null
//         };

//         setAllUsers(prev => {
//           const updatedUsers = [...prev, userWithId];
//           console.log('💾 Saving user via local fallback:', userWithId.name);
//           saveUsersToLocalStorage(updatedUsers);
//           return updatedUsers;
//         });

//         // Add to specific role arrays if applicable
//         if (userData.role === 'team-leader') {
//           // setTeamLeaders removed

//         } else if (userData.role === 'project-manager') {
//           setProjectManagers(prev => [...prev, {
//             ...userWithId,
//             assignedProjects: [],
//             teamSize: 0,
//             projectsAssigned: 0,
//             status: 'Active'
//           }]);
//         }

//         // Update project if user is assigned to one (fallback)
//         if (userData.assignedProject) {
//           console.log('🔄 [FALLBACK] Updating project assignment for user:', userData.name, 'to project:', userData.assignedProject);
//           setProjects(prev => {
//             console.log('📋 [FALLBACK] Current projects:', prev.map(p => p.name));
//             const updatedProjects = prev.map(project => {
//               console.log('🔍 [FALLBACK] Checking project:', project.name, 'against:', userData.assignedProject);
//               if (project.name === userData.assignedProject || project.name.toLowerCase() === userData.assignedProject.toLowerCase()) {
//                 console.log('✅ [FALLBACK] Found matching project, updating...');
//                 // Add user to project's assigned members
//                 const currentAssigned = project.assigned || [];
//                 const isAlreadyAssigned = currentAssigned.some(member => member.name === userData.name);

//                 console.log('👥 [FALLBACK] Current assigned members:', currentAssigned.map(m => m.name));
//                 console.log('🔍 [FALLBACK] Is already assigned?', isAlreadyAssigned);

//                 if (!isAlreadyAssigned) {
//                   const newMember = {
//                     name: userData.name,
//                     color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][currentAssigned.length % 5]
//                   };

//                   console.log('➕ [FALLBACK] Adding new member:', newMember);

//                   const updatedProject = {
//                     ...project,
//                     assigned: [...currentAssigned, newMember],
//                     assignedMembers: [...(project.assignedMembers || []), userData.name]
//                   };

//                   console.log('📝 [FALLBACK] Updated project:', updatedProject.name, 'assigned:', updatedProject.assigned.map(m => m.name));
//                   return updatedProject;
//                 }
//               }
//               return project;
//             });
//             // Save updated projects to localStorage
//             saveProjectsToLocalStorage(updatedProjects);
//             console.log('💾 [FALLBACK] Saved updated projects to localStorage');
//             return updatedProjects;
//           });
//         }

//         // Add to recent activity
//         addRecentActivity({
//           title: 'New User Added',
//           description: `${userData.name} was added to the system`,
//           icon: 'fa-user-plus',
//           iconBg: 'bg-success',
//           timeAgo: 'Just now',
//           details: `Role: ${userData.role || userData.department} | Email: ${userData.email}${userData.assignedProject ? ` | Project: ${userData.assignedProject}` : ''}`
//         });

//         // Force sync project assignments after adding user locally
//         setTimeout(() => {
//           console.log('🔄 Force syncing project assignments after local user creation');
//           forceSyncProjectAssignments();

//           // Additional force update for projects (fallback)
//           if (userData.assignedProject) {
//             console.log('🔄 [FALLBACK] Additional project sync for:', userData.assignedProject);
//             setProjects(prev => {
//               const updated = prev.map(project => {
//                 if (project.name === userData.assignedProject || project.name.toLowerCase() === userData.assignedProject.toLowerCase()) {
//                   const currentAssigned = project.assigned || [];
//                   const isAlreadyAssigned = currentAssigned.some(member => member.name === userData.name);

//                   if (!isAlreadyAssigned) {
//                     const newMember = {
//                       name: userData.name,
//                       color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][currentAssigned.length % 5]
//                     };

//                     return {
//                       ...project,
//                       assigned: [...currentAssigned, newMember],
//                       assignedMembers: [...(project.assignedMembers || []), userData.name]
//                     };
//                   }
//                 }
//                 return project;
//               });
//               saveProjectsToLocalStorage(updated);
//               return updated;
//             });
//           }
//         }, 100);

//         // Show appropriate message based on error type (reuse the isDuplicateEmail variable from above)
//         if (isDuplicateEmail) {
//           alert(`User "${userData.name}" has been added locally!\n\nNote: This email already exists in the database, so the user was saved locally only. The user will persist in your current session.`);
//         } else {
//           alert(`User "${userData.name}" has been added successfully (local storage)!\n\nNote: Database connection failed, but the user is saved locally and will persist.`);
//         }
//         setShowAddUserModal(false);
//       }
//     } catch (error) {
//       console.error('Error adding user:', error);
//       alert('Failed to add user. Please try again.');
//     }
//   };

//   const handleEditUser = (user) => {
//     setEditingUser(user);
//     setShowAddUserModal(true);
//   };

//   const handleUpdateUser = async (userData) => {
//     console.log('handleUpdateUser called with:', userData);
//     console.log('editingUser:', editingUser);

//     if (!editingUser) {
//       console.error('No editingUser found!');
//       alert('Error: No user selected for editing');
//       return;
//     }

//     // Check for duplicates before updating (exclude current user)
//     if (!validateUniqueData(userData, editingUser.id || editingUser._id)) {
//       return; // Stop if duplicates found
//     }

//     const updatedUserData = {
//       name: userData.name,
//       email: userData.email,
//       department: userData.department,
//       role: userData.role,
//       userType: userData.role === 'intern' ? 'Intern' :
//         userData.role === 'employee' ? 'Employee' :
//           userData.role === 'team-leader' ? 'Team Leader' :
//             userData.role === 'project-manager' ? 'Project Manager' : 'Employee',
//       projectStatus: userData.assignedProject ? 'Assigned' : 'Not Assigned',
//       assignedProject: userData.assignedProject || null,
//       teamLeaderId: userData.teamLeaderId || null,
//       teamLeaderName: userData.teamLeaderId ? teamLeaders.find(tl => (tl.id || tl._id) === userData.teamLeaderId)?.name : null,
//       phone: userData.phone || editingUser.phone
//     };

//     console.log('updatedUserData:', updatedUserData);

//     const userId = editingUser.id || editingUser._id;
//     const oldRole = editingUser.role;
//     const newRole = userData.role;

//     console.log(`Updating user ${userId}: ${oldRole} → ${newRole}`);

//     try {

//       // Try to update via API if user has a real database ID
//       if (userId && !userId.startsWith('EMP') && !userId.startsWith('PM') && !userId.startsWith('TL') && !userId.startsWith('INT')) {
//         const updatedUser = await updateUser(userId, updatedUserData);
//         setAllUsers(prev => {
//           const updated = prev.map(user =>
//             (user.id === userId || user._id === userId) ?
//               { ...user, ...updatedUser, ...updatedUserData } : user
//           );
//           console.log('Updated allUsers array:', updated.find(u => (u.id === userId || u._id === userId)));
//           // Save to localStorage immediately
//           saveUsersToLocalStorage(updated);
//           return updated;
//         });
//       } else {
//         // Update local state for generated IDs
//         setAllUsers(prev => {
//           const updated = prev.map(user =>
//             (user.id === userId || user._id === userId) ?
//               { ...user, ...updatedUserData } : user
//           );
//           console.log('Updated allUsers array (local):', updated.find(u => (u.id === userId || u._id === userId)));
//           // Save to localStorage immediately
//           saveUsersToLocalStorage(updated);
//           return updated;
//         });
//       }

//       // Handle project assignment changes
//       const oldProject = editingUser.assignedProject;
//       const newProject = userData.assignedProject;

//       if (oldProject !== newProject) {
//         setProjects(prev => {
//           const updatedProjects = prev.map(project => {
//             // Remove user from old project
//             if (project.name === oldProject) {
//               return {
//                 ...project,
//                 assigned: (project.assigned || []).filter(member => member.name !== userData.name),
//                 assignedMembers: (project.assignedMembers || []).filter(member => member !== userData.name)
//               };
//             }

//             // Add user to new project
//             if (project.name === newProject) {
//               const currentAssigned = project.assigned || [];
//               const isAlreadyAssigned = currentAssigned.some(member => member.name === userData.name);

//               if (!isAlreadyAssigned) {
//                 const newMember = {
//                   name: userData.name,
//                   color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][currentAssigned.length % 5]
//                 };

//                 return {
//                   ...project,
//                   assigned: [...currentAssigned, newMember],
//                   assignedMembers: [...(project.assignedMembers || []), userData.name]
//                 };
//               }
//             }

//             return project;
//           });
//           // Save updated projects to localStorage
//           saveProjectsToLocalStorage(updatedProjects);
//           return updatedProjects;
//         });
//       }

//       // Update user references across all data structures when name changes
//       const oldName = editingUser.name;
//       const newName = userData.name;

//       if (oldName !== newName) {
//         console.log(`🔄 Updating user name references: ${oldName} → ${newName}`);

//         // Update project assignments (both assigned array and assignedMembers)
//         setProjects(prev => {
//           const updatedProjects = prev.map(project => {
//             let projectUpdated = false;

//             // Update assigned array (visual members)
//             const updatedAssigned = (project.assigned || []).map(member => {
//               if (member.name === oldName) {
//                 projectUpdated = true;
//                 return { ...member, name: newName };
//               }
//               return member;
//             });

//             // Update assignedMembers array
//             const updatedAssignedMembers = (project.assignedMembers || []).map(memberName =>
//               memberName === oldName ? newName : memberName
//             );

//             // Update project manager
//             const updatedProjectManager = project.projectManager === oldName ? newName : project.projectManager;

//             if (projectUpdated || project.projectManager === oldName) {
//               console.log(`📝 Updated project "${project.name}" - changed ${oldName} to ${newName}`);
//               return {
//                 ...project,
//                 assigned: updatedAssigned,
//                 assignedMembers: updatedAssignedMembers,
//                 projectManager: updatedProjectManager
//               };
//             }

//             return project;
//           });

//           if (updatedProjects.some((p, i) => p !== prev[i])) {
//             saveProjectsToLocalStorage(updatedProjects);
//           }

//           return updatedProjects;
//         });

//         // Update team leader assignments
//         // setTeamLeaders removed


//         // Update project manager assignments
//         setProjectManagers(prev => prev.map(manager => {
//           if (manager.name === oldName) {
//             console.log(`📝 Updated project manager name: ${oldName} → ${newName}`);
//             return { ...manager, name: newName, email: userData.email };
//           }
//           return manager;
//         }));
//       }

//       // Handle role changes - add/remove from specific role arrays
//       if (oldRole !== newRole) {
//         // Remove from old role array (but keep in allUsers)
//         if (oldRole === 'project-manager') {
//           setProjectManagers(prev => prev.filter(pm => (pm.id || pm._id) !== userId));
//         }

//         // Add to new role array (user already updated in allUsers above)
//         if (newRole === 'project-manager') {
//           const updatedUser = { ...editingUser, ...updatedUserData, assignedProjects: [], teamSize: 0, projectsAssigned: 0, status: 'Active' };
//           setProjectManagers(prev => [...prev, updatedUser]);
//         }
//       }

//       console.log('User update successful');
//       alert(`User "${userData.name}" has been updated successfully!`);
//       setEditingUser(null);
//       // Don't close modal here - let AddUserModal handle it
//     } catch (error) {
//       console.error('Error updating user:', error);
//       console.error('Error details:', error.message);
//       // Fallback: update local state even if API fails

//       setAllUsers(prev => {
//         const updated = prev.map(user =>
//           (user.id === userId || user._id === userId) ?
//             { ...user, ...updatedUserData } : user
//         );
//         // Save to localStorage immediately
//         saveUsersToLocalStorage(updated);
//         return updated;
//       });

//       // Handle project assignment changes in fallback as well
//       const oldProject = editingUser.assignedProject;
//       const newProject = userData.assignedProject;

//       if (oldProject !== newProject) {
//         setProjects(prev => {
//           const updatedProjects = prev.map(project => {
//             // Remove user from old project
//             if (project.name === oldProject) {
//               return {
//                 ...project,
//                 assigned: (project.assigned || []).filter(member => member.name !== userData.name),
//                 assignedMembers: (project.assignedMembers || []).filter(member => member !== userData.name)
//               };
//             }

//             // Add user to new project
//             if (project.name === newProject) {
//               const currentAssigned = project.assigned || [];
//               const isAlreadyAssigned = currentAssigned.some(member => member.name === userData.name);

//               if (!isAlreadyAssigned) {
//                 const newMember = {
//                   name: userData.name,
//                   color: ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-secondary'][currentAssigned.length % 5]
//                 };

//                 return {
//                   ...project,
//                   assigned: [...currentAssigned, newMember],
//                   assignedMembers: [...(project.assignedMembers || []), userData.name]
//                 };
//               }
//             }

//             return project;
//           });
//           // Save updated projects to localStorage
//           saveProjectsToLocalStorage(updatedProjects);
//           return updatedProjects;
//         });
//       }

//       // Update user references across all data structures when name changes (fallback)
//       const oldName = editingUser.name;
//       const newName = userData.name;

//       if (oldName !== newName) {
//         console.log(`🔄 [FALLBACK] Updating user name references: ${oldName} → ${newName}`);

//         // Update project assignments (both assigned array and assignedMembers)
//         setProjects(prev => {
//           const updatedProjects = prev.map(project => {
//             let projectUpdated = false;

//             // Update assigned array (visual members)
//             const updatedAssigned = (project.assigned || []).map(member => {
//               if (member.name === oldName) {
//                 projectUpdated = true;
//                 return { ...member, name: newName };
//               }
//               return member;
//             });

//             // Update assignedMembers array
//             const updatedAssignedMembers = (project.assignedMembers || []).map(memberName =>
//               memberName === oldName ? newName : memberName
//             );

//             // Update project manager
//             const updatedProjectManager = project.projectManager === oldName ? newName : project.projectManager;

//             if (projectUpdated || project.projectManager === oldName) {
//               console.log(`📝 [FALLBACK] Updated project "${project.name}" - changed ${oldName} to ${newName}`);
//               return {
//                 ...project,
//                 assigned: updatedAssigned,
//                 assignedMembers: updatedAssignedMembers,
//                 projectManager: updatedProjectManager
//               };
//             }

//             return project;
//           });

//           if (updatedProjects.some((p, i) => p !== prev[i])) {
//             saveProjectsToLocalStorage(updatedProjects);
//           }

//           return updatedProjects;
//         });

//         // Update team leader assignments
//         // setTeamLeaders removed


//         // Update project manager assignments
//         setProjectManagers(prev => prev.map(manager => {
//           if (manager.name === oldName) {
//             console.log(`📝 [FALLBACK] Updated project manager name: ${oldName} → ${newName}`);
//             return { ...manager, name: newName, email: userData.email };
//           }
//           return manager;
//         }));
//       }

//       // Handle role changes in fallback as well
//       if (oldRole !== newRole) {
//         // Remove from old role array
//         if (oldRole === 'team-leader') {
//           // setTeamLeaders removed

//         } else if (oldRole === 'project-manager') {
//           setProjectManagers(prev => prev.filter(pm => (pm.id || pm._id) !== userId));
//         }

//         // Add to new role array
//         if (newRole === 'team-leader') {
//           const updatedUser = { ...editingUser, ...updatedUserData, teamSize: 0, projectsAssigned: 0, status: 'Active' };
//           // setTeamLeaders removed

//         } else if (newRole === 'project-manager') {
//           const updatedUser = { ...editingUser, ...updatedUserData, assignedProjects: [], teamSize: 0, projectsAssigned: 0, status: 'Active' };
//           setProjectManagers(prev => [...prev, updatedUser]);
//         }
//       }

//       alert(`User "${userData.name}" has been updated locally. API update may have failed.`);
//       setEditingUser(null);
//       // Don't close modal here - let AddUserModal handle it
//     }
//   };

//   const handleDeleteUser = async (userId, userName) => {
//     if (window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
//       console.log(`🗑️ Starting deletion process for user: ${userName} (ID: ${userId})`);

//       try {
//         // Find the user to delete
//         const userToDelete = allUsers.find(user => user.id === userId || user._id === userId);
//         console.log('👤 User to delete:', userToDelete);

//         // Always try to delete from MongoDB API (remove the ID prefix restriction)
//         if (userId) {
//           try {
//             console.log('🌐 Attempting MongoDB deletion...');

//             // Try different endpoints based on user role
//             if (userToDelete?.role === 'project-manager' || userToDelete?.userType === 'Project Manager') {
//               console.log('📋 Deleting Project Manager from MongoDB...');
//               const result = await deleteProjectManager(userId);
//               console.log('✅ Project Manager deleted from MongoDB:', result);
//             } else if (userToDelete?.role === 'team-leader' || userToDelete?.userType === 'Team Leader') {
//               console.log('👥 Deleting Team Leader from MongoDB...');
//               const result = await deleteTeamLeader(userId);
//               console.log('✅ Team Leader deleted from MongoDB:', result);
//             } else {
//               console.log('👤 Deleting User/Employee from MongoDB...');
//               const result = await deleteUser(userId);
//               console.log('✅ User deleted from MongoDB:', result);
//             }

//             console.log('🎉 MongoDB deletion successful!');
//           } catch (apiError) {
//             console.error('❌ MongoDB deletion failed:', apiError);
//             console.error('Error details:', {
//               message: apiError.message,
//               status: apiError.response?.status,
//               data: apiError.response?.data
//             });

//             // Show user that MongoDB sync failed but continue with local deletion
//             alert(`Warning: Failed to delete "${userName}" from database (${apiError.message}). The user will be removed locally but may reappear on refresh.`);
//           }
//         } else {
//           console.log('⚠️ No valid userId provided, skipping MongoDB deletion');
//         }

//         // Remove from ALL state arrays to ensure complete deletion
//         setAllUsers(prev => prev.filter(user =>
//           (user.id !== userId) && (user._id !== userId)
//         ));

//         setProjectManagers(prev => prev.filter(pm =>
//           (pm.id !== userId) && (pm._id !== userId)
//         ));

//         // setTeamLeaders removed


//         // Also remove from localStorage to prevent reappearing on refresh
//         const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
//         const updatedUsers = currentUsers.filter(user =>
//           (user.id !== userId) && (user._id !== userId)
//         );
//         localStorage.setItem('users', JSON.stringify(updatedUsers));

//         const currentPMs = JSON.parse(localStorage.getItem('projectManagers') || '[]');
//         const updatedPMs = currentPMs.filter(pm =>
//           (pm.id !== userId) && (pm._id !== userId)
//         );
//         localStorage.setItem('projectManagers', JSON.stringify(updatedPMs));

//         const currentTLs = JSON.parse(localStorage.getItem('teamLeaders') || '[]');
//         const updatedTLs = currentTLs.filter(tl =>
//           (tl.id !== userId) && (tl._id !== userId)
//         );
//         localStorage.setItem('teamLeaders', JSON.stringify(updatedTLs));

//         // Remove user from all projects
//         if (userToDelete && userToDelete.assignedProject) {
//           setProjects(prev => {
//             const updatedProjects = prev.map(project => {
//               if (project.name === userToDelete.assignedProject ||
//                 (project.assigned && project.assigned.some(member => member.name === userName)) ||
//                 (project.assignedMembers && project.assignedMembers.includes(userName))) {
//                 return {
//                   ...project,
//                   assigned: (project.assigned || []).filter(member => member.name !== userName),
//                   assignedMembers: (project.assignedMembers || []).filter(member => member !== userName)
//                 };
//               }
//               return project;
//             });
//             // Save updated projects to localStorage
//             saveProjectsToLocalStorage(updatedProjects);
//             return updatedProjects;
//           });
//         }

//         // Store deleted user IDs to prevent them from being reloaded
//         const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
//         if (!deletedUsers.includes(userId)) {
//           deletedUsers.push(userId);
//           localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
//         }

//         // Add to recent activity
//         addRecentActivity({
//           title: 'User Deleted',
//           description: `${userName} was deleted from the system`,
//           icon: 'fa-user-times',
//           iconBg: 'bg-danger',
//           timeAgo: 'Just now',
//           details: `Deleted by: ${userName}`
//         });

//         alert(`User "${userName}" has been deleted successfully!`);
//       } catch (error) {
//         console.error('Error deleting user:', error);
//         // Still remove from all states even if API call fails
//         setAllUsers(prev => prev.filter(user =>
//           (user.id !== userId) && (user._id !== userId)
//         ));
//         setProjectManagers(prev => prev.filter(pm =>
//           (pm.id !== userId) && (pm._id !== userId)
//         ));

//         // Store deleted user IDs even on error
//         const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
//         if (!deletedUsers.includes(userId)) {
//           deletedUsers.push(userId);
//           localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
//         }

//         alert(`User "${userName}" has been deleted from local view.`);
//       }
//     }
//   };

//   // Enhanced Task Management Functions with Real-time Updates
//   const handleAddTask = async (taskData) => {
//     try {
//       console.log('🚀 Creating new task with real-time assignment...', taskData);

//       // Support multiple user assignments (comma-separated or array)
//       let assignedUsers;
//       if (Array.isArray(taskData.assignedTo)) {
//         assignedUsers = taskData.assignedTo;
//       } else if (typeof taskData.assignedTo === 'string' && taskData.assignedTo.includes(',')) {
//         assignedUsers = taskData.assignedTo.split(',').map(user => user.trim()).filter(Boolean);
//       } else {
//         assignedUsers = [taskData.assignedTo].filter(Boolean);
//       }

//       // Create tasks for each assigned user (or single task with multiple assignees)
//       const tasksToCreate = assignedUsers.map(assignedUser => ({
//         ...taskData,
//         assignedTo: assignedUser,
//         assignedMembers: assignedUsers, // Store all assigned users
//         assignedBy: userName,
//         createdAt: new Date().toISOString(),
//         status: 'pending',
//         actualHours: 0,
//         isRealTimeAssignment: true // Flag for real-time tracking
//       }));

//       // Create all tasks
//       const savedTasks = await Promise.all(
//         tasksToCreate.map(task => createTask(task))
//       );

//       // Add tasks with proper IDs
//       const tasksWithIds = savedTasks.map((savedTask, index) => ({
//         ...tasksToCreate[index],
//         ...savedTask,
//         id: savedTask.id || savedTask._id || `TASK${Date.now()}_${index}`
//       }));

//       // Immediate local update for instant display
//       setAssignedTasks(prev => [...prev, ...tasksWithIds]);

//       // Send real-time notifications to all assigned employees
//       const realTimeNotifications = assignedUsers.map((assignedUser, index) => ({
//         id: `realtime_assign_${Date.now()}_${index}`,
//         type: 'task',
//         title: '⚡ New Task Assigned',
//         message: `"${taskData.title}" has been assigned to you by ${userName}`,
//         time: 'Just now',
//         read: false,
//         taskId: tasksWithIds[index].id,
//         priority: taskData.priority || 'medium',
//         dueDate: taskData.dueDate,
//         assignedTo: assignedUser,
//         isRealTime: true,
//         urgent: taskData.priority === 'high'
//       }));

//       setNotifications(prev => [...realTimeNotifications, ...prev]);

//       // Update task stats immediately
//       const allTasks = [...assignedTasks, ...tasksWithIds];
//       updateTaskStats(allTasks);

//       // Add to task update queue for tracking
//       setTaskUpdateQueue(prev => [...prev, {
//         timestamp: Date.now(),
//         type: 'task_assignment',
//         assignedBy: userName,
//         assignedTo: assignedUsers,
//         taskTitle: taskData.title,
//         taskId: tasksWithIds[0].id
//       }]);

//       // Immediate task stats update (no polling needed)
//       setTimeout(() => {
//         console.log('🔄 Updating task stats immediately...');
//         updateTaskStats([...assignedTasks, ...tasksWithIds]);
//       }, 500); // Quick local update

//       // Force immediate refresh for all employees by triggering a global refresh
//       const refreshDelays = [500, 1500, 3000, 5000]; // Multiple refresh attempts
//       refreshDelays.forEach((delay, index) => {
//         setTimeout(async () => {
//           console.log(`🔄 Global task refresh attempt ${index + 1}/4...`);
//           try {
//             await loadTasks();
//             // Also trigger employee-specific refresh if current user is employee
//             if (currentRole === 'employee' || currentRole === 'intern') {
//               await loadEmployeeDynamicTasks();
//             }
//             console.log(`✅ Global task refresh attempt ${index + 1} completed`);
//           } catch (error) {
//             console.error(`❌ Global task refresh attempt ${index + 1} failed:`, error);
//           }
//         }, delay);
//       });

//       // Show browser notification for high priority tasks
//       if (taskData.priority === 'high' && 'Notification' in window && Notification.permission === 'granted') {
//         assignedUsers.forEach(user => {
//           new Notification('🔥 High Priority Task Assigned', {
//             body: `"${taskData.title}" assigned to ${user}`,
//             icon: '/favicon.ico',
//             tag: `task-${tasksWithIds[0].id}`,
//             silent: true
//           });
//         });
//       }

//       const userCount = assignedUsers.length;
//       console.log(`✅ Task "${taskData.title}" assigned to ${userCount} user(s) with real-time updates`);

//       // Enhanced success message with real-time confirmation
//       const successMessage = `✅ Task "${taskData.title}" has been assigned to ${userCount} user${userCount > 1 ? 's' : ''} successfully!\n\n` +
//         `📱 Real-time notifications sent\n` +
//         `⚡ Updates will appear in "My Daily Tasks" within seconds\n` +
//         `🔔 ${userCount} notification${userCount > 1 ? 's' : ''} delivered`;

//       alert(successMessage);

//       // Close the modal if it was opened from project tasks modal
//       if (showProjectTasksModal) {
//         setShowProjectTasksModal(false);
//         setSelectedProjectForTasks(null);
//       }

//       // Track the task assignment for analytics
//       trackTaskAssignment(taskData, assignedUsers);

//       // Update last task update timestamp
//       setLastTaskUpdate(Date.now());

//       // Trigger immediate refresh for all employee sessions via localStorage
//       const taskAssignmentEvent = {
//         type: 'TASK_ASSIGNED',
//         timestamp: Date.now(),
//         assignedUsers: assignedUsers,
//         taskData: {
//           id: tasksWithIds[0].id,
//           title: taskData.title,
//           priority: taskData.priority,
//           dueDate: taskData.dueDate
//         },
//         assignedBy: userName
//       };

//       // Store the event in localStorage to trigger updates in other tabs/sessions
//       localStorage.setItem('taskAssignmentEvent', JSON.stringify(taskAssignmentEvent));

//       // Also trigger team leader update if any assigned user has a team leader
//       const teamLeaderUpdateEvent = {
//         type: 'TEAM_DATA_UPDATED',
//         timestamp: Date.now(),
//         affectedUsers: assignedUsers,
//         updateType: 'task_assignment'
//       };

//       localStorage.setItem('teamLeaderUpdateEvent', JSON.stringify(teamLeaderUpdateEvent));

//       // Remove the events after a short delay to prevent repeated triggers
//       setTimeout(() => {
//         localStorage.removeItem('taskAssignmentEvent');
//         localStorage.removeItem('teamLeaderUpdateEvent');
//       }, 2000);

//     } catch (error) {
//       console.error('❌ Error adding task with real-time updates:', error);

//       // Enhanced error notification
//       const errorNotification = {
//         id: `task_error_${Date.now()}`,
//         type: 'error',
//         title: '❌ Task Assignment Failed',
//         message: `Failed to assign task "${taskData.title}". Please try again.`,
//         time: 'Just now',
//         read: false,
//         isRealTime: true
//       };

//       setNotifications(prev => [errorNotification, ...prev]);
//       alert('❌ Failed to add task. Please try again.');
//     }
//   };

//   // Update Task Status Function
//   const updateTaskStatus = (taskId, newStatus) => {
//     console.log('🔄 Updating task status:', taskId, 'to', newStatus);

//     setAssignedTasks(prev => prev.map(task => {
//       const matches = (task.id === taskId || task._id === taskId);
//       if (matches) {
//         console.log('✅ Matched task:', task.title, 'ID:', task.id || task._id);
//       }
//       return matches
//         ? {
//           ...task,
//           status: newStatus,
//           completedDate: newStatus === 'completed' ? new Date().toISOString() : task.completedDate,
//           updatedAt: new Date().toISOString()
//         }
//         : task;
//     }));

//     // Add notification for status update
//     const task = assignedTasks.find(t => t.id === taskId || t._id === taskId);
//     if (task) {
//       const notification = {
//         id: `notif${Date.now()}`,
//         type: 'task',
//         title: 'Task Status Updated',
//         message: `Task "${task.title}" status changed to ${newStatus}`,
//         time: 'Just now',
//         read: false,
//         taskId: taskId
//       };
//       setNotifications(prev => [notification, ...prev]);
//     }

//     // Show success message
//     alert(`Task status updated to ${newStatus} successfully!`);
//   };

//   // Task Notes/Discussion Functions
//   const addTaskNote = async (taskId, noteText) => {
//     try {
//       const currentUser = localStorage.getItem('userName') || userName;
//       const userRole = localStorage.getItem('userRole') || currentRole;

//       const newNote = {
//         id: `note_${Date.now()}`,
//         taskId: taskId,
//         author: currentUser,
//         authorRole: userRole,
//         text: noteText,
//         timestamp: new Date().toISOString(),
//         isRead: false
//       };

//       // Update task discussions
//       setTaskDiscussions(prev => ({
//         ...prev,
//         [taskId]: [...(prev[taskId] || []), newNote]
//       }));

//       // Save to localStorage for persistence
//       const existingDiscussions = JSON.parse(localStorage.getItem('taskDiscussions') || '{}');
//       existingDiscussions[taskId] = [...(existingDiscussions[taskId] || []), newNote];
//       localStorage.setItem('taskDiscussions', JSON.stringify(existingDiscussions));

//       // Find the task to get assignee info
//       const task = assignedTasks.find(t => (t.id || t._id) === taskId);

//       // Create notification for the assignee (if current user is not the assignee)
//       if (task && task.assignedTo !== currentUser) {
//         const notification = {
//           id: `note_notif_${Date.now()}`,
//           type: 'note',
//           title: '💬 New Task Note',
//           message: `${currentUser} added a note to "${task.title}"`,
//           time: 'Just now',
//           read: false,
//           taskId: taskId,
//           noteId: newNote.id,
//           isRealTime: true
//         };

//         setNotifications(prev => [notification, ...prev]);

//         // Store notification event for cross-tab communication
//         const noteEvent = {
//           type: 'TASK_NOTE_ADDED',
//           timestamp: Date.now(),
//           taskId: taskId,
//           taskTitle: task.title,
//           author: currentUser,
//           authorRole: userRole,
//           assignedTo: task.assignedTo,
//           noteText: noteText
//         };

//         localStorage.setItem('taskNoteEvent', JSON.stringify(noteEvent));
//         setTimeout(() => localStorage.removeItem('taskNoteEvent'), 2000);
//       }

//       console.log(`✅ Note added to task ${taskId} by ${currentUser}`);
//       return newNote;

//     } catch (error) {
//       console.error('❌ Error adding task note:', error);
//       alert('Failed to add note. Please try again.');
//     }
//   };





//   const handleAddNote = async () => {
//     if (!newNote.trim() || !selectedTaskForNotes) return;

//     await addTaskNote(selectedTaskForNotes.id || selectedTaskForNotes._id, newNote.trim());
//     setNewNote('');
//   };

//   // Quick Task Assignment Function for PM Dashboard
//   const handleQuickTaskAssignment = async () => {
//     if (!selectedEmployeeForTask || !newTaskName.trim()) {
//       alert('Please select an employee and enter a task name');
//       return;
//     }

//     try {
//       // Handle multiple employees (comma-separated or array)
//       const assignedEmployees = Array.isArray(selectedEmployeeForTask)
//         ? selectedEmployeeForTask
//         : selectedEmployeeForTask.split(',').map(emp => emp.trim()).filter(emp => emp);

//       const taskData = {
//         title: newTaskName.trim(),
//         description: `Task assigned to ${assignedEmployees.join(', ')} for project: ${selectedProjectForTask || 'General'}`,
//         assignedTo: assignedEmployees.length === 1 ? assignedEmployees[0] : assignedEmployees,
//         assignedBy: safeUserData?.name || userName,
//         project: selectedProjectForTask || 'General',
//         priority: taskPriority,
//         dueDate: taskDueDate,
//         status: 'assigned', // Changed from 'pending' to 'assigned'
//         createdAt: new Date().toISOString(),
//         assignedDate: new Date().toISOString(),
//         actualHours: 0,
//         estimatedHours: 0
//       };

//       // Create task using existing function
//       await handleAddTask(taskData);

//       // Reset form
//       setSelectedEmployeeForTask('');
//       setSelectedProjectForTask('');
//       setNewTaskName('');
//       setTaskPriority('medium');
//       setTaskDueDate(new Date().toISOString().split('T')[0]);

//       // Show success message
//       const employeeText = assignedEmployees.length === 1 ? assignedEmployees[0] : `${assignedEmployees.length} employees`;
//       alert(`Task "${taskData.title}" has been assigned to ${employeeText} successfully!`);

//     } catch (error) {
//       console.error('Error in quick task assignment:', error);
//       alert('Failed to assign task. Please try again.');
//     }
//   };

//   const handleEditTask = (task) => {
//     setEditingTask(task);
//     setShowAddTaskModal(true);
//   };

//   const handleUpdateTask = async (taskData) => {
//     try {
//       const updatedTask = await updateTask(editingTask.id, taskData);
//       setAssignedTasks(prev => prev.map(task =>
//         task.id === editingTask.id ? updatedTask : task
//       ));
//       alert(`Task "${taskData.title}" has been updated successfully!`);
//       setEditingTask(null);
//     } catch (error) {
//       console.error('Error updating task:', error);
//       alert('Failed to update task. Please try again.');
//     }
//   };

//   const handleDeleteTask = async (taskId, taskTitle) => {
//     if (window.confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`)) {
//       try {
//         await deleteTask(taskId);
//         setAssignedTasks(prev => prev.filter(task => task.id !== taskId));
//         alert(`Task "${taskTitle}" has been deleted successfully!`);
//       } catch (error) {
//         console.error('Error deleting task:', error);
//         alert('Failed to delete task. Please try again.');
//       }
//     }
//   };

//   // Handle task status update by Project Manager
//   const handleTaskStatusChange = async (taskId, newStatus) => {
//     try {
//       const task = assignedTasks.find(t => t.id === taskId);
//       if (!task) return;

//       const updatedTaskData = {
//         ...task,
//         status: newStatus,
//         updatedAt: new Date().toISOString(),
//         updatedBy: userName
//       };

//       await updateTask(taskId, updatedTaskData);

//       setAssignedTasks(prev => prev.map(t =>
//         t.id === taskId ? { ...t, status: newStatus } : t
//       ));

//       // Send notification to employee about status change
//       const notification = {
//         id: `notif${Date.now()}`,
//         type: 'task_status',
//         title: 'Task Status Updated',
//         message: `Task "${task.title}" status changed to ${newStatus}`,
//         time: 'Just now',
//         read: false,
//         taskId: taskId
//       };

//       setNotifications(prev => [notification, ...prev]);

//       alert(`Task status updated to "${newStatus}" successfully!`);
//     } catch (error) {
//       console.error('Error updating task status:', error);
//       alert('Failed to update task status. Please try again.');
//     }
//   };



//   const handleProjectUpdate = async (updateData) => {
//     try {
//       const newUpdate = {
//         id: `pu${Date.now()}`,
//         ...updateData,
//         employeeName: localStorage.getItem('userName') || 'Current User',
//         employeeId: localStorage.getItem('userId') || 'current_user',
//         updateDate: new Date().toISOString().split('T')[0],
//         createdAt: new Date().toISOString()
//       };

//       setProjectUpdates(prev => [...prev, newUpdate]);

//       // Update project progress if provided
//       if (updateData.completionPercentage) {
//         setProjects(prev => prev.map(project =>
//           project.id === updateData.projectId ?
//             { ...project, progress: updateData.completionPercentage } :
//             project
//         ));
//       }

//       alert('Project update submitted successfully!');
//     } catch (error) {
//       console.error('Error submitting project update:', error);
//       alert('Failed to submit project update. Please try again.');
//     }
//   };



//   const getEmployeeTasks = (employeeEmail) => {
//     return Array.isArray(assignedTasks) ? assignedTasks.filter(task => task.assignedTo === employeeEmail) : [];
//   };

//   const getProjectManagerProjects = (managerEmail) => {
//     const managerName = allUsers.find(user => user.email === managerEmail)?.name;
//     return projects.filter(project => project.projectManager === managerName);
//   };

//   const getTeamLeaderEmployees = (teamLeaderEmail) => {
//     const teamLeaderName = allUsers.find(user => user.email === teamLeaderEmail)?.name;
//     return teamAssignments.filter(assignment => assignment.teamLeader === teamLeaderName);
//   };

//   // Get team members for a specific team leader
//   const getTeamMembers = (teamLeaderId) => {
//     return allUsers.filter(user => user.teamLeaderId === teamLeaderId);
//   };

//   // Get active users count for a team leader
//   const getActiveUsersCount = (teamLeaderId) => {
//     return allUsers.filter(user => user.teamLeaderId === teamLeaderId && user.status === 'Active').length;
//   };

//   // Handle notification actions
//   const markNotificationAsRead = (notificationId) => {
//     setNotifications(prev =>
//       prev.map(notif =>
//         notif.id === notificationId ? { ...notif, read: true } : notif
//       )
//     );
//   };

//   const clearAllNotifications = () => {
//     setNotifications([]);
//   };

//   // Enhanced Admin Notification System
//   const addNotification = (notificationData) => {
//     const notification = {
//       id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       type: notificationData.type || 'info',
//       title: notificationData.title,
//       message: notificationData.message,
//       timestamp: notificationData.timestamp || new Date().toISOString(),
//       priority: notificationData.priority || 'medium',
//       read: false,
//       time: 'Just now'
//     };

//     setNotifications(prev => [notification, ...prev]);

//     // Also add to recent activities
//     addRecentActivity({
//       title: notification.title,
//       description: notification.message,
//       icon: getNotificationIcon(notification.type),
//       iconBg: getNotificationColor(notification.type),
//       timeAgo: 'Just now',
//       details: `Priority: ${notification.priority}`
//     });

//     console.log('📢 New notification added:', notification.title);
//   };

//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case 'project': return 'fa-project-diagram';
//       case 'user': return 'fa-user-plus';
//       case 'employee': return 'fa-user-tie';
//       case 'payment': return 'fa-dollar-sign';
//       case 'team': return 'fa-users';
//       case 'completion': return 'fa-check-circle';
//       default: return 'fa-info-circle';
//     }
//   };

//   const getNotificationColor = (type) => {
//     switch (type) {
//       case 'project': return 'bg-info';
//       case 'user': return 'bg-success';
//       case 'employee': return 'bg-primary';
//       case 'payment': return 'bg-warning';
//       case 'team': return 'bg-secondary';
//       case 'completion': return 'bg-success';
//       default: return 'bg-info';
//     }
//   };

//   // Notification Functions for Different Events
//   const notifyProjectCompleted = (projectName, completedBy) => {
//     addNotification({
//       type: 'completion',
//       title: 'Project Completed',
//       message: `Project "${projectName}" has been marked as completed by ${completedBy}`,
//       priority: 'high'
//     });
//   };

//   const notifyNewUserAdded = (userName, userRole, department) => {
//     addNotification({
//       type: 'user',
//       title: 'New User Added',
//       message: `${userName} has been added as ${userRole} in ${department} department`,
//       priority: 'medium'
//     });
//   };

//   const notifyNewEmployeeAdded = (employeeName, department, teamLeader) => {
//     addNotification({
//       type: 'employee',
//       title: 'New Employee Added',
//       message: `${employeeName} has been added to ${department} department${teamLeader ? ` under ${teamLeader}` : ''}`,
//       priority: 'medium'
//     });
//   };

//   const notifyNewProjectAdded = (projectName, clientName, projectManager) => {
//     addNotification({
//       type: 'project',
//       title: 'New Project Created',
//       message: `Project "${projectName}" for client ${clientName} has been assigned to ${projectManager}`,
//       priority: 'high'
//     });
//   };

//   const notifyAdvancePaymentReceived = (amount, projectName, clientName) => {
//     addNotification({
//       type: 'payment',
//       title: 'Advance Payment Received',
//       message: `Advance payment of $${(amount || 0).toLocaleString()} received for project "${projectName}" from ${clientName}`,
//       priority: 'high'
//     });
//   };

//   const notifyTeamAssignment = (memberName, teamLeaderName) => {
//     addNotification({
//       type: 'team',
//       title: 'Team Assignment',
//       message: `${memberName} has been assigned to ${teamLeaderName}'s team`,
//       priority: 'medium'
//     });
//   };

//   // Team Member View Functionality
//   const [showTeamMemberView, setShowTeamMemberView] = useState(false);
//   const [selectedTeamForMemberView, setSelectedTeamForMemberView] = useState(null);
//   const [teamMemberEditMode, setTeamMemberEditMode] = useState(false);

//   // Debug function to check team assignments
//   const debugTeamAssignments = () => {
//     console.log('🐛 DEBUG: Current Team Assignments');
//     console.log('Team Leaders:', teamLeaders.map(tl => ({
//       id: tl.id,
//       _id: tl._id,
//       name: tl.name,
//       email: tl.email
//     })));

//     console.log('Users with team assignments:', allUsers
//       .filter(u => u.teamLeaderId)
//       .map(u => ({
//         name: u.name,
//         teamLeaderId: u.teamLeaderId,
//         teamLeaderName: u.teamLeaderName,
//         role: u.role
//       }))
//     );

//     teamLeaders.forEach(tl => {
//       const leaderId = tl.id || tl._id;
//       const members = getTeamMembersForLeader(leaderId);
//       console.log(`Team ${tl.name} (ID: ${leaderId}):`, members.map(m => m.name));
//     });
//   };

//   // Make debug function available globally for testing
//   window.debugTeamAssignments = debugTeamAssignments;

//   const handleViewTeamMembers = (teamLeader) => {
//     console.log('🔍 Opening team member view for:', {
//       id: teamLeader.id,
//       _id: teamLeader._id,
//       name: teamLeader.name,
//       email: teamLeader.email
//     });

//     setSelectedTeamForMemberView(teamLeader);
//     setShowTeamMemberView(true);
//     setTeamMemberEditMode(false);
//   };

//   const handleEditTeamMemberRestrictions = (teamLeader) => {
//     // Check if current user has permission to edit team leader data
//     const currentUserRole = localStorage.getItem('userRole') || currentRole;
//     const currentUserEmail = localStorage.getItem('userEmail');

//     if (currentUserRole === 'admin') {
//       // Admin can edit all team leaders
//       setSelectedTeamForMemberView(teamLeader);
//       setShowTeamMemberView(true);
//       setTeamMemberEditMode(true);
//     } else if (currentUserRole === 'project-manager') {
//       // Project managers can only view, not edit team leader assignments
//       addNotification({
//         type: 'warning',
//         title: 'Access Restricted',
//         message: 'Project Managers can view team members but cannot modify team leader assignments',
//         priority: 'medium'
//       });
//       setSelectedTeamForMemberView(teamLeader);
//       setShowTeamMemberView(true);
//       setTeamMemberEditMode(false);
//     } else if (currentUserRole === 'team-leader' && teamLeader.email === currentUserEmail) {
//       // Team leaders can only edit their own team
//       setSelectedTeamForMemberView(teamLeader);
//       setShowTeamMemberView(true);
//       setTeamMemberEditMode(true);
//     } else {
//       // Other team leaders cannot edit other teams
//       addNotification({
//         type: 'warning',
//         title: 'Access Denied',
//         message: 'You can only manage your own team members',
//         priority: 'high'
//       });
//     }
//   };

//   const getTeamMembersForLeader = (leaderId) => {
//     const members = allUsers.filter(user => {
//       // Normalize both IDs to strings for consistent comparison
//       const userTeamLeaderId = String(user.teamLeaderId || '');
//       const targetLeaderId = String(leaderId || '');

//       const matches = userTeamLeaderId === targetLeaderId && userTeamLeaderId !== '';

//       return matches && (user.role === 'employee' || user.role === 'intern');
//     });

//     // Debug logging (reduced)
//     if (leaderId && members.length > 0) {
//       console.log(`👥 Team ${leaderId}: ${members.map(m => m.name).join(', ')}`);
//     }

//     return members;
//   };

//   const handleRemoveFromTeam = async (memberId, teamLeaderId) => {
//     // Allow admin to remove without edit mode, but require edit mode for team leaders
//     if (!teamMemberEditMode && currentRole !== 'admin') {
//       addNotification({
//         type: 'warning',
//         title: 'Edit Mode Required',
//         message: 'Please enable edit mode to modify team assignments',
//         priority: 'medium'
//       });
//       return;
//     }

//     const member = allUsers.find(user => user.id === memberId || user._id === memberId);
//     const teamLeader = teamLeaders.find(tl => (tl.id || tl._id) === teamLeaderId);

//     if (window.confirm(`Remove ${member?.name} from ${teamLeader?.name}'s team?`)) {
//       try {
//         // Update backend first
//         const userId = member.id || member._id;
//         console.log(`🗑️ Removing ${member.name} from team leader ${teamLeaderId}`);

//         const updatedUserData = {
//           ...member,
//           teamLeaderId: null,
//           teamLeaderName: null
//         };

//         await updateUser(userId, updatedUserData);
//         console.log(`✅ Successfully removed ${member.name} from backend`);

//         // Update local state after successful backend update
//         setAllUsers(prev => prev.map(user => {
//           if ((user.id || user._id) === memberId) {
//             return {
//               ...user,
//               teamLeaderId: null,
//               teamLeaderName: null
//             };
//           }
//           return user;
//         }));

//         // Save to localStorage
//         const updatedUsers = allUsers.map(user => {
//           if ((user.id || user._id) === memberId) {
//             return {
//               ...user,
//               teamLeaderId: null,
//               teamLeaderName: null
//             };
//           }
//           return user;
//         });
//         saveUsersToLocalStorage(updatedUsers);
//       } catch (error) {
//         console.error('❌ Error removing member from team:', error);
//         alert('Error removing member from team. Please try again.');
//         return;
//       }

//       addNotification({
//         type: 'team',
//         title: 'Team Member Removed',
//         message: `${member?.name} has been removed from ${teamLeader?.name}'s team`,
//         priority: 'medium'
//       });

//       // Update team leader data and force real-time updates
//       setTimeout(() => {
//         // updateTeamLeaderData(); 
//         // Force team leader cards to update with new member counts
//         // setTeamLeaders removed


//         // Update the selected team data
//         const updatedTeamLeader = {
//           ...selectedTeamForMemberView,
//           teamMembers: getTeamMembersForLeader(teamLeaderId)
//         };
//         setSelectedTeamForMemberView(updatedTeamLeader);
//       }, 100);
//     }
//   };

//   const handleAssignToTeamFromView = (memberId, newTeamLeaderId) => {
//     if (!teamMemberEditMode) {
//       addNotification({
//         type: 'warning',
//         title: 'Edit Mode Required',
//         message: 'Please enable edit mode to modify team assignments',
//         priority: 'medium'
//       });
//       return;
//     }

//     const member = allUsers.find(user => user.id === memberId || user._id === memberId);
//     const newTeamLeader = teamLeaders.find(tl => (tl.id || tl._id) === newTeamLeaderId);

//     setAllUsers(prev => prev.map(user => {
//       if ((user.id || user._id) === memberId) {
//         return {
//           ...user,
//           teamLeaderId: newTeamLeaderId,
//           teamLeaderName: newTeamLeader?.name
//         };
//       }
//       return user;
//     }));

//     addNotification({
//       type: 'team',
//       title: 'Team Assignment Updated',
//       message: `${member?.name} has been assigned to ${newTeamLeader?.name}'s team`,
//       priority: 'medium'
//     });

//     // Update team leader data and refresh the team member view
//     setTimeout(() => {
//       // updateTeamLeaderData();

//       // Force team leader cards to update with new member counts
//       // setTeamLeaders removed


//       // Refresh the team member view
//       const updatedTeamLeader = {
//         ...selectedTeamForMemberView,
//         teamMembers: getTeamMembersForLeader(selectedTeamForMemberView.id || selectedTeamForMemberView._id)
//       };
//       setSelectedTeamForMemberView(updatedTeamLeader);
//     }, 100);
//   };

//   // Removed duplicate addNotification function - using the enhanced version above

//   // Load notifications from localStorage on component mount
//   useEffect(() => {
//     const savedNotifications = localStorage.getItem('adminNotifications');
//     if (savedNotifications) {
//       try {
//         const parsed = JSON.parse(savedNotifications);
//         setNotifications(parsed);
//       } catch (error) {
//         console.error('Error loading notifications:', error);
//       }
//     }
//   }, []);

//   // Removed duplicate notification functions - using the enhanced versions above

//   // Team member assignment functions
//   const handleAssignMembersToTeam = async (memberIds, teamLeaderId) => {
//     console.log('🔍 Assignment Debug Info:');
//     console.log('- Member IDs to assign:', memberIds);
//     console.log('- Target Team Leader ID:', teamLeaderId);
//     console.log('- Available Team Leaders:', teamLeaders.map(tl => ({
//       id: tl.id,
//       _id: tl._id,
//       name: tl.name,
//       email: tl.email
//     })));

//     // Check both teamLeaders array and allUsers with team-leader role
//     let teamLeader = teamLeaders.find(tl => (tl.id || tl._id) === teamLeaderId);

//     // If not found in teamLeaders, check allUsers
//     if (!teamLeader) {
//       teamLeader = allUsers.find(user =>
//         user.role === 'team-leader' && (user.id || user._id) === teamLeaderId
//       );
//     }

//     console.log('- Found Team Leader:', teamLeader ? {
//       id: teamLeader.id,
//       _id: teamLeader._id,
//       name: teamLeader.name,
//       email: teamLeader.email,
//       source: teamLeaders.find(tl => (tl.id || tl._id) === teamLeaderId) ? 'teamLeaders array' : 'allUsers array'
//     } : 'NOT FOUND');

//     if (!teamLeader) {
//       alert('Please select a team leader');
//       return;
//     }

//     if (memberIds.length === 0) {
//       alert('Please select at least one member to assign');
//       return;
//     }

//     const members = allUsers.filter(user => memberIds.includes(user.id || user._id));
//     console.log('- Members to assign:', members.map(m => ({
//       id: m.id,
//       _id: m._id,
//       name: m.name,
//       currentTeamLeaderId: m.teamLeaderId
//     })));

//     // Since we only show unassigned members, no conflict checking needed
//     // Update all selected members' team assignments
//     console.log('🔄 Updating user assignments...');

//     // Update each member in the backend database
//     const updatePromises = members.map(async (member) => {
//       try {
//         const userId = member.id || member._id;
//         console.log(`💾 Saving ${member.name} to backend:`, {
//           userId,
//           teamLeaderId: String(teamLeaderId),
//           teamLeaderName: teamLeader.name,
//           memberData: member
//         });

//         const updatedUserData = {
//           ...member,
//           teamLeaderId: String(teamLeaderId),
//           teamLeaderName: teamLeader.name
//         };

//         console.log(`📤 Sending to backend:`, updatedUserData);
//         const result = await updateUser(userId, updatedUserData);
//         console.log(`✅ Backend response for ${member.name}:`, result);
//         return updatedUserData;
//       } catch (error) {
//         console.error(`❌ Error saving ${member.name} to backend:`, error);
//         throw error;
//       }
//     });

//     // Wait for all backend updates to complete
//     try {
//       await Promise.all(updatePromises);
//       console.log('✅ All members saved to backend successfully');
//     } catch (error) {
//       console.error('❌ Error saving some members to backend:', error);
//       alert('Error saving team assignments. Please try again.');
//       return;
//     }

//     // Update local state after successful backend save
//     setAllUsers(prev => {
//       const updatedUsers = prev.map(user => {
//         if (memberIds.includes(user.id || user._id)) {
//           console.log(`✅ Updating local state for ${user.name}`);
//           return {
//             ...user,
//             teamLeaderId: String(teamLeaderId), // Ensure consistent string type
//             teamLeaderName: teamLeader.name
//           };
//         }
//         return user;
//       });

//       // Save to localStorage as backup
//       saveUsersToLocalStorage(updatedUsers);
//       return updatedUsers;
//     });

//     // Update team leader data and force real-time updates
//     setTimeout(() => {
//       // updateTeamLeaderData();

//       // Force team leader cards to update with new member counts
//       // setTeamLeaders removed

//     }, 100);

//     // Notify admin for each member
//     members.forEach(member => {
//       notifyTeamAssignment(member.name, teamLeader.name);
//     });

//     const memberNames = members.map(m => m.name).join(', ');

//     // Reset modal state first
//     setShowAddMemberModal(false);
//     setSelectedMembersForTeam([]);
//     setSelectedTeamLeaderForMember(null);
//     setMemberSearchTerm('');
//     setTeamLeaderSearchTerm('');

//     // Show success message
//     alert(`${memberNames} ${members.length > 1 ? 'have' : 'has'} been successfully assigned to ${teamLeader.name}'s team!`);

//     // Reload users from backend to ensure data consistency
//     console.log('🔄 Reloading users from backend after assignment...');
//     try {
//       await loadUsers();
//       console.log('✅ Users reloaded successfully from backend');

//       // Force update team leader data after reload
//       setTimeout(() => {
//         // updateTeamLeaderData();

//         console.log('✅ Team leader data updated');
//       }, 500);
//     } catch (error) {
//       console.error('❌ Error reloading users:', error);
//       // If reload fails, keep the local state which was already updated
//     }
//   };

//   // Toggle member selection
//   const toggleMemberSelection = (memberId) => {
//     setSelectedMembersForTeam(prev => {
//       if (prev.includes(memberId)) {
//         return prev.filter(id => id !== memberId);
//       } else {
//         return [...prev, memberId];
//       }
//     });
//   };

//   // Get filtered members based on search
//   const getFilteredMembers = () => {
//     const availableMembers = getAvailableMembers();
//     if (!memberSearchTerm) return availableMembers;

//     return availableMembers.filter(member =>
//       member.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
//       member.email.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
//       member.department.toLowerCase().includes(memberSearchTerm.toLowerCase())
//     );
//   };

//   // Get filtered team leaders based on search
//   const getFilteredTeamLeaders = () => {
//     // Combine team leaders from both teamLeaders array and allUsers with team-leader role
//     const allTeamLeaders = [
//       ...teamLeaders,
//       ...allUsers.filter(user =>
//         user.role === 'team-leader' &&
//         !teamLeaders.some(tl => (tl.id || tl._id) === (user.id || user._id))
//       )
//     ];

//     if (!teamLeaderSearchTerm) return allTeamLeaders;

//     return allTeamLeaders.filter(leader =>
//       leader.name.toLowerCase().includes(teamLeaderSearchTerm.toLowerCase()) ||
//       leader.email.toLowerCase().includes(teamLeaderSearchTerm.toLowerCase()) ||
//       (leader.department && leader.department.toLowerCase().includes(teamLeaderSearchTerm.toLowerCase()))
//     );
//   };

//   // Get available members (only unassigned members)
//   const getAvailableMembers = () => {
//     return allUsers.filter(user =>
//       (user.role === 'employee' || user.role === 'intern') &&
//       !user.teamLeaderId // Only show members who are NOT assigned to any team
//     );
//   };

//   // Remove member from team
//   const handleRemoveMemberFromTeam = (memberId) => {
//     const member = allUsers.find(user => (user.id || user._id) === memberId);
//     if (!member) return;

//     if (window.confirm(`Are you sure you want to remove ${member.name} from their current team?`)) {
//       setAllUsers(prev => {
//         const updatedUsers = prev.map(user => {
//           if ((user.id || user._id) === memberId) {
//             return {
//               ...user,
//               teamLeaderId: null,
//               teamLeaderName: null
//             };
//           }
//           return user;
//         });

//         saveUsersToLocalStorage(updatedUsers);
//         return updatedUsers;
//       });

//       // updateTeamLeaderData();

//       alert(`${member.name} has been removed from their team.`);
//     }
//   };

//   const addRecentActivity = (activityData) => {
//     const activity = {
//       id: Date.now(),
//       ...activityData,
//       timestamp: activityData.timestamp || new Date().toISOString()
//     };
//     setRecentActivities(prev => {
//       const updated = [activity, ...prev.slice(0, 19)]; // Keep only 20 activities
//       localStorage.setItem('recentActivities', JSON.stringify(updated));
//       return updated;
//     });
//   };

//   const getUnreadNotificationCount = () => {
//     return notifications.filter(notif => !notif.read).length;
//   };

//   // Export users to CSV
//   const exportUsers = () => {
//     const csvData = filteredAndSortedUsers.map(user => ({
//       Name: user.name,
//       ID: user.payroll || user.id,
//       Email: user.email,
//       Department: user.department,
//       UserType: user.userType || user.role,
//       Status: user.status || 'Active',
//       Project: user.assignedProject || 'Not Assigned',
//       JoinDate: user.joinDate || new Date().toLocaleDateString()
//     }));

//     const csvContent = [
//       Object.keys(csvData[0]).join(','),
//       ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
//   };

//   // Get unique departments for filter
//   const getUniqueDepartments = () => {
//     const departments = [...new Set(allUsers.map(user => user.department).filter(Boolean))];
//     return departments.sort();
//   };

//   // Get unique roles for filter
//   const getUniqueRoles = () => {
//     const roles = [...new Set(allUsers.map(user => user.userType || user.role).filter(Boolean))];
//     return roles.sort();
//   };

//   // Get user type counts for display
//   const getUserTypeCounts = (userList = allUsersWithRoles) => {
//     const counts = {
//       'Project Manager': 0,
//       'Team Leader': 0,
//       'Employee': 0,
//       'Other': 0
//     };

//     userList.forEach(user => {
//       const userType = user.userType || user.role;
//       if (userType === 'Project Manager') {
//         counts['Project Manager']++;
//       } else if (userType === 'Team Leader') {
//         counts['Team Leader']++;
//       } else if (userType === 'Employee' || userType === 'employee' || userType === 'intern') {
//         counts['Employee']++;
//       } else {
//         counts['Other']++;
//       }
//     });

//     return counts;
//   };

//   // Get only regular employees (excluding Project Managers and Team Leaders)
//   const getRegularEmployees = () => {
//     return allUsers.filter(user => {
//       const userType = user.userType || user.role;
//       return userType !== 'Project Manager' && userType !== 'Team Leader' &&
//         userType !== 'project-manager' && userType !== 'team-leader';
//     });
//   };

//   // Get available employees (not assigned to any team leader)
//   const getAvailableEmployees = () => {
//     return getRegularEmployees().filter(employee => !employee.teamLeaderId);
//   };

//   // Get employees assigned to a specific team leader
//   const getTeamMembersByLeader = (teamLeaderId) => {
//     return getRegularEmployees().filter(employee => employee.teamLeaderId === teamLeaderId);
//   };

//   // Assign employee to team leader
//   const assignEmployeeToTeamLeader = async (employeeId, teamLeaderId) => {
//     try {
//       // Update in allUsers state
//       setAllUsers(prev => prev.map(user =>
//         (user.id === employeeId || user._id === employeeId)
//           ? { ...user, teamLeaderId, teamLeaderName: teamLeaders.find(tl => tl.id === teamLeaderId)?.name }
//           : user
//       ));

//       // Add notification
//       const employee = allUsers.find(u => u.id === employeeId || u._id === employeeId);
//       const teamLeader = teamLeaders.find(tl => tl.id === teamLeaderId);

//       addNotification({
//         type: 'assignment',
//         title: 'Employee Assigned to Team',
//         message: `${employee?.name} has been assigned to ${teamLeader?.name}'s team`,
//         timestamp: new Date().toISOString(),
//         priority: 'medium'
//       });

//       return true;
//     } catch (error) {
//       console.error('Error assigning employee to team leader:', error);
//       return false;
//     }
//   };

//   // Remove employee from team leader
//   const removeEmployeeFromTeam = async (employeeId) => {
//     try {
//       const employee = allUsers.find(u => u.id === employeeId || u._id === employeeId);
//       const teamLeader = teamLeaders.find(tl => tl.id === employee?.teamLeaderId);

//       // Update in allUsers state
//       setAllUsers(prev => prev.map(user =>
//         (user.id === employeeId || user._id === employeeId)
//           ? { ...user, teamLeaderId: null, teamLeaderName: null }
//           : user
//       ));

//       // Add notification
//       addNotification({
//         type: 'assignment',
//         title: 'Employee Removed from Team',
//         message: `${employee?.name} has been removed from ${teamLeader?.name}'s team`,
//         timestamp: new Date().toISOString(),
//         priority: 'medium'
//       });

//       return true;
//     } catch (error) {
//       console.error('Error removing employee from team:', error);
//       return false;
//     }
//   };

//   // Unassign all employees when a team leader is deleted
//   const unassignEmployeesFromTeamLeader = async (teamLeaderId) => {
//     try {
//       const teamMembers = getTeamMembersByLeader(teamLeaderId);

//       // Update all team members to remove team leader assignment
//       setAllUsers(prev => prev.map(user =>
//         user.teamLeaderId === teamLeaderId
//           ? { ...user, teamLeaderId: null, teamLeaderName: null }
//           : user
//       ));

//       // Add notification if there were team members
//       if (teamMembers.length > 0) {
//         const teamLeader = teamLeaders.find(tl => tl.id === teamLeaderId);
//         addNotification({
//           type: 'assignment',
//           title: 'Team Members Unassigned',
//           message: `${teamMembers.length} employees have been unassigned from ${teamLeader?.name}'s team`,
//           timestamp: new Date().toISOString(),
//           priority: 'medium'
//         });
//       }

//       return true;
//     } catch (error) {
//       console.error('Error unassigning employees from team leader:', error);
//       return false;
//     }
//   };

//   // Get unique projects for filter
//   const getUniqueProjects = () => {
//     const projects = [...new Set(allUsers.map(user => user.assignedProject).filter(Boolean))];
//     return projects.sort();
//   };

//   // Get all users including Project Managers, Team Leaders, and Employees
//   const getAllUsersWithRoles = () => {
//     const consolidatedUsers = [];
//     const seenIds = new Set();

//     // Priority order: allUsers first (most up-to-date), then role-specific arrays
//     // Add all users from allUsers array first (this includes updated roles)
//     allUsers.forEach(user => {
//       const id = user.id || user._id;
//       if (!seenIds.has(id)) {
//         consolidatedUsers.push({
//           ...user,
//           userType: user.userType ||
//             (user.role === 'intern' ? 'Intern' :
//               user.role === 'employee' ? 'Employee' :
//                 user.role === 'team-leader' ? 'Team Leader' :
//                   user.role === 'project-manager' ? 'Project Manager' : 'Employee')
//         });
//         seenIds.add(id);
//       }
//     });

//     // Add project managers only if not already included from allUsers
//     projectManagers.forEach(pm => {
//       const id = pm.id || pm._id;
//       if (!seenIds.has(id)) {
//         consolidatedUsers.push({
//           ...pm,
//           role: 'project-manager',
//           userType: 'Project Manager',
//           payroll: pm.payroll || `PM${id?.slice(-3) || '001'}`
//         });
//         seenIds.add(id);
//       }
//     });



//     return consolidatedUsers;
//   };

//   // Filter and sort all users
//   const allUsersWithRoles = getAllUsersWithRoles();
//   const filteredAndSortedUsers = allUsersWithRoles
//     .filter(user => {
//       const matchesSearch = !userSearchTerm ||
//         user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
//         user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
//         user.payroll?.toLowerCase().includes(userSearchTerm.toLowerCase());

//       const matchesRole = filterByRole === 'all' ||
//         (user.userType || user.role) === filterByRole;

//       const matchesDepartment = filterByDepartment === 'all' ||
//         user.department === filterByDepartment;

//       const matchesStatus = filterByStatus === 'all' ||
//         (user.status || 'Active') === filterByStatus;

//       const matchesProject = filterByProject === 'all' ||
//         (filterByProject === 'assigned' && user.assignedProject) ||
//         (filterByProject === 'unassigned' && !user.assignedProject) ||
//         user.assignedProject === filterByProject;

//       const matchesTeam = filterByTeam === 'all' ||
//         (filterByTeam === 'team-assigned' && user.teamLeaderId) ||
//         (filterByTeam === 'team-unassigned' && !user.teamLeaderId) ||
//         (filterByTeam.startsWith('team-') && user.teamLeaderId === filterByTeam.replace('team-', ''));

//       return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesProject && matchesTeam;
//     })
//     .sort((a, b) => {
//       let aValue = a[sortBy] || '';
//       let bValue = b[sortBy] || '';

//       if (typeof aValue === 'string') aValue = aValue.toLowerCase();
//       if (typeof bValue === 'string') bValue = bValue.toLowerCase();

//       if (sortOrder === 'asc') {
//         return aValue > bValue ? 1 : -1;
//       } else {
//         return aValue < bValue ? 1 : -1;
//       }
//     });

//   // Handle task assignment
//   const handleTaskAssignment = async (taskData) => {
//     try {
//       const newTask = {
//         ...taskData,
//         status: 'pending',
//         assignedBy: localStorage.getItem('userEmail'),
//         createdAt: new Date().toISOString()
//       };

//       const savedTask = await createTask(newTask);
//       setAssignedTasks(prev => [...prev, savedTask]);

//       // Add notification for assigned user
//       addNotification({
//         type: 'task',
//         title: 'New Task Assigned',
//         message: `${taskData.title} has been assigned to ${taskData.assignedTo}`,
//         timestamp: new Date().toISOString(),
//         priority: 'medium'
//       });

//       // Add to recent activity
//       addRecentActivity({
//         title: 'Task Assigned',
//         description: `"${taskData.title}" was assigned to ${taskData.assignedTo}`,
//         icon: 'fa-tasks',
//         iconBg: 'bg-warning',
//         timeAgo: 'Just now',
//         details: `Priority: ${taskData.priority} | Due: ${taskData.dueDate}`
//       });

//       alert('Task assigned successfully!');
//     } catch (error) {
//       console.error('Error assigning task:', error);
//       alert('Failed to assign task. Please try again.');
//     }
//   };

//   // Handle task status update
//   const handleTaskStatusUpdate = async (taskId, newStatus, estimatedHours) => {
//     try {
//       const task = assignedTasks.find(t => t.id === taskId);
//       if (!task) return;

//       // For employees: Check if trying to start a new task while another is in progress
//       if (currentRole === 'employee' && newStatus === 'in-progress') {
//         const hasActiveTask = assignedTasks.some(t =>
//           t.id !== taskId &&
//           t.status === 'in-progress' &&
//           t.assignedTo === localStorage.getItem('userEmail')
//         );

//         if (hasActiveTask) {
//           alert('You can only work on one task at a time. Please complete or pause your current task first.');
//           return;
//         }

//         setCurrentWorkingTask(taskId);
//       }

//       // If completing a task, clear the current working task
//       if (newStatus === 'completed') {
//         setCurrentWorkingTask(null);
//       }

//       // Update task status
//       setAssignedTasks(prev =>
//         prev.map(t =>
//           t.id === taskId ? {
//             ...t,
//             status: newStatus,
//             actualHours: newStatus === 'completed' ? (estimatedHours || t.estimatedHours) : t.actualHours,
//             completedAt: newStatus === 'completed' ? new Date().toISOString() : t.completedAt
//           } : t
//         )
//       );

//       setAssignedTasks(prev =>
//         prev.map(t =>
//           t.id === taskId ? {
//             ...t,
//             status: newStatus,
//             actualHours: newStatus === 'completed' ? (estimatedHours || t.estimatedHours) : t.actualHours
//           } : t
//         )
//       );

//       // Add notification for task status change
//       if (task) {
//         const notification = {
//           id: `notif${Date.now()}`,
//           type: 'task_status_update',
//           title: 'Task Status Updated',
//           message: `Task "${task.title}" status changed to ${newStatus}`,
//           time: 'Just now',
//           read: false
//         };

//         setNotifications(prev => [notification, ...prev]);
//       }

//       // Show success message
//       const statusText = newStatus === 'in-progress' ? 'started' :
//         newStatus === 'completed' ? 'completed' : 'updated';
//       alert(`Task "${task.title}" has been ${statusText} successfully!`);
//     } catch (error) {
//       console.error('Error updating task status:', error);
//       alert('Failed to update task status. Please try again.');
//     }
//   };

//   // Project Manager Management Functions
//   const handleAddProjectManager = async (managerData) => {
//     // Check for duplicates before adding
//     if (!validateUniqueData(managerData)) {
//       return; // Stop if duplicates found
//     }

//     try {
//       console.log('Adding project manager with data:', managerData);
//       const savedManager = await createProjectManager(managerData);
//       console.log('Saved manager:', savedManager);

//       // Update state immediately
//       setProjectManagers(prev => {
//         const updated = [...prev, savedManager];
//         console.log('Updated projectManagers state:', updated);
//         // Also save to localStorage as backup to ensure persistence
//         localStorage.setItem('projectManagers', JSON.stringify(updated));
//         console.log('Manually saved to localStorage:', updated);
//         return updated;
//       });

//       // Also add to allUsers with project-manager role
//       const userEntry = {
//         ...savedManager,
//         role: 'project-manager',
//         userType: 'Project Manager',
//         password: savedManager.password || 'defaultPassword123', // Ensure password exists
//         payroll: savedManager.payroll || `PM${savedManager.id?.slice(-3) || '001'}`,
//         status: savedManager.status
//       };
//       setAllUsers(prev => [...prev, userEntry]);

//       // Verify localStorage
//       const localData = localStorage.getItem('projectManagers');
//       console.log('localStorage after save:', localData);

//       // Add notification for admin
//       addNotification({
//         type: 'user',
//         title: 'New Project Manager Added',
//         message: `${savedManager.name} has been added as a Project Manager in ${savedManager.department} department`,
//         timestamp: new Date().toISOString(),
//         priority: 'medium'
//       });

//       // Add to recent activity
//       addRecentActivity({
//         title: 'New Project Manager Added',
//         description: `${savedManager.name} was added to the ${savedManager.department} department`,
//         icon: 'fa-user-tie',
//         iconBg: 'bg-primary',
//         timeAgo: 'Just now',
//         details: `Email: ${savedManager.email} | Experience: ${savedManager.experience || 'Not specified'}`
//       });

//       // Verify data was saved to localStorage
//       const savedData = localStorage.getItem('projectManagers');
//       console.log('Project manager saved. localStorage now contains:', savedData);

//       alert(`Project Manager "${managerData.name}" has been added successfully and saved to database!`);
//     } catch (error) {
//       console.error('Error adding project manager:', error);
//       alert('Failed to add project manager. Please try again.');
//     }
//   };

//   const handleEditProjectManager = (manager) => {
//     setEditingProjectManager(manager);
//     setShowAddProjectManagerModal(true);
//   };

//   const handleUpdateProjectManager = async (managerData) => {
//     // Check for duplicates before updating (exclude current manager)
//     if (!validateUniqueData(managerData, editingProjectManager.id || editingProjectManager._id)) {
//       return; // Stop if duplicates found
//     }

//     try {
//       const managerId = editingProjectManager.id || editingProjectManager._id;
//       const updatedManager = await updateProjectManager(managerId, managerData);

//       setProjectManagers(prev => prev.map(manager =>
//         (manager.id === managerId || manager._id === managerId) ?
//           updatedManager : manager
//       ));

//       // Update in allUsers as well
//       setAllUsers(prev => prev.map(user =>
//         (user.id === managerId || user._id === managerId) ?
//           { ...user, ...updatedManager, role: 'project-manager' } : user
//       ));

//       alert(`Project Manager "${managerData.name}" has been updated successfully!`);
//       setEditingProjectManager(null);
//     } catch (error) {
//       console.error('Error updating project manager:', error);
//       alert('Failed to update project manager. Please try again.');
//     }
//   };

//   const handleDeleteProjectManager = async (managerId, managerName) => {
//     if (window.confirm(`Are you sure you want to delete "${managerName}"? This action cannot be undone.`)) {
//       try {
//         await deleteProjectManager(managerId);
//         setProjectManagers(prev => prev.filter(manager =>
//           manager.id !== managerId && manager._id !== managerId
//         ));
//         setAllUsers(prev => prev.filter(user =>
//           user.id !== managerId && user._id !== managerId
//         ));
//         alert(`Project Manager "${managerName}" has been deleted successfully!`);
//       } catch (error) {
//         console.error('Error deleting project manager:', error);
//         alert('Failed to delete project manager. Please try again.');
//       }
//     }
//   };

//   const handleSaveProjectManager = (managerData) => {
//     if (editingProjectManager) {
//       handleUpdateProjectManager(managerData);
//     } else {
//       handleAddProjectManager(managerData);
//     }
//     setShowAddProjectManagerModal(false);
//   };

//   const handleSaveTeamLeader = (leaderData) => {
//     if (editingTeamLeader) {
//       handleUpdateTeamLeader(leaderData);
//     } else {
//       handleAddTeamLeader(leaderData);
//     }
//     setShowAddTeamLeaderModal(false);
//   };

//   const handleViewProjectManager = (manager) => {
//     setSelectedProjectManager(manager);
//     setShowIndividualDashboard(true);
//     setActiveDetailView(null); // Reset detail view when opening dashboard
//   };

//   const handleBackToProjectManagers = () => {
//     setSelectedProjectManager(null);
//     setShowIndividualDashboard(false);
//     setActiveDetailView(null);
//   };

//   const handleViewEmployee = (employee) => {
//     setSelectedEmployee(employee);
//     setShowEmployeeDashboard(true);
//   };

//   const handleBackToEmployees = () => {
//     setSelectedEmployee(null);
//     setShowEmployeeDashboard(false);
//   };

//   const handleTaskSelection = (task) => {
//     setSelectedTask(task);
//     setShowTaskSelectionModal(false);
//     // Set the current working task for the employee
//     setCurrentWorkingTask(task);
//     // Persist selected task in localStorage
//     localStorage.setItem('selectedTask', JSON.stringify(task));

//     // Update user status to Active when they select a task
//     const userEmail = localStorage.getItem('userEmail');
//     const userName = localStorage.getItem('userName');
//     updateUserStatusToActive(userEmail, userName);

//     // Also update the task status to in-progress
//     setAssignedTasks(prev => prev.map(t =>
//       (t.id === task.id || t._id === task._id)
//         ? { ...t, status: 'in-progress', startedAt: new Date().toISOString() }
//         : t
//     ));
//   };

//   const handleSkipTaskSelection = () => {
//     setShowTaskSelectionModal(false);
//     setSelectedTask(null);
//     // Clear selected task from localStorage
//     localStorage.removeItem('selectedTask');
//   };

//   const handleDetailViewClick = (viewType) => {
//     setActiveDetailView(activeDetailView === viewType ? null : viewType);
//   };

//   // Team Leader Management Functions
//   // Get dynamic team leader data with real-time calculations
//   const getTeamLeaderData = (leaderId) => {
//     const leader = teamLeaders.find(tl => (tl.id || tl._id) === leaderId);
//     if (!leader) return null;

//     // Get team members assigned to this team leader
//     // Normalize IDs to strings for consistent comparison
//     const normalizedLeaderId = String(leaderId || '');
//     const teamMembers = allUsers.filter(user => {
//       const userTeamLeaderId = String(user.teamLeaderId || '');
//       return (
//         (userTeamLeaderId === normalizedLeaderId && userTeamLeaderId !== '') ||
//         user.teamLeaderName === leader.name ||
//         (user.teamLeader && user.teamLeader === leader.name)
//       );
//     });

//     // Debug logging
//     console.log(`👥 getTeamLeaderData for ${leader.name} (ID: ${leaderId}):`, {
//       normalizedLeaderId,
//       teamMembersFound: teamMembers.length,
//       teamMemberNames: teamMembers.map(m => m.name),
//       allUsersWithTeamLeaderId: allUsers.filter(u => u.teamLeaderId).map(u => ({
//         name: u.name,
//         teamLeaderId: u.teamLeaderId,
//         teamLeaderName: u.teamLeaderName
//       }))
//     });

//     // Get projects where team leader or their members are assigned
//     const assignedProjects = projects.filter(project =>
//       project.projectManager === leader.name ||
//       (project.assigned && project.assigned.some(member =>
//         member.name === leader.name ||
//         teamMembers.some(tm => tm.name === member.name)
//       ))
//     );

//     // Get tasks assigned to team leader or their members
//     const relatedTasks = assignedTasks.filter(task =>
//       task.assignedTo === leader.name ||
//       task.assignedTo === leader.email ||
//       teamMembers.some(member =>
//         task.assignedTo === member.name || task.assignedTo === member.email
//       )
//     );

//     return {
//       ...leader,
//       teamMembers,
//       assignedProjects,
//       relatedTasks,
//       teamSize: teamMembers.length,
//       projectsManaged: assignedProjects.length,
//       activeTasks: relatedTasks.filter(t => t.status !== 'completed').length,
//       completedTasks: relatedTasks.filter(t => t.status === 'completed').length
//     };
//   };

//   // Get total team leader count
//   const getTotalTeamLeaderCount = () => {
//     // Count team leaders from both teamLeaders array and allUsers with team-leader role
//     const teamLeadersFromAllUsers = allUsers.filter(user =>
//       user.role === 'team-leader' &&
//       !teamLeaders.some(tl => (tl.id || tl._id) === (user.id || user._id))
//     );
//     const totalCount = teamLeaders.length + teamLeadersFromAllUsers.length;
//     console.log('📊 Team Leaders count:', totalCount, '(teamLeaders:', teamLeaders.length, '+ allUsers:', teamLeadersFromAllUsers.length, ')');
//     return totalCount;
//   };

//   // Handle team leader detail view
//   const handleViewTeamLeaderDetails = (leader) => {
//     const leaderData = getTeamLeaderData(leader.id || leader._id);
//     if (!leaderData) return;

//     setSelectedTeamLeader(leaderData);
//     setShowTeamLeaderDetail(true);
//   };

//   // Update team leader data when users are assigned/unassigned
//   // const updateTeamLeaderData = () => { ... } - Removed as teamLeaders is derived

//   // Auto-update team leader data when users or projects change
//   useEffect(() => {
//     // No-op
//   }, [allUsers, projects, assignedTasks]);

//   // Project Manager Management Functions (similar to Team Leader)
//   const getProjectManagerDetails = (managerId) => {
//     const manager = projectManagers.find(pm => (pm.id || pm._id) === managerId);
//     if (!manager) return null;

//     // Get projects managed by this project manager
//     const managedProjects = projects.filter(project =>
//       project.projectManager === manager.name
//     );

//     // Get all team members working on this PM's projects
//     const teamMembers = allUsers.filter(user =>
//       managedProjects.some(project =>
//         project.assigned?.some(member => member.name === user.name) ||
//         project.projectManager === user.name
//       )
//     );

//     // Get tasks related to this PM's projects
//     const relatedTasks = assignedTasks.filter(task =>
//       task.assignedTo === manager.name ||
//       task.assignedTo === manager.email ||
//       managedProjects.some(project => task.project === project.name) ||
//       teamMembers.some(member =>
//         task.assignedTo === member.name || task.assignedTo === member.email
//       )
//     );

//     return {
//       ...manager,
//       managedProjects,
//       teamMembers,
//       relatedTasks,
//       projectsManaged: managedProjects.length,
//       teamSize: teamMembers.length,
//       activeTasks: relatedTasks.filter(t => t.status !== 'completed').length,
//       completedTasks: relatedTasks.filter(t => t.status === 'completed').length,
//       totalClients: [...new Set(managedProjects.map(p => p.clientName))].length
//     };
//   };

//   // Get total project manager count
//   const getTotalProjectManagerCount = () => {
//     // Count project managers from both projectManagers array and allUsers with project-manager role
//     const projectManagersFromAllUsers = allUsers.filter(user =>
//       user.role === 'project-manager' &&
//       !projectManagers.some(pm => (pm.id || pm._id) === (user.id || user._id))
//     );
//     const totalCount = projectManagers.length + projectManagersFromAllUsers.length;
//     console.log('📊 Project Managers count:', totalCount, '(projectManagers:', projectManagers.length, '+ allUsers:', projectManagersFromAllUsers.length, ')');
//     return totalCount;
//   };

//   // Handle project manager detail view
//   const handleViewProjectManagerDetails = (manager) => {
//     const managerData = getProjectManagerDetails(manager.id || manager._id);
//     if (!managerData) return;

//     setSelectedProjectManager(managerData);
//     setShowIndividualDashboard(true);
//   };

//   // Update project manager data when projects are assigned/unassigned
//   const updateProjectManagerData = () => {
//     setProjectManagers(prev => prev.map(manager => {
//       const managerData = getProjectManagerDetails(manager.id || manager._id);
//       return {
//         ...manager,
//         projectsManaged: managerData?.projectsManaged || 0,
//         teamSize: managerData?.teamSize || 0
//       };
//     }));
//   };

//   // Auto-update project manager data when projects or users change
//   useEffect(() => {
//     if (projectManagers.length > 0 && projects.length > 0) {
//       updateProjectManagerData();
//     }
//   }, [projects, allUsers, assignedTasks]);

//   const handleAddTeamLeader = async (leaderData) => {
//     // Check for duplicates before adding
//     if (!validateUniqueData(leaderData)) {
//       return; // Stop if duplicates found
//     }

//     try {
//       const newLeader = await createTeamLeader({
//         ...leaderData,
//         managedBy: currentRole === 'project-manager' ? userName : null
//       });
//       // setTeamLeaders(prev => [...prev, newLeader]); // Removed derived state


//       // Assign team members to this team leader
//       if (leaderData.teamMembers && leaderData.teamMembers.length > 0) {
//         setEmployees(prev => prev.map(emp => {
//           const isSelectedMember = leaderData.teamMembers.some(member => member.id === emp.id);
//           return isSelectedMember ? { ...emp, teamLeaderId: newLeader.id } : emp;
//         }));
//       }

//       // Add to unified user list
//       const teamLeaderUser = {
//         ...newLeader,
//         role: 'team-leader',
//         userType: 'Team Leader',
//         password: newLeader.password || 'defaultPassword123', // Ensure password exists
//         payroll: newLeader.payroll || `TL${newLeader.id?.slice(-3) || '001'}`
//       };
//       setAllUsers(prev => [...prev, teamLeaderUser]);

//       // Add notification for admin
//       addNotification({
//         type: 'user',
//         title: 'New Team Leader Added',
//         message: `${newLeader.name} has been added as a Team Leader in ${newLeader.department} department with ${leaderData.teamMembers?.length || 0} team members`,
//         timestamp: new Date().toISOString(),
//         priority: 'medium'
//       });

//       // Add to recent activity
//       addRecentActivity({
//         title: 'New Team Leader Added',
//         description: `${newLeader.name} was added as Team Leader`,
//         icon: 'fa-users-cog',
//         iconBg: 'bg-success',
//         timeAgo: 'Just now',
//         details: `Department: ${newLeader.department} | Team Size: ${leaderData.teamMembers?.length || 0} members`
//       });
//     } catch (error) {
//       console.error('Error adding team leader:', error);
//       alert('Failed to add team leader. Please try again.');
//     }
//   };

//   const handleEditTeamLeader = (leader) => {
//     setEditingTeamLeader(leader);
//     setShowAddTeamLeaderModal(true);
//   };

//   const handleUpdateTeamLeader = async (leaderData) => {
//     // Check for duplicates before updating (exclude current team leader)
//     if (!validateUniqueData(leaderData, editingTeamLeader.id || editingTeamLeader._id)) {
//       return; // Stop if duplicates found
//     }

//     try {
//       const updatedLeader = await updateTeamLeader(editingTeamLeader.id, leaderData);
//       // setTeamLeaders removed - derived state


//       // Update team member assignments
//       if (leaderData.teamMembers) {
//         // First, remove all previous team assignments for this leader
//         setEmployees(prev => prev.map(emp =>
//           emp.teamLeaderId === editingTeamLeader.id ? { ...emp, teamLeaderId: null } : emp
//         ));

//         // Then assign new team members
//         setEmployees(prev => prev.map(emp => {
//           const isSelectedMember = leaderData.teamMembers.some(member => member.id === emp.id);
//           return isSelectedMember ? { ...emp, teamLeaderId: editingTeamLeader.id } : emp;
//         }));
//       }

//       // Add notification for team update
//       addNotification({
//         type: 'user',
//         title: 'Team Leader Updated',
//         message: `${leaderData.name}'s team has been updated with ${leaderData.teamMembers?.length || 0} members`,
//         timestamp: new Date().toISOString(),
//         priority: 'medium'
//       });
//     } catch (error) {
//       console.error('Error updating team leader:', error);
//       alert('Failed to update team leader. Please try again.');
//     }
//   };

//   const handleDeleteTeamLeader = async (leaderId, leaderName) => {
//     if (window.confirm(`Are you sure you want to delete "${leaderName}"? This action cannot be undone. All team members will be unassigned.`)) {
//       try {
//         // First unassign all employees from this team leader locally
//         setAllUsers(prev => prev.map(user =>
//           user.teamLeaderId === leaderId ? { ...user, teamLeaderId: null, teamLeaderName: null } : user
//         ));

//         // Try to delete from database
//         let databaseDeleted = false;
//         try {
//           await deleteTeamLeader(leaderId);
//           databaseDeleted = true;
//           console.log('✅ Team leader deleted from database successfully');
//         } catch (apiError) {
//           console.warn('⚠️ Failed to delete from database, proceeding with local deletion:', apiError);

//           // Add to deleted users list to prevent reappearing
//           const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
//           if (!deletedUsers.includes(leaderId)) {
//             deletedUsers.push(leaderId);
//             localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
//           }
//         }

//         // Remove from local state regardless of database result
//         // setTeamLeaders removed - derived state


//         // Remove from allUsers as well
//         setAllUsers(prev => {
//           const updatedUsers = prev.filter(user =>
//             user.id !== leaderId && user._id !== leaderId
//           );
//           // Save updated users to localStorage
//           saveUsersToLocalStorage(updatedUsers);
//           return updatedUsers;
//         });

//         // Show appropriate success message
//         const message = databaseDeleted
//           ? `${leaderName} has been deleted successfully and all team members have been unassigned`
//           : `${leaderName} has been removed locally. Database deletion failed but the user won't reappear on refresh.`;

//         alert(message);

//         // Add notification
//         addNotification({
//           type: 'user',
//           title: 'Team Leader Deleted',
//           message: `${leaderName} has been deleted and all team members have been unassigned`,
//           timestamp: new Date().toISOString(),
//           priority: 'high'
//         });

//       } catch (error) {
//         console.error('Error deleting team leader:', error);
//         alert(`Failed to delete team leader "${leaderName}". Error: ${error.message || 'Unknown error'}`);
//       }
//     }
//   };

//   // Team Management Functions
//   // Team Management Functions
//   // handleUpdateTeamSize removed - teamLeaders is derived state


//   const handleAddTeamMember = (leaderId, employeeId) => {
//     const leader = teamLeaders.find(l => l.id === leaderId);
//     const currentTeamMembers = employees.filter(emp => emp.teamLeaderId === leaderId);

//     if (currentTeamMembers.length >= leader.teamSize) {
//       alert(`Team is full. Current team size is ${leader.teamSize}. Increase team size to add more members.`);
//       return;
//     }

//     setEmployees(prev => prev.map(emp =>
//       emp.id === employeeId ? { ...emp, teamLeaderId: leaderId } : emp
//     ));
//   };

//   const handleRemoveTeamMember = (employeeId) => {
//     setEmployees(prev => prev.map(emp =>
//       emp.id === employeeId ? { ...emp, teamLeaderId: null } : emp
//     ));
//   };

//   // Role Management Functions
//   const handleAddCustomRole = async (roleData) => {
//     try {
//       const newRole = await createCustomRole({
//         ...roleData,
//         createdBy: userName
//       });
//       setCustomRoles(prev => [...prev, newRole]);
//     } catch (error) {
//       console.error('Error adding custom role:', error);
//       alert('Failed to add custom role. Please try again.');
//     }
//   };

//   const handleDeleteCustomRole = async (roleId, roleName) => {
//     if (window.confirm(`Are you sure you want to delete the "${roleName}" role? This action cannot be undone.`)) {
//       try {
//         await deleteCustomRole(roleId);
//         setCustomRoles(prev => prev.filter(role => role.id !== roleId));
//       } catch (error) {
//         console.error('Error deleting custom role:', error);
//         alert('Failed to delete custom role. Please try again.');
//       }
//     }
//   };

//   // Password Management Functions
//   const handleOpenPasswordManagement = (user) => {
//     setSelectedUserForPasswordManagement(user);
//     setShowPasswordManagementModal(true);
//   };

//   const handleResetPassword = async (userId, newPassword) => {
//     try {
//       console.log('🔑 Resetting password for user:', userId);
//       console.log('🔑 New password:', newPassword);

//       // Find the user to get their name
//       let targetUser = allUsers.find(u => u.id === userId || u._id === userId);
//       if (!targetUser) {
//         targetUser = projectManagers.find(pm => pm.id === userId || pm._id === userId);
//       }
//       if (!targetUser) {
//         targetUser = teamLeaders.find(tl => tl.id === userId || tl._id === userId);
//       }

//       const userName = targetUser?.name || 'Unknown User';

//       // Update password in the user data
//       const updatedUserData = {
//         password: newPassword,
//         passwordUpdatedAt: new Date().toISOString(),
//         passwordUpdatedBy: localStorage.getItem('userName') || 'Admin'
//       };

//       // Update password via API
//       try {
//         await updateUserPassword(userId, newPassword);
//         console.log('✅ Password updated in API successfully');
//       } catch (apiError) {
//         console.warn('⚠️ API update failed, updating locally only:', apiError);
//         // If API fails, we'll still update locally below
//       }

//       // Update in local state for all user types
//       const updatedUsers = allUsers.map(user =>
//         (user.id === userId || user._id === userId) ?
//           { ...user, password: newPassword, passwordUpdatedAt: new Date().toISOString() } : user
//       );
//       setAllUsers(updatedUsers);

//       const updatedPMs = projectManagers.map(pm =>
//         (pm.id === userId || pm._id === userId) ?
//           { ...pm, password: newPassword, passwordUpdatedAt: new Date().toISOString() } : pm
//       );
//       setProjectManagers(updatedPMs);

//       // setTeamLeaders removed - derived state


//       // Save to localStorage immediately
//       saveUsersToLocalStorage(updatedUsers);
//       localStorage.setItem('projectManagers', JSON.stringify(updatedPMs));
//       // localStorage.setItem('teamLeaders', JSON.stringify(updatedTLs));

//       console.log('✅ Password updated in all states and localStorage');

//       // Add notification
//       addNotification({
//         type: 'password_reset',
//         title: 'Password Reset',
//         message: `Password has been reset for ${userName}`,
//         timestamp: new Date().toISOString(),
//         priority: 'medium'
//       });

//       // Add to recent activity
//       addRecentActivity({
//         title: 'Password Reset',
//         description: `Password was reset for ${userName}`,
//         icon: 'fa-key',
//         iconBg: 'bg-warning',
//         timeAgo: 'Just now',
//         details: `Reset by: ${localStorage.getItem('userName') || 'Admin'}`
//       });

//       alert(`✅ Password has been reset successfully for ${userName}!`);

//       // Force re-render by updating a timestamp
//       setLastTaskUpdate(Date.now());

//     } catch (error) {
//       console.error('❌ Error resetting password:', error);
//       alert('❌ Failed to reset password. Please try again.');
//     }
//   };

//   const handleDeleteUserFromPasswordModal = async (userId, userName) => {
//     try {
//       // Use existing delete user function
//       await handleDeleteUser(userId, userName);
//       setShowPasswordManagementModal(false);
//       setSelectedUserForPasswordManagement(null);
//     } catch (error) {
//       console.error('Error deleting user from password modal:', error);
//       alert('Failed to delete user. Please try again.');
//     }
//   };

//   // Chart initialization
//   useEffect(() => {
//     if (currentRole === 'admin' && activeView === 'dashboard') {
//       const canvas = document.getElementById('progressChart');
//       if (canvas && window.Chart) {
//         const ctx = canvas.getContext('2d');

//         // Destroy existing chart if it exists
//         if (window.progressChartInstance) {
//           window.progressChartInstance.destroy();
//         }

//         window.progressChartInstance = new window.Chart(ctx, {
//           type: 'line',
//           data: {
//             labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
//             datasets: [
//               {
//                 label: 'Project Completion',
//                 data: progressData.projectCompletion,
//                 borderColor: '#4361ee',
//                 backgroundColor: 'rgba(67, 97, 238, 0.1)',
//                 borderWidth: 3,
//                 fill: true,
//                 tension: 0.4
//               },
//               {
//                 label: 'Team Productivity',
//                 data: progressData.teamProductivity,
//                 borderColor: '#4cc9f0',
//                 backgroundColor: 'rgba(76, 201, 240, 0.1)',
//                 borderWidth: 3,
//                 fill: true,
//                 tension: 0.4
//               }
//             ]
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 position: 'top',
//               },
//               tooltip: {
//                 mode: 'index',
//                 intersect: false
//               }
//             },
//             scales: {
//               y: {
//                 beginAtZero: true,
//                 max: 100,
//                 ticks: {
//                   callback: function (value) {
//                     return value + '%';
//                   }
//                 }
//               }
//             }
//           }
//         });
//       }
//     }
//   }, [currentRole, activeView, progressData]);



//   const handleAssignEmployee = (projectId, employeeId) => {
//     setEmployees(prev => prev.map(emp =>
//       emp.id === employeeId
//         ? { ...emp, projectIds: [...emp.projectIds, projectId] }
//         : emp
//     ));

//     setProjects(prev => prev.map(project =>
//       project.id === projectId
//         ? {
//           ...project,
//           assigned: [...project.assigned, employees.find(e => e.id === employeeId)]
//         }
//         : project
//     ));
//   };

//   const handleUnassignEmployee = (projectId, employeeId) => {
//     setEmployees(prev => prev.map(emp =>
//       emp.id === employeeId
//         ? { ...emp, projectIds: emp.projectIds.filter(id => id !== projectId) }
//         : emp
//     ));

//     setProjects(prev => prev.map(project =>
//       project.id === projectId
//         ? {
//           ...project,
//           assigned: project.assigned.filter(emp => emp.id !== employeeId)
//         }
//         : project
//     ));
//   };

//   // Sort projects by completion percentage (100% first, then descending)
//   const sortedProjects = [...projects].sort((a, b) => b.progress - a.progress);
//   const assignedProjects = sortedProjects.filter(p => p.assigned.length > 0);
//   const unassignedProjects = sortedProjects.filter(p => p.assigned.length === 0);

//   const roleConfig = roles[currentRole] || {
//     title: 'Dashboard',
//     menu: [
//       { icon: 'fas fa-home', text: 'Dashboard', active: true }
//     ],
//     stats: []
//   };

//   return (
//     <div>
//       {/* Mobile Menu Button */}
//       <button
//         className="mobile-menu-btn"
//         onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
//         aria-label="Toggle Menu"
//       >
//         <i className={`fas ${isMobileSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
//         <span className="d-none d-sm-inline">{isMobileSidebarOpen ? 'Close' : 'Menu'}</span>
//       </button>

//       {/* Mobile Overlay */}
//       <div
//         className={`mobile-overlay ${isMobileSidebarOpen ? 'show' : ''}`}
//         onClick={() => setIsMobileSidebarOpen(false)}
//       ></div>

//       {/* Mobile Action Buttons - Top Right */}
//       <div className="mobile-action-buttons d-md-none">
//         {currentRole === 'admin' && (
//           <button
//             className="btn btn-outline-primary btn-sm"
//             onClick={() => setShowPasswordManagementModal(true)}
//             title="Password Management"
//           >
//             <i className="fas fa-key"></i>
//           </button>
//         )}

//         <div className="dropdown">
//           <button
//             className="btn btn-outline-secondary btn-sm position-relative"
//             type="button"
//             data-bs-toggle="dropdown"
//             aria-expanded="false"
//             title="Notifications"
//           >
//             <i className="fas fa-bell"></i>
//             {getUnreadNotificationCount() > 0 && (
//               <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
//                 {getUnreadNotificationCount()}
//               </span>
//             )}
//           </button>
//           <div className="dropdown-menu dropdown-menu-end" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
//             <div className="dropdown-header d-flex justify-content-between align-items-center">
//               <span>Notifications</span>
//               {notifications.length > 0 && (
//                 <button
//                   className="btn btn-sm btn-link text-decoration-none p-0"
//                   onClick={clearAllNotifications}
//                 >
//                   Clear All
//                 </button>
//               )}
//             </div>
//             {notifications.length === 0 ? (
//               <div className="dropdown-item-text text-center text-muted py-3">
//                 <i className="fas fa-bell-slash mb-2 d-block"></i>
//                 No notifications
//               </div>
//             ) : (
//               notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`dropdown-item ${!notification.read ? 'bg-light' : ''}`}
//                   onClick={() => markNotificationAsRead(notification.id)}
//                   style={{ cursor: 'pointer' }}
//                 >
//                   <div className="d-flex align-items-start">
//                     <div className={`me-2 mt-1 ${notification.type === 'task' ? 'text-primary' :
//                       notification.type === 'update' ? 'text-info' :
//                         notification.type === 'deadline' ? 'text-warning' : 'text-secondary'
//                       }`}>
//                       <i className={`fas ${notification.type === 'task' ? 'fa-tasks' :
//                         notification.type === 'update' ? 'fa-clipboard-list' :
//                           notification.type === 'deadline' ? 'fa-clock' : 'fa-bell'
//                         }`}></i>
//                     </div>
//                     <div className="flex-grow-1">
//                       <div className="fw-semibold small">{notification.title}</div>
//                       <div className="text-muted small">{notification.message}</div>
//                       <div className="text-muted small mt-1">{notification.time}</div>
//                     </div>
//                     {!notification.read && (
//                       <div className="ms-2">
//                         <span className="badge bg-primary rounded-pill" style={{ width: '8px', height: '8px' }}></span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         <button
//           className="btn btn-sm btn-outline-danger"
//           onClick={handleLogout}
//           title="Logout"
//         >
//           <i className="fas fa-sign-out-alt"></i>
//         </button>
//       </div>

//       {/* External CSS (Bootstrap, Font Awesome) should be included in public/index.html */}

//       <style>{`
//         /* Sidebar Navigation Styles */
//         .sidebar .nav-link {
//           color: rgba(255, 255, 255, 0.9) !important;
//           border-radius: 0.5rem;
//           margin-bottom: 0.25rem;
//           padding: 0.75rem 1rem;
//           text-decoration: none !important;
//           display: flex;
//           align-items: center;
//           transition: all 0.3s ease;
//         }
        
//         .sidebar .nav-link:hover {
//           background-color: rgba(255, 255, 255, 0.15) !important;
//           color: white !important;
//           transform: translateX(3px);
//         }
        
//         .sidebar .nav-link.active {
//           background-color: rgba(255, 255, 255, 0.2) !important;
//           color: white !important;
//         }
        
//         .sidebar .nav-link i {
//           margin-right: 0.75rem;
//           width: 20px;
//           text-align: center;
//           opacity: 1 !important;
//           visibility: visible !important;
//         }
        
//         .sidebar * {
//           color: white;
//         }
        
//         /* Sidebar dropdown menu */
//         .sidebar .dropdown-menu {
//           background-color: #2d3748 !important;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//         }
        
//         .sidebar .dropdown-menu .dropdown-item {
//           color: rgba(255, 255, 255, 0.9) !important;
//           padding: 0.5rem 1rem;
//         }
        
//         .sidebar .dropdown-menu .dropdown-item:hover {
//           background-color: rgba(255, 255, 255, 0.1) !important;
//           color: white !important;
//         }
        
//         .sidebar .dropdown-menu .dropdown-divider {
//           border-color: rgba(255, 255, 255, 0.1);
//         }
        
//         /* Sidebar submenu styling */
//         .sidebar .nav .nav {
//           background-color: rgba(0, 0, 0, 0.15);
//           border-radius: 0.5rem;
//           padding: 0.5rem 0;
//           margin-bottom: 0.5rem;
//         }
        
//         .sidebar .nav .nav .nav-link {
//           padding: 0.5rem 1rem;
//           font-size: 0.9rem;
//         }
        
//         /* Mobile menu button */
//         .mobile-menu-btn {
//           display: none;
//           position: fixed;
//           top: 1rem;
//           left: 1rem;
//           z-index: 1060;
//           background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
//           color: white;
//           border: none;
//           border-radius: 8px;
//           padding: 0.75rem 1rem;
//           box-shadow: 0 4px 6px rgba(79, 70, 229, 0.4);
//           font-size: 1.25rem;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }
        
//         .mobile-menu-btn:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 16px rgba(79, 70, 229, 0.6);
//         }
        
//         .mobile-menu-btn:active {
//           transform: scale(0.95);
//         }
        
//         /* Mobile action buttons */
//         .mobile-action-buttons {
//           display: none;
//           position: fixed;
//           top: 1rem;
//           right: 1rem;
//           z-index: 1060;
//           gap: 0.5rem;
//         }
        
//         .mobile-action-buttons .btn {
//           padding: 0.5rem 0.75rem;
//           font-size: 1rem;
//           border-radius: 8px;
//           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//         }
        
//         @media (max-width: 768px) {
//           /* Show mobile menu button */
//           .mobile-menu-btn {
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//           }
          
//           /* Show mobile action buttons */
//           .mobile-action-buttons {
//             display: flex !important;
//           }
          
//           /* Sidebar styles */
//           .sidebar {
//             background: linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%);
//             box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
//             position: fixed;
//             left: -100%;
//             width: 280px !important;
//             transition: left 0.3s ease-in-out, transform 0.3s ease-in-out;
//             z-index: 1055 !important;
//             max-width: 85vw;
//             overflow-y: auto;
//             overflow-x: hidden;
//             min-height: 100vh;
//             max-height: 100vh;
//           }
          
//           .sidebar.mobile-open {
//             left: 0 !important;
//           }
          
//           /* Mobile overlay */
//           .mobile-overlay {
//             display: none;
//             position: fixed;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: rgba(0, 0, 0, 0.5);
//             z-index: 1050;
//             backdrop-filter: blur(2px);
//           }
          
//           .mobile-overlay.show {
//             display: block;
//           }
          
//           /* Main content adjustments */
//           .main-content {
//             margin-left: 0 !important;
//             width: 100% !important;
//             padding: 0.5rem !important;
//           }
          
//           .col-md-9, .col-lg-10 {
//             margin-left: 0 !important;
//             width: 100% !important;
//             max-width: 100% !important;
//             padding-left: 0.75rem !important;
//             padding-right: 0.75rem !important;
//           }
          
//           /* Dashboard Header Mobile Layout */
//           .dashboard-header {
//             padding-top: 4.5rem !important;
//             margin-bottom: 1rem !important;
//           }
          
//           .dashboard-header .row {
//             flex-direction: column;
//             gap: 0.75rem;
//           }
          
//           .dashboard-header .col {
//             text-align: center;
//             width: 100%;
//           }
          
//           .dashboard-header .col-auto {
//             display: none !important;
//           }
          
//           .dashboard-header .page-title {
//             font-size: 1.5rem !important;
//             margin-bottom: 0.25rem;
//           }
          
//           .dashboard-header .text-secondary-muted {
//             font-size: 0.875rem !important;
//           }
          
//           /* Card Responsive */
//           .card {
//             margin-bottom: 1rem !important;
//           }
          
//           .card-body {
//             padding: 1rem !important;
//           }
          
//           /* KPI Cards Mobile */
//           .kpi-card {
//             margin-bottom: 0.75rem !important;
//           }
          
//           .kpi-value {
//             font-size: 1.25rem !important;
//           }
          
//           .kpi-title {
//             font-size: 0.7rem !important;
//           }
          
//           /* Container adjustments */
//           .container-fluid {
//             padding-left: 0.75rem !important;
//             padding-right: 0.75rem !important;
//           }
          
//           /* Row adjustments */
//           .row {
//             margin-left: -0.5rem !important;
//             margin-right: -0.5rem !important;
//           }
          
//           .row > * {
//             padding-left: 0.5rem !important;
//             padding-right: 0.5rem !important;
//           }
          
//           /* Dashboard header mobile */
//           .dashboard-header {
//             padding: 1rem 0.75rem !important;
//             margin-top: 4rem !important;
//           }
          
//           .dashboard-header .row {
//             flex-direction: column;
//             gap: 1rem;
//           }
          
//           .dashboard-header .col {
//             width: 100%;
//             margin-bottom: 0;
//           }
          
//           .dashboard-header .col-auto {
//             width: 100%;
//           }
          
//           .dashboard-header .d-flex.align-items-center {
//             flex-direction: column;
//             align-items: stretch !important;
//             gap: 0.75rem !important;
//           }
          
//           .dashboard-header .btn {
//             width: 100%;
//             justify-content: center;
//             text-align: center;
//           }
          
//           .dashboard-header .dropdown {
//             width: 100%;
//           }
          
//           .dashboard-header .dropdown .btn {
//             width: 100%;
//           }
          
//           .dashboard-header .btn-outline-primary,
//           .dashboard-header .btn-outline-secondary {
//             padding: 0.65rem 1rem;
//             font-size: 0.9rem;
//           }
          
//           .page-title {
//             font-size: 1.5rem !important;
//             margin-bottom: 0.5rem !important;
//             text-align: center;
//           }
          
//           .text-secondary-muted {
//             font-size: 0.875rem !important;
//             text-align: center;
//           }
          
//           /* Button groups mobile */
//           .d-flex.gap-2 {
//             flex-wrap: wrap;
//             gap: 0.5rem !important;
//           }
          
//           .btn-sm {
//             font-size: 0.8rem;
//             padding: 0.5rem 0.75rem;
//           }
          
//           /* Card header buttons */
//           .card-header .d-flex {
//             flex-wrap: wrap;
//             gap: 0.5rem !important;
//           }
          
//           .card-header .btn-group {
//             flex-wrap: wrap;
//           }
          
//           .card-header h5, .card-header h4 {
//             font-size: 1.1rem !important;
//             margin-bottom: 0.5rem;
//           }
          
//           /* KPI Cards mobile - Full width */
//           .col-xl-3, .col-lg-6, .col-md-6, .col-sm-12 {
//             flex: 0 0 100% !important;
//             max-width: 100% !important;
//             padding-left: 0.5rem !important;
//             padding-right: 0.5rem !important;
//           }
          
//           .kpi-card {
//             margin-bottom: 1rem !important;
//           }
          
//           /* Cards */
//           .card {
//             margin-bottom: 1rem !important;
//             border-radius: 12px;
//           }
          
//           .card-header {
//             padding: 1rem !important;
//             flex-wrap: wrap;
//           }
          
//           .card-header .d-flex.justify-content-between {
//             flex-direction: column;
//             align-items: flex-start !important;
//             gap: 0.75rem;
//           }
          
//           .card-header .d-flex.justify-content-between > * {
//             width: 100%;
//           }
          
//           .card-body {
//             padding: 1rem !important;
//           }
          
//           /* User stats badges */
//           .badge {
//             font-size: 0.75rem;
//             padding: 0.4rem 0.65rem;
//             white-space: nowrap;
//           }
          
//           /* User Management specific */
//           .card-header .input-group {
//             max-width: 100%;
//           }
          
//           .card-header .btn-group .btn {
//             font-size: 0.8rem;
//             padding: 0.5rem 0.75rem;
//           }
          
//           /* Tables */
//           .table-responsive {
//             font-size: 0.85rem;
//             overflow-x: auto;
//             -webkit-overflow-scrolling: touch;
//           }
          
//           .table th, .table td {
//             padding: 0.75rem 0.5rem !important;
//             white-space: nowrap;
//           }
          
//           /* Action buttons in cards */
//           .card .d-flex.justify-content-between.align-items-center {
//             flex-direction: column;
//             align-items: flex-start !important;
//             gap: 0.75rem;
//           }
          
//           .card .d-flex.justify-content-between.align-items-center > .d-flex {
//             width: 100%;
//             justify-content: space-between;
//           }
          
//           .card .btn-group {
//             width: 100%;
//           }
          
//           .card .btn-group .btn {
//             flex: 1;
//           }
          
//           /* Modals */
//           .modal-dialog {
//             margin: 0.5rem !important;
//             max-width: calc(100% - 1rem) !important;
//           }
          
//           .modal-xl, .modal-lg {
//             max-width: 100% !important;
//           }
          
//           /* Input groups */
//           .input-group {
//             font-size: 0.9rem;
//           }
          
//           /* Dropdown */
//           .dropdown-menu {
//             font-size: 0.875rem;
//             max-width: 90vw;
//           }
          
//           /* Badges */
//           .badge {
//             font-size: 0.75rem;
//             padding: 0.35rem 0.6rem;
//           }
          
//           /* User stats badges in header */
//           .d-flex.align-items-center .badge {
//             font-size: 0.7rem;
//             padding: 0.3rem 0.5rem;
//             margin: 0.15rem;
//           }
          
//           /* Avatar circles */
//           .rounded-circle {
//             width: 36px !important;
//             height: 36px !important;
//             font-size: 0.9rem !important;
//           }
          
//           /* User stats section */
//           .card-body .d-flex.align-items-center.mb-3 {
//             flex-wrap: wrap;
//             gap: 0.5rem !important;
//           }
          
//           .card-body .d-flex.align-items-center.mb-3 h5 {
//             width: 100%;
//             margin-bottom: 0.5rem;
//           }
          
//           .card-body .d-flex.align-items-center.mb-3 .badge {
//             margin: 0.25rem;
//           }
//         }
        
//         @media (max-width: 576px) {
//           /* Extra small devices */
//           .mobile-menu-btn {
//             padding: 0.6rem 0.85rem;
//             font-size: 1.1rem;
//           }
          
//           .sidebar {
//             width: 260px !important;
//           }
          
//           .page-title {
//             font-size: 1.25rem !important;
//             text-align: center;
//           }
          
//           .section-title {
//             font-size: 1.1rem !important;
//           }
          
//           .btn {
//             font-size: 0.85rem;
//             padding: 0.5rem 0.75rem;
//           }
          
//           .btn-sm {
//             font-size: 0.75rem;
//             padding: 0.4rem 0.6rem;
//           }
          
//           .dashboard-header .btn {
//             font-size: 0.85rem;
//             padding: 0.6rem 0.85rem;
//           }
          
//           .dashboard-header .btn i {
//             margin-right: 0.4rem;
//           }
          
//           .kpi-value {
//             font-size: 1.5rem !important;
//           }
          
//           .kpi-title {
//             font-size: 0.75rem !important;
//           }
          
//           /* Notification dropdown adjustments */
//           .dropdown-menu {
//             width: 100vw !important;
//             max-width: calc(100vw - 2rem) !important;
//             left: 50% !important;
//             transform: translateX(-50%) !important;
//           }
          
//           /* Hide some table columns on very small screens */
//           .table td:nth-child(n+6),
//           .table th:nth-child(n+6) {
//             display: none;
//           }
          
//           /* Table header adjustments */
//           .table thead th {
//             font-size: 0.8rem;
//             padding: 0.6rem 0.4rem !important;
//           }
          
//           .table tbody td {
//             font-size: 0.8rem;
//             padding: 0.6rem 0.4rem !important;
//           }
          
//           /* Dropdown menus in tables */
//           .table .dropdown-menu {
//             font-size: 0.8rem;
//           }
//         }
        
//         @media (max-width: 400px) {
//           /* Very small devices */
//           .sidebar {
//             width: 240px !important;
//           }
          
//           .mobile-menu-btn {
//             padding: 0.5rem 0.75rem;
//             font-size: 1rem;
//           }
          
//           .dashboard-header {
//             padding: 0.75rem 0.5rem !important;
//             margin-top: 3.5rem !important;
//           }
          
//           .dashboard-header .btn {
//             font-size: 0.8rem;
//             padding: 0.55rem 0.75rem;
//           }
          
//           .page-title {
//             font-size: 1.1rem !important;
//           }
          
//           .text-secondary-muted {
//             font-size: 0.8rem !important;
//           }
          
//           .card-body {
//             padding: 0.75rem !important;
//           }
//         }
        
//         /* Mobile Responsive Styles - REMOVED DUPLICATE */
          
//           /* Card Responsive */
//           .card {
//             margin-bottom: 1rem !important;
//           }
          
//           .card-body {
//             padding: 1rem !important;
//           }
          
//           /* KPI Cards Mobile */
//           .kpi-card {
//             margin-bottom: 0.75rem !important;
//           }
          
//           .kpi-value {
//             font-size: 1.25rem !important;
//           }
          
//           .kpi-title {
//             font-size: 0.7rem !important;
//           }
          
//           /* Table Responsive */
//           .table-responsive {
//             overflow-x: auto;
//             -webkit-overflow-scrolling: touch;
//           }
          
//           .table {
//             font-size: 0.85rem;
//             min-width: 600px;
//           }
          
//           .table th,
//           .table td {
//             padding: 0.5rem !important;
//             white-space: nowrap;
//           }
          
//           /* Button Groups */
//           .btn-group {
//             flex-wrap: wrap;
//           }
          
//           .btn-sm {
//             font-size: 0.75rem;
//             padding: 0.25rem 0.5rem;
//           }
          
//           /* Modal Mobile */
//           .modal-dialog {
//             margin: 0.5rem;
//             max-width: calc(100% - 1rem);
//           }
          
//           .modal-xl,
//           .modal-lg {
//             max-width: calc(100% - 1rem);
//           }
          
//           /* Form Controls */
//           .form-control,
//           .form-select {
//             font-size: 0.9rem;
//           }
          
//           /* Badges and Pills */
//           .badge {
//             font-size: 0.7rem;
//             padding: 0.25rem 0.5rem;
//           }
          
//           /* Dropdown Menus */
//           .dropdown-menu {
//             font-size: 0.85rem;
//           }
          
//           /* Avatar Circles */
//           .rounded-circle {
//             width: 32px !important;
//             height: 32px !important;
//             font-size: 12px !important;
//           }
          
//           /* Progress Bars */
//           .progress {
//             height: 4px !important;
//           }
          
//           /* Spacing Utilities */
//           .mb-4 {
//             margin-bottom: 1rem !important;
//           }
          
//           .mb-3 {
//             margin-bottom: 0.75rem !important;
//           }
          
//           .p-4 {
//             padding: 1rem !important;
//           }
          
//           .p-3 {
//             padding: 0.75rem !important;
//           }
          
//           /* Typography */
//           h1, .h1 {
//             font-size: 1.5rem !important;
//           }
          
//           h2, .h2 {
//             font-size: 1.35rem !important;
//           }
          
//           h3, .h3 {
//             font-size: 1.2rem !important;
//           }
          
//           h4, .h4 {
//             font-size: 1.1rem !important;
//           }
          
//           h5, .h5 {
//             font-size: 1rem !important;
//           }
          
//           h6, .h6 {
//             font-size: 0.9rem !important;
//           }
          
//           .page-title {
//             font-size: 1.5rem !important;
//           }
          
//           .section-title {
//             font-size: 1.1rem 
        
          
//              Hide on Mobile */
//             .sine-mobdee {
//  bar .n     display: none !important;av {
//           }
//                    --bs-nav-link-color: rgba(255, 255, 255, 0.8);
//           /* Stack columns on mobil    
//           .row > [class*="col-    --bs-nav-link-hover-color: white;
//             margin-b   }m: 0.75rem;
          
          
//           /* Input Groups */
//  put-group {
//          p: nowrap;
          
//           roup .forntrol {
//           th: 0;
     
          
//           /* Notification Dropdown */
//           .dropdown-menu {
//             max-width: 90vw;
//           }
          
//           /* Dashboard Header */
//           .dashboard-header {
//             padding: 0.75rem 1rem !important;
//           }
          
//           .dashboard-header .row {
//             gap: 1rem;
//           }
          
//           .dashboard-header .col {
//             flex: 1 1 100%;
//             max-width: 100%;
//           }
          
//           .dashboard-header .col-auto {
//             flex: 1 1 100%;
//             max-width: 100%;
//           }
          
//           .dashboard-header .d-flex {
//             flex-wrap: wrap;
//             justify-content: flex-start !important;
//             gap: 0.5rem !important;
//           }
          
//           .dashboard-header .btn {
//             flex: 1 1 auto;
//             min-width: fit-content;
//             white-space: nowrap;
//           }
          
//           .dashboard-header .dropdown {
//             flex: 0 0 auto;
//           }
          
//               ilter Dropdo  .n/
//    av-lin 50max-hlow-y: auto;
//           }
//   eight: 80vh;
        
//           /     @mediall devices */
//  a        .col-lg-6,
//             max    .co 100%;
//           }
//        l-md-0 0 100%;
//                     .col-x(max-width: 576px) {% !importk {ilnslate(-50%, -50%) !importerant;-dropamportant;
//           }title {
//           ;
//         }
//           .mobile-he none !imp      ;
         
//           }
          
//           }
//         }       display: none !important;
//            .sidebar-o
//             display: none !  le-menu-btn 
     
//             d    tsa (min-width: */
//         @
//         /* Desktop - Hide mo}able .table.tab table-cellle.table-full td
//             di         h:nth-ay:chine;
//       ld(n+4) {
//             displ
//            tables */
         
//       table td:nth-child(n+
//           /* Hide extra cfont-size: 0.95
//           .card- 
//           font-size: 0.85re 0.75rem;
//   m;
//             padding            tr  sform: trant;
//             top: 5down {
//        position: fixed
//           color: rgba(255, 255, 255, 0.8) !important;
//           border-radius: 0.5rem;
//           margin-bottom: 0.25rem;
//           padding: 0.75rem 1rem;
//           text-decoration: none !important;
//           display: flex;
//           align-items: center;
//           transition: all 0.3s ease;
//           position: relative;
//           z-index: 1;
//         }
//         .nav-link:hover, .nav-link.active {
//           background-color: rgba(255, 255, 255, 0.15) !important;
//           color: white !important;
//           transform: translateX(3px);
//         }
//         .nav-link:focus {
//           color: white !important;
//           background-color: rgba(255, 255, 255, 0.15) !important;
//         }
//         .nav-link i {
//           margin-right: 0.75rem;
//           width: 20px;
//           text-align: center;
//           opacity: 1 !important;
//           visibility: visible !important;
//         }
//         .sidebar .nav-pills .nav-link {
//           color: rgba(255, 255, 255, 0.8) !important;
//         }
//         .sidebar .nav-pills .nav-link:hover {
//           color: white !important;
//           background-color: rgba(255, 255, 255, 0.15) !important;
//         }
//         .sidebar .nav-pills .nav-link.active {
//           color: white !important;
//           background-color: rgba(255, 255, 255, 0.2) !important;
//         }
//         /* Standardized Card Styling */
//         .card {
//           border: 1px solid #e2e8f0;
//           border-radius: 12px;
//           background: #ffffff;
//           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }
//         .card:hover {
//           box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
//           transform: translateY(-2px);
//         }
        
//         /* Interactive dashboard cards */
//         .dashboard-card {
//           cursor: pointer;
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }
//         .dashboard-card:hover {
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
//           transform: translateY(-4px) scale(1.02);
//           border-color: #3b82f6;
//         }
//         .dashboard-card:active {
//           transform: translateY(-2px) scale(1.01);
//         }

//         /* Real-time indicators */
//         @keyframes pulse {
//           0% { opacity: 1; }
//           50% { opacity: 0.5; }
//           100% { opacity: 1; }
//         }
        
//         .real-time-indicator {
//           animation: pulse 2s infinite;
//         }
        
//         .live-badge {
//           background: linear-gradient(45deg, #28a745, #20c997);
//           color: white;
//           font-size: 0.7rem;
//           padding: 0.25rem 0.5rem;
//           border-radius: 0.375rem;
//         }
//         .dashboard-header {
//           background-color: #f8fafc;
//           border-bottom: 1px solid #e2e8f0;
//         }
//         /* Enhanced KPI Card Styling */
//         .kpi-card {
//           border: 1px solid #e2e8f0;
//           border-radius: 12px;
//           background: #ffffff;
//           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           position: relative;
//           overflow: hidden;
//           cursor: pointer;
//         }
//         .kpi-card:hover {
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
//           transform: translateY(-4px) scale(1.02);
//           border-color: #3b82f6;
//           background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
//         }
//         .kpi-card:active {
//           transform: translateY(-2px) scale(1.01);
//           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
//         }
//         .kpi-card.clickable {
//           cursor: pointer;
//         }
//         .kpi-card.clickable:hover {
//           border-color: #3b82f6;
//           background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
//         }
//         .kpi-card.clickable:focus {
//           outline: 2px solid #3b82f6;
//           outline-offset: 2px;
//         }
        
//         /* Enhanced hover effects for icons and text */
//         .kpi-card:hover .kpi-icon {
//           /* Icon size remains constant on hover */
//           transform: none;
//         }
//         .kpi-card:hover .kpi-value {
//           color: #3b82f6 !important;
//           transition: color 0.3s ease;
//         }
//         .kpi-card:hover .kpi-trend {
//           transform: translateX(2px);
//           transition: transform 0.3s ease;
//         }
//         .kpi-content {
//           width: 100%;
//         }
//         .kpi-icon {
//           font-size: 1.25rem;
//         }
//         .kpi-title {
//           font-size: 0.75rem;
//           font-weight: 600;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//         }
//         .kpi-value {
//           font-size: 1.5rem;
//           font-weight: 700;
//           line-height: 1.2;
//         }
//         .kpi-trend {
//           font-size: 0.75rem;
//           font-weight: 500;
//         }
        
//         /* 3-Level Heading Hierarchy */
//         .page-title {
//           font-size: 2rem;
//           font-weight: 700;
//           color: #1a202c;
//           margin-bottom: 0.5rem;
//         }
//         .section-title {
//           font-size: 1.25rem;
//           font-weight: 600;
//           color: #2d3748;
//           margin-bottom: 1rem;
//         }
//         .widget-title {
//           font-size: 1rem;
//           font-weight: 500;
//           color: #4a5568;
//           margin-bottom: 0.75rem;
//         }
        
//         /* Improved Text Contrast */
//         .text-primary-dark {
//           color: #1a202c !important;
//         }
//         .text-secondary-muted {
//           color: #718096 !important;
//         }
//         .text-tertiary-light {
//           color: #a0aec0 !important;
//         }
//         .border-left-primary { border-left: 0.25rem solid #007bff !important; }
//         .border-left-success { border-left: 0.25rem solid #28a745 !important; }
//         .border-left-info { border-left: 0.25rem solid #17a2b8 !important; }
//         .border-left-warning { border-left: 0.25rem solid #ffc107 !important; }
//         .text-primary { color: #007bff !important; }
//         .text-success { color: #28a745 !important; }
//         .text-info { color: #17a2b8 !important; }
//         .text-warning { color: #ffc107 !important; }
//         .text-gray-800 { color: #2d3748 !important; }
//         .text-gray-300 { color: #cbd5e0 !important; }
//         .text-xs { font-size: 0.75rem; }
//         .font-weight-bold { font-weight: 700 !important; }
//         .text-uppercase { text-transform: uppercase !important; }
//       `}</style>

//       <div className="container-fluid">
//         <div className="row">
//           {/* Sidebar */}
//           <div className={`col-md-3 col-lg-2 sidebar p-0 ${isMobileSidebarOpen ? 'mobile-open' : ''}`} style={{ background: 'linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%)', minHeight: '100vh' }}>
//             <div className="d-flex flex-column h-100">
//               <div className="d-flex flex-column flex-shrink-0 p-3 text-white">
//                 <a href="#" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
//                   <i className="fas fa-tachometer-alt me-2"></i>
//                   <span className="fs-4 fw-bold">{roleConfig.title}</span>
//                 </a>
//                 <hr />
//                 <ul className="nav nav-pills flex-column mb-auto">
//                   {roleConfig.menu.map((item, index) => (
//                     <li key={index} className="nav-item">
//                       {item.hasDropdown ? (
//                         <>
//                           <a
//                             href="#"
//                             className={`nav-link ${item.active ? 'active' : ''} d-flex justify-content-between align-items-center`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               setOpenDropdown(openDropdown === item.text ? null : item.text);
//                             }}
//                           >
//                             <span>
//                               <i className={`${item.icon} me-2`}></i>
//                               {item.text}
//                             </span>
//                             <i className={`fas fa-chevron-${openDropdown === item.text ? 'up' : 'down'} ms-auto`} style={{ fontSize: '0.75rem' }}></i>
//                           </a>
//                           {openDropdown === item.text && item.submenu && (
//                             <ul className="nav flex-column ms-3 mt-1">
//                               {item.submenu.map((subitem, subindex) => (
//                                 <li key={subindex} className="nav-item">
//                                   <a
//                                     href="#"
//                                     className="nav-link py-2"
//                                     onClick={(e) => {
//                                       e.preventDefault();
//                                       handleMenuClick(subitem.text);
//                                     }}
//                                     style={{ fontSize: '0.9rem', paddingLeft: '2rem' }}
//                                   >
//                                     <i className={`${subitem.icon} me-2`} style={{ fontSize: '0.85rem' }}></i>
//                                     {subitem.text}
//                                   </a>
//                                 </li>
//                               ))}
//                             </ul>
//                           )}
//                         </>
//                       ) : (
//                         <a
//                           href="#"
//                           className={`nav-link ${item.active ? 'active' : ''}`}
//                           onClick={(e) => {
//                             e.preventDefault();
//                             handleMenuClick(item.text);
//                           }}
//                         >
//                           <i className={`${item.icon} me-2`}></i>
//                           {item.text}
//                         </a>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//                 <hr />
//                 <div className="dropdown">
//                   <a
//                     href="#"
//                     className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
//                     id="dropdownUser1"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     <img
//                       src="https://github.com/mdo.png"
//                       alt=""
//                       width="32"
//                       height="32"
//                       className="rounded-circle me-2"
//                     />
//                     <strong>{userName}</strong>
//                   </a>
//                   <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
//                     <li><a className="dropdown-item" href="#">Profile</a></li>
//                     <li><a className="dropdown-item" href="#">Settings</a></li>
//                     <li><hr className="dropdown-divider" /></li>
//                     <li><a className="dropdown-item" href="#" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i>Sign out</a></li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="col-md-9 col-lg-10 ms-sm-auto px-4" style={{ marginLeft: '16.666667%' }}>
//             {/* Header */}
//             <div className="dashboard-header pt-3 pb-2 mb-3">
//               <div className="row align-items-center">
//                 <div className="col">
//                   <h1 className="page-title">
//                     {currentRole === 'employee' || currentRole === 'intern'
//                       ? `${localStorage.getItem('userName') || 'Employee'} Dashboard`
//                       : roleConfig.title
//                     }
//                   </h1>
//                   <p className="text-secondary-muted mb-0">
//                     {currentRole === 'employee' || currentRole === 'intern'
//                       ? `Welcome to your employee dashboard`
//                       : `Welcome to your ${currentRole.replace('-', ' ')} dashboard`
//                     }
//                   </p>
//                 </div>
//                 <div className="col-auto">
//                   <div className="d-flex align-items-center gap-2">
//                     {/* Password Management Button - Only for Admin */}
//                     {currentRole === 'admin' && (
//                       <button
//                         className="btn btn-outline-primary btn-sm"
//                         onClick={() => setShowPasswordManagementModal(true)}
//                         title="Password Management"
//                       >
//                         <i className="fas fa-key"></i>
//                       </button>
//                     )}

//                     {/* Notification Dropdown */}
//                     <div className="dropdown">
//                       <button
//                         className="btn btn-outline-secondary btn-sm position-relative"
//                         type="button"
//                         data-bs-toggle="dropdown"
//                         aria-expanded="false"
//                         title="Notifications"
//                       >
//                         <i className="fas fa-bell"></i>
//                         {getUnreadNotificationCount() > 0 && (
//                           <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//                             {getUnreadNotificationCount()}
//                           </span>
//                         )}
//                       </button>
//                       <div className="dropdown-menu dropdown-menu-end" style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}>
//                         <div className="dropdown-header d-flex justify-content-between align-items-center">
//                           <span>Notifications</span>
//                           {notifications.length > 0 && (
//                             <button
//                               className="btn btn-sm btn-link text-decoration-none p-0"
//                               onClick={clearAllNotifications}
//                             >
//                               Clear All
//                             </button>
//                           )}
//                         </div>
//                         {notifications.length === 0 ? (
//                           <div className="dropdown-item-text text-center text-muted py-3">
//                             <i className="fas fa-bell-slash mb-2 d-block"></i>
//                             No notifications
//                           </div>
//                         ) : (
//                           notifications.map((notification) => (
//                             <div
//                               key={notification.id}
//                               className={`dropdown-item ${!notification.read ? 'bg-light' : ''}`}
//                               onClick={() => markNotificationAsRead(notification.id)}
//                               style={{ cursor: 'pointer' }}
//                             >
//                               <div className="d-flex align-items-start">
//                                 <div className={`me-2 mt-1 ${notification.type === 'task' ? 'text-primary' :
//                                   notification.type === 'update' ? 'text-info' :
//                                     notification.type === 'deadline' ? 'text-warning' : 'text-secondary'
//                                   }`}>
//                                   <i className={`fas ${notification.type === 'task' ? 'fa-tasks' :
//                                     notification.type === 'update' ? 'fa-clipboard-list' :
//                                       notification.type === 'deadline' ? 'fa-clock' : 'fa-bell'
//                                     }`}></i>
//                                 </div>
//                                 <div className="flex-grow-1">
//                                   <div className="fw-semibold">{notification.title}</div>
//                                   <div className="text-muted small">{notification.message}</div>
//                                   <div className="text-muted small mt-1">{notification.time}</div>
//                                 </div>
//                                 {!notification.read && (
//                                   <div className="ms-2">
//                                     <span className="badge bg-primary rounded-pill" style={{ width: '8px', height: '8px' }}></span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           ))
//                         )}
//                       </div>
//                     </div>


//                     <button
//                       className="btn btn-sm btn-outline-danger"
//                       onClick={handleLogout}
//                       title="Logout"
//                     >
//                       <i className="fas fa-sign-out-alt"></i>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Enhanced KPI Cards - Only show on dashboard view */}
//             {activeView === 'dashboard' && (
//               <div className="row">
//                 {roleConfig.stats.map((stat, index) => (
//                   <div key={index} className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
//                     <div
//                       className={`card kpi-card h-100 ${stat.clickable ? 'clickable' : ''}`}
//                       onClick={() => stat.clickable && handleCardClick(stat.title)}
//                       onDoubleClick={() => stat.clickable && handleCardDoubleClick(stat.title)}
//                       role={stat.clickable ? 'button' : 'presentation'}
//                       tabIndex={stat.clickable ? 0 : -1}
//                       aria-label={stat.ariaLabel}
//                       onKeyDown={(e) => {
//                         if (stat.clickable && (e.key === 'Enter' || e.key === ' ')) {
//                           e.preventDefault();
//                           handleCardClick(stat.title);
//                         }
//                       }}
//                     >
//                       <div className="card-body p-3">
//                         <div className="d-flex align-items-center justify-content-between">
//                           <div className="kpi-content">
//                             <div className={`kpi-icon text-${stat.color} mb-2`}>
//                               <i className={`${stat.icon} fa-lg`} aria-hidden="true"></i>
//                             </div>
//                             <div className="kpi-title text-muted small mb-1">{stat.title}</div>
//                             <div className="kpi-value h4 mb-0 font-weight-bold text-dark">{stat.value}</div>
//                             {stat.trend && (
//                               <div className={`kpi-trend small mt-1 ${stat.trend.startsWith('+') ? 'text-success' :
//                                 stat.trend.startsWith('-') ? 'text-danger' : 'text-muted'
//                                 }`}>
//                                 <i className={`fas ${stat.trend.startsWith('+') ? 'fa-arrow-up' :
//                                   stat.trend.startsWith('-') ? 'fa-arrow-down' : 'fa-minus'
//                                   } me-1`} aria-hidden="true"></i>
//                                 {stat.trend}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Content based on role */}
//             <div className="row">
//               <div className="col-12">
//                 {currentRole === 'admin' && activeView === 'dashboard' && (
//                   <div>
//                     <div className="row mb-4">
//                       {/* Overall Progress Analytics Chart */}
//                       <div className="col-md-8 mb-4">
//                         <div className="card">
//                           <div className="card-header d-flex justify-content-between align-items-center">
//                             <h3 className="section-title mb-0">Overall Progress Analytics</h3>
//                             <div className="dropdown">
//                               <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
//                                 This Month
//                               </button>
//                               <ul className="dropdown-menu">
//                                 <li><a className="dropdown-item" href="#">This Week</a></li>
//                                 <li><a className="dropdown-item" href="#">This Month</a></li>
//                                 <li><a className="dropdown-item" href="#">This Quarter</a></li>
//                               </ul>
//                             </div>
//                           </div>
//                           <div className="card-body">
//                             <canvas id="progressChart" style={{ height: '250px', maxHeight: '250px' }}></canvas>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Recent Activity Card */}
//                       <div className="col-md-4 mb-4">
//                         <div className="card h-100 stats-card clickable" onClick={() => handleCardClick('Recent Activity')}>
//                           <div className="card-header d-flex justify-content-between align-items-center">
//                             <h4 className="widget-title mb-0">Recent Activity</h4>
//                             <i className="fas fa-clock"></i>
//                           </div>
//                           <div className="card-body">
//                             {recentActivities.length > 0 ? (
//                               <div className="activity-list">
//                                 {recentActivities.slice(0, 4).map((activity, index) => (
//                                   <div key={activity.id} className="activity-item d-flex align-items-start mb-3">
//                                     <div className={`activity-icon me-3 rounded-circle d-flex align-items-center justify-content-center ${activity.iconBg || 'bg-primary'}`} style={{ width: '32px', height: '32px', minWidth: '32px' }}>
//                                       <i className={`fas ${activity.icon || 'fa-bell'} text-white`} style={{ fontSize: '12px' }}></i>
//                                     </div>
//                                     <div className="activity-content flex-grow-1">
//                                       <div className="activity-text small">
//                                         <strong>{activity.title}</strong>
//                                         <div className="text-muted">{activity.description}</div>
//                                       </div>
//                                       <small className="text-muted">{activity.timeAgo}</small>
//                                     </div>
//                                   </div>
//                                 ))}
//                                 {recentActivities.length === 0 && (
//                                   <div className="text-center text-muted py-3">
//                                     <i className="fas fa-clock fa-2x mb-2"></i>
//                                     <p className="mb-0">No recent activity</p>
//                                   </div>
//                                 )}
//                               </div>
//                             ) : (
//                               <div className="text-center text-muted py-4">
//                                 <i className="fas fa-clock fa-3x mb-3"></i>
//                                 <h6>No Recent Activity</h6>
//                                 <p className="small mb-0">Activity will appear here as you use the system</p>
//                               </div>
//                             )}
//                             {recentActivities.length > 4 && (
//                               <div className="text-center mt-3">
//                                 <small className="text-primary">
//                                   <i className="fas fa-plus me-1"></i>
//                                   {recentActivities.length - 4} more activities
//                                 </small>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Active Projects Section */}
//                     <div className="card mb-4">
//                       <div className="card-header d-flex justify-content-between align-items-center">
//                         <div>
//                           <h3 className="section-title mb-0">Active Projects</h3>
//                           <small className="text-secondary-muted">Track and manage project progress</small>
//                         </div>
//                         <div className="d-flex gap-2">
//                           <button className="btn btn-outline-secondary btn-sm">
//                             <i className="fas fa-filter me-1"></i> Filter
//                           </button>
//                           <button
//                             className="btn btn-primary btn-sm"
//                             onClick={handleOpenAddProjectModal}
//                           >
//                             <i className="fas fa-plus me-1"></i> New Project
//                           </button>
//                         </div>
//                       </div>
//                       <div className="card-body">
//                         <div className="table-responsive">
//                           <table className="table table-hover">
//                             <thead className="table-light">
//                               <tr>
//                                 <th>Name</th>
//                                 <th>Project Manager</th>
//                                 <th>Progress</th>
//                                 <th>Status</th>
//                                 <th>Start Date</th>
//                                 <th>End Date</th>
//                                 <th>Assigned To</th>
//                                 <th>Actions</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {projects.map((project, index) => (
//                                 <tr key={index}>
//                                   <td>
//                                     <div>
//                                       <div className="fw-semibold">{project.name}</div>
//                                       <small className="text-muted">{project.clientName || 'No client specified'}</small>
//                                     </div>
//                                   </td>
//                                   <td>
//                                     <div className="d-flex align-items-center">
//                                       <div
//                                         className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
//                                         style={{ width: '28px', height: '28px', fontSize: '11px', fontWeight: 'bold' }}
//                                         title={project.projectManager || 'No manager assigned'}
//                                       >
//                                         {project.projectManager ? project.projectManager.charAt(0).toUpperCase() : '?'}
//                                       </div>
//                                       <div>
//                                         <div className="fw-semibold" style={{ fontSize: '13px' }}>
//                                           {project.projectManager || 'Not Assigned'}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td>
//                                     <div className="d-flex align-items-center">
//                                       <span className="me-2">{project.progress}%</span>
//                                       <div className="progress" style={{ width: '70px', height: '6px' }}>
//                                         <div
//                                           className={`progress-bar ${project.progress === 100 ? 'bg-success' :
//                                             project.progress >= 70 ? 'bg-primary' :
//                                               project.progress >= 40 ? 'bg-warning' : 'bg-danger'
//                                             }`}
//                                           role="progressbar"
//                                           style={{ width: `${project.progress}%` }}
//                                         ></div>
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td>
//                                     <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
//                                       project.status === 'On Track' ? 'bg-primary' :
//                                         project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
//                                       }`}>
//                                       {project.status}
//                                     </span>
//                                   </td>
//                                   <td>
//                                     <small className="text-muted">
//                                       {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', {
//                                         month: 'short',
//                                         day: 'numeric'
//                                       }) : 'Not set'}
//                                     </small>
//                                   </td>
//                                   <td>
//                                     <small className="text-muted">
//                                       {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', {
//                                         month: 'short',
//                                         day: 'numeric'
//                                       }) : 'Not set'}
//                                     </small>
//                                   </td>
//                                   <td>
//                                     <div className="d-flex align-items-center">
//                                       {project.assigned && project.assigned.length > 0 ? (
//                                         <>
//                                           {project.assigned.slice(0, 2).map((person, idx) => (
//                                             <div
//                                               key={idx}
//                                               className={`rounded-circle text-white d-flex align-items-center justify-content-center me-1 ${person.color}`}
//                                               style={{ width: '24px', height: '24px', fontSize: '10px', fontWeight: 'bold', marginLeft: idx > 0 ? '-4px' : '0' }}
//                                               title={person.name}
//                                             >
//                                               {person.name.charAt(0)}
//                                             </div>
//                                           ))}
//                                           {project.assigned.length > 2 && (
//                                             <div
//                                               className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
//                                               style={{ width: '24px', height: '24px', fontSize: '10px', fontWeight: 'bold', marginLeft: '-4px' }}
//                                               title={`+${project.assigned.length - 2} more members`}
//                                             >
//                                               +{project.assigned.length - 2}
//                                             </div>
//                                           )}
//                                         </>
//                                       ) : (
//                                         <small className="text-muted">No members</small>
//                                       )}
//                                     </div>
//                                   </td>
//                                   <td>
//                                     <div className="dropdown">
//                                       <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
//                                         <i className="fas fa-ellipsis-v"></i>
//                                       </button>
//                                       <ul className="dropdown-menu">
//                                         <li><a className="dropdown-item" href="#"><i className="fas fa-eye me-2"></i>View</a></li>
//                                         <li><a className="dropdown-item" href="#"><i className="fas fa-edit me-2"></i>Edit</a></li>
//                                         <li><hr className="dropdown-divider" /></li>
//                                         <li><a className="dropdown-item text-danger" href="#"><i className="fas fa-trash me-2"></i>Delete</a></li>
//                                       </ul>
//                                     </div>
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                         <div className="text-center mt-3">
//                           <a href="#" className="text-decoration-none text-primary">
//                             <i className="fas fa-arrow-right me-1"></i>
//                             View All Projects
//                           </a>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Unassigned Projects Section */}
//                     {unassignedProjects.length > 0 && (
//                       <div className="card mb-4">
//                         <div className="card-header d-flex justify-content-between align-items-center">
//                           <div>
//                             <h3 className="section-title mb-0">Unassigned Projects</h3>
//                             <small className="text-secondary-muted">Projects waiting for team assignment</small>
//                           </div>
//                           <span className="badge bg-warning">{unassignedProjects.length} Projects</span>
//                         </div>
//                         <div className="card-body">
//                           <div className="table-responsive">
//                             <table className="table table-hover">
//                               <thead className="table-light">
//                                 <tr>
//                                   <th>Project Name</th>
//                                   <th>Client Name</th>
//                                   <th>Advance Payment</th>
//                                   <th>Due Date</th>
//                                   <th>Actions</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {unassignedProjects.map((project, index) => (
//                                   <tr key={index}>
//                                     <td>
//                                       <div>
//                                         <div className="fw-semibold">{project.name}</div>
//                                         <span className="badge bg-secondary">{project.status}</span>
//                                       </div>
//                                     </td>
//                                     <td>
//                                       <div className="fw-semibold text-primary">{project.clientName}</div>
//                                     </td>
//                                     <td>
//                                       <span className="fw-bold text-success">${(project.advancePayment || 0).toLocaleString()}</span>
//                                     </td>
//                                     <td>
//                                       <small className="text-muted">{project.date}</small>
//                                     </td>
//                                     <td>
//                                       <button className="btn btn-sm btn-primary me-2">
//                                         <i className="fas fa-user-plus me-1"></i>
//                                         Assign Team
//                                       </button>
//                                       <div className="dropdown d-inline">
//                                         <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
//                                           <i className="fas fa-ellipsis-v"></i>
//                                         </button>
//                                         <ul className="dropdown-menu">
//                                           <li><a className="dropdown-item" href="#"><i className="fas fa-eye me-2"></i>View Details</a></li>
//                                           <li><a className="dropdown-item" href="#"><i className="fas fa-edit me-2"></i>Edit Project</a></li>
//                                           <li><hr className="dropdown-divider" /></li>
//                                           <li><a className="dropdown-item text-danger" href="#"><i className="fas fa-trash me-2"></i>Delete</a></li>
//                                         </ul>
//                                       </div>
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Project Manager Dashboard with Sidebar */}
//                 {currentRole === 'project-manager' && activeView === 'dashboard' && (
//                   <PMDashboardSidebar
//                     pmActiveSection={pmActiveSection}
//                     setPmActiveSection={setPmActiveSection}
//                     getProjectManagerData={getProjectManagerData}
//                     setShowAddTaskModal={setShowAddTaskModal}
//                     setShowAddProjectModal={setShowAddProjectModal}
//                     setShowAddUserModal={setShowAddUserModal}
//                     getUserWorkStatus={getUserWorkStatus}
//                     allUsers={allUsers}
//                     assignedTasks={assignedTasks}
//                     showPasswordManagementModal={showPasswordManagementModal}
//                     setShowPasswordManagementModal={setShowPasswordManagementModal}
//                     handleResetPassword={handleResetPassword}
//                     handleDeleteUserFromPasswordModal={handleDeleteUserFromPasswordModal}
//                     currentRole={currentRole}
//                     // New task assignment props
//                     selectedEmployeeForTask={selectedEmployeeForTask}
//                     setSelectedEmployeeForTask={setSelectedEmployeeForTask}
//                     selectedProjectForTask={selectedProjectForTask}
//                     setSelectedProjectForTask={setSelectedProjectForTask}
//                     newTaskName={newTaskName}
//                     setNewTaskName={setNewTaskName}
//                     taskPriority={taskPriority}
//                     setTaskPriority={setTaskPriority}
//                     taskDueDate={taskDueDate}
//                     setTaskDueDate={setTaskDueDate}
//                     handleQuickTaskAssignment={handleQuickTaskAssignment}
//                     updateTaskStatus={updateTaskStatus}
//                     userData={userData}
//                     // Task Notes props
//                     taskDiscussions={taskDiscussions}
//                     openTaskNotesModal={openTaskNotesModal}
//                     getTaskNoteCount={getTaskNoteCount}
//                   />
//                 )}

//                 {/* Team Leader Dashboard - Centralized Rendering */}
//                 {currentRole === 'team-leader' && (
//                   <TeamLeaderDashboard
//                     activeView={activeView}
//                     userData={userData}
//                     getUserWorkStatus={getUserWorkStatus}
//                     onLogout={safeOnLogout}
//                   />
//                 )}

//                 {/* Team Leader My Team View */}
//                 {false && currentRole === 'team-leader' && activeView === 'my-team' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">
//                           <i className="fas fa-users me-2"></i>My Team
//                         </h5>
//                         <small className="text-muted">Manage your team members and assignments</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-outline-success btn-sm"
//                           onClick={forceRefreshEmployeeTasks}
//                           title="Refresh team data"
//                         >
//                           <i className="fas fa-sync-alt me-1"></i> Refresh
//                         </button>
//                         <button
//                           className="btn btn-outline-primary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       {(() => {
//                         // Get current Team Leader's data dynamically
//                         const currentTLEmail = localStorage.getItem('userEmail') || safeUserData?.email;
//                         const currentTLName = localStorage.getItem('userName') || safeUserData?.name || userName;

//                         // Get the current team leader's ID from allUsers
//                         const currentTL = allUsers.find(u => u.email === currentTLEmail || u.name === currentTLName);
//                         const currentTLId = String(currentTL?.id || currentTL?._id || '');

//                         console.log('🔍 My Team View - Current TL:', {
//                           name: currentTLName,
//                           email: currentTLEmail,
//                           id: currentTLId
//                         });

//                         // Get team members under current Team Leader
//                         // Normalize IDs to strings for consistent comparison
//                         const tlTeamMembers = allUsers.filter(user => {
//                           const userTeamLeaderId = String(user.teamLeaderId || '');
//                           const matches = (
//                             (user.role === 'employee' || user.role === 'intern') && (
//                               (userTeamLeaderId === currentTLId && userTeamLeaderId !== '') ||
//                               user.teamLeaderName === currentTLName ||
//                               user.teamLeader === currentTLName
//                             )
//                           );

//                           if (matches) {
//                             console.log('✅ Found team member:', {
//                               name: user.name,
//                               teamLeaderId: user.teamLeaderId,
//                               teamLeaderName: user.teamLeaderName
//                             });
//                           }

//                           return matches;
//                         });

//                         console.log(`👥 My Team View - Found ${tlTeamMembers.length} team members`);

//                         if (tlTeamMembers.length === 0) {
//                           return (
//                             <div className="text-center py-5">
//                               <i className="fas fa-users fa-3x text-muted mb-3"></i>
//                               <h6 className="text-muted">No Team Members Assigned</h6>
//                               <p className="text-muted">Contact admin to assign team members to your leadership</p>
//                             </div>
//                           );
//                         }

//                         return (
//                           <div>
//                             {/* Team Summary */}
//                             <div className="row mb-4">
//                               <div className="col-md-3">
//                                 <div className="card border-0 bg-primary bg-opacity-10">
//                                   <div className="card-body text-center">
//                                     <i className="fas fa-users fa-2x text-primary mb-2"></i>
//                                     <h4 className="fw-bold text-primary">{tlTeamMembers.length}</h4>
//                                     <small className="text-muted">Total Members</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0 bg-success bg-opacity-10">
//                                   <div className="card-body text-center">
//                                     <i className="fas fa-user-check fa-2x text-success mb-2"></i>
//                                     <h4 className="fw-bold text-success">
//                                       {tlTeamMembers.filter(member => getUserWorkStatus(member).status === 'Active').length}
//                                     </h4>
//                                     <small className="text-muted">Active Members</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0 bg-warning bg-opacity-10">
//                                   <div className="card-body text-center">
//                                     <i className="fas fa-tasks fa-2x text-warning mb-2"></i>
//                                     <h4 className="fw-bold text-warning">
//                                       {assignedTasks.filter(task =>
//                                         tlTeamMembers.some(member =>
//                                           task.assignedTo === member.name || task.assignedTo === member.email
//                                         )
//                                       ).length}
//                                     </h4>
//                                     <small className="text-muted">Total Tasks</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0 bg-info bg-opacity-10">
//                                   <div className="card-body text-center">
//                                     <i className="fas fa-project-diagram fa-2x text-info mb-2"></i>
//                                     <h4 className="fw-bold text-info">
//                                       {projects.filter(project =>
//                                         project.assigned?.some(member =>
//                                           tlTeamMembers.some(teamMember => teamMember.name === member.name)
//                                         )
//                                       ).length}
//                                     </h4>
//                                     <small className="text-muted">Active Projects</small>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Team Members Table */}
//                             <div className="table-responsive">
//                               <table className="table table-hover">
//                                 <thead className="table-light">
//                                   <tr>
//                                     <th>Member</th>
//                                     <th>Contact</th>
//                                     <th>Department</th>
//                                     <th>Project</th>
//                                     <th>Client</th>
//                                     <th>Tasks</th>
//                                     <th>Current Task</th>
//                                     <th>Status</th>
//                                     <th>Actions</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {tlTeamMembers.map((member, index) => {
//                                     // Get member's assigned project
//                                     const memberProject = projects.find(project =>
//                                       project.assigned?.some(assigned => assigned.name === member.name)
//                                     );

//                                     // Get member's tasks
//                                     const memberTasks = assignedTasks.filter(task =>
//                                       task.assignedTo === member.name || task.assignedTo === member.email
//                                     );

//                                     const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
//                                     const workStatus = getUserWorkStatus(member);

//                                     // Get current working task (in-progress or selected task)
//                                     const currentTask = memberTasks.find(task =>
//                                       task.status === 'in-progress'
//                                     ) || memberTasks.find(task =>
//                                       task.status === 'pending' || task.status === 'assigned'
//                                     );

//                                     return (
//                                       <tr key={member.id || index}>
//                                         <td>
//                                           <div className="d-flex align-items-center">
//                                             <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
//                                               style={{ width: '40px', height: '40px' }}>
//                                               {member.name.charAt(0).toUpperCase()}
//                                             </div>
//                                             <div>
//                                               <div className="fw-bold">{member.name}</div>
//                                               <small className="text-muted">{member.userType || member.role}</small>
//                                             </div>
//                                           </div>
//                                         </td>
//                                         <td>
//                                           <div>
//                                             <div className="small">
//                                               <i className="fas fa-envelope me-1"></i>
//                                               {member.email}
//                                             </div>
//                                             {member.phone && (
//                                               <div className="small text-muted">
//                                                 <i className="fas fa-phone me-1"></i>
//                                                 {member.phone}
//                                               </div>
//                                             )}
//                                           </div>
//                                         </td>
//                                         <td>
//                                           <span className="badge bg-secondary bg-opacity-25 text-secondary">
//                                             {member.department || 'Not Assigned'}
//                                           </span>
//                                         </td>
//                                         <td>
//                                           {memberProject ? (
//                                             <div>
//                                               <div className="fw-semibold">{memberProject.name}</div>
//                                               <div className="progress mt-1" style={{ height: '4px' }}>
//                                                 <div className="progress-bar bg-primary"
//                                                   style={{ width: `${memberProject.progress || 0}%` }}></div>
//                                               </div>
//                                               <small className="text-muted">{memberProject.progress || 0}% Complete</small>
//                                             </div>
//                                           ) : (
//                                             <span className="text-muted">No Project</span>
//                                           )}
//                                         </td>
//                                         <td>
//                                           {memberProject?.clientName ? (
//                                             <span className="badge bg-info bg-opacity-25 text-info">
//                                               {memberProject.clientName}
//                                             </span>
//                                           ) : (
//                                             <span className="text-muted">-</span>
//                                           )}
//                                         </td>
//                                         <td>
//                                           <div className="d-flex align-items-center gap-2">
//                                             <span className="badge bg-primary">{memberTasks.length}</span>
//                                             {completedTasks > 0 && (
//                                               <span className="badge bg-success">{completedTasks} Done</span>
//                                             )}
//                                           </div>
//                                         </td>
//                                         <td>
//                                           {currentTask ? (
//                                             <div>
//                                               <div className="fw-semibold text-truncate" style={{ maxWidth: '150px' }} title={currentTask.title}>
//                                                 {currentTask.title}
//                                               </div>
//                                               <span className={`badge badge-sm ${currentTask.status === 'in-progress' ? 'bg-warning' : 'bg-secondary'
//                                                 }`}>
//                                                 {currentTask.status === 'in-progress' ? 'Working' : 'Assigned'}
//                                               </span>
//                                             </div>
//                                           ) : (
//                                             <span className="text-muted">No active task</span>
//                                           )}
//                                         </td>
//                                         <td>
//                                           <span className={`badge ${workStatus.color}`}>
//                                             {workStatus.status}
//                                           </span>
//                                         </td>
//                                         <td>
//                                           <div className="btn-group" role="group">
//                                             <button
//                                               className="btn btn-sm btn-outline-primary"
//                                               onClick={() => {
//                                                 // View member details
//                                                 alert(`Member Details:\nName: ${member.name}\nEmail: ${member.email}\nDepartment: ${member.department}\nTasks: ${memberTasks.length}\nProject: ${memberProject?.name || 'None'}`);
//                                               }}
//                                               title="View Details"
//                                             >
//                                               <i className="fas fa-eye"></i>
//                                             </button>
//                                             <button
//                                               className="btn btn-sm btn-outline-success"
//                                               onClick={() => {
//                                                 // Assign task functionality
//                                                 setSelectedEmployeeForTask(member.email);
//                                                 setShowAddTaskModal(true);
//                                               }}
//                                               title="Assign Task"
//                                             >
//                                               <i className="fas fa-plus"></i>
//                                             </button>
//                                           </div>
//                                         </td>
//                                       </tr>
//                                     );
//                                   })}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         );
//                       })()}
//                     </div>
//                   </div>
//                 )}

//                 {/* Team Leader Task Management View */}
//                 {currentRole === 'team-leader' && activeView === 'task-management' && (
//                   <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
//                     <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
//                       <div>
//                         <h5 className="card-title mb-1 fw-bold">
//                           <i className="fas fa-tasks me-2 text-primary"></i>Task Management
//                         </h5>
//                         <small className="text-muted">Assign and track team tasks</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-success btn-sm"
//                           onClick={() => setShowAddTaskModal(true)}
//                         >
//                           <i className="fas fa-plus me-1"></i> New Task
//                         </button>
//                         <button
//                           className="btn btn-outline-primary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body p-4">
//                       {(() => {
//                         // Get current Team Leader's tasks
//                         const currentTLName = localStorage.getItem('userName') || safeUserData?.name || userName;
//                         const currentTLEmail = localStorage.getItem('userEmail') || safeUserData?.email;

//                         // Get team members
//                         const currentTL = allUsers.find(u => u.email === currentTLEmail || u.name === currentTLName);
//                         const currentTLId = String(currentTL?.id || currentTL?._id || '');
//                         const tlTeamMembers = allUsers.filter(user => {
//                           const userTeamLeaderId = String(user.teamLeaderId || '');
//                           return (
//                             (user.role === 'employee' || user.role === 'intern') && (
//                               (userTeamLeaderId === currentTLId && userTeamLeaderId !== '') ||
//                               user.teamLeaderName === currentTLName ||
//                               user.teamLeader === currentTLName
//                             )
//                           );
//                         });

//                         // Get tasks for team members
//                         const teamTasks = assignedTasks.filter(task =>
//                           task.assignedTo === currentTLName ||
//                           task.assignedTo === currentTLEmail ||
//                           tlTeamMembers.some(member =>
//                             task.assignedTo === member.name || task.assignedTo === member.email
//                           )
//                         );

//                         const pendingTasks = teamTasks.filter(t => t.status === 'pending' || t.status === 'assigned');
//                         const inProgressTasks = teamTasks.filter(t => t.status === 'in-progress');
//                         const completedTasks = teamTasks.filter(t => t.status === 'completed');

//                         return (
//                           <div>
//                             {/* Task Stats */}
//                             <div className="row mb-4">
//                               <div className="col-md-3">
//                                 <div className="card border-0" style={{ backgroundColor: '#e3f2fd' }}>
//                                   <div className="card-body text-center py-3">
//                                     <i className="fas fa-clipboard-list fa-2x text-primary mb-2"></i>
//                                     <h4 className="fw-bold text-primary mb-0">{teamTasks.length}</h4>
//                                     <small className="text-muted">Total Tasks</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0" style={{ backgroundColor: '#fff3e0' }}>
//                                   <div className="card-body text-center py-3">
//                                     <i className="fas fa-clock fa-2x text-warning mb-2"></i>
//                                     <h4 className="fw-bold text-warning mb-0">{pendingTasks.length}</h4>
//                                     <small className="text-muted">Pending</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0" style={{ backgroundColor: '#e8f5e9' }}>
//                                   <div className="card-body text-center py-3">
//                                     <i className="fas fa-spinner fa-2x text-info mb-2"></i>
//                                     <h4 className="fw-bold text-info mb-0">{inProgressTasks.length}</h4>
//                                     <small className="text-muted">In Progress</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0" style={{ backgroundColor: '#f1f8e9' }}>
//                                   <div className="card-body text-center py-3">
//                                     <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
//                                     <h4 className="fw-bold text-success mb-0">{completedTasks.length}</h4>
//                                     <small className="text-muted">Completed</small>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Task List */}
//                             {teamTasks.length > 0 ? (
//                               <div className="table-responsive">
//                                 <table className="table table-hover">
//                                   <thead className="table-light">
//                                     <tr>
//                                       <th>Task</th>
//                                       <th>Assigned To</th>
//                                       <th>Priority</th>
//                                       <th>Status</th>
//                                       <th>Due Date</th>
//                                       <th>Actions</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {teamTasks.map((task, index) => (
//                                       <tr key={index}>
//                                         <td>
//                                           <div className="fw-semibold">{task.title}</div>
//                                           {task.description && (
//                                             <small className="text-muted">{task.description.substring(0, 50)}...</small>
//                                           )}
//                                         </td>
//                                         <td>
//                                           <span className="badge bg-light text-dark">{task.assignedTo}</span>
//                                         </td>
//                                         <td>
//                                           <span className={`badge ${task.priority === 'high' ? 'bg-danger' :
//                                             task.priority === 'medium' ? 'bg-warning' :
//                                               'bg-info'
//                                             }`}>
//                                             {task.priority || 'Normal'}
//                                           </span>
//                                         </td>
//                                         <td>
//                                           <span className={`badge ${task.status === 'completed' ? 'bg-success' :
//                                             task.status === 'in-progress' ? 'bg-info' :
//                                               'bg-warning'
//                                             }`}>
//                                             {task.status}
//                                           </span>
//                                         </td>
//                                         <td>
//                                           <small className="text-muted">
//                                             {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
//                                           </small>
//                                         </td>
//                                         <td>
//                                           <button
//                                             className="btn btn-sm btn-outline-primary"
//                                             onClick={() => {
//                                               // View task details
//                                               alert(`Task: ${task.title}\nStatus: ${task.status}\nAssigned to: ${task.assignedTo}`);
//                                             }}
//                                           >
//                                             <i className="fas fa-eye"></i>
//                                           </button>
//                                         </td>
//                                       </tr>
//                                     ))}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             ) : (
//                               <div className="text-center py-5">
//                                 <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
//                                 <h6 className="text-muted">No Tasks Yet</h6>
//                                 <p className="text-muted">Create tasks to assign to your team members</p>
//                                 <button
//                                   className="btn btn-primary"
//                                   onClick={() => setShowAddTaskModal(true)}
//                                 >
//                                   <i className="fas fa-plus me-2"></i>Create First Task
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })()}
//                     </div>
//                   </div>
//                 )}

//                 {/* Team Leader Performance View */}
//                 {currentRole === 'team-leader' && activeView === 'performance' && (
//                   <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
//                     <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
//                       <div>
//                         <h5 className="card-title mb-1 fw-bold">
//                           <i className="fas fa-chart-bar me-2 text-success"></i>Team Performance
//                         </h5>
//                         <small className="text-muted">Monitor team performance metrics and analytics</small>
//                       </div>
//                       <button
//                         className="btn btn-outline-primary btn-sm"
//                         onClick={() => setActiveView('dashboard')}
//                       >
//                         <i className="fas fa-arrow-left me-1"></i> Back
//                       </button>
//                     </div>
//                     <div className="card-body p-4">
//                       {(() => {
//                         // Get current Team Leader's data
//                         const currentTLName = localStorage.getItem('userName') || safeUserData?.name || userName;
//                         const currentTLEmail = localStorage.getItem('userEmail') || safeUserData?.email;

//                         // Get team members
//                         const currentTL = allUsers.find(u => u.email === currentTLEmail || u.name === currentTLName);
//                         const currentTLId = String(currentTL?.id || currentTL?._id || '');
//                         const tlTeamMembers = allUsers.filter(user => {
//                           const userTeamLeaderId = String(user.teamLeaderId || '');
//                           return (
//                             (user.role === 'employee' || user.role === 'intern') && (
//                               (userTeamLeaderId === currentTLId && userTeamLeaderId !== '') ||
//                               user.teamLeaderName === currentTLName ||
//                               user.teamLeader === currentTLName
//                             )
//                           );
//                         });

//                         // Get tasks and projects
//                         const teamTasks = assignedTasks.filter(task =>
//                           task.assignedTo === currentTLName ||
//                           task.assignedTo === currentTLEmail ||
//                           tlTeamMembers.some(member =>
//                             task.assignedTo === member.name || task.assignedTo === member.email
//                           )
//                         );

//                         const teamProjects = projects.filter(project =>
//                           project.projectManager === currentTLName ||
//                           (project.assigned && project.assigned.some(member =>
//                             tlTeamMembers.some(tm => tm.name === member.name)
//                           ))
//                         );

//                         const completedTasks = teamTasks.filter(t => t.status === 'completed').length;
//                         const totalTasks = teamTasks.length;
//                         const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

//                         const activeMembers = tlTeamMembers.filter(m => getUserWorkStatus(m).status === 'Active').length;
//                         const memberActivityRate = tlTeamMembers.length > 0 ? Math.round((activeMembers / tlTeamMembers.length) * 100) : 0;

//                         const avgProjectProgress = teamProjects.length > 0 ?
//                           Math.round(teamProjects.reduce((acc, p) => acc + (p.progress || 0), 0) / teamProjects.length) : 0;

//                         return (
//                           <div>
//                             {/* Overall Performance Score */}
//                             <div className="row mb-4">
//                               <div className="col-md-4">
//                                 <div className="card border-0 shadow-sm h-100">
//                                   <div className="card-body text-center p-4">
//                                     <h6 className="text-muted mb-3">Overall Team Performance</h6>
//                                     <div className="position-relative d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '150px', height: '150px' }}>
//                                       <svg width="150" height="150" className="position-absolute">
//                                         <circle cx="75" cy="75" r="65" fill="none" stroke="#e9ecef" strokeWidth="12"></circle>
//                                         <circle cx="75" cy="75" r="65" fill="none" stroke="#28a745" strokeWidth="12"
//                                           strokeDasharray="408" strokeDashoffset={408 - (408 * (taskCompletionRate / 100))} strokeLinecap="round"
//                                           transform="rotate(-90 75 75)"></circle>
//                                       </svg>
//                                       <div className="text-center">
//                                         <h2 className="mb-0 fw-bold text-success">{taskCompletionRate}%</h2>
//                                         <small className="text-muted">Completion</small>
//                                       </div>
//                                     </div>
//                                     <p className="text-muted small mb-0">Based on task completion rate</p>
//                                   </div>
//                                 </div>
//                               </div>

//                               <div className="col-md-8">
//                                 <div className="card border-0 shadow-sm h-100">
//                                   <div className="card-body p-4">
//                                     <h6 className="text-muted mb-4">Performance Metrics</h6>

//                                     {/* Task Completion */}
//                                     <div className="mb-4">
//                                       <div className="d-flex justify-content-between mb-2">
//                                         <span className="fw-semibold">Task Completion Rate</span>
//                                         <span className="fw-bold text-success">{taskCompletionRate}%</span>
//                                       </div>
//                                       <div className="progress" style={{ height: '10px' }}>
//                                         <div className="progress-bar bg-success" style={{ width: `${taskCompletionRate}%` }}></div>
//                                       </div>
//                                       <small className="text-muted">{completedTasks} of {totalTasks} tasks completed</small>
//                                     </div>

//                                     {/* Member Activity */}
//                                     <div className="mb-4">
//                                       <div className="d-flex justify-content-between mb-2">
//                                         <span className="fw-semibold">Team Activity Rate</span>
//                                         <span className="fw-bold text-info">{memberActivityRate}%</span>
//                                       </div>
//                                       <div className="progress" style={{ height: '10px' }}>
//                                         <div className="progress-bar bg-info" style={{ width: `${memberActivityRate}%` }}></div>
//                                       </div>
//                                       <small className="text-muted">{activeMembers} of {tlTeamMembers.length} members active</small>
//                                     </div>

//                                     {/* Project Progress */}
//                                     <div className="mb-0">
//                                       <div className="d-flex justify-content-between mb-2">
//                                         <span className="fw-semibold">Average Project Progress</span>
//                                         <span className="fw-bold text-warning">{avgProjectProgress}%</span>
//                                       </div>
//                                       <div className="progress" style={{ height: '10px' }}>
//                                         <div className="progress-bar bg-warning" style={{ width: `${avgProjectProgress}%` }}></div>
//                                       </div>
//                                       <small className="text-muted">{teamProjects.length} active projects</small>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Team Member Performance */}
//                             <div className="card border-0 shadow-sm">
//                               <div className="card-header bg-white border-0 py-3">
//                                 <h6 className="mb-0 fw-semibold">Individual Performance</h6>
//                               </div>
//                               <div className="card-body p-0">
//                                 {tlTeamMembers.length > 0 ? (
//                                   <div className="table-responsive">
//                                     <table className="table table-hover mb-0">
//                                       <thead className="table-light">
//                                         <tr>
//                                           <th>Member</th>
//                                           <th>Status</th>
//                                           <th>Tasks Assigned</th>
//                                           <th>Tasks Completed</th>
//                                           <th>Completion Rate</th>
//                                           <th>Performance</th>
//                                         </tr>
//                                       </thead>
//                                       <tbody>
//                                         {tlTeamMembers.map((member, index) => {
//                                           const memberTasks = teamTasks.filter(t =>
//                                             t.assignedTo === member.name || t.assignedTo === member.email
//                                           );
//                                           const memberCompleted = memberTasks.filter(t => t.status === 'completed').length;
//                                           const memberRate = memberTasks.length > 0 ?
//                                             Math.round((memberCompleted / memberTasks.length) * 100) : 0;

//                                           return (
//                                             <tr key={index}>
//                                               <td>
//                                                 <div className="d-flex align-items-center">
//                                                   <div
//                                                     className="rounded-circle d-flex align-items-center justify-content-center me-2"
//                                                     style={{
//                                                       width: '35px',
//                                                       height: '35px',
//                                                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                                                       color: 'white',
//                                                       fontSize: '14px',
//                                                       fontWeight: '600'
//                                                     }}
//                                                   >
//                                                     {member.name.charAt(0).toUpperCase()}
//                                                   </div>
//                                                   <div>
//                                                     <div className="fw-semibold">{member.name}</div>
//                                                     <small className="text-muted">{member.role}</small>
//                                                   </div>
//                                                 </div>
//                                               </td>
//                                               <td>
//                                                 <span className={`badge ${getUserWorkStatus(member).color}`}>
//                                                   {getUserWorkStatus(member).status}
//                                                 </span>
//                                               </td>
//                                               <td>{memberTasks.length}</td>
//                                               <td>{memberCompleted}</td>
//                                               <td>
//                                                 <div className="d-flex align-items-center">
//                                                   <div className="progress flex-grow-1 me-2" style={{ height: '6px', width: '60px' }}>
//                                                     <div
//                                                       className={`progress-bar ${memberRate >= 80 ? 'bg-success' :
//                                                         memberRate >= 50 ? 'bg-warning' : 'bg-danger'
//                                                         }`}
//                                                       style={{ width: `${memberRate}%` }}
//                                                     ></div>
//                                                   </div>
//                                                   <small className="fw-semibold">{memberRate}%</small>
//                                                 </div>
//                                               </td>
//                                               <td>
//                                                 <span className={`badge ${memberRate >= 80 ? 'bg-success' :
//                                                   memberRate >= 50 ? 'bg-warning' : 'bg-danger'
//                                                   }`}>
//                                                   {memberRate >= 80 ? 'Excellent' :
//                                                     memberRate >= 50 ? 'Good' : 'Needs Improvement'}
//                                                 </span>
//                                               </td>
//                                             </tr>
//                                           );
//                                         })}
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                 ) : (
//                                   <div className="text-center py-5">
//                                     <i className="fas fa-users fa-3x text-muted mb-3"></i>
//                                     <h6 className="text-muted">No Team Members</h6>
//                                     <p className="text-muted">Add team members to see performance metrics</p>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })()}
//                     </div>
//                   </div>
//                 )}

//                 {/* Team Leader Work Report View */}
//                 {currentRole === 'team-leader' && activeView === 'work-report' && (
//                   <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
//                     <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
//                       <div>
//                         <h5 className="card-title mb-1 fw-bold">
//                           <i className="fas fa-file-alt me-2 text-info"></i>Work Report
//                         </h5>
//                         <small className="text-muted">Generate and view team work reports</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button className="btn btn-success btn-sm">
//                           <i className="fas fa-download me-1"></i> Export Report
//                         </button>
//                         <button
//                           className="btn btn-outline-primary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body p-4">
//                       {(() => {
//                         // Get current Team Leader's data
//                         const currentTLName = localStorage.getItem('userName') || safeUserData?.name || userName;
//                         const currentTLEmail = localStorage.getItem('userEmail') || safeUserData?.email;

//                         // Get team members
//                         const currentTL = allUsers.find(u => u.email === currentTLEmail || u.name === currentTLName);
//                         const currentTLId = String(currentTL?.id || currentTL?._id || '');
//                         const tlTeamMembers = allUsers.filter(user => {
//                           const userTeamLeaderId = String(user.teamLeaderId || '');
//                           return (
//                             (user.role === 'employee' || user.role === 'intern') && (
//                               (userTeamLeaderId === currentTLId && userTeamLeaderId !== '') ||
//                               user.teamLeaderName === currentTLName ||
//                               user.teamLeader === currentTLName
//                             )
//                           );
//                         });

//                         // Get tasks and projects
//                         const teamTasks = assignedTasks.filter(task =>
//                           task.assignedTo === currentTLName ||
//                           task.assignedTo === currentTLEmail ||
//                           tlTeamMembers.some(member =>
//                             task.assignedTo === member.name || task.assignedTo === member.email
//                           )
//                         );

//                         const teamProjects = projects.filter(project =>
//                           project.projectManager === currentTLName ||
//                           (project.assigned && project.assigned.some(member =>
//                             tlTeamMembers.some(tm => tm.name === member.name)
//                           ))
//                         );

//                         // Calculate report data
//                         const today = new Date();
//                         const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

//                         const recentTasks = teamTasks.filter(t => {
//                           const taskDate = new Date(t.createdAt || t.startDate || today);
//                           return taskDate >= weekAgo;
//                         });

//                         const completedThisWeek = recentTasks.filter(t => t.status === 'completed').length;
//                         const inProgressThisWeek = recentTasks.filter(t => t.status === 'in-progress').length;

//                         return (
//                           <div>
//                             {/* Report Summary */}
//                             <div className="row mb-4">
//                               <div className="col-12">
//                                 <div className="card border-0" style={{ backgroundColor: '#f8f9fa' }}>
//                                   <div className="card-body p-4">
//                                     <div className="row">
//                                       <div className="col-md-6">
//                                         <h6 className="text-muted mb-3">Report Period</h6>
//                                         <p className="mb-1"><strong>From:</strong> {weekAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
//                                         <p className="mb-0"><strong>To:</strong> {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
//                                       </div>
//                                       <div className="col-md-6">
//                                         <h6 className="text-muted mb-3">Team Leader</h6>
//                                         <p className="mb-1"><strong>Name:</strong> {currentTLName}</p>
//                                         <p className="mb-0"><strong>Team Size:</strong> {tlTeamMembers.length} members</p>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Weekly Stats */}
//                             <div className="row mb-4">
//                               <div className="col-md-3">
//                                 <div className="card border-0 shadow-sm">
//                                   <div className="card-body text-center p-3">
//                                     <i className="fas fa-tasks fa-2x text-primary mb-2"></i>
//                                     <h4 className="fw-bold text-primary mb-0">{recentTasks.length}</h4>
//                                     <small className="text-muted">Tasks This Week</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0 shadow-sm">
//                                   <div className="card-body text-center p-3">
//                                     <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
//                                     <h4 className="fw-bold text-success mb-0">{completedThisWeek}</h4>
//                                     <small className="text-muted">Completed</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0 shadow-sm">
//                                   <div className="card-body text-center p-3">
//                                     <i className="fas fa-spinner fa-2x text-info mb-2"></i>
//                                     <h4 className="fw-bold text-info mb-0">{inProgressThisWeek}</h4>
//                                     <small className="text-muted">In Progress</small>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="col-md-3">
//                                 <div className="card border-0 shadow-sm">
//                                   <div className="card-body text-center p-3">
//                                     <i className="fas fa-project-diagram fa-2x text-warning mb-2"></i>
//                                     <h4 className="fw-bold text-warning mb-0">{teamProjects.length}</h4>
//                                     <small className="text-muted">Active Projects</small>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Detailed Work Report */}
//                             <div className="card border-0 shadow-sm mb-4">
//                               <div className="card-header bg-white border-0 py-3">
//                                 <h6 className="mb-0 fw-semibold">Team Member Activity Report</h6>
//                               </div>
//                               <div className="card-body p-0">
//                                 {tlTeamMembers.length > 0 ? (
//                                   <div className="table-responsive">
//                                     <table className="table table-hover mb-0">
//                                       <thead className="table-light">
//                                         <tr>
//                                           <th>Member</th>
//                                           <th>Department</th>
//                                           <th>Tasks Assigned</th>
//                                           <th>Completed</th>
//                                           <th>In Progress</th>
//                                           <th>Pending</th>
//                                           <th>Status</th>
//                                         </tr>
//                                       </thead>
//                                       <tbody>
//                                         {tlTeamMembers.map((member, index) => {
//                                           const memberTasks = teamTasks.filter(t =>
//                                             t.assignedTo === member.name || t.assignedTo === member.email
//                                           );
//                                           const memberCompleted = memberTasks.filter(t => t.status === 'completed').length;
//                                           const memberInProgress = memberTasks.filter(t => t.status === 'in-progress').length;
//                                           const memberPending = memberTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length;

//                                           return (
//                                             <tr key={index}>
//                                               <td>
//                                                 <div className="d-flex align-items-center">
//                                                   <div
//                                                     className="rounded-circle d-flex align-items-center justify-content-center me-2"
//                                                     style={{
//                                                       width: '35px',
//                                                       height: '35px',
//                                                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                                                       color: 'white',
//                                                       fontSize: '14px',
//                                                       fontWeight: '600'
//                                                     }}
//                                                   >
//                                                     {member.name.charAt(0).toUpperCase()}
//                                                   </div>
//                                                   <div>
//                                                     <div className="fw-semibold">{member.name}</div>
//                                                     <small className="text-muted">{member.email}</small>
//                                                   </div>
//                                                 </div>
//                                               </td>
//                                               <td>{member.department || member.role || 'N/A'}</td>
//                                               <td><span className="badge bg-primary">{memberTasks.length}</span></td>
//                                               <td><span className="badge bg-success">{memberCompleted}</span></td>
//                                               <td><span className="badge bg-info">{memberInProgress}</span></td>
//                                               <td><span className="badge bg-warning">{memberPending}</span></td>
//                                               <td>
//                                                 <span className={`badge ${getUserWorkStatus(member).color}`}>
//                                                   {getUserWorkStatus(member).status}
//                                                 </span>
//                                               </td>
//                                             </tr>
//                                           );
//                                         })}
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                 ) : (
//                                   <div className="text-center py-5">
//                                     <i className="fas fa-users fa-3x text-muted mb-3"></i>
//                                     <h6 className="text-muted">No Team Members</h6>
//                                     <p className="text-muted">Add team members to generate work reports</p>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>

//                             {/* Project Summary */}
//                             {teamProjects.length > 0 && (
//                               <div className="card border-0 shadow-sm">
//                                 <div className="card-header bg-white border-0 py-3">
//                                   <h6 className="mb-0 fw-semibold">Project Summary</h6>
//                                 </div>
//                                 <div className="card-body">
//                                   <div className="row">
//                                     {teamProjects.map((project, index) => (
//                                       <div key={index} className="col-md-6 mb-3">
//                                         <div className="card border">
//                                           <div className="card-body p-3">
//                                             <h6 className="fw-semibold mb-2">{project.name}</h6>
//                                             <div className="d-flex justify-content-between align-items-center mb-2">
//                                               <small className="text-muted">Progress</small>
//                                               <small className="fw-bold">{project.progress || 0}%</small>
//                                             </div>
//                                             <div className="progress mb-2" style={{ height: '6px' }}>
//                                               <div
//                                                 className={`progress-bar ${(project.progress || 0) >= 80 ? 'bg-success' :
//                                                   (project.progress || 0) >= 50 ? 'bg-info' : 'bg-warning'
//                                                   }`}
//                                                 style={{ width: `${project.progress || 0}%` }}
//                                               ></div>
//                                             </div>
//                                             <div className="d-flex justify-content-between">
//                                               <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
//                                                 project.status === 'In Progress' ? 'bg-info' : 'bg-warning'
//                                                 }`}>
//                                                 {project.status || 'Active'}
//                                               </span>
//                                               <small className="text-muted">
//                                                 {project.assigned?.length || 0} members
//                                               </small>
//                                             </div>
//                                           </div>
//                                         </div>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })()}
//                     </div>
//                   </div>
//                 )}

//                 {/* Intern Dashboard - Now uses Employee Dashboard */}
//                 {currentRole === 'intern' && activeView === 'dashboard' && (
//                   <div className="employee-dashboard">
//                     {/* Enhanced Real-time Stats Cards */}
//                     <div className="row mb-4">
//                       {roles[currentRole]?.stats.map((stat, index) => (
//                         <div key={index} className="col-lg-3 col-md-6 mb-4">
//                           <div
//                             className={`card border-0 shadow-sm h-100 ${stat.clickable ? 'cursor-pointer' : ''}`}
//                             style={{ borderRadius: '12px' }}
//                             onClick={stat.clickable ? () => handleCardClick(stat.title) : undefined}
//                             role={stat.clickable ? "button" : undefined}
//                             tabIndex={stat.clickable ? 0 : undefined}
//                             aria-label={stat.ariaLabel}
//                           >
//                             <div className="card-body p-4">
//                               <div className="d-flex align-items-center justify-content-between">
//                                 <div>
//                                   <div className="d-flex align-items-center mb-1">
//                                     <p className="text-muted mb-0 small me-2">{stat.title}</p>
//                                     {stat.isRealTime && (
//                                       <span className="badge bg-success bg-opacity-10 text-success px-2 py-1" style={{ fontSize: '0.7rem' }}>
//                                         <i className="fas fa-circle fa-xs me-1" style={{ animation: 'pulse 2s infinite' }}></i>
//                                         LIVE
//                                       </span>
//                                     )}
//                                   </div>
//                                   <h3 className="fw-bold mb-0">{stat.value}</h3>
//                                   <div className="d-flex align-items-center">
//                                     <small className={`text-${stat.color} fw-medium me-2`}>
//                                       {stat.trend}
//                                     </small>
//                                     {stat.isRealTime && stat.lastUpdate && (
//                                       <small className="text-muted" style={{ fontSize: '0.7rem' }}>
//                                         Updated: {stat.lastUpdate}
//                                       </small>
//                                     )}
//                                   </div>
//                                 </div>
//                                 <div className={`text-${stat.color} opacity-75`}>
//                                   <i className={`${stat.icon} fa-2x`}></i>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Employee Dashboard Content */}
//                     <div className="row">
//                       <div className="col-lg-8 mb-4">
//                         <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
//                           <div className="card-header bg-white border-0 py-3" style={{ borderRadius: '12px 12px 0 0' }}>
//                             <div className="d-flex align-items-center justify-content-between">
//                               <h5 className="mb-0 fw-bold text-dark">
//                                 <i className="fas fa-tasks me-2 text-primary"></i>My Daily Tasks
//                               </h5>
//                               <div className="d-flex align-items-center">
//                                 <span className="badge bg-primary bg-opacity-10 text-primary me-2">
//                                   {assignedTasks.filter(task => isUserAssignedToTask(task, localStorage.getItem('userEmail'))).length} Tasks
//                                 </span>
//                                 <span className="badge bg-success bg-opacity-10 text-success">
//                                   <i className="fas fa-circle fa-xs me-1" style={{ animation: 'pulse 2s infinite' }}></i>
//                                   Live Updates
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="card-body p-0">
//                             <div className="table-responsive">
//                               <table className="table table-hover mb-0">
//                                 <thead className="table-light">
//                                   <tr>
//                                     <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Task</th>
//                                     <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Project</th>
//                                     <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Status</th>
//                                     <th style={{ border: 'none', fontWeight: '600', padding: '12px 16px' }}>Due Date</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {assignedTasks
//                                     .filter(task => isUserAssignedToTask(task, localStorage.getItem('userEmail')))
//                                     .slice(0, 5)
//                                     .map((task, index) => (
//                                       <tr key={index}>
//                                         <td style={{ border: 'none', padding: '12px 16px' }}>
//                                           <div className="fw-semibold">{task.title}</div>
//                                           <small className="text-muted">{task.description?.substring(0, 50)}...</small>
//                                         </td>
//                                         <td style={{ border: 'none', padding: '12px 16px' }}>
//                                           <small className="text-muted">{task.project || 'General'}</small>
//                                         </td>
//                                         <td style={{ border: 'none', padding: '12px 16px' }}>
//                                           <span className={`badge ${task.status === 'completed' ? 'bg-success' :
//                                             task.status === 'in-progress' ? 'bg-info' :
//                                               'bg-secondary'
//                                             }`}>
//                                             {task.status === 'completed' ? 'Completed' :
//                                               task.status === 'in-progress' ? 'In Progress' : 'Pending'}
//                                           </span>
//                                         </td>
//                                         <td style={{ border: 'none', padding: '12px 16px' }}>
//                                           <small className="text-muted">
//                                             {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
//                                           </small>
//                                         </td>
//                                       </tr>
//                                     ))
//                                   }
//                                 </tbody>
//                               </table>
//                               {assignedTasks.filter(task => isUserAssignedToTask(task, localStorage.getItem('userEmail'))).length === 0 && (
//                                 <div className="text-center py-4">
//                                   <i className="fas fa-tasks fa-2x text-muted mb-2"></i>
//                                   <p className="text-muted">No tasks assigned yet</p>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="col-lg-4 mb-4">
//                         <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
//                           <div className="card-header bg-white border-0 py-3" style={{ borderRadius: '12px 12px 0 0' }}>
//                             <h5 className="mb-0 fw-bold text-dark">
//                               <i className="fas fa-project-diagram me-2 text-success"></i>My Projects
//                             </h5>
//                           </div>
//                           <div className="card-body">
//                             {getEmployeeProjects(localStorage.getItem('userEmail')).length > 0 ? (
//                               getEmployeeProjects(localStorage.getItem('userEmail')).map((project, index) => (
//                                 <div key={index} className="mb-3 p-3 bg-light rounded">
//                                   <h6 className="fw-bold mb-1">{project.name}</h6>
//                                   <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
//                                     project.status === 'On Track' ? 'bg-primary' :
//                                       project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
//                                     }`}>
//                                     {project.status}
//                                   </span>
//                                   <div className="mt-2">
//                                     <div className="d-flex justify-content-between mb-1">
//                                       <small className="text-muted">Progress</small>
//                                       <small className="fw-bold">{project.progress}%</small>
//                                     </div>
//                                     <div className="progress" style={{ height: '6px' }}>
//                                       <div className="progress-bar bg-primary" style={{ width: `${project.progress}%` }}></div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))
//                             ) : (
//                               <div className="text-center py-3">
//                                 <i className="fas fa-project-diagram fa-2x text-muted mb-2"></i>
//                                 <p className="text-muted">No projects assigned</p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Employee Dashboard with Real-time Updates */}
//                 {currentRole === 'employee' && activeView === 'dashboard' && (
//                   <div>
//                     <div className="row mb-4">
//                       <div className="col-md-8">
//                         <div className="card border-0 shadow-sm">
//                           <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
//                             <h5 className="mb-0">
//                               <i className="fas fa-tasks me-2 text-primary"></i>My Daily Tasks
//                             </h5>
//                             <div className="d-flex align-items-center gap-2">
//                               <span className="badge bg-primary rounded-pill">{assignedTasks.filter(task => isUserAssignedToTask(task, localStorage.getItem('userEmail'))).length} Tasks</span>
//                               <span className="badge bg-success bg-opacity-10 text-success">
//                                 <i className="fas fa-circle fa-xs me-1" style={{ animation: 'pulse 2s infinite' }}></i>
//                                 LIVE
//                               </span>
//                               <button
//                                 className="btn btn-sm btn-outline-primary ms-2"
//                                 onClick={manualRefreshTasks}
//                                 disabled={isRefreshing}
//                                 title="Refresh tasks manually"
//                               >
//                                 <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}></i>
//                               </button>
//                             </div>
//                           </div>
//                           <div className="card-body p-3">
//                             {/* Task Filter Tabs */}
//                             <div className="d-flex gap-2 mb-3 flex-wrap">
//                               <button
//                                 className={`btn btn-sm ${selectedTaskFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                                 onClick={() => setSelectedTaskFilter('all')}
//                               >
//                                 <i className="fas fa-list me-1"></i>All Tasks
//                               </button>
//                               <button
//                                 className={`btn btn-sm ${selectedTaskFilter === 'assigned' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                                 onClick={() => setSelectedTaskFilter('assigned')}
//                               >
//                                 <i className="fas fa-clipboard-list me-1"></i>Assigned ({taskStats.assigned})
//                               </button>
//                               <button
//                                 className={`btn btn-sm ${selectedTaskFilter === 'completed' ? 'btn-success' : 'btn-outline-secondary'}`}
//                                 onClick={() => setSelectedTaskFilter('completed')}
//                               >
//                                 <i className="fas fa-check-circle me-1"></i>Completed ({taskStats.completed})
//                               </button>
//                               <button
//                                 className={`btn btn-sm ${selectedTaskFilter === 'in-progress' ? 'btn-warning' : 'btn-outline-secondary'}`}
//                                 onClick={() => setSelectedTaskFilter('in-progress')}
//                               >
//                                 <i className="fas fa-clock me-1"></i>In Progress ({taskStats.inProgress})
//                               </button>
//                               <button
//                                 className={`btn btn-sm ${selectedTaskFilter === 'pending' ? 'btn-danger' : 'btn-outline-secondary'}`}
//                                 onClick={() => setSelectedTaskFilter('pending')}
//                               >
//                                 <i className="fas fa-times-circle me-1"></i>Pending ({taskStats.pending})
//                               </button>
//                             </div>

//                             {(() => {
//                               const userEmail = localStorage.getItem('userEmail');
//                               let filteredTasks = assignedTasks.filter(task => isUserAssignedToTask(task, userEmail));

//                               // Apply status filter based on selected filter
//                               if (selectedTaskFilter === 'assigned') {
//                                 filteredTasks = filteredTasks.filter(task =>
//                                   task.status === 'assigned' || task.status === 'pending' || !task.status
//                                 );
//                               } else if (selectedTaskFilter === 'completed') {
//                                 filteredTasks = filteredTasks.filter(task => task.status === 'completed');
//                               } else if (selectedTaskFilter === 'in-progress') {
//                                 filteredTasks = filteredTasks.filter(task => task.status === 'in-progress');
//                               } else if (selectedTaskFilter === 'pending') {
//                                 filteredTasks = filteredTasks.filter(task =>
//                                   task.status === 'pending' || !task.status
//                                 );
//                               }
//                               // 'all' shows all tasks without filtering

//                               // Show loading state if tasks are being refreshed
//                               if (isRefreshing && filteredTasks.length === 0) {
//                                 return (
//                                   <div className="text-center py-5">
//                                     <div className="spinner-border text-primary" role="status">
//                                       <span className="visually-hidden">Loading...</span>
//                                     </div>
//                                     <p className="text-muted mt-2">Loading your tasks...</p>
//                                   </div>
//                                 );
//                               }

//                               console.log('🔍 Filtering tasks for employee dashboard:', {
//                                 userEmail,
//                                 totalTasks: assignedTasks.length,
//                                 selectedFilter: selectedTaskFilter,
//                                 filteredTasks: filteredTasks.length,
//                                 taskTitles: filteredTasks.map(t => t.title),
//                                 isRefreshing
//                               });

//                               return filteredTasks.length > 0 ?
//                                 filteredTasks.map((task, index) => (
//                                   <div key={index} className="position-relative mb-3">
//                                     <div className="card border-0 shadow-sm" style={{ borderLeft: `4px solid ${task.status === 'completed' ? '#28a745' : task.status === 'in-progress' ? '#17a2b8' : '#6c757d'}` }}>
//                                       <div className="card-body p-3">
//                                         <div className="d-flex justify-content-between align-items-start mb-2">
//                                           <div className="flex-grow-1">
//                                             <div className="d-flex align-items-center mb-1">
//                                               <h6 className="fw-bold mb-0 text-dark me-2">{task.title}</h6>
//                                               {task.isRealTimeAssignment && (
//                                                 <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '0.7rem' }}>
//                                                   <i className="fas fa-bolt fa-xs me-1"></i>
//                                                   NEW
//                                                 </span>
//                                               )}
//                                               {task.priority === 'high' && (
//                                                 <span className="badge bg-danger bg-opacity-10 text-danger ms-1" style={{ fontSize: '0.7rem' }}>
//                                                   <i className="fas fa-exclamation fa-xs me-1"></i>
//                                                   HIGH
//                                                 </span>
//                                               )}
//                                             </div>
//                                             <p className="text-muted small mb-0">Project: {task.project || 'No Project'}</p>
//                                             {task.assignedBy && (
//                                               <p className="text-muted small mb-0">Assigned by: {task.assignedBy}</p>
//                                             )}
//                                           </div>
//                                           <button className="btn btn-sm btn-light border-0 ms-2">
//                                             <i className="fas fa-edit text-muted"></i>
//                                           </button>
//                                         </div>
//                                         <div className="d-flex justify-content-between align-items-center mt-3">
//                                           <div className="text-muted small">
//                                             <div>
//                                               <i className="far fa-calendar me-1"></i>Start: {task.startDate ? new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                                             </div>
//                                             <div className="mt-1">
//                                               <i className="far fa-clock me-1"></i>Deadline: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
//                                             </div>
//                                           </div>
//                                           <span className={`badge rounded-pill px-3 py-2 ${task.status === 'completed' ? 'bg-success bg-opacity-25 text-success' :
//                                             task.status === 'in-progress' ? 'bg-warning bg-opacity-25 text-warning' :
//                                               'bg-secondary bg-opacity-25 text-secondary'
//                                             }`}>
//                                             {task.status === 'completed' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
//                                           </span>
//                                         </div>

//                                         {/* Task Notes/Discussion Section */}
//                                         <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
//                                           <div className="d-flex align-items-center gap-2">
//                                             <button
//                                               className="btn btn-sm btn-outline-primary"
//                                               onClick={() => openTaskNotesModal(task)}
//                                               title="Add note to this task"
//                                             >
//                                               <i className="fas fa-plus me-1"></i>
//                                               Add Note
//                                             </button>
//                                             {getTaskNoteCount(task.id || task._id) > 0 && (
//                                               <button
//                                                 className="btn btn-sm btn-outline-secondary position-relative"
//                                                 onClick={() => openTaskNotesModal(task)}
//                                                 title="View discussion"
//                                               >
//                                                 <i className="fas fa-comments me-1"></i>
//                                                 View Discussion
//                                                 <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
//                                                   {getTaskNoteCount(task.id || task._id)}
//                                                 </span>
//                                               </button>
//                                             )}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 )) : (
//                                   <div className="text-center py-5">
//                                     <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
//                                     <p className="text-muted">No tasks assigned yet</p>
//                                     <div className="d-flex gap-2 justify-content-center mt-3">
//                                       <button
//                                         className="btn btn-sm btn-outline-primary"
//                                         onClick={() => window.debugEmployeeTasks && window.debugEmployeeTasks()}
//                                       >
//                                         Debug Tasks
//                                       </button>
//                                       <button
//                                         className="btn btn-sm btn-primary"
//                                         onClick={() => {
//                                           setShowTaskSelectionModal(true);
//                                           setEmployeeTasksLoaded(false);
//                                         }}
//                                       >
//                                         Select Task
//                                       </button>
//                                       <button
//                                         className="btn btn-sm btn-success"
//                                         onClick={manualRefreshTasks}
//                                       >
//                                         Refresh Tasks
//                                       </button>
//                                     </div>
//                                   </div>
//                                 );
//                             })()}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-md-4">
//                         {/* Daily Reminders Section */}
//                         <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)' }}>
//                           <div className="card-header bg-transparent border-0 py-3">
//                             <div className="d-flex align-items-center">
//                               <div className="rounded-circle bg-warning bg-opacity-25 p-2 me-3">
//                                 <i className="fas fa-bell text-warning"></i>
//                               </div>
//                               <div>
//                                 <h6 className="mb-0 fw-bold text-dark">Daily Reminders</h6>
//                                 <small className="text-muted">Stay updated with important deadlines</small>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="card-body pt-0">
//                             {(() => {
//                               const currentUser = localStorage.getItem('userEmail');
//                               const today = new Date();
//                               const reminders = [];

//                               // Check for project deadlines (within 5 days)
//                               const userProjects = projects.filter(project =>
//                                 project.assigned?.some(member => member.name === localStorage.getItem('userName')) ||
//                                 project.projectManager === localStorage.getItem('userName')
//                               );

//                               userProjects.forEach(project => {
//                                 if (project.endDate) {
//                                   const projectEndDate = new Date(project.endDate);
//                                   const daysUntilDeadline = Math.ceil((projectEndDate - today) / (1000 * 60 * 60 * 24));

//                                   if (daysUntilDeadline <= 5 && daysUntilDeadline > 0) {
//                                     reminders.push({
//                                       type: 'project-deadline',
//                                       icon: 'fas fa-project-diagram',
//                                       color: 'danger',
//                                       title: `Project "${project.name}" deadline approaching`,
//                                       message: `Due in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''} (${projectEndDate.toLocaleDateString()})`,
//                                       priority: daysUntilDeadline <= 2 ? 'high' : 'medium'
//                                     });
//                                   }
//                                 }
//                               });

//                               // Check for task deadlines (within 5 days)
//                               const userTasks = assignedTasks.filter(task =>
//                                 isUserAssignedToTask(task, currentUser)
//                               );

//                               userTasks.forEach(task => {
//                                 if (task.dueDate && task.status !== 'completed') {
//                                   const taskDueDate = new Date(task.dueDate);
//                                   const daysUntilDeadline = Math.ceil((taskDueDate - today) / (1000 * 60 * 60 * 24));

//                                   if (daysUntilDeadline <= 5 && daysUntilDeadline > 0) {
//                                     reminders.push({
//                                       type: 'task-deadline',
//                                       icon: 'fas fa-tasks',
//                                       color: 'warning',
//                                       title: `Task "${task.title}" deadline approaching`,
//                                       message: `Due in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''} (${taskDueDate.toLocaleDateString()})`,
//                                       priority: daysUntilDeadline <= 2 ? 'high' : 'medium'
//                                     });
//                                   }
//                                 }
//                               });

//                               // Check for new tasks (assigned within last 24 hours)
//                               const oneDayAgo = new Date(today.getTime() - (24 * 60 * 60 * 1000));
//                               userTasks.forEach(task => {
//                                 if (task.assignedDate || task.createdAt) {
//                                   const assignedDate = new Date(task.assignedDate || task.createdAt);
//                                   if (assignedDate > oneDayAgo && task.status === 'assigned') {
//                                     reminders.push({
//                                       type: 'new-task',
//                                       icon: 'fas fa-plus-circle',
//                                       color: 'info',
//                                       title: `New task: "${task.title}"`,
//                                       message: `Assigned ${assignedDate.toLocaleDateString()} - Priority: ${task.priority || 'Normal'}`,
//                                       priority: 'medium'
//                                     });
//                                   }
//                                 }
//                               });

//                               // Sort reminders by priority (high first)
//                               reminders.sort((a, b) => {
//                                 const priorityOrder = { high: 3, medium: 2, low: 1 };
//                                 return priorityOrder[b.priority] - priorityOrder[a.priority];
//                               });

//                               return reminders.length > 0 ? (
//                                 <div className="d-flex flex-column gap-2">
//                                   {reminders.slice(0, 3).map((reminder, index) => (
//                                     <div key={index} className={`alert alert-${reminder.color} alert-dismissible fade show mb-0 py-2`}
//                                       style={{ borderRadius: '8px', border: 'none', fontSize: '0.85rem' }}>
//                                       <div className="d-flex align-items-start">
//                                         <div className={`rounded-circle bg-${reminder.color} bg-opacity-25 p-1 me-2 flex-shrink-0`} style={{ width: '24px', height: '24px' }}>
//                                           <i className={`${reminder.icon} text-${reminder.color}`} style={{ fontSize: '0.7rem' }}></i>
//                                         </div>
//                                         <div className="flex-grow-1">
//                                           <div className={`fw-bold text-${reminder.color} mb-1`} style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
//                                             {reminder.type === 'project-deadline' ? 'Project Deadline' :
//                                               reminder.type === 'task-deadline' ? 'Task Deadline' : 'New Assignment'}
//                                           </div>
//                                           <p className="mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>{reminder.message}</p>
//                                         </div>
//                                         {reminder.priority === 'high' && (
//                                           <span className="badge bg-danger ms-1" style={{ fontSize: '0.6rem' }}>!</span>
//                                         )}
//                                       </div>
//                                     </div>
//                                   ))}
//                                   {reminders.length > 3 && (
//                                     <div className="text-center">
//                                       <small className="text-muted" style={{ fontSize: '0.75rem' }}>
//                                         +{reminders.length - 3} more reminder{reminders.length - 3 > 1 ? 's' : ''}
//                                       </small>
//                                     </div>
//                                   )}
//                                 </div>
//                               ) : (
//                                 <div className="text-center py-2">
//                                   <div className="rounded-circle bg-success bg-opacity-25 p-2 mx-auto mb-2" style={{ width: '40px', height: '40px' }}>
//                                     <i className="fas fa-check text-success"></i>
//                                   </div>
//                                   <h6 className="text-success mb-1" style={{ fontSize: '0.85rem' }}>All caught up!</h6>
//                                   <small className="text-muted" style={{ fontSize: '0.75rem' }}>No urgent reminders</small>
//                                 </div>
//                               );
//                             })()}
//                           </div>
//                         </div>

//                         <div className="card border-0 shadow-sm">
//                           <div className="card-header bg-white border-0 py-3">
//                             <h5 className="mb-0">
//                               <i className="fas fa-project-diagram me-2 text-primary"></i>My Projects
//                             </h5>
//                           </div>
//                           <div className="card-body p-3">
//                             {projects && projects.length > 0 ? projects.slice(0, 3).map((project, index) => (
//                               <div key={index} className="card border-0 shadow-sm mb-3">
//                                 <div className="card-body p-3">
//                                   <div className="fw-semibold mb-1">{project.name}</div>
//                                   <div className="text-muted small mb-2">Client: {project.clientName}</div>
//                                   <div className="progress mb-2" style={{ height: '6px' }}>
//                                     <div className="progress-bar bg-primary" style={{ width: `${project.progress}%` }}></div>
//                                   </div>
//                                   <div className="d-flex justify-content-between align-items-center">
//                                     <small className="text-muted">{project.progress}% Complete</small>
//                                     <span className={`badge ${project.status === 'On Track' ? 'bg-success' : 'bg-warning'}`} style={{ fontSize: '10px' }}>
//                                       {project.status}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                             )) : (
//                               <div className="text-center py-4">
//                                 <i className="fas fa-project-diagram fa-2x text-muted mb-2"></i>
//                                 <p className="text-muted small">No projects assigned</p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Task Table Section - Hidden in Dashboard, shown in My Tasks */}
//                     {false && ( // Hide this table in dashboard view
//                       <div className="card border-0 shadow-sm">
//                         <div className="card-body p-0">
//                           <div className="table-responsive">
//                             <table className="table table-hover mb-0">
//                               <thead className="bg-light">
//                                 <tr>
//                                   <th className="border-0 px-4 py-3">Task Name</th>
//                                   <th className="border-0 px-4 py-3">Assignee</th>
//                                   <th className="border-0 px-4 py-3">Project</th>
//                                   <th className="border-0 px-4 py-3">Priority</th>
//                                   <th className="border-0 px-4 py-3">Due Date</th>
//                                   <th className="border-0 px-4 py-3">Status</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {assignedTasks && assignedTasks.length > 0 ? assignedTasks.map((task, index) => (
//                                   <tr key={index}>
//                                     <td className="px-4 py-3">
//                                       <div>
//                                         <div className="fw-semibold">{task.title}</div>
//                                         <small className="text-muted">{task.description}</small>
//                                       </div>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                       <div className="d-flex align-items-center">
//                                         <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
//                                           {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
//                                         </div>
//                                         <span>{task.assignedTo || 'Unassigned'}</span>
//                                       </div>
//                                     </td>
//                                     <td className="px-4 py-3">{task.project || 'No Project'}</td>
//                                     <td className="px-4 py-3">
//                                       <span className={`badge ${task.priority === 'high' ? 'bg-danger' :
//                                         task.priority === 'medium' ? 'bg-warning text-dark' :
//                                           'bg-success'
//                                         }`}>
//                                         {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
//                                       </span>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                       {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
//                                     </td>
//                                     <td className="px-4 py-3">
//                                       <span className={`badge ${task.status === 'completed' ? 'bg-success' :
//                                         task.status === 'in-progress' ? 'bg-warning' :
//                                           'bg-secondary'
//                                         }`}>
//                                         {task.status === 'completed' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
//                                       </span>
//                                     </td>
//                                   </tr>
//                                 )) : (
//                                   <tr>
//                                     <td colSpan="6" className="text-center py-5">
//                                       <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
//                                       <p className="text-muted">No tasks available</p>
//                                     </td>
//                                   </tr>
//                                 )}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     )} {/* End of hidden table in dashboard */}
//                   </div>
//                 )}

//                 {/* Employee Tasks View - New Format */}
//                 {(currentRole === 'employee' || currentRole === 'intern') && activeView === 'employee-tasks' && (
//                   <div>
//                     <div className="mb-3">
//                       <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
//                         <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//                       </button>
//                     </div>

//                     <div className="card">
//                       <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom">
//                         <h5 className="card-title mb-0">
//                           <i className="fas fa-list me-2"></i>All Tasks Overview
//                         </h5>
//                         <div className="d-flex align-items-center gap-2">
//                           <span className="badge bg-primary">{assignedTasks.length} Total Tasks</span>
//                           <button className="btn btn-success btn-sm">
//                             <i className="fas fa-plus me-1"></i> Create Task
//                           </button>
//                         </div>
//                       </div>
//                       <div className="card-body p-0">
//                         {/* Filter Tabs */}
//                         <div className="d-flex justify-content-between align-items-center mb-3 px-4 pt-3">
//                           <h6 className="mb-0">Recent Tasks</h6>
//                           <div className="btn-group" role="group">
//                             <button type="button" className="btn btn-primary btn-sm" data-bs-toggle="pill" data-bs-target="#all-tasks-tab">All</button>
//                             <button type="button" className="btn btn-outline-secondary btn-sm" data-bs-toggle="pill" data-bs-target="#assigned-tab">Assigned</button>
//                             <button type="button" className="btn btn-outline-secondary btn-sm" data-bs-toggle="pill" data-bs-target="#completed-tab">Completed</button>
//                           </div>
//                         </div>

//                         {/* Tab Content */}
//                         <div className="tab-content">
//                           <div id="all-tasks-tab" className="tab-pane fade show active">
//                             <div className="table-responsive">
//                               <table className="table table-hover mb-0">
//                                 <thead className="bg-light">
//                                   <tr>
//                                     <th className="border-0 px-4 py-3">Task Name</th>
//                                     <th className="border-0 px-4 py-3">Assignee</th>
//                                     <th className="border-0 px-4 py-3">Project</th>
//                                     <th className="border-0 px-4 py-3">Priority</th>
//                                     <th className="border-0 px-4 py-3">Due Date</th>
//                                     <th className="border-0 px-4 py-3">Status</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {assignedTasks && assignedTasks.length > 0 ? assignedTasks.map((task, index) => (
//                                     <tr key={index}>
//                                       <td className="px-4 py-3">
//                                         <div>
//                                           <div className="fw-semibold">{task.title}</div>
//                                           <small className="text-muted">{task.description}</small>
//                                         </div>
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         <div className="d-flex align-items-center">
//                                           <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
//                                             {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
//                                           </div>
//                                           <span>{task.assignedTo || 'Unassigned'}</span>
//                                         </div>
//                                       </td>
//                                       <td className="px-4 py-3">{task.project || 'No Project'}</td>
//                                       <td className="px-4 py-3">
//                                         <span className={`badge ${task.priority === 'high' ? 'bg-danger' :
//                                           task.priority === 'medium' ? 'bg-warning text-dark' :
//                                             'bg-success'
//                                           }`}>
//                                           {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
//                                         </span>
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         <span className={`badge ${task.status === 'completed' ? 'bg-success' :
//                                           task.status === 'in-progress' ? 'bg-warning' :
//                                             'bg-secondary'
//                                           }`}>
//                                           {task.status === 'completed' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
//                                         </span>
//                                       </td>
//                                     </tr>
//                                   )) : (
//                                     <tr>
//                                       <td colSpan="6" className="text-center py-5">
//                                         <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
//                                         <p className="text-muted">No tasks available</p>
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                           <div id="assigned-tab" className="tab-pane fade">
//                             <div className="table-responsive">
//                               <table className="table table-hover mb-0">
//                                 <thead className="bg-light">
//                                   <tr>
//                                     <th className="border-0 px-4 py-3">Task Name</th>
//                                     <th className="border-0 px-4 py-3">Assignee</th>
//                                     <th className="border-0 px-4 py-3">Project</th>
//                                     <th className="border-0 px-4 py-3">Priority</th>
//                                     <th className="border-0 px-4 py-3">Due Date</th>
//                                     <th className="border-0 px-4 py-3">Status</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {assignedTasks && assignedTasks.filter(t => t.status !== 'completed').length > 0 ? assignedTasks.filter(t => t.status !== 'completed').map((task, index) => (
//                                     <tr key={index}>
//                                       <td className="px-4 py-3">
//                                         <div>
//                                           <div className="fw-semibold">{task.title}</div>
//                                           <small className="text-muted">{task.description}</small>
//                                         </div>
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         <div className="d-flex align-items-center">
//                                           <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
//                                             {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
//                                           </div>
//                                           <span>{task.assignedTo || 'Unassigned'}</span>
//                                         </div>
//                                       </td>
//                                       <td className="px-4 py-3">{task.project || 'No Project'}</td>
//                                       <td className="px-4 py-3">
//                                         <span className={`badge ${task.priority === 'high' ? 'bg-danger' :
//                                           task.priority === 'medium' ? 'bg-warning text-dark' :
//                                             'bg-success'
//                                           }`}>
//                                           {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
//                                         </span>
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         <span className={`badge ${task.status === 'in-progress' ? 'bg-warning' : 'bg-secondary'
//                                           }`}>
//                                           {task.status === 'in-progress' ? 'In Progress' : 'Pending'}
//                                         </span>
//                                       </td>
//                                     </tr>
//                                   )) : (
//                                     <tr>
//                                       <td colSpan="6" className="text-center py-5">
//                                         <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
//                                         <p className="text-muted">No assigned tasks</p>
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                           <div id="completed-tab" className="tab-pane fade">
//                             <div className="table-responsive">
//                               <table className="table table-hover mb-0">
//                                 <thead className="bg-light">
//                                   <tr>
//                                     <th className="border-0 px-4 py-3">Task Name</th>
//                                     <th className="border-0 px-4 py-3">Assignee</th>
//                                     <th className="border-0 px-4 py-3">Project</th>
//                                     <th className="border-0 px-4 py-3">Priority</th>
//                                     <th className="border-0 px-4 py-3">Due Date</th>
//                                     <th className="border-0 px-4 py-3">Status</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {assignedTasks && assignedTasks.filter(t => t.status === 'completed').length > 0 ? assignedTasks.filter(t => t.status === 'completed').map((task, index) => (
//                                     <tr key={index}>
//                                       <td className="px-4 py-3">
//                                         <div>
//                                           <div className="fw-semibold">{task.title}</div>
//                                           <small className="text-muted">{task.description}</small>
//                                         </div>
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         <div className="d-flex align-items-center">
//                                           <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
//                                             {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
//                                           </div>
//                                           <span>{task.assignedTo || 'Unassigned'}</span>
//                                         </div>
//                                       </td>
//                                       <td className="px-4 py-3">{task.project || 'No Project'}</td>
//                                       <td className="px-4 py-3">
//                                         <span className={`badge ${task.priority === 'high' ? 'bg-danger' :
//                                           task.priority === 'medium' ? 'bg-warning text-dark' :
//                                             'bg-success'
//                                           }`}>
//                                           {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
//                                         </span>
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
//                                       </td>
//                                       <td className="px-4 py-3">
//                                         <span className="badge bg-success">Completed</span>
//                                       </td>
//                                     </tr>
//                                   )) : (
//                                     <tr>
//                                       <td colSpan="6" className="text-center py-5">
//                                         <i className="fas fa-check-circle fa-3x text-muted mb-3"></i>
//                                         <p className="text-muted">No completed tasks</p>
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Admin View: Project Manager Dashboard */}
//                 {currentRole === 'admin' && activeView === 'pm-dashboard-view' && (
//                   <div>
//                     <div className="mb-3">
//                       <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
//                         <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//                       </button>
//                     </div>

//                     <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', color: 'white' }}>
//                       <div className="card-body py-4">
//                         <h3 className="mb-1"><i className="fas fa-user-tie me-2"></i>Overview</h3>
//                         <p className="mb-0 opacity-75">View all project managers and their activities</p>
//                       </div>
//                     </div>

//                     <div className="row mb-4">
//                       {projectManagers.map((manager, index) => (
//                         <div key={index} className="col-md-6 col-lg-4 mb-4">
//                           <div className="card h-100 border-2 shadow-sm">
//                             <div className="card-body">
//                               <div className="d-flex align-items-center mb-3">
//                                 <div
//                                   className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
//                                   style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}
//                                 >
//                                   {manager.name.charAt(0)}
//                                 </div>
//                                 <div className="flex-grow-1">
//                                   <h6 className="card-title mb-1">{manager.name}</h6>
//                                   <small className="text-muted">{manager.email}</small>
//                                 </div>
//                               </div>

//                               <div className="row text-center mb-3">
//                                 <div className="col-4">
//                                   <div className="fw-bold text-primary">{manager.projectsAssigned || 0}</div>
//                                   <small className="text-muted">Projects</small>
//                                 </div>
//                                 <div className="col-4">
//                                   <div className="fw-bold text-success">{manager.teamSize || 0}</div>
//                                   <small className="text-muted">Team Size</small>
//                                 </div>
//                                 <div className="col-4">
//                                   <div className="fw-bold text-info">{manager.experience}</div>
//                                   <small className="text-muted">Experience</small>
//                                 </div>
//                               </div>

//                               <div className="mb-2">
//                                 <small className="text-muted">Department:</small>
//                                 <span className="ms-2 badge bg-light text-dark">{manager.department}</span>
//                               </div>

//                               <button
//                                 className="btn btn-sm btn-outline-primary w-100 mt-2"
//                                 onClick={() => handleViewProjectManager(manager)}
//                               >
//                                 <i className="fas fa-eye me-1"></i>View Details
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Admin View: Team Leader Dashboard */}
//                 {currentRole === 'admin' && activeView === 'tl-dashboard-view' && (
//                   <div>
//                     <div className="mb-3">
//                       <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
//                         <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//                       </button>
//                     </div>

//                     <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
//                       <div className="card-body py-4">
//                         <h3 className="mb-1"><i className="fas fa-users-cog me-2"></i>Team Leader Dashboard Overview</h3>
//                         <p className="mb-0 opacity-75">View all team leaders and their teams</p>
//                       </div>
//                     </div>

//                     <div className="row mb-4">
//                       {teamLeaders.map((leader, index) => (
//                         <div key={index} className="col-md-6 col-lg-4 mb-4">
//                           <div className="card h-100 border-2 shadow-sm">
//                             <div className="card-body">
//                               <div className="d-flex align-items-center mb-3">
//                                 <div
//                                   className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
//                                   style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}
//                                 >
//                                   {leader.name.charAt(0)}
//                                 </div>
//                                 <div className="flex-grow-1">
//                                   <h6 className="card-title mb-1">{leader.name}</h6>
//                                   <small className="text-muted">{leader.email}</small>
//                                 </div>
//                               </div>

//                               <div className="row text-center mb-3">
//                                 <div className="col-4">
//                                   <div className="fw-bold text-primary">{leader.projectsManaged || 0}</div>
//                                   <small className="text-muted">Projects</small>
//                                 </div>
//                                 <div className="col-4">
//                                   <div className="fw-bold text-success">{leader.teamSize || 0}</div>
//                                   <small className="text-muted">Team Size</small>
//                                 </div>
//                                 <div className="col-4">
//                                   <div className="fw-bold text-info">{leader.skills?.length || 0}</div>
//                                   <small className="text-muted">Skills</small>
//                                 </div>
//                               </div>

//                               <div className="mb-2">
//                                 <small className="text-muted">Department:</small>
//                                 <span className="ms-2 badge bg-light text-dark">{leader.department}</span>
//                               </div>

//                               <button
//                                 className="btn btn-sm btn-outline-success w-100 mt-2"
//                                 onClick={() => alert(`Team Leader Details:\n\nName: ${leader.name}\nEmail: ${leader.email}\nDepartment: ${leader.department}\nTeam Size: ${leader.teamSize}\nProjects: ${leader.projectsManaged}`)}
//                               >
//                                 <i className="fas fa-eye me-1"></i>View Details
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Admin View: Employee Dashboard */}
//                 {currentRole === 'admin' && activeView === 'employee-dashboard-view' && (
//                   <div>
//                     <div className="mb-3">
//                       <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
//                         <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//                       </button>
//                     </div>

//                     <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
//                       <div className="card-body py-4">
//                         <h3 className="mb-1"><i className="fas fa-user me-2"></i>Employee Dashboard Overview</h3>
//                         <p className="mb-0 opacity-75">View all employees and their tasks</p>
//                       </div>
//                     </div>

//                     <div className="row mb-4">
//                       {allUsers.filter(user => user.role === 'employee' || user.role === 'intern').map((employee, index) => (
//                         <div key={index} className="col-md-6 col-lg-4 mb-4">
//                           <div className="card h-100 border-2 shadow-sm">
//                             <div className="card-body">
//                               <div className="d-flex align-items-center mb-3">
//                                 <div
//                                   className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3"
//                                   style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}
//                                 >
//                                   {employee.name.charAt(0)}
//                                 </div>
//                                 <div className="flex-grow-1">
//                                   <h6 className="card-title mb-1">{employee.name}</h6>
//                                   <small className="text-muted">{employee.email}</small>
//                                 </div>
//                               </div>

//                               <div className="row text-center mb-3">
//                                 <div className="col-6">
//                                   <div className="fw-bold text-primary">{assignedTasks.filter(t => t.assignedTo === employee.email).length}</div>

//                                 </div>
//                                 <div className="col-6">
//                                   <div className="fw-bold text-success">{assignedTasks.filter(t => t.assignedTo === employee.email && t.status === 'completed').length}</div>
//                                   <small className="text-muted">Completed</small>
//                                 </div>
//                               </div>

//                               <div className="mb-2">
//                                 <small className="text-muted">Department:</small>
//                                 <span className="ms-2 badge bg-light text-dark">{employee.department}</span>
//                               </div>

//                               <div className="mb-2">
//                                 <small className="text-muted">Project:</small>
//                                 <span className="ms-2 text-primary small">{employee.assignedProject || 'Not Assigned'}</span>
//                               </div>

//                               <button
//                                 className="btn btn-sm btn-outline-info w-100 mt-2"
//                                 onClick={() => alert(`Employee Details:\n\nName: ${employee.name}\nEmail: ${employee.email}\nDepartment: ${employee.department}\nProject: ${employee.assignedProject || 'Not Assigned'}\nTasks: ${assignedTasks.filter(t => t.assignedTo === employee.email).length}`)}
//                               >
//                                 <i className="fas fa-eye me-1"></i>View Details
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Employee Projects View */}
//                 {currentRole === 'admin' && activeView === 'employee-projects' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">Employee Project Assignments</h5>
//                         <small className="text-muted">View employee details with project assignments and status</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button className="btn btn-outline-secondary btn-sm">
//                           <i className="fas fa-filter me-1"></i> Filter
//                         </button>
//                         <button className="btn btn-primary btn-sm" onClick={() => setShowAddEmployeeModal(true)}>
//                           <i className="fas fa-plus me-1"></i> Add Employee
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       <div className="table-responsive">
//                         <table className="table table-hover">
//                           <thead className="table-light">
//                             <tr>
//                               <th>Employee</th>
//                               <th>Role</th>
//                               <th>Project Names</th>
//                               <th>Client Names</th>
//                               <th>Project Status</th>
//                               <th>Assignment Status</th>
//                               <th>Actions</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {employees.map((employee, index) => {
//                               const employeeProjects = getEmployeeProjects(employee.id);
//                               const isAssigned = employeeProjects.length > 0;
//                               return (
//                                 <tr key={index}>
//                                   <td>
//                                     <div className="d-flex align-items-center">
//                                       <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
//                                         {getCleanAvatar(employee.avatar, employee.name)}
//                                       </div>
//                                       <div>
//                                         <div className="fw-semibold">{employee.name}</div>
//                                         <small className="text-muted">{employee.email}</small>
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td>
//                                     <span className="badge bg-light text-dark border">{employee.role}</span>
//                                   </td>
//                                   <td>
//                                     {employeeProjects.length > 0 ? (
//                                       <div>
//                                         {employeeProjects.map((project, idx) => (
//                                           <div key={idx} className="mb-1">
//                                             <span className="fw-semibold">{project.name}</span>
//                                             {idx < employeeProjects.length - 1 && <br />}
//                                           </div>
//                                         ))}
//                                         {employeeProjects.length > 1 && (
//                                           <small className="text-muted">({employeeProjects.length} projects)</small>
//                                         )}
//                                       </div>
//                                     ) : (
//                                       <span className="text-muted fst-italic">No projects assigned</span>
//                                     )}
//                                   </td>
//                                   <td>
//                                     {employeeProjects.length > 0 ? (
//                                       <div>
//                                         {employeeProjects.map((project, idx) => (
//                                           <div key={idx} className="mb-1">
//                                             <span className="text-primary fw-semibold">{project.clientName}</span>
//                                             {idx < employeeProjects.length - 1 && <br />}
//                                           </div>
//                                         ))}
//                                       </div>
//                                     ) : (
//                                       <span className="text-muted">-</span>
//                                     )}
//                                   </td>
//                                   <td>
//                                     {employeeProjects.length > 0 ? (
//                                       <div>
//                                         {employeeProjects.map((project, idx) => (
//                                           <div key={idx} className="mb-1">
//                                             <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
//                                               project.status === 'On Track' ? 'bg-primary' :
//                                                 project.status === 'At Risk' ? 'bg-warning' :
//                                                   project.status === 'Delayed' ? 'bg-danger' : 'bg-secondary'
//                                               }`}>
//                                               {project.status}
//                                             </span>
//                                             {idx < employeeProjects.length - 1 && <br />}
//                                           </div>
//                                         ))}
//                                       </div>
//                                     ) : (
//                                       <span className="badge bg-secondary">Available</span>
//                                     )}
//                                   </td>
//                                   <td>
//                                     <div className="d-flex align-items-center">
//                                       <div
//                                         className={`rounded-pill px-2 py-1 text-white fw-bold ${isAssigned ? 'bg-danger' : 'bg-success'
//                                           }`}
//                                         style={{ fontSize: '12px' }}
//                                       >
//                                         {isAssigned ? 'ASSIGNED' : 'AVAILABLE'}
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td>
//                                     <div className="dropdown">
//                                       <button
//                                         className="btn btn-sm btn-outline-secondary dropdown-toggle"
//                                         data-bs-toggle="dropdown"
//                                         title="User Management Settings"
//                                       >
//                                         <i className="fas fa-cog"></i>
//                                       </button>
//                                       <ul className="dropdown-menu">
//                                         <li>
//                                           <button
//                                             className="dropdown-item"
//                                             onClick={() => {
//                                               const employeeProjects = projects.filter(project =>
//                                                 project.assignedMembers?.some(member => member.name === employee.name) ||
//                                                 project.projectManager === employee.name
//                                               );
//                                               const projectsList = employeeProjects.length > 0
//                                                 ? employeeProjects.map(p => `• ${p.name} (${p.clientName})`).join('\n')
//                                                 : 'No projects assigned';
//                                               alert(`Employee Details:\n\nName: ${employee.name}\nEmail: ${employee.email}\nRole: ${employee.role}\nDepartment: ${employee.department || 'Not specified'}\nStatus: ${employee.status || 'Active'}\n\nProjects:\n${projectsList}`);
//                                             }}
//                                           >
//                                             <i className="fas fa-eye me-2"></i>View Details
//                                           </button>
//                                         </li>
//                                         <li>
//                                           <button
//                                             className="dropdown-item"
//                                             onClick={() => handleEditUser(employee)}
//                                           >
//                                             <i className="fas fa-edit me-2"></i>Edit Profile
//                                           </button>
//                                         </li>
//                                         <li>
//                                           <button
//                                             className="dropdown-item"
//                                             onClick={() => handleOpenPasswordManagement(employee)}
//                                           >
//                                             <i className="fas fa-key me-2"></i>Password Management
//                                           </button>
//                                         </li>
//                                         <li><hr className="dropdown-divider" /></li>
//                                         <li>
//                                           <button
//                                             className="dropdown-item text-danger"
//                                             onClick={() => handleDeleteUser(employee.id || employee._id, employee.name)}
//                                           >
//                                             <i className="fas fa-trash me-2"></i>Delete User
//                                           </button>
//                                         </li>
//                                       </ul>
//                                     </div>
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Employee Management View */}
//                 {currentRole === 'admin' && activeView === 'employees' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">User Management</h5>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                         </button>



//                         <button
//                           className="btn btn-outline-secondary btn-sm me-2"
//                           onClick={() => {
//                             loadProjectManagers();
//                             loadUsers();
//                           }}
//                           title="Refresh all user data"
//                         >
//                           <i className="fas fa-sync-alt me-1"></i> Refresh
//                         </button>

//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={() => setShowAddUserModal(true)}
//                         >
//                           <i className="fas fa-plus me-1"></i> New User
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       <div className="d-flex justify-content-between align-items-center mb-3">
//                         <div className="d-flex align-items-center">
//                           <i className="fas fa-users me-2 text-primary"></i>
//                           <span className="fw-bold">Total Users: {allUsersWithRoles.length} persons</span>
//                           <div className="ms-3 d-flex gap-3">
//                             <span className="badge bg-primary">
//                               <i className="fas fa-user-tie me-1"></i>
//                               PM: {allUsersWithRoles.filter(u => u.userType === 'Project Manager').length}
//                             </span>
//                             <span className="badge bg-success">
//                               <i className="fas fa-users-cog me-1"></i>
//                               TL: {allUsersWithRoles.filter(u => u.userType === 'Team Leader').length}
//                             </span>
//                             <span className="badge bg-info">
//                               <i className="fas fa-user me-1"></i>
//                               EMP: {allUsersWithRoles.filter(u => u.userType === 'Employee' || u.userType === 'Intern').length}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="d-flex gap-2">
//                           <div className="input-group" style={{ width: '300px' }}>
//                             <span className="input-group-text"><i className="fas fa-search"></i></span>
//                             <input
//                               type="text"
//                               className="form-control"
//                               placeholder="Search by name, email, or payroll"
//                               value={userSearchTerm}
//                               onChange={(e) => setUserSearchTerm(e.target.value)}
//                             />
//                           </div>

//                           {/* Filter Dropdown */}
//                           <div className="dropdown position-relative">
//                             <button
//                               className="btn btn-outline-secondary dropdown-toggle"
//                               type="button"
//                               onClick={() => setShowFilterDropdown(!showFilterDropdown)}
//                             >
//                               <i className="fas fa-filter me-1"></i> Filter
//                             </button>
//                             {showFilterDropdown && (
//                               <div
//                                 className="dropdown-menu show position-absolute"
//                                 style={{
//                                   minWidth: '280px',
//                                   top: '100%',
//                                   left: '0',
//                                   zIndex: 1050,
//                                   backgroundColor: 'white',
//                                   border: '1px solid #dee2e6',
//                                   borderRadius: '0.375rem',
//                                   boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
//                                 }}
//                               >
//                                 <div className="px-3 py-2">
//                                   <h6 className="dropdown-header">Filter Options</h6>

//                                   {/* Role Filter */}
//                                   <div className="mb-3">
//                                     <label className="form-label small fw-bold">By User Role</label>
//                                     <select
//                                       className="form-select form-select-sm"
//                                       value={filterByRole}
//                                       onChange={(e) => setFilterByRole(e.target.value)}
//                                     >
//                                       <option value="all">All Roles</option>
//                                       {getUniqueRoles().map(role => (
//                                         <option key={role} value={role}>{role}</option>
//                                       ))}
//                                     </select>
//                                   </div>

//                                   {/* Department Filter */}
//                                   <div className="mb-3">
//                                     <label className="form-label small fw-bold">By Department</label>
//                                     <select
//                                       className="form-select form-select-sm"
//                                       value={filterByDepartment}
//                                       onChange={(e) => setFilterByDepartment(e.target.value)}
//                                     >
//                                       <option value="all">All Departments</option>
//                                       {getUniqueDepartments().map(dept => (
//                                         <option key={dept} value={dept}>{dept}</option>
//                                       ))}
//                                     </select>
//                                   </div>

//                                   {/* Status Filter */}
//                                   <div className="mb-3">
//                                     <label className="form-label small fw-bold">By Status</label>
//                                     <select
//                                       className="form-select form-select-sm"
//                                       value={filterByStatus}
//                                       onChange={(e) => setFilterByStatus(e.target.value)}
//                                     >
//                                       <option value="all">All Status</option>
//                                       <option value="Active">Active</option>
//                                       <option value="Inactive">Inactive</option>
//                                       <option value="On Leave">On Leave</option>
//                                       <option value="Suspended">Suspended</option>
//                                     </select>
//                                   </div>

//                                   {/* Team Assignment Filter */}
//                                   <div className="mb-3">
//                                     <label className="form-label small fw-bold">By Team Assignment</label>
//                                     <select
//                                       className="form-select form-select-sm"
//                                       value={filterByTeam}
//                                       onChange={(e) => setFilterByTeam(e.target.value)}
//                                     >
//                                       <option value="all">All Employees</option>
//                                       <option value="team-assigned">Assigned to Team</option>
//                                       <option value="team-unassigned">Available (No Team)</option>
//                                       <optgroup label="Specific Team Leaders">
//                                         {teamLeaders.map(tl => (
//                                           <option key={`team-${tl.id}`} value={`team-${tl.id}`}>{tl.name}'s Team</option>
//                                         ))}
//                                       </optgroup>
//                                     </select>
//                                   </div>

//                                   {/* Project Assignment Filter */}
//                                   <div className="mb-3">
//                                     <label className="form-label small fw-bold">By Project Assignment</label>
//                                     <select
//                                       className="form-select form-select-sm"
//                                       value={filterByProject}
//                                       onChange={(e) => setFilterByProject(e.target.value)}
//                                     >
//                                       <option value="all">All Employees</option>
//                                       <option value="assigned">Has Project Assignment</option>
//                                       <option value="unassigned">No Project Assignment</option>
//                                       <optgroup label="Specific Projects">
//                                         {getUniqueProjects().map(project => (
//                                           <option key={project} value={project}>{project}</option>
//                                         ))}
//                                       </optgroup>
//                                     </select>
//                                   </div>

//                                   {/* Filter Actions */}
//                                   <div className="d-flex gap-2 mt-3 pt-2 border-top">
//                                     <button
//                                       className="btn btn-sm btn-outline-danger flex-fill"
//                                       onClick={() => {
//                                         setFilterByRole('all');
//                                         setFilterByDepartment('all');
//                                         setFilterByStatus('all');
//                                         setFilterByProject('all');
//                                         setFilterByTeam('all');
//                                         setUserSearchTerm('');
//                                       }}
//                                     >
//                                       <i className="fas fa-times me-1"></i>Clear All
//                                     </button>
//                                     <button
//                                       className="btn btn-sm btn-primary flex-fill"
//                                       onClick={() => setShowFilterDropdown(false)}
//                                     >
//                                       <i className="fas fa-check me-1"></i>Apply
//                                     </button>
//                                   </div>

//                                   {/* Active Filters Display */}
//                                   {(filterByRole !== 'all' || filterByDepartment !== 'all' || filterByStatus !== 'all' || filterByProject !== 'all' || filterByTeam !== 'all' || userSearchTerm) && (
//                                     <div className="mt-3 pt-2 border-top">
//                                       <small className="text-muted fw-bold">Active Filters:</small>
//                                       <div className="mt-1">
//                                         {filterByRole !== 'all' && (
//                                           <span className="badge bg-primary me-1 mb-1">Role: {filterByRole}</span>
//                                         )}
//                                         {filterByDepartment !== 'all' && (
//                                           <span className="badge bg-success me-1 mb-1">Dept: {filterByDepartment}</span>
//                                         )}
//                                         {filterByStatus !== 'all' && (
//                                           <span className="badge bg-warning me-1 mb-1">Status: {filterByStatus}</span>
//                                         )}
//                                         {filterByProject !== 'all' && (
//                                           <span className="badge bg-info me-1 mb-1">
//                                             Project: {filterByProject === 'assigned' ? 'Has Assignment' :
//                                               filterByProject === 'unassigned' ? 'No Assignment' : filterByProject}
//                                           </span>
//                                         )}
//                                         {filterByTeam !== 'all' && (
//                                           <span className="badge bg-success me-1 mb-1">
//                                             Team: {filterByTeam === 'team-assigned' ? 'Has Team' :
//                                               filterByTeam === 'team-unassigned' ? 'Available' :
//                                                 teamLeaders.find(tl => tl.id === filterByTeam.replace('team-', ''))?.name || 'Specific Team'}
//                                           </span>
//                                         )}
//                                         {userSearchTerm && (
//                                           <span className="badge bg-secondary me-1 mb-1">Search: "{userSearchTerm}"</span>
//                                         )}
//                                       </div>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             )}
//                           </div>

//                           {/* Sort Dropdown */}
//                           <div className="dropdown">
//                             <button
//                               className="btn btn-outline-secondary"
//                               onClick={() => {
//                                 const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
//                                 setSortOrder(newOrder);
//                               }}
//                               title={`Currently sorting by ${sortBy} (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'}). Click to toggle.`}
//                             >
//                               <i className={`fas ${sortOrder === 'asc' ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up'} me-1`}></i>
//                               Sort {sortBy === 'name' ? 'Name' : sortBy === 'department' ? 'Dept' : 'Type'}
//                             </button>
//                           </div>

//                           {/* Export Button */}
//                           <button
//                             className="btn btn-outline-primary"
//                             onClick={exportUsers}
//                             title="Export user data to CSV"
//                           >
//                             <i className="fas fa-download me-1"></i> Export
//                           </button>
//                         </div>
//                       </div>

//                       {/* User Management Table/Cards */}
//                       <div className="table-responsive">
//                         <table className="table table-hover">
//                           <thead className="table-light">
//                             <tr>
//                               <th>Name</th>
//                               <th>Phone Number</th>
//                               <th>Role</th>
//                               <th>Department</th>
//                               <th>Project Name</th>
//                               <th>Joined Date</th>
//                               <th>Work Status</th>
//                               <th>Actions</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {filteredAndSortedUsers.map((user, index) => (
//                               <tr key={index}>
//                                 <td>
//                                   <div className="d-flex align-items-center">
//                                     <div
//                                       className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
//                                       style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}
//                                     >
//                                       {user.name.charAt(0)}
//                                     </div>
//                                     <div>
//                                       <div className="fw-semibold">{user.name}</div>
//                                       <small className="text-muted">{user.email}</small>
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <span className="text-muted">{user.phone || 'Not provided'}</span>
//                                 </td>
//                                 <td>
//                                   <div>
//                                     <div className="fw-medium">
//                                       <span className={`badge ${getRoleBadgeClass(user.userType || user.role)}`}>
//                                         {user.userType || (user.role === 'intern' ? 'Intern' : user.role === 'employee' ? 'Employee' : 'Employee')}
//                                       </span>
//                                     </div>
//                                     <small className="text-muted">
//                                       {user.userType === 'Project Manager' || user.userType === 'Team Leader' ?
//                                         'Management Role' :
//                                         (user.teamLeaderId ?
//                                           `Team: ${user.teamLeaderName || teamLeaders.find(tl => tl.id === user.teamLeaderId)?.name || 'Assigned'}` :
//                                           'Available'
//                                         )
//                                       }
//                                     </small>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <div>
//                                     <div className="fw-medium">{user.department}</div>

//                                   </div>
//                                 </td>
//                                 <td>
//                                   {user.assignedProject ? (
//                                     <div>
//                                       <div className="fw-medium text-primary">{user.assignedProject}</div>
//                                     </div>
//                                   ) : (
//                                     <div>
//                                       <span className="badge bg-danger">Not Assigned</span>
//                                     </div>
//                                   )}
//                                 </td>
//                                 <td>
//                                   <div>
//                                     <div className="fw-medium">
//                                       {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', {
//                                         year: 'numeric',
//                                         month: 'short',
//                                         day: 'numeric'
//                                       }) : 'Not provided'}
//                                     </div>
//                                     <small className="text-muted">
//                                       {user.joinDate ? `${Math.floor((new Date() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24 * 365))} years` : 'Unknown tenure'}
//                                     </small>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   {(() => {
//                                     const workStatus = getUserWorkStatus(user);
//                                     return (
//                                       <span className={`badge ${workStatus.color}`}>
//                                         {workStatus.status}
//                                       </span>
//                                     );
//                                   })()}
//                                 </td>
//                                 <td>
//                                   <div className="dropdown">
//                                     <button
//                                       className="btn btn-sm btn-outline-secondary dropdown-toggle"
//                                       data-bs-toggle="dropdown"
//                                       title="User Management Settings"
//                                     >
//                                       <i className="fas fa-cog"></i>
//                                     </button>
//                                     <ul className="dropdown-menu">
//                                       <li>
//                                         <button
//                                           className="dropdown-item"
//                                           onClick={() => alert(`User Details:\n\nID: ${user.id || user._id || `USER${String(index + 1).padStart(3, '0')}`}\nName: ${user.name}\nRole: ${user.userType || user.role}\nDepartment: ${user.department}\nEmail: ${user.email}\nTeam Leader: ${user.teamLeaderId ? (user.teamLeaderName || teamLeaders.find(tl => tl.id === user.teamLeaderId)?.name || 'Assigned') : 'Not assigned'}\nProject: ${user.assignedProject || 'No project assigned'}\nStatus: ${user.userType || user.role || 'Employee'}\nJoin Date: ${user.joinDate}`)}
//                                         >
//                                           <i className="fas fa-eye me-2"></i>View Details
//                                         </button>
//                                       </li>
//                                       <li>
//                                         <button
//                                           className="dropdown-item"
//                                           onClick={() => handleEditUser(user)}
//                                         >
//                                           <i className="fas fa-edit me-2"></i>Edit Profile
//                                         </button>
//                                       </li>
//                                       <li>
//                                         <button
//                                           className="dropdown-item"
//                                           onClick={() => handleOpenPasswordManagement(user)}
//                                         >
//                                           <i className="fas fa-key me-2"></i>Password Management
//                                         </button>
//                                       </li>
//                                       <li><hr className="dropdown-divider" /></li>
//                                       <li>
//                                         <button
//                                           className="dropdown-item text-success"
//                                           onClick={() => {
//                                             updateUserStatusToActive(user.email, user.name);
//                                             alert(`${user.name} status updated to Active`);
//                                           }}
//                                         >
//                                           <i className="fas fa-play me-2"></i>Set Active
//                                         </button>
//                                       </li>
//                                       <li>
//                                         <button
//                                           className="dropdown-item text-warning"
//                                           onClick={() => {
//                                             setUserOnLeave(user.email, user.name);
//                                             alert(`${user.name} status updated to On Leave`);
//                                           }}
//                                         >
//                                           <i className="fas fa-pause me-2"></i>Set On Leave
//                                         </button>
//                                       </li>
//                                       <li>
//                                         <button
//                                           className="dropdown-item text-secondary"
//                                           onClick={() => {
//                                             updateUserStatusToInactive(user.email, user.name);
//                                             alert(`${user.name} status updated to Inactive`);
//                                           }}
//                                         >
//                                           <i className="fas fa-stop me-2"></i>Set Inactive
//                                         </button>
//                                       </li>
//                                       <li><hr className="dropdown-divider" /></li>
//                                       <li>
//                                         <button
//                                           className="dropdown-item text-danger"
//                                           onClick={() => handleDeleteUser(user.id || user._id || `USER${String(index + 1).padStart(3, '0')}`, user.name)}
//                                         >
//                                           <i className="fas fa-trash me-2"></i>Delete User
//                                         </button>
//                                       </li>
//                                     </ul>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* REMOVED CARD VIEW - KEEPING ONLY LIST VIEW */}
//                 {/* {false && filteredAndSortedUsers.map((user, index) => (
//                             <div key={index} className="col-md-6 col-lg-4 mb-4">
//                               <div className="card h-100 border-2 shadow-sm">
//                                 <div className="card-body">
//                                   <div className="d-flex align-items-center mb-3">
//                                     <div 
//                                       className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
//                                       style={{width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold'}}
//                                     >
//                                       {user.name.charAt(0)}
//                                     </div>
//                                     <div className="flex-grow-1">
//                                       <h6 className="card-title mb-1">{user.name}</h6>
//                                       <small className="text-muted">{user.email}</small>
//                                     </div>
//                                     <div className="dropdown">
//                                       <button 
//                                         className="btn btn-sm btn-outline-secondary" 
//                                         data-bs-toggle="dropdown"
//                                         title="User Management Settings"
//                                       >
//                                         <i className="fas fa-cog"></i>
//                                       </button>
//                                       <ul className="dropdown-menu">
//                                         <li>
//                                           <button 
//                                             className="dropdown-item"
//                                             onClick={() => alert(`User Details:\n\nName: ${user.name}\nPhone: ${user.phone || 'Not provided'}\nDepartment: ${user.department}\nRole: ${user.role}\nEmail: ${user.email}\nProject: ${user.assignedProject || 'No project assigned'}\nStatus: ${user.assignedProject ? 'Assigned' : 'Not Assigned'}\nJoin Date: ${user.joinDate}`)}
//                                           >
//                                             <i className="fas fa-eye me-2"></i>View Details
//                                           </button>
//                                         </li>
//                                         <li>
//                                           <button 
//                                             className="dropdown-item"
//                                             onClick={() => handleEditUser(user)}
//                                           >
//                                             <i className="fas fa-edit me-2"></i>Edit Profile
//                                           </button>
//                                         </li>
//                                         <li>
//                                           <button 
//                                             className="dropdown-item"
//                                             onClick={() => handleOpenPasswordManagement(user)}
//                                           >
//                                             <i className="fas fa-key me-2"></i>Password Management
//                                           </button>
//                                         </li>
//                                         <li><hr className="dropdown-divider" /></li>
//                                         <li>
//                                           <button 
//                                             className="dropdown-item text-danger"
//                                             onClick={() => handleDeleteUser(user.id || user._id || `EMP${String(index + 1).padStart(3, '0')}`, user.name)}
//                                           >
//                                             <i className="fas fa-trash me-2"></i>Delete User
//                                           </button>
//                                         </li>
//                                       </ul>
//                                     </div>
//                                   </div>
                                  
//                                   <div className="mb-2">
//                                     <span className="ms-2">{user.phone || 'Not provided'}</span>
//                                   </div>
                                  
//                                   <div className="mb-2">
//                                     <small className="text-muted">Role:</small>
//                                     <span className="ms-2 badge bg-primary text-white">
//                                       {user.userType || (user.role === 'intern' ? 'Intern' : user.role === 'employee' ? 'Employee' : 'Employee')}
//                                     </span>
//                                   </div>
                                  
//                                   <div className="mb-2">
//                                     <small className="text-muted">Department:</small>
//                                     <span className="ms-2 badge bg-light text-dark">{user.department}</span>
//                                   </div>
                                  
//                                   <div className="mb-2">
//                                     <small className="text-muted">Team Assignment:</small>
//                                     <div className="ms-2">
//                                       {user.teamLeaderId ? (
//                                         <div className="d-flex align-items-center">
//                                           <span className="text-success me-2">
//                                             {user.teamLeaderName || teamLeaders.find(tl => tl.id === user.teamLeaderId)?.name || 'Assigned'}
//                                           </span>
//                                           <button 
//                                             className="btn btn-sm btn-outline-danger"
//                                             onClick={() => removeEmployeeFromTeam(user.id || user._id)}
//                                             title="Remove from team"
//                                           >
//                                             <i className="fas fa-times"></i>
//                                           </button>
//                                         </div>
//                                       ) : (
//                                         <select 
//                                           className="form-select form-select-sm"
//                                           onChange={(e) => {
//                                             if (e.target.value) {
//                                               assignEmployeeToTeamLeader(user.id || user._id, e.target.value);
//                                             }
//                                           }}
//                                           defaultValue=""
//                                         >
//                                           <option value="">Assign to Team Leader</option>
//                                           {teamLeaders.map(tl => (
//                                             <option key={tl.id} value={tl.id}>
//                                               {tl.name} ({tl.department})
//                                             </option>
//                                           ))}
//                                         </select>
//                                       )}
//                                     </div>
//                                   </div>

//                                   <div className="mb-2">
//                                     <small className="text-muted">Project:</small>
//                                     <span className="ms-2">
//                                       {user.assignedProject ? (
//                                         <span className="text-primary">{user.assignedProject}</span>
//                                       ) : (
//                                         <span className="badge bg-danger">Not Assigned</span>
//                                       )}
//                                     </span>
//                                   </div>
                                  
//                                   <div className="mb-3">
//                                     <small className="text-muted">Status:</small>
//                                     <span className={`ms-2 badge ${getRoleBadgeClass(user.userType || user.role)}`}>
//                                       {user.userType === 'Project Manager' ? 'Manager' :
//                                        user.userType === 'Team Leader' ? 'Leader' :
//                                        user.teamLeaderId ? 'Assigned to Team' : 'Available'}
//                                     </span>
//                                   </div>
//                                 </div>

//                               </div>
//                             </div>
//                           ))}
//                             </tbody>
//                           </table>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Project Manager View */}
//                 {currentRole === 'admin' && activeView === 'project-managers' && !showIndividualDashboard && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">Project Manager Management</h5>
//                         <small className="text-muted">Manage project managers and their assignments</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                         </button>
//                         <button
//                           className="btn btn-outline-secondary btn-sm"
//                           type="button"
//                           title="Password Management"
//                           onClick={() => setShowPasswordManagementModal(true)}
//                         >
//                           <i className="fas fa-cog"></i>
//                         </button>
//                         <button className="btn btn-outline-secondary btn-sm">
//                           <i className="fas fa-list me-1"></i> List View
//                         </button>
//                         <button className="btn btn-outline-secondary btn-sm">
//                           <i className="fas fa-th me-1"></i> Card View
//                         </button>
//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={() => {
//                             setEditingProjectManager(null);
//                             setShowAddProjectManagerModal(true);
//                           }}
//                         >
//                           <i className="fas fa-plus me-1"></i> Add Project Manager
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       <div className="d-flex justify-content-between align-items-center mb-3">
//                         <div className="d-flex align-items-center">
//                           <i className="fas fa-user-tie me-2 text-primary"></i>
//                           <span className="fw-bold">Total Project Managers: {getTotalProjectManagerCount()} persons</span>
//                         </div>
//                         <div className="d-flex gap-2">
//                           <div className="input-group" style={{ width: '300px' }}>
//                             <span className="input-group-text"><i className="fas fa-search"></i></span>
//                             <input
//                               type="text"
//                               className="form-control"
//                               placeholder="Search by name or department"
//                               value={pmSearchTerm}
//                               onChange={(e) => setPmSearchTerm(e.target.value)}
//                             />
//                           </div>
//                           <button className="btn btn-outline-secondary">
//                             <i className="fas fa-filter me-1"></i> Filter
//                           </button>
//                           <button className="btn btn-outline-secondary">
//                             <i className="fas fa-sort me-1"></i> Sort
//                           </button>
//                         </div>
//                       </div>

//                       {/* Project Manager Cards */}
//                       {(() => {
//                         // Combine project managers from both projectManagers array and allUsers with project-manager role
//                         const allProjectManagers = [
//                           ...projectManagers,
//                           ...allUsers.filter(user =>
//                             user.role === 'project-manager' &&
//                             !projectManagers.some(pm => (pm.id || pm._id) === (user.id || user._id))
//                           )
//                         ];

//                         if (allProjectManagers.length === 0) {
//                           return (
//                             <div className="text-center py-5">
//                               <i className="fas fa-user-tie fa-3x text-muted mb-3"></i>
//                               <h5 className="text-muted">No Project Managers Added</h5>
//                               <p className="text-muted">Click "Add Project Manager" to get started</p>
//                               <button
//                                 className="btn btn-primary"
//                                 onClick={() => {
//                                   setEditingProjectManager(null);
//                                   setShowAddProjectManagerModal(true);
//                                 }}
//                               >
//                                 <i className="fas fa-plus me-1"></i> Add First Project Manager
//                               </button>
//                             </div>
//                           );
//                         }

//                         return (
//                           <div className="row">
//                             {allProjectManagers.map((manager, index) => (
//                               <div key={manager.id} className="col-md-6 col-lg-4 mb-4">
//                                 <div className="card h-100 border-2">
//                                   <div className="card-body">
//                                     <div className="d-flex align-items-center mb-3">
//                                       <div
//                                         className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
//                                         style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}
//                                       >
//                                         {manager.name.charAt(0)}
//                                       </div>
//                                       <div className="flex-grow-1">
//                                         <h6 className="card-title mb-1">{manager.name}</h6>
//                                         <small className="text-muted">{manager.email}</small>
//                                       </div>
//                                       <div className="dropdown">
//                                         <button
//                                           className="btn btn-sm btn-outline-secondary"
//                                           data-bs-toggle="dropdown"
//                                           title="User Management Settings"
//                                         >
//                                           <i className="fas fa-cog"></i>
//                                         </button>
//                                         <ul className="dropdown-menu">
//                                           <li>
//                                             <button
//                                               className="dropdown-item"
//                                               onClick={() => handleEditProjectManager(manager)}
//                                             >
//                                               <i className="fas fa-edit me-2"></i>Edit Profile
//                                             </button>
//                                           </li>
//                                           <li>
//                                             <button
//                                               className="dropdown-item"
//                                               onClick={() => handleOpenPasswordManagement(manager)}
//                                             >
//                                               <i className="fas fa-key me-2"></i>Password Management
//                                             </button>
//                                           </li>
//                                           <li><hr className="dropdown-divider" /></li>
//                                           <li>
//                                             <button
//                                               className="dropdown-item text-danger"
//                                               onClick={() => handleDeleteProjectManager(manager.id, manager.name)}
//                                             >
//                                               <i className="fas fa-trash me-2"></i>Delete User
//                                             </button>
//                                           </li>
//                                         </ul>
//                                       </div>
//                                     </div>

//                                     <div className="row text-center mb-3">
//                                       <div className="col-4">
//                                         <div className="fw-bold text-primary">{manager.projectsAssigned || 0}</div>
//                                         <small className="text-muted">Projects</small>
//                                       </div>
//                                       <div className="col-4">
//                                         <div className="fw-bold text-success">{manager.teamSize || 0}</div>
//                                         <small className="text-muted">Team Size</small>
//                                       </div>
//                                       <div className="col-4">
//                                         <div className="fw-bold text-info">{manager.experience}</div>
//                                         <small className="text-muted">Experience</small>
//                                       </div>
//                                     </div>

//                                     <div className="mb-2">
//                                       <small className="text-muted">Department:</small>
//                                       <span className="ms-2 badge bg-light text-dark">{manager.department}</span>
//                                     </div>

//                                     {manager.specialization && (
//                                       <div className="mb-2">
//                                         <small className="text-muted">Specialization:</small>
//                                         <span className="ms-2">{manager.specialization}</span>
//                                       </div>
//                                     )}

//                                     <div className="mb-2">
//                                       <small className="text-muted">Status:</small>
//                                       <span className={`ms-2 badge ${manager.status === 'Active' ? 'bg-success' :
//                                         manager.status === 'Inactive' ? 'bg-danger' : 'bg-warning'}`}>
//                                         {manager.status}
//                                       </span>
//                                     </div>

//                                     <div className="mb-2">
//                                       <small className="text-muted">Joined:</small>
//                                       <span className="ms-2">{new Date(manager.joiningDate).toLocaleDateString()}</span>
//                                     </div>

//                                     {manager.phone && (
//                                       <div className="mb-2">

//                                         <span className="ms-2">{manager.phone}</span>
//                                       </div>
//                                     )}
//                                   </div>
//                                   <div className="card-footer bg-light">
//                                     <div className="d-flex gap-2">
//                                       <button
//                                         className="btn btn-sm btn-outline-primary flex-fill"
//                                         onClick={() => handleEditProjectManager(manager)}
//                                       >
//                                         <i className="fas fa-edit me-1"></i>Edit
//                                       </button>
//                                       <button
//                                         className="btn btn-sm btn-outline-info flex-fill"
//                                         onClick={() => handleViewProjectManager(manager)}
//                                       >
//                                         <i className="fas fa-eye me-1"></i>View
//                                       </button>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         );
//                       })()}

//                       <div className="text-center mt-3">
//                         <small className="text-muted">
//                           Showing {getTotalProjectManagerCount()} project managers •
//                           Active: {[...projectManagers, ...allUsers.filter(u => u.role === 'project-manager' && !projectManagers.some(pm => (pm.id || pm._id) === (u.id || u._id)))].filter(pm => pm.status === 'Active').length} •
//                           Total Projects Managed: {[...projectManagers, ...allUsers.filter(u => u.role === 'project-manager' && !projectManagers.some(pm => (pm.id || pm._id) === (u.id || u._id)))].reduce((sum, pm) => sum + (pm.projectsAssigned || 0), 0)}
//                         </small>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Individual Project Manager Dashboard */}
//                 {currentRole === 'admin' && activeView === 'project-managers' && showIndividualDashboard && selectedProjectManager && (
//                   <div>
//                     {/* Header with Back Button */}
//                     <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', color: 'white' }}>
//                       <div className="card-body py-4">
//                         <div className="row align-items-center">
//                           <div className="col-md-8">
//                             <div className="d-flex align-items-center">
//                               <button
//                                 className="btn btn-light btn-sm me-2"
//                                 onClick={handleBackToProjectManagers}
//                               >
//                                 <i className="fas fa-arrow-left me-1"></i> Back
//                               </button>
//                               <button
//                                 className="btn btn-outline-light btn-sm me-3"
//                                 type="button"
//                                 title="Password Management"
//                                 onClick={() => setShowPasswordManagementModal(true)}
//                               >
//                                 <i className="fas fa-cog"></i>
//                               </button>
//                               <div>
//                                 <h3 className="mb-1">{selectedProjectManager.name} - Dashboard</h3>
//                                 <p className="mb-0 opacity-75">Project Manager Individual Dashboard</p>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="col-md-4 text-md-end mt-3 mt-md-0">
//                             <div className="d-flex align-items-center justify-content-md-end">
//                               <div
//                                 className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3"
//                                 style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}
//                               >
//                                 {selectedProjectManager.name.charAt(0)}
//                               </div>
//                               <div className="text-start text-md-end">
//                                 <div className="fw-bold">{selectedProjectManager.email}</div>
//                                 <small className="opacity-75">{selectedProjectManager.department}</small>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Dashboard Stats Cards */}
//                     <div className="row mb-4">
//                       <div className="col-md-3 mb-3">
//                         <div
//                           className={`card h-100 border-0 shadow-sm ${activeDetailView === 'projects' ? 'border-primary' : ''}`}
//                           onClick={() => handleDetailViewClick('projects')}
//                           style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
//                           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
//                           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//                         >
//                           <div className="card-body text-center">
//                             <div className="mb-2">
//                               <i className="fas fa-project-diagram fa-2x text-primary"></i>
//                             </div>
//                             <h4 className="mb-1 text-primary">{selectedProjectManager.projectsAssigned || 0}</h4>
//                             <p className="text-muted mb-0">Assigned Projects</p>
//                             <small className="text-primary"><i className="fas fa-mouse-pointer me-1"></i>Click to view details</small>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-md-3 mb-3">
//                         <div
//                           className={`card h-100 border-0 shadow-sm ${activeDetailView === 'members' ? 'border-success' : ''}`}
//                           onClick={() => handleDetailViewClick('members')}
//                           style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
//                           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
//                           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//                         >
//                           <div className="card-body text-center">
//                             <div className="mb-2">
//                               <i className="fas fa-users fa-2x text-success"></i>
//                             </div>
//                             <h4 className="mb-1 text-success">{selectedProjectManager.teamSize || 0}</h4>
//                             <p className="text-muted mb-0">Total Project Members</p>
//                             <small className="text-success"><i className="fas fa-mouse-pointer me-1"></i>Click to view details</small>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-md-3 mb-3">
//                         <div
//                           className={`card h-100 border-0 shadow-sm ${activeDetailView === 'tasks' ? 'border-warning' : ''}`}
//                           onClick={() => handleDetailViewClick('tasks')}
//                           style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
//                           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
//                           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
//                         >
//                           <div className="card-body text-center">
//                             <div className="mb-2">
//                               <i className="fas fa-tasks fa-2x text-warning"></i>
//                             </div>
//                             <h4 className="mb-1 text-warning">{assignedTasks.filter(task => task.assignedTo === selectedProjectManager.name).length}</h4>

//                             <small className="text-warning"><i className="fas fa-mouse-pointer me-1"></i>Click to view details</small>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-md-3 mb-3">
//                         <div className="card h-100 border-0 shadow-sm">
//                           <div className="card-body text-center">
//                             <div className="mb-2">
//                               <i className="fas fa-clock fa-2x text-info"></i>
//                             </div>
//                             <h4 className="mb-1 text-info">{selectedProjectManager.experience}</h4>
//                             <p className="text-muted mb-0">Experience</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Detailed Views */}
//                     {activeDetailView === 'projects' && (
//                       <div className="row mb-4">
//                         <div className="col-12">
//                           <div className="card border-primary">
//                             <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
//                               <h5 className="mb-0"><i className="fas fa-project-diagram me-2"></i>Assigned Projects Details</h5>
//                               <button
//                                 className="btn btn-light btn-sm"
//                                 onClick={() => setActiveDetailView(null)}
//                               >
//                                 <i className="fas fa-times"></i>
//                               </button>
//                             </div>
//                             <div className="card-body">
//                               <div className="table-responsive">
//                                 <table className="table table-hover">
//                                   <thead>
//                                     <tr>
//                                       <th>Project Name</th>
//                                       <th>Client</th>
//                                       <th>Status</th>
//                                       <th>Progress</th>
//                                       <th>Start Date</th>
//                                       <th>End Date</th>
//                                       <th>Budget</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {/* Real project data will be loaded from API */}
//                                     {projects.filter(project => project.projectManager === selectedProjectManager?.name).length > 0 ? (
//                                       projects.filter(project => project.projectManager === selectedProjectManager?.name).map((project, index) => (
//                                         <tr key={project.id || index}>
//                                           <td>
//                                             <div className="fw-semibold">{project.name}</div>
//                                             <small className="text-muted">{project.description || 'No description'}</small>
//                                           </td>
//                                           <td>{project.clientName || 'N/A'}</td>
//                                           <td>
//                                             <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
//                                               project.status === 'On Track' ? 'bg-primary' :
//                                                 project.status === 'At Risk' ? 'bg-warning' : 'bg-secondary'
//                                               }`}>
//                                               {project.status || 'Not Set'}
//                                             </span>
//                                           </td>
//                                           <td>
//                                             <div className="d-flex align-items-center">
//                                               <div className="progress me-2" style={{ width: '80px', height: '8px' }}>
//                                                 <div
//                                                   className="progress-bar"
//                                                   style={{ width: `${project.progress || 0}%` }}
//                                                 ></div>
//                                               </div>
//                                               <small>{project.progress || 0}%</small>
//                                             </div>
//                                           </td>
//                                           <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</td>
//                                           <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
//                                           <td className="text-success fw-bold">${project.projectCost || 0}</td>
//                                         </tr>
//                                       ))
//                                     ) : (
//                                       <tr>
//                                         <td colSpan="7" className="text-center py-4">
//                                           <i className="fas fa-project-diagram fa-2x text-muted mb-2"></i>
//                                           <p className="text-muted mb-0">No projects assigned to this manager</p>
//                                         </td>
//                                       </tr>
//                                     )}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {activeDetailView === 'members' && (
//                       <div className="row mb-4">
//                         <div className="col-12">
//                           <div className="card border-success">
//                             <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
//                               <h5 className="mb-0"><i className="fas fa-users me-2"></i>Project Members Details</h5>
//                               <button
//                                 className="btn btn-light btn-sm"
//                                 onClick={() => setActiveDetailView(null)}
//                               >
//                                 <i className="fas fa-times"></i>
//                               </button>
//                             </div>
//                             <div className="card-body">
//                               <div className="row">
//                                 {/* Real team members data */}
//                                 {allUsers.filter(user =>
//                                   projects.some(project =>
//                                     project.projectManager === selectedProjectManager?.name &&
//                                     project.assigned?.some(member => member.name === user.name)
//                                   )
//                                 ).length > 0 ? (
//                                   allUsers.filter(user =>
//                                     projects.some(project =>
//                                       project.projectManager === selectedProjectManager?.name &&
//                                       project.assigned?.some(member => member.name === user.name)
//                                     )
//                                   ).map((user, index) => (
//                                     <div key={user.id || index} className="col-md-6 col-lg-4 mb-3">
//                                       <div className="card border h-100">
//                                         <div className="card-body">
//                                           <div className="d-flex align-items-center mb-3">
//                                             <div
//                                               className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
//                                               style={{ width: '50px', height: '50px', fontSize: '18px' }}
//                                             >
//                                               {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
//                                             </div>
//                                             <div>
//                                               <h6 className="mb-1">{user.name}</h6>
//                                               <small className="text-muted">{user.email}</small>
//                                             </div>
//                                           </div>
//                                           <div className="mb-2">
//                                             <strong>Role:</strong> {user.userType || user.role || 'Employee'}
//                                           </div>
//                                           <div className="mb-2">
//                                             <strong>Department:</strong> {user.department || 'N/A'}
//                                           </div>
//                                           <div className="mb-2">
//                                             <strong>Status:</strong>
//                                             <span className={`ms-1 badge ${user.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
//                                               {user.status || 'Active'}
//                                             </span>
//                                           </div>
//                                           <div>
//                                             <strong>Project:</strong>
//                                             <div className="mt-1">
//                                               <span className="badge bg-light text-dark">
//                                                 {user.assignedProject || 'Multiple Projects'}
//                                               </span>
//                                             </div>
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   ))
//                                 ) : (
//                                   <div className="col-12">
//                                     <div className="text-center py-4">
//                                       <i className="fas fa-users fa-3x text-muted mb-3"></i>
//                                       <p className="text-muted">No team members assigned to this manager's projects</p>
//                                     </div>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {activeDetailView === 'tasks' && (
//                       <div className="row mb-4">
//                         <div className="col-12">
//                           <div className="card border-warning">
//                             <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
//                               <h5 className="mb-0"><i className="fas fa-tasks me-2"></i>Assigned Tasks Details</h5>
//                               <button
//                                 className="btn btn-dark btn-sm"
//                                 onClick={() => setActiveDetailView(null)}
//                               >
//                                 <i className="fas fa-times"></i>
//                               </button>
//                             </div>
//                             <div className="card-body">
//                               <div className="table-responsive">
//                                 <table className="table table-hover">
//                                   <thead>
//                                     <tr>
//                                       <th>Task Name</th>
//                                       <th>Project</th>
//                                       <th>Priority</th>
//                                       <th>Status</th>
//                                       <th>Assigned To</th>
//                                       <th>Due Date</th>
//                                       <th>Progress</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {/* Real task data will be loaded from API */}
//                                     {assignedTasks.filter(task =>
//                                       task.assignedBy === selectedProjectManager?.name ||
//                                       task.assignedBy === selectedProjectManager?.email
//                                     ).length > 0 ? (
//                                       assignedTasks.filter(task =>
//                                         task.assignedBy === selectedProjectManager?.name ||
//                                         task.assignedBy === selectedProjectManager?.email
//                                       ).map((task, index) => (
//                                         <tr key={task.id || index}>
//                                           <td>
//                                             <div className="fw-semibold">{task.title}</div>
//                                             <small className="text-muted">{task.description || 'No description'}</small>
//                                           </td>
//                                           <td>{task.project || 'N/A'}</td>
//                                           <td>
//                                             <span className={`badge ${task.priority === 'high' ? 'bg-danger' :
//                                               task.priority === 'medium' ? 'bg-warning' : 'bg-success'
//                                               }`}>
//                                               {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Low'}
//                                             </span>
//                                           </td>
//                                           <td>
//                                             <span className={`badge ${task.status === 'completed' ? 'bg-success' :
//                                               task.status === 'in-progress' ? 'bg-primary' :
//                                                 task.status === 'in-review' ? 'bg-warning' : 'bg-secondary'
//                                               }`}>
//                                               {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ') : 'Todo'}
//                                             </span>
//                                           </td>
//                                           <td>{task.assignedTo || 'Unassigned'}</td>
//                                           <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
//                                           <td>
//                                             <div className="d-flex align-items-center">
//                                               <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
//                                                 <div
//                                                   className="progress-bar"
//                                                   style={{ width: `${task.progress || 0}%` }}
//                                                 ></div>
//                                               </div>
//                                               <small>{task.progress || 0}%</small>
//                                             </div>
//                                           </td>
//                                         </tr>
//                                       ))
//                                     ) : (
//                                       <tr>
//                                         <td colSpan="7" className="text-center py-4">
//                                           <i className="fas fa-tasks fa-2x text-muted mb-2"></i>
//                                           <p className="text-muted mb-0">No tasks assigned by this manager</p>
//                                         </td>
//                                       </tr>
//                                     )}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                   </div>
//                 )}

//                 {/* Team Leader Management View */}
//                 {(currentRole === 'admin' || currentRole === 'project-manager') && activeView === 'team-leaders' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">Team Leader Management</h5>
//                         <small className="text-muted">Manage team leaders and their assignments</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                         </button>
//                         <button
//                           className={`btn btn-sm ${teamLeaderViewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                           onClick={() => setTeamLeaderViewMode('list')}
//                         >
//                           <i className="fas fa-list me-1"></i> List View
//                         </button>
//                         <button
//                           className={`btn btn-sm ${teamLeaderViewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                           onClick={() => setTeamLeaderViewMode('card')}
//                         >
//                           <i className="fas fa-th me-1"></i> Card View
//                         </button>
//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={() => {
//                             setEditingTeamLeader(null);
//                             setShowAddTeamLeaderModal(true);
//                           }}
//                         >
//                           <i className="fas fa-plus me-1"></i> Add Team Leader
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       <div className="d-flex justify-content-between align-items-center mb-3">
//                         <div className="d-flex align-items-center">
//                           <i className="fas fa-users-cog me-2 text-primary"></i>
//                           <span className="fw-bold">Total Team Leaders: {getTotalTeamLeaderCount()} persons</span>
//                         </div>
//                         <div className="d-flex gap-2">
//                           <div className="input-group" style={{ width: '300px' }}>
//                             <span className="input-group-text"><i className="fas fa-search"></i></span>
//                             <input
//                               type="text"
//                               className="form-control"
//                               placeholder="Search by name or department"
//                               value={teamLeaderSearchTerm}
//                               onChange={(e) => setTeamLeaderSearchTerm(e.target.value)}
//                             />
//                           </div>
//                           <button
//                             className="btn btn-success"
//                             onClick={() => setShowAddMemberModal(true)}
//                           >
//                             <i className="fas fa-user-plus me-1"></i> Add Member
//                           </button>
//                         </div>
//                       </div>

//                       {/* Team Leader Cards */}
//                       {(() => {
//                         const filteredLeaders = getFilteredTeamLeaders();

//                         if (getTotalTeamLeaderCount() === 0) {
//                           return (
//                             <div className="text-center py-5">
//                               <i className="fas fa-users-cog fa-3x text-muted mb-3"></i>
//                               <h5 className="text-muted">No Team Leaders Added</h5>
//                               <p className="text-muted">Click "Add Team Leader" to get started</p>
//                               <button
//                                 className="btn btn-primary"
//                                 onClick={() => {
//                                   setEditingTeamLeader(null);
//                                   setShowAddTeamLeaderModal(true);
//                                 }}
//                               >
//                                 <i className="fas fa-plus me-1"></i> Add First Team Leader
//                               </button>
//                             </div>
//                           );
//                         }

//                         if (filteredLeaders.length === 0) {
//                           return (
//                             <div className="text-center py-5">
//                               <i className="fas fa-search fa-3x text-muted mb-3"></i>
//                               <h5 className="text-muted">No Team Leaders Found</h5>
//                               <p className="text-muted">Try adjusting your search criteria</p>
//                             </div>
//                           );
//                         }

//                         if (teamLeaderViewMode === 'list') {
//                           return (
//                             <div className="table-responsive">
//                               <table className="table table-hover">
//                                 <thead>
//                                   <tr>
//                                     <th>Team Leader</th>
//                                     <th>Department</th>
//                                     <th>Projects</th>
//                                     <th>Team Size</th>
//                                     <th>Status</th>
//                                     <th>Actions</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {filteredLeaders.map((leader, index) => (
//                                     <tr key={leader.id}>
//                                       <td>
//                                         <div className="d-flex align-items-center">
//                                           <div
//                                             className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
//                                             style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}
//                                           >
//                                             {leader.name.charAt(0)}
//                                           </div>
//                                           <div>
//                                             <div className="fw-bold">{leader.name}</div>
//                                             <small className="text-muted">{leader.email}</small>
//                                           </div>
//                                         </div>
//                                       </td>
//                                       <td>
//                                         <span className="badge bg-light text-dark">{leader.department}</span>
//                                       </td>
//                                       <td>
//                                         <span className="fw-bold text-primary">{getTeamLeaderData(leader.id || leader._id)?.projectsManaged || 0}</span>
//                                       </td>
//                                       <td>
//                                         <span className="fw-bold text-success">{getTeamLeaderData(leader.id || leader._id)?.teamSize || 0}</span>
//                                       </td>
//                                       <td>
//                                         <span className={`badge ${leader.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
//                                           {leader.status}
//                                         </span>
//                                       </td>
//                                       <td>
//                                         <div className="dropdown">
//                                           <button
//                                             className="btn btn-sm btn-outline-secondary dropdown-toggle"
//                                             data-bs-toggle="dropdown"
//                                             title="Team Leader Management Settings"
//                                           >
//                                             <i className="fas fa-cog"></i>
//                                           </button>
//                                           <ul className="dropdown-menu">
//                                             <li>
//                                               <button
//                                                 className="dropdown-item"
//                                                 onClick={() => alert(`Team Leader Details:\n\nName: ${leader.name}\nEmail: ${leader.email}\nDepartment: ${leader.department}\nTeam Size: ${leader.teamSize}\nProjects: ${leader.projectsManaged}\nPhone: ${leader.phone || 'Not provided'}\nSpecialization: ${leader.specialization || 'Not specified'}`)}
//                                               >
//                                                 <i className="fas fa-eye me-2"></i>View Details
//                                               </button>
//                                             </li>
//                                             <li>
//                                               <button
//                                                 className="dropdown-item"
//                                                 onClick={((currentLeader) => () => {
//                                                   console.log('🔘 List view Members button clicked for:', {
//                                                     id: currentLeader.id,
//                                                     _id: currentLeader._id,
//                                                     name: currentLeader.name,
//                                                     email: currentLeader.email
//                                                   });
//                                                   handleViewTeamMembers(currentLeader);
//                                                 })(leader)}
//                                                 title={(() => {
//                                                   const teamMembers = getTeamMembersForLeader(leader.id || leader._id);
//                                                   return teamMembers.length > 0
//                                                     ? `Team Members: ${teamMembers.map(m => m.name).join(', ')}`
//                                                     : 'No team members assigned';
//                                                 })()}
//                                               >
//                                                 <i className="fas fa-users me-2"></i>View Members ({getTeamMembersForLeader(leader.id || leader._id).length})
//                                               </button>
//                                             </li>
//                                             <li>
//                                               <button
//                                                 className="dropdown-item"
//                                                 onClick={() => handleEditTeamMemberRestrictions(leader)}
//                                               >
//                                                 <i className="fas fa-edit me-2"></i>Manage Team
//                                               </button>
//                                             </li>
//                                             <li>
//                                               <button
//                                                 className="dropdown-item"
//                                                 onClick={() => handleEditTeamLeader(leader)}
//                                               >
//                                                 <i className="fas fa-edit me-2"></i>Edit Profile
//                                               </button>
//                                             </li>
//                                             <li>
//                                               <button
//                                                 className="dropdown-item"
//                                                 onClick={() => handleOpenPasswordManagement(leader)}
//                                               >
//                                                 <i className="fas fa-key me-2"></i>Password Management
//                                               </button>
//                                             </li>
//                                             <li><hr className="dropdown-divider" /></li>
//                                             <li>
//                                               <button
//                                                 className="dropdown-item text-danger"
//                                                 onClick={() => handleDeleteTeamLeader(leader.id, leader.name)}
//                                               >
//                                                 <i className="fas fa-trash me-2"></i>Delete User
//                                               </button>
//                                             </li>
//                                           </ul>
//                                         </div>
//                                       </td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           );
//                         }

//                         return (
//                           <div className="row">
//                             {filteredLeaders.map((leader, index) => {
//                               const leaderData = getTeamLeaderData(leader.id || leader._id);
//                               return (
//                                 <div key={leader.id} className="col-md-6 col-lg-4 mb-4">
//                                   <div
//                                     className="card h-100 border-2"
//                                     style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
//                                     onMouseEnter={(e) => {
//                                       e.currentTarget.style.transform = 'translateY(-5px)';
//                                       e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
//                                     }}
//                                     onMouseLeave={(e) => {
//                                       e.currentTarget.style.transform = 'translateY(0)';
//                                       e.currentTarget.style.boxShadow = '';
//                                     }}
//                                   >
//                                     <div className="card-body">
//                                       <div className="d-flex align-items-center mb-3">
//                                         <div
//                                           className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
//                                           style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}
//                                         >
//                                           {leader.name.charAt(0)}
//                                         </div>
//                                         <div className="flex-grow-1">
//                                           <h6 className="card-title mb-1">{leader.name}</h6>
//                                           <small className="text-muted">{leader.email}</small>
//                                         </div>
//                                         <div className="dropdown">
//                                           <button
//                                             className="btn btn-sm btn-outline-secondary"
//                                             data-bs-toggle="dropdown"
//                                             title="Team Leader Management Settings"
//                                             onClick={(e) => e.stopPropagation()}
//                                           >
//                                             <i className="fas fa-cog"></i>
//                                           </button>
//                                           <ul className="dropdown-menu">
//                                             <li>
//                                               <button
//                                                 className="dropdown-item"
//                                                 onClick={(e) => {
//                                                   e.stopPropagation();
//                                                   alert(`Team Leader Details:\n\nName: ${leader.name}\nEmail: ${leader.email}\nDepartment: ${leader.department}\nTeam Size: ${leader.teamSize}\nProjects: ${leader.projectsManaged}\nPhone: ${leader.phone || 'Not provided'}\nSpecialization: ${leader.specialization || 'Not specified'}`);
//                                                 }}
//                                               >
//                                                 <i className="fas fa-eye me-2"></i>View Details
//                                               </button>
//                                             </li>

//                                             <li>
//                                               <button
//                                                 className="dropdown-item"
//                                                 onClick={(e) => {
//                                                   e.stopPropagation();
//                                                   handleEditTeamLeader(leader);
//                                                 }}
//                                               >
//                                                 <i className="fas fa-edit me-2"></i>Edit Profile
//                                               </button>
//                                             </li>
//                                             <li>
//                                               <button
//                                                 className="dropdown-item"
//                                                 onClick={(e) => {
//                                                   e.stopPropagation();
//                                                   handleOpenPasswordManagement(leader);
//                                                 }}
//                                               >
//                                                 <i className="fas fa-key me-2"></i>Password Management
//                                               </button>
//                                             </li>
//                                             <li><hr className="dropdown-divider" /></li>
//                                             <li>
//                                               <button
//                                                 className="dropdown-item text-danger"
//                                                 onClick={(e) => {
//                                                   e.stopPropagation();
//                                                   handleDeleteTeamLeader(leader.id, leader.name);
//                                                 }}
//                                               >
//                                                 <i className="fas fa-trash me-2"></i>Delete User
//                                               </button>
//                                             </li>
//                                           </ul>
//                                         </div>
//                                       </div>

//                                       <div className="row text-center mb-3">
//                                         <div className="col-4">
//                                           <div className="fw-bold text-primary">{getTeamLeaderData(leader.id || leader._id)?.projectsManaged || 0}</div>
//                                           <small className="text-muted">Projects</small>
//                                         </div>
//                                         <div className="col-4">
//                                           <div className="fw-bold text-success">{getTeamLeaderData(leader.id || leader._id)?.teamSize || 0}</div>
//                                           <small className="text-muted">Team Size</small>
//                                         </div>
//                                         <div className="col-4">
//                                           <div
//                                             className={`fw-bold ${getTeamMembersForLeader(leader.id || leader._id).length > 0 ? 'text-info' : 'text-muted'}`}
//                                             title={(() => {
//                                               const teamMembers = getTeamMembersForLeader(leader.id || leader._id);
//                                               return teamMembers.length > 0
//                                                 ? `Team Members:\n${teamMembers.map(m => `• ${m.name} (${m.department})`).join('\n')}\n\nClick Members button to manage`
//                                                 : 'No team members assigned. Click Members button to add members.';
//                                             })()}
//                                             style={{ cursor: 'help' }}
//                                           >
//                                             {getTeamMembersForLeader(leader.id || leader._id).length}
//                                           </div>
//                                           <small className="text-muted">Members</small>
//                                         </div>
//                                       </div>

//                                       <div className="mb-2">
//                                         <small className="text-muted">Department:</small>
//                                         <span className="ms-2 badge bg-light text-dark">{leader.department}</span>
//                                       </div>

//                                       <div className="mb-2">
//                                         <small className="text-muted">Status:</small>
//                                         <span className={`ms-2 badge ${leader.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
//                                           {leader.status}
//                                         </span>
//                                       </div>

//                                       <div className="mb-2">
//                                         <small className="text-muted">Joined:</small>
//                                         <span className="ms-2">{new Date(leader.joinDate).toLocaleDateString()}</span>
//                                       </div>

//                                       {leader.managedBy && (
//                                         <div className="mb-2">
//                                           <small className="text-muted">Managed by:</small>
//                                           <span className="ms-2">{leader.managedBy}</span>
//                                         </div>
//                                       )}

//                                       {(() => {
//                                         const teamMembers = employees.filter(emp => emp.teamLeaderId === leader.id);
//                                         return teamMembers.length > 0 && (
//                                           <div className="mb-2">
//                                             <small className="text-muted">Team Members:</small>
//                                             <div className="mt-1">
//                                               {teamMembers.slice(0, 3).map((member, idx) => (
//                                                 <span key={idx} className="badge bg-primary me-1 mb-1">{member.name}</span>
//                                               ))}
//                                               {teamMembers.length > 3 && (
//                                                 <span className="badge bg-secondary">+{teamMembers.length - 3}</span>
//                                               )}
//                                             </div>
//                                           </div>
//                                         );
//                                       })()}
//                                     </div>
//                                     <div className="card-footer bg-light">
//                                       <div className="d-flex gap-1">
//                                         <button
//                                           className="btn btn-sm btn-outline-primary"
//                                           onClick={((currentLeader) => (e) => {
//                                             e.stopPropagation();
//                                             handleEditTeamLeader(currentLeader);
//                                           })(leader)}
//                                         >
//                                           <i className="fas fa-edit me-1"></i>Edit
//                                         </button>
//                                         <button
//                                           className="btn btn-sm btn-outline-info"
//                                           onClick={((currentLeader) => (e) => {
//                                             e.stopPropagation();
//                                             alert(`Team Leader Details:\n\nName: ${currentLeader.name}\nEmail: ${currentLeader.email}\nDepartment: ${currentLeader.department}\nTeam Size: ${currentLeader.teamSize}\nProjects: ${currentLeader.projectsManaged}\nPhone: ${currentLeader.phone || 'Not provided'}\nSpecialization: ${currentLeader.specialization || 'Not specified'}`);
//                                           })(leader)}
//                                         >
//                                           <i className="fas fa-eye me-1"></i>View
//                                         </button>
//                                         <button
//                                           className="btn btn-sm btn-outline-primary"
//                                           onClick={((currentLeader) => (e) => {
//                                             e.stopPropagation();
//                                             console.log('🔘 Members button clicked for:', {
//                                               id: currentLeader.id,
//                                               _id: currentLeader._id,
//                                               name: currentLeader.name,
//                                               email: currentLeader.email
//                                             });
//                                             handleViewTeamMembers(currentLeader);
//                                           })(leader)}
//                                           title={(() => {
//                                             const teamMembers = getTeamMembersForLeader(leader.id || leader._id);
//                                             return teamMembers.length > 0
//                                               ? `View & Manage Team Members:\n${teamMembers.map(m => `• ${m.name} (${m.department})`).join('\n')}\n\nClick to add/remove members`
//                                               : 'No team members assigned. Click to add members.';
//                                           })()}
//                                         >
//                                           <i className="fas fa-users me-1"></i>Members ({getTeamMembersForLeader(leader.id || leader._id).length})
//                                         </button>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         );
//                       })()}

//                       <div className="text-center mt-3">
//                         <small className="text-muted">
//                           {(() => {
//                             const filteredLeaders = getFilteredTeamLeaders();
//                             return `Showing ${filteredLeaders.length} of ${teamLeaders.length} team leaders • 
//                             Active: ${filteredLeaders.filter(tl => tl.status === 'Active').length} • 
//                             Total Team Members: ${filteredLeaders.reduce((sum, tl) => sum + (tl.teamSize || 0), 0)}`;
//                           })()}
//                         </small>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Employee Management View */}
//                 {(currentRole === 'admin' || currentRole === 'project-manager') && activeView === 'employees' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">Employee Management</h5>
//                         <small className="text-muted">Manage employees and their information</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                         </button>
//                         <button
//                           className={`btn btn-sm ${employeeViewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                           onClick={() => setEmployeeViewMode('list')}
//                         >
//                           <i className="fas fa-list me-1"></i> List View
//                         </button>
//                         <button
//                           className={`btn btn-sm ${employeeViewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                           onClick={() => setEmployeeViewMode('card')}
//                         >
//                           <i className="fas fa-th me-1"></i> Card View
//                         </button>
//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={() => {
//                             setEditingUser(null);
//                             setShowAddUserModal(true);
//                           }}
//                         >
//                           <i className="fas fa-plus me-1"></i> Add Employee
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       <div className="d-flex justify-content-between align-items-center mb-3">
//                         <div className="d-flex align-items-center">
//                           <i className="fas fa-user me-2 text-info"></i>
//                           <span className="fw-bold">Total Employees: {allUsers.filter(u => u.role === 'employee' || u.role === 'intern').length} persons</span>
//                         </div>
//                         <div className="d-flex gap-2">
//                           <div className="input-group" style={{ width: '300px' }}>
//                             <span className="input-group-text"><i className="fas fa-search"></i></span>
//                             <input
//                               type="text"
//                               className="form-control"
//                               placeholder="Search by name, email, or department"
//                               value={employeeSearchTerm}
//                               onChange={(e) => setEmployeeSearchTerm(e.target.value)}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Employee Cards/List */}
//                       {(() => {
//                         const employees = allUsers.filter(u => u.role === 'employee' || u.role === 'intern');
//                         const filteredEmployees = employees.filter(employee => {
//                           const searchLower = employeeSearchTerm.toLowerCase();
//                           return employee.name.toLowerCase().includes(searchLower) ||
//                             employee.email.toLowerCase().includes(searchLower) ||
//                             (employee.department && employee.department.toLowerCase().includes(searchLower)) ||
//                             (employee.phone && employee.phone.includes(employeeSearchTerm));
//                         });

//                         if (employees.length === 0) {
//                           return (
//                             <div className="text-center py-5">
//                               <i className="fas fa-user fa-3x text-muted mb-3"></i>
//                               <h5 className="text-muted">No Employees Added</h5>
//                               <p className="text-muted">Click "Add Employee" to get started</p>
//                               <button
//                                 className="btn btn-primary"
//                                 onClick={() => {
//                                   setEditingUser(null);
//                                   setShowAddUserModal(true);
//                                 }}
//                               >
//                                 <i className="fas fa-plus me-1"></i> Add First Employee
//                               </button>
//                             </div>
//                           );
//                         }

//                         if (filteredEmployees.length === 0) {
//                           return (
//                             <div className="text-center py-5">
//                               <i className="fas fa-search fa-3x text-muted mb-3"></i>
//                               <h5 className="text-muted">No Employees Found</h5>
//                               <p className="text-muted">Try adjusting your search criteria</p>
//                             </div>
//                           );
//                         }

//                         if (employeeViewMode === 'list') {
//                           return (
//                             <div className="table-responsive">
//                               <table className="table table-hover">
//                                 <thead>
//                                   <tr>
//                                     <th>Employee</th>
//                                     <th>Email</th>
//                                     <th>Phone</th>
//                                     <th>Department</th>
//                                     <th>Projects</th>
//                                     <th>Clients</th>
//                                     <th>Status</th>
//                                     <th>Actions</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {filteredEmployees.map((employee, index) => (
//                                     <tr key={employee.id || employee._id || index}>
//                                       <td>
//                                         <div className="d-flex align-items-center">
//                                           <div
//                                             className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3"
//                                             style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}
//                                           >
//                                             {employee.name.charAt(0)}
//                                           </div>
//                                           <div>
//                                             <div className="fw-bold">{employee.name}</div>
//                                             <small className="text-muted">{employee.email}</small>
//                                           </div>
//                                         </div>
//                                       </td>
//                                       <td>
//                                         <span className="text-muted">{employee.email || 'Not Provided'}</span>
//                                       </td>
//                                       <td>
//                                         <span className="text-muted">{employee.phone || employee.phoneNumber || 'Not Provided'}</span>
//                                       </td>
//                                       <td>
//                                         <span className="badge bg-light text-dark">{employee.department || employee.role || 'Not Assigned'}</span>
//                                       </td>
//                                       <td>
//                                         {(() => {
//                                           const employeeProjects = projects.filter(project =>
//                                             project.assigned?.some(a => a.name === employee.name) ||
//                                             project.projectManager === employee.name
//                                           );
//                                           return employeeProjects.length > 0 ? (
//                                             <div>
//                                               {employeeProjects.slice(0, 2).map((project, idx) => (
//                                                 <span key={idx} className="badge bg-primary me-1 mb-1" style={{ fontSize: '0.75rem' }}>
//                                                   {project.name}
//                                                 </span>
//                                               ))}
//                                               {employeeProjects.length > 2 && (
//                                                 <small className="text-muted d-block">+{employeeProjects.length - 2} more</small>
//                                               )}
//                                             </div>
//                                           ) : (
//                                             <span className="text-muted">No projects</span>
//                                           );
//                                         })()}
//                                       </td>
//                                       <td>
//                                         {(() => {
//                                           const employeeProjects = projects.filter(project =>
//                                             project.assigned?.some(a => a.name === employee.name) ||
//                                             project.projectManager === employee.name
//                                           );
//                                           const clientNames = [...new Set(employeeProjects.map(p => p.clientName).filter(Boolean))];
//                                           return clientNames.length > 0 ? (
//                                             <div>
//                                               {clientNames.slice(0, 2).map((client, idx) => (
//                                                 <small key={idx} className="fw-medium text-dark d-block">{client}</small>
//                                               ))}
//                                               {clientNames.length > 2 && (
//                                                 <small className="text-muted">+{clientNames.length - 2} more</small>
//                                               )}
//                                             </div>
//                                           ) : (
//                                             <span className="text-muted">No clients</span>
//                                           );
//                                         })()}
//                                       </td>
//                                       <td>
//                                         <span className={`badge ${employee.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
//                                           {employee.status || 'Active'}
//                                         </span>
//                                       </td>
//                                       <td>
//                                         <div className="btn-group">
//                                           <button
//                                             className="btn btn-sm btn-outline-primary"
//                                             onClick={() => {
//                                               setEditingUser(employee);
//                                               setShowAddUserModal(true);
//                                             }}
//                                             title="Edit Employee"
//                                           >
//                                             <i className="fas fa-edit"></i>
//                                           </button>
//                                           <button
//                                             className="btn btn-sm btn-outline-danger"
//                                             onClick={() => handleDeleteUser(employee.id || employee._id)}
//                                             title="Delete Employee"
//                                           >
//                                             <i className="fas fa-trash"></i>
//                                           </button>
//                                         </div>
//                                       </td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           );
//                         } else {
//                           // Card View
//                           return (
//                             <div className="row">
//                               {filteredEmployees.map((employee, index) => (
//                                 <div key={employee.id || employee._id || index} className="col-md-6 col-lg-4 mb-4">
//                                   <div className="card h-100 shadow-sm">
//                                     <div className="card-body">
//                                       <div className="d-flex align-items-center mb-3">
//                                         <div
//                                           className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3"
//                                           style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}
//                                         >
//                                           {employee.name.charAt(0)}
//                                         </div>
//                                         <div className="flex-grow-1">
//                                           <h6 className="card-title mb-1">{employee.name}</h6>
//                                           <small className="text-muted">{employee.email}</small>
//                                         </div>
//                                         <span className={`badge ${employee.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
//                                           {employee.status || 'Active'}
//                                         </span>
//                                       </div>

//                                       <div className="row g-2 mb-3">
//                                         <div className="col-6">
//                                           <small className="text-muted d-block">Department</small>
//                                           <span className="badge bg-light text-dark w-100">{employee.department || employee.role || 'Not Assigned'}</span>
//                                         </div>
//                                         <div className="col-6">

//                                           <span className="small">{employee.phone || employee.phoneNumber || 'Not Provided'}</span>
//                                         </div>
//                                         <div className="col-12">
//                                           <small className="text-muted d-block">Projects</small>
//                                           {(() => {
//                                             const employeeProjects = projects.filter(project =>
//                                               project.assigned?.some(a => a.name === employee.name) ||
//                                               project.projectManager === employee.name
//                                             );
//                                             return employeeProjects.length > 0 ? (
//                                               <div>
//                                                 {employeeProjects.slice(0, 3).map((project, idx) => (
//                                                   <span key={idx} className="badge bg-primary me-1 mb-1" style={{ fontSize: '0.75rem' }}>
//                                                     {project.name}
//                                                   </span>
//                                                 ))}
//                                                 {employeeProjects.length > 3 && (
//                                                   <small className="text-muted d-block">+{employeeProjects.length - 3} more</small>
//                                                 )}
//                                               </div>
//                                             ) : (
//                                               <span className="text-muted small">No projects assigned</span>
//                                             );
//                                           })()}
//                                         </div>
//                                         <div className="col-12">

//                                           {(() => {
//                                             const employeeProjects = projects.filter(project =>
//                                               project.assigned?.some(a => a.name === employee.name) ||
//                                               project.projectManager === employee.name
//                                             );
//                                             const clientNames = [...new Set(employeeProjects.map(p => p.clientName).filter(Boolean))];
//                                             return clientNames.length > 0 ? (
//                                               <div>
//                                                 {clientNames.slice(0, 3).map((client, idx) => (
//                                                   <small key={idx} className="fw-medium text-dark d-block">{client}</small>
//                                                 ))}
//                                                 {clientNames.length > 3 && (
//                                                   <small className="text-muted">+{clientNames.length - 3} more</small>
//                                                 )}
//                                               </div>
//                                             ) : (
//                                               <span className="text-muted small">No clients</span>
//                                             );
//                                           })()}
//                                         </div>
//                                         {employee.address && (
//                                           <div className="col-12">
//                                             <small className="text-muted d-block">Address</small>
//                                             <span className="small">{employee.address}</span>
//                                           </div>
//                                         )}
//                                       </div>

//                                       <div className="d-flex gap-2">
//                                         <button
//                                           className="btn btn-sm btn-outline-primary flex-fill"
//                                           onClick={() => {
//                                             setEditingUser(employee);
//                                             setShowAddUserModal(true);
//                                           }}
//                                         >
//                                           <i className="fas fa-edit me-1"></i> Edit
//                                         </button>
//                                         <button
//                                           className="btn btn-sm btn-outline-danger"
//                                           onClick={() => handleDeleteUser(employee.id || employee._id)}
//                                         >
//                                           <i className="fas fa-trash"></i>
//                                         </button>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           );
//                         }
//                       })()}

//                       <div className="text-center mt-3">
//                         <small className="text-muted">
//                           {(() => {
//                             const employees = allUsers.filter(u => u.role === 'employee' || u.role === 'intern');
//                             const filteredEmployees = employees.filter(employee => {
//                               const searchLower = employeeSearchTerm.toLowerCase();
//                               return employee.name.toLowerCase().includes(searchLower) ||
//                                 employee.email.toLowerCase().includes(searchLower) ||
//                                 (employee.department && employee.department.toLowerCase().includes(searchLower)) ||
//                                 (employee.phone && employee.phone.includes(employeeSearchTerm));
//                             });
//                             return `Showing ${filteredEmployees.length} of ${employees.length} employees • 
//                             Active: ${filteredEmployees.filter(emp => emp.status === 'Active').length} • 
//                             Departments: ${[...new Set(filteredEmployees.map(emp => emp.department).filter(Boolean))].length}`;
//                           })()}
//                         </small>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Team Leader Detail Modal */}
//                 {showTeamLeaderDetail && selectedTeamLeader && (
//                   <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-xl">
//                       <div className="modal-content">
//                         <div className="modal-header bg-success text-white">
//                           <h5 className="modal-title">
//                             <i className="fas fa-users-cog me-2"></i>
//                             Team Leader Details - {selectedTeamLeader.name}
//                           </h5>
//                           <button
//                             type="button"
//                             className="btn-close btn-close-white"
//                             onClick={() => {
//                               setShowTeamLeaderDetail(false);
//                               setSelectedTeamLeader(null);
//                             }}
//                           ></button>
//                         </div>
//                         <div className="modal-body">
//                           {/* Statistics Row */}
//                           <div className="row mb-4">
//                             <div className="col-md-3 mb-3">
//                               <div className="card text-center">
//                                 <div className="card-body">
//                                   <h3 className="text-primary mb-1">{selectedTeamLeader.projectsManaged}</h3>
//                                   <small className="text-muted">Projects Managed</small>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="col-md-3 mb-3">
//                               <div className="card text-center">
//                                 <div className="card-body">
//                                   <h3 className="text-success mb-1">{selectedTeamLeader.teamSize}</h3>
//                                   <small className="text-muted">Team Members</small>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="col-md-3 mb-3">
//                               <div className="card text-center">
//                                 <div className="card-body">
//                                   <h3 className="text-warning mb-1">{selectedTeamLeader.activeTasks}</h3>

//                                 </div>
//                               </div>
//                             </div>
//                             <div className="col-md-3 mb-3">
//                               <div className="card text-center">
//                                 <div className="card-body">
//                                   <h3 className="text-info mb-1">{selectedTeamLeader.completedTasks}</h3>

//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="row">
//                             {/* Team Leader Info */}
//                             <div className="col-md-4 mb-4">
//                               <div className="card h-100">
//                                 <div className="card-header bg-success text-white">
//                                   <h6 className="mb-0">
//                                     <i className="fas fa-user me-2"></i>Personal Information
//                                   </h6>
//                                 </div>
//                                 <div className="card-body">
//                                   <div className="text-center mb-3">
//                                     <div
//                                       className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-2"
//                                       style={{ width: '80px', height: '80px', fontSize: '32px' }}
//                                     >
//                                       {selectedTeamLeader.name.charAt(0)}
//                                     </div>
//                                     <h5 className="mb-1">{selectedTeamLeader.name}</h5>
//                                     <p className="text-muted mb-0">{selectedTeamLeader.department}</p>
//                                   </div>
//                                   <div className="mb-2">
//                                     <strong>Email:</strong>
//                                     <div className="text-muted">{selectedTeamLeader.email}</div>
//                                   </div>
//                                   <div className="mb-2">
//                                     <strong>Phone:</strong>
//                                     <div className="text-muted">{selectedTeamLeader.phone || 'Not provided'}</div>
//                                   </div>
//                                   <div className="mb-2">
//                                     <strong>Department:</strong>
//                                     <div><span className="badge bg-light text-dark">{selectedTeamLeader.department}</span></div>
//                                   </div>
//                                   <div className="mb-2">
//                                     <strong>Status:</strong>
//                                     <div>
//                                       <span className={`badge ${selectedTeamLeader.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
//                                         {selectedTeamLeader.status}
//                                       </span>
//                                     </div>
//                                   </div>
//                                   <div className="mb-2">
//                                     <strong>Joined:</strong>
//                                     <div className="text-muted">{new Date(selectedTeamLeader.joinDate || selectedTeamLeader.joiningDate).toLocaleDateString()}</div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Projects */}
//                             <div className="col-md-4 mb-4">
//                               <div className="card h-100">
//                                 <div className="card-header bg-primary text-white">
//                                   <h6 className="mb-0">
//                                     <i className="fas fa-project-diagram me-2"></i>
//                                     Assigned Projects ({selectedTeamLeader.assignedProjects.length})
//                                   </h6>
//                                 </div>
//                                 <div className="card-body">
//                                   {selectedTeamLeader.assignedProjects.length > 0 ? (
//                                     selectedTeamLeader.assignedProjects.map((project, index) => (
//                                       <div key={index} className="mb-3 p-2 border rounded">
//                                         <div className="d-flex justify-content-between align-items-start">
//                                           <div>
//                                             <h6 className="mb-1">{project.name}</h6>
//                                             <small className="text-muted">Client: {project.clientName}</small>
//                                           </div>
//                                           <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
//                                             project.status === 'On Track' ? 'bg-primary' :
//                                               project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
//                                             }`}>
//                                             {project.status}
//                                           </span>
//                                         </div>
//                                         <div className="mt-2">
//                                           <div className="d-flex justify-content-between mb-1">
//                                             <small>Progress</small>
//                                             <small>{project.progress}%</small>
//                                           </div>
//                                           <div className="progress" style={{ height: '4px' }}>
//                                             <div
//                                               className="progress-bar bg-primary"
//                                               style={{ width: `${project.progress}%` }}
//                                             ></div>
//                                           </div>
//                                         </div>
//                                       </div>
//                                     ))
//                                   ) : (
//                                     <div className="text-center py-3">
//                                       <i className="fas fa-project-diagram fa-2x text-muted mb-2"></i>
//                                       <p className="text-muted mb-0">No projects assigned</p>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Team Members */}
//                             <div className="col-md-4 mb-4">
//                               <div className="card h-100">
//                                 <div className="card-header bg-info text-white">
//                                   <h6 className="mb-0">
//                                     <i className="fas fa-users me-2"></i>
//                                     Team Members ({selectedTeamLeader.teamMembers.length})
//                                   </h6>
//                                 </div>
//                                 <div className="card-body">
//                                   {selectedTeamLeader.teamMembers.length > 0 ? (
//                                     selectedTeamLeader.teamMembers.map((member, index) => (
//                                       <div key={index} className="d-flex align-items-center mb-2 p-2 border rounded">
//                                         <div
//                                           className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-2"
//                                           style={{ width: '32px', height: '32px', fontSize: '12px' }}
//                                         >
//                                           {member.name.charAt(0)}
//                                         </div>
//                                         <div className="flex-grow-1">
//                                           <div className="fw-semibold">{member.name}</div>
//                                           <small className="text-muted">{member.email}</small>
//                                         </div>
//                                         <div>
//                                           <span className={`badge ${getUserWorkStatus(member).color}`}>
//                                             {getUserWorkStatus(member).status}
//                                           </span>
//                                         </div>
//                                       </div>
//                                     ))
//                                   ) : (
//                                     <div className="text-center py-3">
//                                       <i className="fas fa-users fa-2x text-muted mb-2"></i>
//                                       <p className="text-muted mb-0">No team members assigned</p>
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="modal-footer">
//                           <button
//                             type="button"
//                             className="btn btn-secondary"
//                             onClick={() => {
//                               setShowTeamLeaderDetail(false);
//                               setSelectedTeamLeader(null);
//                             }}
//                           >
//                             Close
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Team Member View Modal */}
//                 {showTeamMemberView && selectedTeamForMemberView && (
//                   <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-xl">
//                       <div className="modal-content">
//                         <div className="modal-header bg-primary text-white">
//                           <h5 className="modal-title">
//                             <i className="fas fa-users me-2"></i>
//                             Team Members - {selectedTeamForMemberView.name}
//                           </h5>
//                           <button
//                             type="button"
//                             className="btn-close btn-close-white"
//                             onClick={() => {
//                               setShowTeamMemberView(false);
//                               setSelectedTeamForMemberView(null);
//                               setTeamMemberEditMode(false);
//                             }}
//                           ></button>
//                         </div>
//                         <div className="modal-body">
//                           <div className="d-flex justify-content-between align-items-center mb-4">
//                             <div>
//                               <h6 className="mb-1">Team: {selectedTeamForMemberView.name}</h6>
//                               <small className="text-muted">
//                                 {getTeamMembersForLeader(selectedTeamForMemberView.id || selectedTeamForMemberView._id).length} members
//                               </small>
//                             </div>
//                             <div className="d-flex gap-2">
//                               {(currentRole === 'admin' ||
//                                 (currentRole === 'team-leader' && selectedTeamForMemberView.email === localStorage.getItem('userEmail'))) && (
//                                   <button
//                                     className={`btn btn-sm ${teamMemberEditMode ? 'btn-warning' : 'btn-outline-warning'}`}
//                                     onClick={() => setTeamMemberEditMode(!teamMemberEditMode)}
//                                   >
//                                     <i className={`fas ${teamMemberEditMode ? 'fa-lock' : 'fa-edit'} me-1`}></i>
//                                     {teamMemberEditMode ? 'Lock Edit' : 'Enable Edit'}
//                                   </button>
//                                 )}
//                               <button
//                                 className="btn btn-sm btn-outline-success"
//                                 onClick={() => {
//                                   const teamLeaderId = selectedTeamForMemberView.id || selectedTeamForMemberView._id;
//                                   console.log('➕ Add Members button clicked');
//                                   console.log('- Selected team for member view:', {
//                                     id: selectedTeamForMemberView.id,
//                                     _id: selectedTeamForMemberView._id,
//                                     name: selectedTeamForMemberView.name
//                                   });
//                                   console.log('- Setting team leader ID to:', teamLeaderId);
//                                   setSelectedTeamLeaderForMember(teamLeaderId);
//                                   setShowAddMemberModal(true);
//                                 }}
//                                 disabled={!teamMemberEditMode && currentRole !== 'admin'}
//                               >
//                                 <i className="fas fa-user-plus me-1"></i>
//                                 Add Member
//                               </button>
//                             </div>
//                           </div>

//                           {teamMemberEditMode && (
//                             <div className="alert alert-warning">
//                               <i className="fas fa-exclamation-triangle me-2"></i>
//                               <strong>Edit Mode Active:</strong> You can now modify team assignments. Changes will be saved automatically.
//                             </div>
//                           )}

//                           <div className="row">
//                             {getTeamMembersForLeader(selectedTeamForMemberView.id || selectedTeamForMemberView._id).length === 0 ? (
//                               <div className="col-12">
//                                 <div className="text-center py-5">
//                                   <i className="fas fa-users fa-3x text-muted mb-3"></i>
//                                   <h5 className="text-muted">No Team Members</h5>
//                                   <p className="text-muted">This team leader has no assigned members yet.</p>
//                                   <button
//                                     className="btn btn-primary"
//                                     onClick={() => {
//                                       const teamLeaderId = selectedTeamForMemberView.id || selectedTeamForMemberView._id;
//                                       console.log('➕ Add First Member button clicked');
//                                       console.log('- Selected team for member view:', {
//                                         id: selectedTeamForMemberView.id,
//                                         _id: selectedTeamForMemberView._id,
//                                         name: selectedTeamForMemberView.name
//                                       });
//                                       console.log('- Setting team leader ID to:', teamLeaderId);
//                                       setSelectedTeamLeaderForMember(teamLeaderId);
//                                       setShowAddMemberModal(true);
//                                     }}
//                                     disabled={!teamMemberEditMode && currentRole !== 'admin'}
//                                   >
//                                     <i className="fas fa-user-plus me-2"></i>
//                                     Add First Member
//                                   </button>
//                                 </div>
//                               </div>
//                             ) : (
//                               getTeamMembersForLeader(selectedTeamForMemberView.id || selectedTeamForMemberView._id).map((member, index) => (
//                                 <div key={member.id || member._id || index} className="col-md-6 col-lg-4 mb-3">
//                                   <div className="card h-100">
//                                     <div className="card-body">
//                                       <div className="d-flex align-items-center mb-3">
//                                         <div className="avatar-circle bg-primary text-white me-3">
//                                           {member.name.charAt(0).toUpperCase()}
//                                         </div>
//                                         <div className="flex-grow-1">
//                                           <h6 className="mb-1">{member.name}</h6>
//                                           <small className="text-muted">{member.role || 'Employee'}</small>
//                                         </div>
//                                         {(teamMemberEditMode || currentRole === 'admin') && (
//                                           <div className="dropdown">
//                                             <button
//                                               className="btn btn-sm btn-outline-secondary dropdown-toggle"
//                                               data-bs-toggle="dropdown"
//                                               aria-expanded="false"
//                                             >
//                                               <i className="fas fa-cog"></i>
//                                             </button>
//                                             <ul className="dropdown-menu dropdown-menu-end" style={{ maxHeight: '300px', overflowY: 'auto' }}>
//                                               <li>
//                                                 <button
//                                                   className="dropdown-item text-danger"
//                                                   onClick={() => handleRemoveFromTeam(member.id || member._id, selectedTeamForMemberView.id || selectedTeamForMemberView._id)}
//                                                 >
//                                                   <i className="fas fa-user-minus me-2"></i>
//                                                   Remove from Team
//                                                 </button>
//                                               </li>
//                                               <li><hr className="dropdown-divider" /></li>
//                                               <li>
//                                                 <h6 className="dropdown-header">Reassign to:</h6>
//                                               </li>
//                                               {teamLeaders
//                                                 .filter(tl => (tl.id || tl._id) !== (selectedTeamForMemberView.id || selectedTeamForMemberView._id))
//                                                 .map(tl => (
//                                                   <li key={tl.id || tl._id}>
//                                                     <button
//                                                       className="dropdown-item"
//                                                       onClick={() => handleAssignToTeamFromView(member.id || member._id, tl.id || tl._id)}
//                                                     >
//                                                       <i className="fas fa-arrow-right me-2"></i>
//                                                       {tl.name}
//                                                     </button>
//                                                   </li>
//                                                 ))}
//                                             </ul>
//                                           </div>
//                                         )}
//                                       </div>
//                                       <div className="row text-center">
//                                         <div className="col-6">
//                                           <small className="text-muted d-block">Department</small>
//                                           <strong>{member.department || 'N/A'}</strong>
//                                         </div>
//                                         <div className="col-6">
//                                           <small className="text-muted d-block">Status</small>
//                                           <span className={`badge ${getUserWorkStatus(member).color}`}>
//                                             {getUserWorkStatus(member).status}
//                                           </span>
//                                         </div>
//                                       </div>
//                                       {member.assignedProject && (
//                                         <div className="mt-2">
//                                           <small className="text-muted d-block">Current Project</small>
//                                           <strong className="text-primary">{member.assignedProject}</strong>
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))
//                             )}
//                           </div>
//                         </div>
//                         <div className="modal-footer">
//                           <button
//                             type="button"
//                             className="btn btn-secondary"
//                             onClick={() => {
//                               setShowTeamMemberView(false);
//                               setSelectedTeamForMemberView(null);
//                               setTeamMemberEditMode(false);
//                             }}
//                           >
//                             Close
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Add Member to Team Modal */}
//                 {showAddMemberModal && (
//                   <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-xl">
//                       <div className="modal-content">
//                         <div className="modal-header bg-success text-white">
//                           <h5 className="modal-title">
//                             <i className="fas fa-user-plus me-2"></i>
//                             {selectedTeamLeaderForMember ?
//                               `Add Members to ${(() => {
//                                 // Check both teamLeaders array and allUsers
//                                 let leader = teamLeaders.find(tl => (tl.id || tl._id) === selectedTeamLeaderForMember);
//                                 if (!leader) {
//                                   leader = allUsers.find(user =>
//                                     user.role === 'team-leader' && (user.id || user._id) === selectedTeamLeaderForMember
//                                   );
//                                 }
//                                 console.log('🎯 Modal opened for team leader ID:', selectedTeamLeaderForMember);
//                                 console.log('🎯 Found leader:', leader ? { name: leader.name, id: leader.id, _id: leader._id } : 'NOT FOUND');
//                                 return leader ? leader.name + "'s Team" : 'Team';
//                               })()}` :
//                               'Add Members to Team'
//                             }
//                           </h5>
//                           <button
//                             type="button"
//                             className="btn-close btn-close-white"
//                             onClick={() => {
//                               setShowAddMemberModal(false);
//                               setSelectedMembersForTeam([]);
//                               setSelectedTeamLeaderForMember(null);
//                               setMemberSearchTerm('');
//                               setTeamLeaderSearchTerm('');
//                             }}
//                           ></button>
//                         </div>
//                         <div className="modal-body">
//                           <div className="row">
//                             {/* Select Team Leader - Only show if no team leader is pre-selected */}
//                             {!selectedTeamLeaderForMember && (
//                               <div className="col-md-6 mb-4">
//                                 <div className="d-flex justify-content-between align-items-center mb-3">
//                                   <h6 className="fw-bold mb-0">
//                                     <i className="fas fa-users-cog me-2 text-success"></i>
//                                     Select Team Leader
//                                   </h6>
//                                   <small className="text-muted">{getFilteredTeamLeaders().length} leaders</small>
//                                 </div>

//                                 {/* Team Leader Search */}
//                                 <div className="mb-3">
//                                   <div className="input-group">
//                                     <span className="input-group-text">
//                                       <i className="fas fa-search"></i>
//                                     </span>
//                                     <input
//                                       type="text"
//                                       className="form-control"
//                                       placeholder="Search team leaders..."
//                                       value={teamLeaderSearchTerm}
//                                       onChange={(e) => setTeamLeaderSearchTerm(e.target.value)}
//                                     />
//                                     {teamLeaderSearchTerm && (
//                                       <button
//                                         className="btn btn-outline-secondary"
//                                         onClick={() => setTeamLeaderSearchTerm('')}
//                                       >
//                                         <i className="fas fa-times"></i>
//                                       </button>
//                                     )}
//                                   </div>
//                                 </div>

//                                 <div className="border rounded p-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
//                                   {getFilteredTeamLeaders().map((leader, index) => (
//                                     <div
//                                       key={leader.id || leader._id || index}
//                                       className={`d-flex align-items-center p-2 mb-2 rounded cursor-pointer ${selectedTeamLeaderForMember === (leader.id || leader._id) ? 'bg-success text-white' : 'bg-light'
//                                         }`}
//                                       onClick={() => setSelectedTeamLeaderForMember(leader.id || leader._id)}
//                                       style={{ cursor: 'pointer' }}
//                                     >
//                                       <div
//                                         className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
//                                         style={{ width: '40px', height: '40px', fontSize: '14px' }}
//                                       >
//                                         {leader.name.charAt(0)}
//                                       </div>
//                                       <div className="flex-grow-1">
//                                         <div className="fw-semibold">{leader.name}</div>
//                                         <small className={selectedTeamLeaderForMember === (leader.id || leader._id) ? 'text-white-50' : 'text-muted'}>
//                                           {leader.department} • {getTeamLeaderData(leader.id || leader._id)?.teamSize || 0} members
//                                         </small>
//                                       </div>
//                                       {selectedTeamLeaderForMember === (leader.id || leader._id) && (
//                                         <i className="fas fa-check-circle"></i>
//                                       )}
//                                     </div>
//                                   ))}
//                                   {getFilteredTeamLeaders().length === 0 && (
//                                     <div className="text-center py-3 text-muted">
//                                       <i className="fas fa-search fa-2x mb-2"></i>
//                                       <p>No team leaders found</p>
//                                       {teamLeaderSearchTerm && (
//                                         <button
//                                           className="btn btn-sm btn-outline-secondary"
//                                           onClick={() => setTeamLeaderSearchTerm('')}
//                                         >
//                                           Clear Search
//                                         </button>
//                                       )}
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             )}



//                             {/* Select Members */}
//                             <div className={`${selectedTeamLeaderForMember ? 'col-12' : 'col-md-6'} mb-4`}>
//                               <div className="d-flex justify-content-between align-items-center mb-3">
//                                 <h6 className="fw-bold mb-0">
//                                   <i className="fas fa-users me-2 text-primary"></i>
//                                   Select Members to Assign
//                                 </h6>
//                                 <div className="d-flex align-items-center gap-2">
//                                   <small className="text-muted">
//                                     <span className="badge bg-primary me-1">{selectedMembersForTeam.length}</span>
//                                     of {getFilteredMembers().length} selected
//                                   </small>
//                                   {getFilteredMembers().length > 0 && (
//                                     <button
//                                       className="btn btn-sm btn-outline-primary"
//                                       onClick={() => {
//                                         const allMemberIds = getFilteredMembers().map(m => m.id || m._id);
//                                         setSelectedMembersForTeam(allMemberIds);
//                                       }}
//                                     >
//                                       Select All
//                                     </button>
//                                   )}
//                                   {selectedMembersForTeam.length > 0 && (
//                                     <button
//                                       className="btn btn-sm btn-outline-danger"
//                                       onClick={() => setSelectedMembersForTeam([])}
//                                     >
//                                       Clear All
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>

//                               {/* Member Search */}
//                               <div className="mb-3">
//                                 <div className="input-group">
//                                   <span className="input-group-text">
//                                     <i className="fas fa-search"></i>
//                                   </span>
//                                   <input
//                                     type="text"
//                                     className="form-control"
//                                     placeholder="Search members..."
//                                     value={memberSearchTerm}
//                                     onChange={(e) => setMemberSearchTerm(e.target.value)}
//                                   />
//                                   {memberSearchTerm && (
//                                     <button
//                                       className="btn btn-outline-secondary"
//                                       onClick={() => setMemberSearchTerm('')}
//                                     >
//                                       <i className="fas fa-times"></i>
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>

//                               <div className="border rounded p-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
//                                 {getFilteredMembers().map((member, index) => {
//                                   const isSelected = selectedMembersForTeam.includes(member.id || member._id);

//                                   return (
//                                     <div
//                                       key={member.id || member._id || index}
//                                       className={`d-flex align-items-center p-3 mb-2 rounded cursor-pointer border ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-light border-light hover-bg-light'
//                                         }`}
//                                       onClick={() => toggleMemberSelection(member.id || member._id)}
//                                       style={{
//                                         cursor: 'pointer',
//                                         transition: 'all 0.2s ease',
//                                         transform: isSelected ? 'scale(1.02)' : 'scale(1)'
//                                       }}
//                                     >
//                                       <div className="me-3">
//                                         <div className={`d-flex align-items-center justify-content-center rounded ${isSelected ? 'bg-white text-primary' : 'bg-secondary text-white'
//                                           }`} style={{ width: '24px', height: '24px' }}>
//                                           {isSelected ? (
//                                             <i className="fas fa-check fw-bold"></i>
//                                           ) : (
//                                             <i className="fas fa-plus" style={{ fontSize: '12px' }}></i>
//                                           )}
//                                         </div>
//                                       </div>
//                                       <div
//                                         className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
//                                         style={{ width: '40px', height: '40px', fontSize: '14px' }}
//                                       >
//                                         {member.name.charAt(0)}
//                                       </div>
//                                       <div className="flex-grow-1">
//                                         <div className="fw-semibold">{member.name}</div>
//                                         <small className={isSelected ? 'text-white-50' : 'text-muted'}>
//                                           {member.department} • {member.role}
//                                         </small>
//                                       </div>
//                                       <span className="badge bg-success text-white ms-2">
//                                         <i className="fas fa-user-plus me-1"></i>
//                                         Available
//                                       </span>
//                                     </div>
//                                   );
//                                 })}
//                                 {getFilteredMembers().length === 0 && (
//                                   <div className="text-center py-3 text-muted">
//                                     <i className="fas fa-user-slash fa-2x mb-2"></i>
//                                     <p>
//                                       {memberSearchTerm
//                                         ? 'No unassigned members found matching your search'
//                                         : 'No unassigned members available'
//                                       }
//                                     </p>
//                                     <small className="text-muted">
//                                       Only employees and interns without team assignments are shown here
//                                     </small>
//                                     {memberSearchTerm && (
//                                       <button
//                                         className="btn btn-sm btn-outline-secondary mt-2"
//                                         onClick={() => setMemberSearchTerm('')}
//                                       >
//                                         Clear Search
//                                       </button>
//                                     )}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </div>


//                         </div>
//                         <div className="modal-footer">
//                           <button
//                             type="button"
//                             className="btn btn-secondary"
//                             onClick={() => {
//                               setShowAddMemberModal(false);
//                               setSelectedMembersForTeam([]);
//                               setSelectedTeamLeaderForMember(null);
//                               setMemberSearchTerm('');
//                               setTeamLeaderSearchTerm('');
//                             }}
//                           >
//                             Cancel
//                           </button>
//                           <button
//                             type="button"
//                             className="btn btn-success"
//                             disabled={selectedMembersForTeam.length === 0 || !selectedTeamLeaderForMember}
//                             onClick={() => handleAssignMembersToTeam(selectedMembersForTeam, selectedTeamLeaderForMember)}
//                           >
//                             <i className="fas fa-user-plus me-2"></i>
//                             Assign {selectedMembersForTeam.length} Member{selectedMembersForTeam.length > 1 ? 's' : ''}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Role Management View */}
//                 {currentRole === 'admin' && activeView === 'role-management' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">Role Management</h5>
//                         <small className="text-muted">Create and manage custom roles with specific permissions</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                         </button>
//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={() => setShowAddRoleModal(true)}
//                         >
//                           <i className="fas fa-plus me-1"></i> Create New Role
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       {/* Default Roles */}
//                       <div className="mb-4">
//                         <h6 className="text-muted mb-3">Default System Roles</h6>
//                         <div className="row">
//                           {[
//                             { name: 'Admin', icon: 'fas fa-user-shield', color: 'danger', description: 'Full system access and management', users: allUsers.filter(u => u.role === 'admin').length },
//                             { name: 'Project Manager', icon: 'fas fa-user-tie', color: 'primary', description: 'Manage projects and team leaders', users: getTotalProjectManagerCount(), clickable: true, view: 'project-managers' },
//                             { name: 'Team Leader', icon: 'fas fa-users-cog', color: 'success', description: 'Lead teams and manage tasks', users: getTotalTeamLeaderCount(), clickable: true, view: 'team-leaders' },
//                             { name: 'Employee', icon: 'fas fa-user', color: 'info', description: 'Basic user access', users: allUsers.filter(u => u.role === 'employee' || u.role === 'intern').length, clickable: true, view: 'employees' }
//                           ].map((role, index) => (
//                             <div key={index} className="col-md-6 col-lg-3 mb-3">
//                               <div
//                                 className={`card border h-100 ${role.clickable ? 'shadow-sm' : ''}`}
//                                 onClick={() => {
//                                   if (role.clickable && role.view) {
//                                     console.log(`Navigating to ${role.view} view`);
//                                     setActiveView(role.view);
//                                     setShowIndividualDashboard(false);
//                                   }
//                                 }}
//                                 style={role.clickable ? {
//                                   cursor: 'pointer',
//                                   transition: 'all 0.3s ease',
//                                   border: '2px solid transparent'
//                                 } : {}}
//                                 onMouseEnter={(e) => {
//                                   if (role.clickable) {
//                                     e.currentTarget.style.transform = 'translateY(-5px)';
//                                     e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
//                                     e.currentTarget.style.borderColor = `var(--bs-${role.color})`;
//                                   }
//                                 }}
//                                 onMouseLeave={(e) => {
//                                   if (role.clickable) {
//                                     e.currentTarget.style.transform = 'translateY(0)';
//                                     e.currentTarget.style.boxShadow = '';
//                                     e.currentTarget.style.borderColor = 'transparent';
//                                   }
//                                 }}
//                               >
//                                 <div className="card-body text-center">
//                                   <div className={`rounded-circle bg-${role.color} text-white d-inline-flex align-items-center justify-content-center mb-3`}
//                                     style={{ width: '60px', height: '60px', fontSize: '24px' }}>
//                                     <i className={role.icon}></i>
//                                   </div>
//                                   <h6 className="card-title">{role.name}</h6>
//                                   <div className={`badge bg-${role.color} mb-2`}>
//                                     {role.users} {role.users === 1 ? (role.name === 'Team Leader' ? 'member' : 'user') : (role.name === 'Team Leader' ? 'members' : 'users')}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Custom Roles */}
//                       <div>
//                         <div className="d-flex justify-content-between align-items-center mb-3">
//                           <h6 className="text-muted mb-0">Custom Roles</h6>
//                           <span className="badge bg-secondary">{customRoles.length} custom roles</span>
//                         </div>

//                         {customRoles.length === 0 ? (
//                           <div className="text-center py-4">
//                             <i className="fas fa-user-plus fa-3x text-muted mb-3"></i>
//                             <h6 className="text-muted">No Custom Roles Created</h6>
//                             <p className="text-muted">Create custom roles to fit your organization's needs</p>
//                             <button
//                               className="btn btn-primary"
//                               onClick={() => setShowAddRoleModal(true)}
//                             >
//                               <i className="fas fa-plus me-1"></i> Create First Custom Role
//                             </button>
//                           </div>
//                         ) : (
//                           <div className="table-responsive">
//                             <table className="table table-hover">
//                               <thead>
//                                 <tr>
//                                   <th>Role Name</th>
//                                   <th>Description</th>
//                                   <th>Permissions</th>
//                                   <th>Users</th>
//                                   <th>Created By</th>
//                                   <th>Created Date</th>
//                                   <th>Actions</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {customRoles.map((role) => (
//                                   <tr key={role.id}>
//                                     <td>
//                                       <div className="d-flex align-items-center">
//                                         <div className={`rounded-circle bg-${role.color || 'secondary'} text-white d-flex align-items-center justify-content-center me-2`}
//                                           style={{ width: '30px', height: '30px', fontSize: '12px' }}>
//                                           <i className={role.icon || 'fas fa-user'}></i>
//                                         </div>
//                                         <strong>{role.name}</strong>
//                                       </div>
//                                     </td>
//                                     <td>{role.description}</td>
//                                     <td>
//                                       {role.permissions?.slice(0, 3).map((perm, idx) => (
//                                         <span key={idx} className="badge bg-light text-dark me-1">{perm}</span>
//                                       ))}
//                                       {role.permissions?.length > 3 && (
//                                         <span className="badge bg-secondary">+{role.permissions.length - 3}</span>
//                                       )}
//                                     </td>
//                                     <td>
//                                       <span className="badge bg-info">{role.userCount || 0} users</span>
//                                     </td>
//                                     <td>{role.createdBy}</td>
//                                     <td>{new Date(role.createdAt).toLocaleDateString()}</td>
//                                     <td>
//                                       <div className="btn-group btn-group-sm">
//                                         <button
//                                           className="btn btn-outline-primary"
//                                           onClick={() => alert(`Edit role: ${role.name}`)}
//                                         >
//                                           <i className="fas fa-edit"></i>
//                                         </button>
//                                         <button
//                                           className="btn btn-outline-danger"
//                                           onClick={() => handleDeleteCustomRole(role.id, role.name)}
//                                         >
//                                           <i className="fas fa-trash"></i>
//                                         </button>
//                                       </div>
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* All Users View */}
//                 {(currentRole === 'admin' || currentRole === 'project-manager') && activeView === 'all-users' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">All Users</h5>
//                         <small className="text-muted">Complete list of all system users with their details</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                         </button>
//                         <button className="btn btn-outline-secondary btn-sm">
//                           <i className="fas fa-filter me-1"></i> Filter
//                         </button>
//                         <button className="btn btn-outline-primary btn-sm">
//                           <i className="fas fa-download me-1"></i> Export
//                         </button>
//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={() => setShowAddUserModal(true)}
//                         >
//                           <i className="fas fa-plus me-1"></i> New User
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       <div className="table-responsive">
//                         <table className="table table-hover">
//                           <thead className="table-light">
//                             <tr>
//                               <th>Name</th>
//                               <th>Phone Number</th>
//                               <th>Department</th>
//                               <th>Project Name</th>
//                               <th>Role</th>
//                               <th>Status</th>
//                               <th>Actions</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {filteredAndSortedUsers.map((user, index) => (
//                               <tr key={index}>
//                                 <td>
//                                   <div className="d-flex align-items-center">
//                                     <div
//                                       className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
//                                       style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}
//                                     >
//                                       {user.name.charAt(0)}
//                                     </div>
//                                     <div>
//                                       <div className="fw-semibold">{user.name}</div>
//                                       <small className="text-muted">{user.email}</small>
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <span className="text-muted">{user.phone || 'Not provided'}</span>
//                                 </td>
//                                 <td>
//                                   <div>
//                                     <div className="fw-medium">{user.department}</div>
//                                     <small className="text-muted">{user.role}</small>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   {user.assignedProject ? (
//                                     <div>
//                                       <div className="fw-medium text-primary">{user.assignedProject}</div>
//                                       <small className="text-muted">Active Project</small>
//                                     </div>
//                                   ) : (
//                                     <div>
//                                       <span className="badge bg-danger">Not Assigned</span>
//                                       <div><small className="text-muted">No Active Project</small></div>
//                                     </div>
//                                   )}
//                                 </td>
//                                 <td>
//                                   <small className="text-muted">{user.role}</small>
//                                 </td>
//                                 <td>
//                                   <span className={`badge ${user.assignedProject ? 'bg-danger' : 'bg-success'
//                                     }`}>
//                                     {user.assignedProject ? 'Assigned' : 'Not Assigned'}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   <div className="btn-group" role="group">
//                                     <button
//                                       className="btn btn-sm btn-outline-info"
//                                       onClick={() => alert(`User Details:\n\nID: ${user.id || `EMP${String(index + 1).padStart(3, '0')}`}\nName: ${user.name}\nDepartment: ${user.department}\nRole: ${user.role}\nEmail: ${user.email}\nProject: ${user.assignedProject || 'No project assigned'}\nStatus: ${user.assignedProject ? 'Assigned' : 'Not Assigned'}\nJoin Date: ${user.joinDate}`)}
//                                       title="View User Details"
//                                     >
//                                       <i className="fas fa-eye"></i>
//                                     </button>
//                                     <button
//                                       className="btn btn-sm btn-outline-primary"
//                                       onClick={() => handleEditUser(user)}
//                                       title="Edit User"
//                                     >
//                                       <i className="fas fa-edit"></i>
//                                     </button>
//                                     <button
//                                       className="btn btn-sm btn-outline-danger"
//                                       onClick={() => handleDeleteUser(user.id || user._id || `EMP${String(index + 1).padStart(3, '0')}`, user.name)}
//                                       title="Delete User"
//                                     >
//                                       <i className="fas fa-trash"></i>
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                       <div className="text-center mt-3">
//                         <small className="text-muted">
//                           Showing {allUsers.length} users • Total Active: {allUsers.filter(u => u.status === 'Active').length} •
//                           Assigned to Projects: {allUsers.filter(u => u.projectStatus === 'Assigned').length}
//                         </small>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Active Projects View */}
//                 {(currentRole === 'admin' || currentRole === 'project-manager') && activeView === 'projects' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <div>
//                         <h5 className="card-title mb-0">Active Projects</h5>
//                         <small className="text-muted">Manage and track project progress</small>
//                       </div>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                         </button>
//                         <button className="btn btn-outline-secondary btn-sm">
//                           <i className="fas fa-filter me-1"></i> Filter
//                         </button>
//                         <button
//                           className="btn btn-primary btn-sm"
//                           onClick={handleOpenAddProjectModal}
//                         >
//                           <i className="fas fa-plus me-1"></i> New Project
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       <div className="table-responsive">
//                         <table className="table table-hover">
//                           <thead className="table-light">
//                             <tr>
//                               <th>Name</th>
//                               <th>Project Manager</th>
//                               <th>Progress</th>
//                               <th>Status</th>
//                               <th>Start Date</th>
//                               <th>End Date</th>
//                               <th>Assigned To</th>
//                               <th>Actions</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {loadingProjects ? (
//                               <tr>
//                                 <td colSpan="8" className="text-center py-4">
//                                   <div className="spinner-border text-primary" role="status">
//                                     <span className="visually-hidden">Loading...</span>
//                                   </div>
//                                   <div className="mt-2">Loading projects...</div>
//                                 </td>
//                               </tr>
//                             ) : projects.length === 0 ? (
//                               <tr>
//                                 <td colSpan="8" className="text-center py-4 text-muted">
//                                   No projects found. Click "New Project" to add one.
//                                 </td>
//                               </tr>
//                             ) : projects.map((project, index) => (
//                               <tr key={index}>
//                                 <td>
//                                   <div>
//                                     <div className="fw-semibold">{project.name}</div>
//                                     <small className="text-muted">{project.clientName || 'No client specified'}</small>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <div className="d-flex align-items-center">
//                                     <div
//                                       className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
//                                       style={{ width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold' }}
//                                       title={project.projectManager || 'No manager assigned'}
//                                     >
//                                       {project.projectManager ? project.projectManager.charAt(0).toUpperCase() : '?'}
//                                     </div>
//                                     <div>
//                                       <div className="fw-semibold" style={{ fontSize: '14px' }}>
//                                         {project.projectManager || 'Not Assigned'}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <div className="d-flex align-items-center">
//                                     <span className="me-2">{project.progress}%</span>
//                                     <div className="progress" style={{ width: '80px', height: '6px' }}>
//                                       <div
//                                         className={`progress-bar ${project.progress === 100 ? 'bg-success' :
//                                           project.progress >= 70 ? 'bg-primary' :
//                                             project.progress >= 40 ? 'bg-warning' : 'bg-danger'
//                                           }`}
//                                         role="progressbar"
//                                         style={{ width: `${project.progress}%` }}
//                                       ></div>
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <span className={`badge ${project.status === 'Completed' ? 'bg-success' :
//                                     project.status === 'On Track' ? 'bg-primary' :
//                                       project.status === 'At Risk' ? 'bg-warning' : 'bg-danger'
//                                     }`}>
//                                     {project.status}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   <small className="text-muted">
//                                     {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', {
//                                       month: 'short',
//                                       day: 'numeric',
//                                       year: 'numeric'
//                                     }) : 'Not set'}
//                                   </small>
//                                 </td>
//                                 <td>
//                                   <small className="text-muted">
//                                     {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', {
//                                       month: 'short',
//                                       day: 'numeric',
//                                       year: 'numeric'
//                                     }) : 'Not set'}
//                                   </small>
//                                 </td>
//                                 <td>
//                                   <div className="d-flex align-items-center">
//                                     {project.assigned && project.assigned.length > 0 ? (
//                                       <>
//                                         {project.assigned.slice(0, 3).map((person, idx) => (
//                                           <div
//                                             key={idx}
//                                             className={`rounded-circle text-white d-flex align-items-center justify-content-center me-1 ${person.color}`}
//                                             style={{ width: '28px', height: '28px', fontSize: '11px', fontWeight: 'bold', marginLeft: idx > 0 ? '-6px' : '0' }}
//                                             title={person.name}
//                                           >
//                                             {person.name.charAt(0)}
//                                           </div>
//                                         ))}
//                                         {project.assigned.length > 3 && (
//                                           <div
//                                             className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
//                                             style={{ width: '28px', height: '28px', fontSize: '11px', fontWeight: 'bold', marginLeft: '-6px' }}
//                                             title={`+${project.assigned.length - 3} more members`}
//                                           >
//                                             +{project.assigned.length - 3}
//                                           </div>
//                                         )}
//                                       </>
//                                     ) : (
//                                       <small className="text-muted">No members assigned</small>
//                                     )}
//                                   </div>
//                                 </td>
//                                 <td>
//                                   <div className="btn-group" role="group">
//                                     <button
//                                       className="btn btn-sm btn-outline-info"
//                                       onClick={() => handleViewProject(project)}
//                                       title="View Project Details"
//                                     >
//                                       <i className="fas fa-eye"></i>
//                                     </button>
//                                     <button
//                                       className="btn btn-sm btn-outline-primary"
//                                       onClick={() => handleEditProject(project)}
//                                       title="Edit Project"
//                                     >
//                                       <i className="fas fa-edit"></i>
//                                     </button>
//                                     <button
//                                       className="btn btn-sm btn-outline-danger"
//                                       onClick={() => handleDeleteProject(project.id, project.name)}
//                                       title="Delete Project"
//                                     >
//                                       <i className="fas fa-trash"></i>
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                       <div className="text-center mt-3">
//                         <a href="#" className="text-decoration-none text-primary">
//                           <i className="fas fa-arrow-right me-1"></i>
//                           View All Projects
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Recent Activity Detail View */}
//                 {currentRole === 'admin' && activeView === 'recent-activity' && (
//                   <div className="card mb-4">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                       <h5 className="card-title mb-0">Recent Activity</h5>
//                       <div className="d-flex gap-2">
//                         <button
//                           className="btn btn-sm btn-outline-secondary"
//                           onClick={() => setRecentActivities([])}
//                         >
//                           <i className="fas fa-trash me-1"></i>Clear All
//                         </button>
//                         <button
//                           className="btn btn-sm btn-primary"
//                           onClick={() => setActiveView('dashboard')}
//                         >
//                           <i className="fas fa-arrow-left me-1"></i>Back to Dashboard
//                         </button>
//                       </div>
//                     </div>
//                     <div className="card-body">
//                       {recentActivities.length > 0 ? (
//                         <div className="activity-timeline">
//                           {recentActivities.map((activity, index) => (
//                             <div key={activity.id} className="activity-item d-flex align-items-start mb-4 pb-4 border-bottom">
//                               <div className={`activity-icon me-3 rounded-circle d-flex align-items-center justify-content-center ${activity.iconBg || 'bg-primary'}`} style={{ width: '40px', height: '40px', minWidth: '40px' }}>
//                                 <i className={`fas ${activity.icon || 'fa-bell'} text-white`}></i>
//                               </div>
//                               <div className="activity-content flex-grow-1">
//                                 <div className="d-flex justify-content-between align-items-start">
//                                   <div>
//                                     <h6 className="mb-1">{activity.title}</h6>
//                                     <p className="text-muted mb-2">{activity.description}</p>
//                                     {activity.details && (
//                                       <div className="small text-muted">
//                                         {activity.details}
//                                       </div>
//                                     )}
//                                   </div>
//                                   <small className="text-muted">{activity.timeAgo}</small>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <div className="text-center py-5">
//                           <i className="fas fa-clock fa-4x text-muted mb-3"></i>
//                           <h5 className="text-muted">No Recent Activity</h5>
//                           <p className="text-muted">Activity will appear here as you use the system</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* Revenue View */}
//                 {currentRole === 'admin' && activeView === 'revenue' && (
//                   <div className="card mb-4">
//                     <div className="card-header">
//                       <h5 className="card-title mb-0">Revenue Analytics</h5>
//                     </div>
//                     <div className="card-body">
//                       {/* Employee Stats - Only show if employees exist */}
//                       {employees.length > 0 && (
//                         <div className="row mb-4">
//                           <div className="col-md-3">
//                             <div className="card bg-primary text-white">
//                               <div className="card-body text-center">
//                                 <h3>{getEmployeesByRole('project-manager').length}</h3>
//                                 <p className="mb-0">Project Managers</p>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="col-md-3">
//                             <div className="card bg-info text-white">
//                               <div className="card-body text-center">
//                                 <h3>{getEmployeesByRole('team-leader').length}</h3>
//                                 <p className="mb-0">Team Leaders</p>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="col-md-3">
//                             <div className="card bg-success text-white">
//                               <div className="card-body text-center">
//                                 <h3>{getEmployeesByRole('employee').length + getEmployeesByRole('intern').length}</h3>
//                                 <p className="mb-0">Employees</p>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="col-md-3">
//                             <div className="card bg-secondary text-white">
//                               <div className="card-body text-center">
//                                 <h3>{employees.length}</h3>
//                                 <p className="mb-0">Total Staff</p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                       <div className="row">
//                         <div className="col-md-4">
//                           <div className="card bg-light border-0">
//                             <div className="card-body text-center">
//                               <h3 className="text-success mb-1">$124,592.00</h3>
//                               <p className="text-muted mb-2">Total Revenue</p>
//                               <small className="text-success">
//                                 <i className="fas fa-arrow-up me-1"></i>
//                                 +12.5% from last month
//                               </small>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="col-md-4">
//                           <div className="card bg-light border-0">
//                             <div className="card-body text-center">
//                               <h3 className="text-primary mb-1">$89,432.00</h3>
//                               <p className="text-muted mb-2">This Month</p>
//                               <small className="text-primary">
//                                 <i className="fas fa-arrow-up me-1"></i>
//                                 +8.2% from last month
//                               </small>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="col-md-4">
//                           <div className="card bg-light border-0">
//                             <div className="card-body text-center">
//                               <h3 className="text-warning mb-1">$35,160.00</h3>
//                               <p className="text-muted mb-2">Pending</p>
//                               <small className="text-warning">
//                                 <i className="fas fa-clock me-1"></i>
//                                 Awaiting payment
//                               </small>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Client Dashboard View */}
//                 {currentRole === 'admin' && activeView === 'client-dashboard' && (
//                   <div>
//                     {/* Back to Dashboard Button */}
//                     <div className="mb-3">
//                       <button
//                         className="btn btn-outline-primary"
//                         onClick={() => setActiveView('dashboard')}
//                       >
//                         <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//                       </button>
//                     </div>

//                     <div className="row">
//                       {/* Client Projects Table */}
//                       <div className="col-lg-12">
//                         <div className="card">
//                           <div className="card-header d-flex justify-content-between align-items-center">
//                             <h5 className="mb-0">Client Projects Overview</h5>
//                             <div className="d-flex align-items-center gap-2">
//                               <div className="position-relative">
//                                 <i className="fas fa-search position-absolute" style={{ left: '15px', top: '12px', color: '#6c757d' }}></i>
//                                 <input type="text" className="form-control" placeholder="Search projects..." style={{ paddingLeft: '40px', borderRadius: '50px', border: '1px solid #e2e8f0' }} />
//                               </div>

//                               {/* View Toggle Buttons */}
//                               <div className="btn-group" role="group">
//                                 <button
//                                   type="button"
//                                   className={`btn ${projectViewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                                   onClick={() => setProjectViewMode('card')}
//                                   title="Card View"
//                                 >
//                                   <i className="fas fa-th"></i>
//                                 </button>
//                                 <button
//                                   type="button"
//                                   className={`btn ${projectViewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                                   onClick={() => setProjectViewMode('list')}
//                                   title="List View"
//                                 >
//                                   <i className="fas fa-list"></i>
//                                 </button>
//                               </div>

//                               <button
//                                 className="btn btn-primary"
//                                 onClick={handleOpenAddProjectModal}
//                                 style={{ borderRadius: '50px', padding: '8px 20px' }}
//                               >
//                                 <i className="fas fa-plus me-1"></i> New Project
//                               </button>
//                             </div>
//                           </div>
//                           <div className="card-body">
//                             {/* Card View */}
//                             {projectViewMode === 'card' && (
//                               <div className="row">
//                                 {projects.map((project) => {
//                                   const getProjectStatusBadge = (status) => {
//                                     const statusConfig = {
//                                       'Completed': { bg: '#28a745', text: 'white', label: 'Completed' },
//                                       'On Track': { bg: '#007bff', text: 'white', label: 'On Track' },
//                                       'At Risk': { bg: '#ffc107', text: 'black', label: 'At Risk' },
//                                       'Delayed': { bg: '#dc3545', text: 'white', label: 'Delayed' }
//                                     };
//                                     const config = statusConfig[status] || statusConfig['On Track'];
//                                     return (
//                                       <span style={{
//                                         padding: '5px 10px',
//                                         borderRadius: '20px',
//                                         fontSize: '0.8rem',
//                                         fontWeight: '500',
//                                         backgroundColor: config.bg,
//                                         color: config.text
//                                       }}>
//                                         {config.label}
//                                       </span>
//                                     );
//                                   };

//                                   return (
//                                     <div key={project.id} className="col-md-6 col-lg-4 mb-4">
//                                       <div className="card h-100 border shadow-sm">
//                                         <div className="card-body">
//                                           <div className="d-flex justify-content-between align-items-start mb-3">
//                                             <div>
//                                               <h6 className="card-title text-primary mb-1">{project.name}</h6>
//                                               <small className="text-muted">Started: {project.date}</small>
//                                             </div>
//                                             {getProjectStatusBadge(project.status)}
//                                           </div>

//                                           <div className="mb-3">
//                                             <div className="d-flex align-items-center mb-2">
//                                               <i className="fas fa-user-tie text-primary me-2"></i>
//                                               <div>
//                                                 <small className="text-muted d-block">Client</small>
//                                                 <span className="fw-semibold">{project.clientName || 'N/A'}</span>
//                                               </div>
//                                             </div>
//                                             <div className="d-flex align-items-center mb-2">
//                                               <i className="fas fa-user-cog text-secondary me-2"></i>
//                                               <div>
//                                                 <small className="text-muted d-block">Manager</small>
//                                                 <span>{project.projectManager || 'Not Assigned'}</span>
//                                               </div>
//                                             </div>
//                                           </div>

//                                           <div className="mb-3">
//                                             <div className="d-flex justify-content-between mb-2">
//                                               <span className="text-muted">Project Cost:</span>
//                                               <span className="fw-bold text-success">${project.projectCost ? project.projectCost.toLocaleString() : '0'}</span>
//                                             </div>
//                                             <div className="d-flex justify-content-between">
//                                               <span className="text-muted">Advance Payment:</span>
//                                               <span className="fw-bold text-info">${project.advancePayment ? project.advancePayment.toLocaleString() : '0'}</span>
//                                             </div>
//                                           </div>

//                                           <div className="d-flex gap-2">
//                                             <button
//                                               className="btn btn-sm btn-outline-primary flex-fill"
//                                               onClick={() => handleViewProject(project)}
//                                             >
//                                               <i className="fas fa-file-alt me-1"></i>
//                                               Report
//                                             </button>
//                                             <button
//                                               className="btn btn-sm btn-outline-secondary"
//                                               onClick={() => handleEditProject(project)}
//                                               title="Edit Project"
//                                             >
//                                               <i className="fas fa-edit"></i>
//                                             </button>
//                                             <button
//                                               className="btn btn-sm btn-outline-danger"
//                                               onClick={() => handleDeleteProject(project.id, project.name)}
//                                               title="Delete Project"
//                                             >
//                                               <i className="fas fa-trash"></i>
//                                             </button>
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             )}

//                             {/* List View */}
//                             {projectViewMode === 'list' && (
//                               <div className="table-responsive">
//                                 <table className="table table-hover">
//                                   <thead>
//                                     <tr>
//                                       <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Client Name</th>
//                                       <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Name</th>
//                                       <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Manager</th>
//                                       <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Cost</th>
//                                       <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Advance Payment</th>
//                                       <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Status</th>
//                                       <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Report</th>
//                                       <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Actions</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {projects.map((project) => {
//                                       const getProjectStatusBadge = (status) => {
//                                         const statusConfig = {
//                                           'Completed': { bg: '#28a745', text: 'white', label: 'Completed' },
//                                           'On Track': { bg: '#007bff', text: 'white', label: 'On Track' },
//                                           'At Risk': { bg: '#ffc107', text: 'black', label: 'At Risk' },
//                                           'Delayed': { bg: '#dc3545', text: 'white', label: 'Delayed' }
//                                         };
//                                         const config = statusConfig[status] || statusConfig['On Track'];
//                                         return (
//                                           <span style={{
//                                             padding: '5px 10px',
//                                             borderRadius: '20px',
//                                             fontSize: '0.8rem',
//                                             fontWeight: '500',
//                                             backgroundColor: config.bg,
//                                             color: config.text
//                                           }}>
//                                             {config.label}
//                                           </span>
//                                         );
//                                       };

//                                       return (
//                                         <tr key={project.id}>
//                                           <td>
//                                             <div className="d-flex align-items-center">
//                                               <div className="me-3">
//                                                 <i className="fas fa-user-tie text-primary p-2 rounded-circle" style={{ backgroundColor: 'rgba(67, 97, 238, 0.1)' }}></i>
//                                               </div>
//                                               <div>
//                                                 <div className="fw-semibold">{project.clientName || 'N/A'}</div>
//                                                 <small className="text-muted">Client</small>
//                                               </div>
//                                             </div>
//                                           </td>
//                                           <td>
//                                             <div className="fw-semibold text-primary">{project.name}</div>
//                                             <small className="text-muted">Started: {project.date}</small>
//                                           </td>
//                                           <td>
//                                             <div className="fw-semibold">{project.projectManager || 'Not Assigned'}</div>
//                                             <small className="text-muted">Manager</small>
//                                           </td>
//                                           <td>
//                                             <div className="fw-bold text-success">${project.projectCost ? project.projectCost.toLocaleString() : '0'}</div>
//                                             <small className="text-muted">Total Cost</small>
//                                           </td>
//                                           <td>
//                                             <div className="fw-bold text-info">${project.advancePayment ? project.advancePayment.toLocaleString() : '0'}</div>
//                                             <small className="text-muted">Paid in Advance</small>
//                                           </td>
//                                           <td>{getProjectStatusBadge(project.status)}</td>
//                                           <td>
//                                             <button
//                                               className="btn btn-sm btn-outline-primary"
//                                               onClick={() => handleViewProject(project)}
//                                             >
//                                               <i className="fas fa-file-alt me-1"></i>
//                                               View Report
//                                             </button>
//                                           </td>
//                                           <td>
//                                             <div className="d-flex gap-1">
//                                               <button
//                                                 className="btn btn-sm btn-outline-primary"
//                                                 onClick={() => handleEditProject(project)}
//                                                 title="Edit Project"
//                                               >
//                                                 <i className="fas fa-edit"></i>
//                                               </button>
//                                               <button
//                                                 className="btn btn-sm btn-outline-danger"
//                                                 onClick={() => handleDeleteProject(project.id, project.name)}
//                                                 title="Delete Project"
//                                               >
//                                                 <i className="fas fa-trash"></i>
//                                               </button>
//                                             </div>
//                                           </td>
//                                         </tr>
//                                       );
//                                     })}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {/* Clients Overview View */}
//                 {currentRole === 'admin' && activeView === 'clients-overview' && (
//                   <div>
//                     {/* Clients Overview Header */}
//                     <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', color: 'white', borderRadius: '0 0 20px 20px' }}>
//                       <div className="card-body py-4">
//                         <div className="row align-items-center">
//                           <div className="col-md-6">
//                             <h3 className="mb-1">Clients Overview</h3>
//                             <p className="mb-0 opacity-75">Track client projects, payments, and progress</p>
//                           </div>
//                           <div className="col-md-6 text-md-end mt-3 mt-md-0">
//                             <button className="btn btn-light me-2">
//                               <i className="fas fa-download me-1"></i> Export Report
//                             </button>
//                             <button
//                               className="btn btn-light"
//                               onClick={handleOpenAddProjectModal}
//                             >
//                               <i className="fas fa-plus me-1"></i> New Project
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="row">
//                       {/* Clients Projects Table */}
//                       <div className="col-12">
//                         <div className="card">
//                           <div className="card-header d-flex justify-content-between align-items-center">
//                             <h5 className="mb-0">Client Projects Data</h5>
//                             <div className="d-flex">
//                               <div className="position-relative me-2">
//                                 <i className="fas fa-search position-absolute" style={{ left: '15px', top: '12px', color: '#6c757d' }}></i>
//                                 <input type="text" className="form-control" placeholder="Search clients..." style={{ paddingLeft: '40px', borderRadius: '50px', border: '1px solid #e2e8f0' }} />
//                               </div>
//                               <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '8px 20px', color: '#6c757d' }}>
//                                 <i className="fas fa-filter me-1"></i> Filter
//                               </button>
//                             </div>
//                           </div>
//                           <div className="card-body">
//                             <div className="table-responsive">
//                               <table className="table table-hover">
//                                 <thead>
//                                   <tr>
//                                     <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Client Name</th>
//                                     <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Name</th>
//                                     <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Manager</th>
//                                     <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Cost</th>
//                                     <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Advance Payment</th>
//                                     <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Status</th>
//                                     <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project Report</th>
//                                     <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Actions</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {projects.map((project) => {
//                                     const getProjectStatusBadge = (status) => {
//                                       const statusConfig = {
//                                         'Completed': { bg: '#28a745', text: 'white', label: 'Completed' },
//                                         'On Track': { bg: '#007bff', text: 'white', label: 'On Track' },
//                                         'At Risk': { bg: '#ffc107', text: 'black', label: 'At Risk' },
//                                         'Delayed': { bg: '#dc3545', text: 'white', label: 'Delayed' }
//                                       };
//                                       const config = statusConfig[status] || statusConfig['On Track'];
//                                       return (
//                                         <span style={{
//                                           padding: '5px 10px',
//                                           borderRadius: '20px',
//                                           fontSize: '0.8rem',
//                                           fontWeight: '500',
//                                           backgroundColor: config.bg,
//                                           color: config.text
//                                         }}>
//                                           {config.label}
//                                         </span>
//                                       );
//                                     };

//                                     return (
//                                       <tr key={project.id}>
//                                         <td>
//                                           <div className="d-flex align-items-center">
//                                             <div className="me-3">
//                                               <i className="fas fa-user-tie text-primary p-2 rounded-circle" style={{ backgroundColor: 'rgba(67, 97, 238, 0.1)' }}></i>
//                                             </div>
//                                             <div>
//                                               <div className="fw-semibold">{project.clientName || 'N/A'}</div>
//                                               <small className="text-muted">Client</small>
//                                             </div>
//                                           </div>
//                                         </td>
//                                         <td>
//                                           <div className="fw-semibold text-primary">{project.name}</div>
//                                           <small className="text-muted">Started: {project.date}</small>
//                                         </td>
//                                         <td>
//                                           <div className="fw-semibold">{project.projectManager || 'Not Assigned'}</div>
//                                           <small className="text-muted">Manager</small>
//                                         </td>
//                                         <td>
//                                           <div className="fw-bold text-success">${project.projectCost ? project.projectCost.toLocaleString() : '0'}</div>
//                                           <small className="text-muted">Total Cost</small>
//                                         </td>
//                                         <td>
//                                           <div className="fw-bold text-info">${project.advancePayment ? project.advancePayment.toLocaleString() : '0'}</div>
//                                           <small className="text-muted">Paid in Advance</small>
//                                         </td>
//                                         <td>{getProjectStatusBadge(project.status)}</td>
//                                         <td>
//                                           <button
//                                             className="btn btn-sm btn-outline-primary"
//                                             onClick={() => handleViewProject(project)}
//                                           >
//                                             <i className="fas fa-file-alt me-1"></i>
//                                             View Report
//                                           </button>
//                                         </td>
//                                         <td>
//                                           <div className="d-flex gap-1">
//                                             <button
//                                               className="btn btn-sm btn-outline-primary"
//                                               onClick={() => handleEditProject(project)}
//                                               title="Edit Project"
//                                             >
//                                               <i className="fas fa-edit"></i>
//                                             </button>
//                                             <button
//                                               className="btn btn-sm btn-outline-danger"
//                                               onClick={() => handleDeleteProject(project.id, project.name)}
//                                               title="Delete Project"
//                                             >
//                                               <i className="fas fa-trash"></i>
//                                             </button>
//                                           </div>
//                                         </td>
//                                       </tr>
//                                     );
//                                   })}
//                                   {projects.length === 0 && (
//                                     <tr>
//                                       <td colSpan="8" className="text-center py-4">
//                                         <div className="text-muted">
//                                           <i className="fas fa-inbox fa-2x mb-2"></i>
//                                           <p>No client projects found. Add a new project to get started.</p>
//                                         </div>
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Points Scheme View */}
//                 {currentRole === 'admin' && activeView === 'points-scheme' && (
//                   <>
//                     {/* Summary Section */}
//                     <div className="row mb-4">
//                       <div className="col-12">
//                         <div className="card bg-light">
//                           <div className="card-body">
//                             <h6 className="card-title">Points Summary</h6>
//                             <div className="row text-center">
//                               <div className="col-md-3">
//                                 <h4 className="text-primary">{pointsSchemes.filter(s => s.category === 'Attendance').length}</h4>
//                                 <small className="text-muted">Attendance Schemes</small>
//                               </div>
//                               <div className="col-md-3">
//                                 <h4 className="text-success">{pointsSchemes.filter(s => s.category === 'Performance').length}</h4>
//                                 <small className="text-muted">Performance Schemes</small>
//                               </div>
//                               <div className="col-md-3">
//                                 <h4 className="text-info">{pointsSchemes.filter(s => s.category === 'Business').length}</h4>
//                                 <small className="text-muted">Business Schemes</small>
//                               </div>
//                               <div className="col-md-3">
//                                 <h4 className="text-warning">{pointsSchemes.reduce((sum, s) => sum + s.points, 0)}</h4>
//                                 <small className="text-muted">Total Points Available</small>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="card mb-4">
//                       <div className="card-header d-flex justify-content-between align-items-center">
//                         <div>
//                           <h5 className="card-title mb-0">Points Scheme Configuration</h5>
//                           <small className="text-muted">Configure how many points employees earn for each activity</small>
//                         </div>
//                         <div className="d-flex gap-2">
//                           <button
//                             className="btn btn-secondary btn-sm"
//                             onClick={() => setActiveView('dashboard')}
//                           >
//                             <i className="fas fa-arrow-left me-1"></i> Back to Dashboard
//                           </button>
//                           <button className="btn btn-primary" onClick={handleAddPointsScheme}>
//                             <i className="fas fa-plus me-2"></i>
//                             Add New Point Scheme
//                           </button>
//                         </div>
//                       </div>
//                       <div className="card-body">
//                         <div className="row">
//                           {pointsSchemes.map((scheme, index) => (
//                             <div key={index} className="col-md-6 col-lg-4 mb-4">
//                               <div className="card border">
//                                 <div className="card-body">
//                                   <div className="d-flex justify-content-between align-items-start mb-2">
//                                     <h6 className="card-title mb-0">{scheme.name}</h6>
//                                     <span className="badge bg-primary">{scheme.points} pts</span>
//                                   </div>
//                                   <p className="text-muted small mb-2">{scheme.description}</p>
//                                   <div className="d-flex justify-content-between align-items-center">
//                                     <span className="badge bg-light text-dark">{scheme.category}</span>
//                                     <div className="dropdown">
//                                       <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
//                                         <i className="fas fa-ellipsis-v"></i>
//                                       </button>
//                                       <ul className="dropdown-menu">
//                                         <li>
//                                           <a
//                                             className="dropdown-item"
//                                             href="#"
//                                             onClick={(e) => {
//                                               e.preventDefault();
//                                               handleEditPointsScheme(scheme);
//                                             }}
//                                           >
//                                             <i className="fas fa-edit me-2"></i>Edit
//                                           </a>
//                                         </li>
//                                         <li>
//                                           <a
//                                             className="dropdown-item text-danger"
//                                             href="#"
//                                             onClick={(e) => {
//                                               e.preventDefault();
//                                               handleDeletePointsScheme(scheme.id);
//                                             }}
//                                           >
//                                             <i className="fas fa-trash me-2"></i>Delete
//                                           </a>
//                                         </li>
//                                       </ul>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {/* Back to Dashboard Button */}
//                 {currentRole === 'admin' && activeView !== 'dashboard' && (
//                   <div className="mb-3">
//                     <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
//                       <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//                     </button>
//                   </div>
//                 )}

//                 {/* All Tasks View for Project Manager */}
//                 {currentRole === 'project-manager' && activeView === 'all-tasks' && (
//                   <div>
//                     <div className="mb-3">
//                       <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
//                         <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//                       </button>
//                     </div>

//                     <div className="card">
//                       <div className="card-header d-flex justify-content-between align-items-center">
//                         <h5 className="card-title mb-0">
//                           <i className="fas fa-tasks me-2"></i>All Tasks Overview
//                         </h5>
//                         <div className="d-flex align-items-center gap-2">
//                           <span className="badge bg-primary">{assignedTasks.length} Total Tasks</span>
//                           <button
//                             className="btn btn-success btn-sm"
//                             onClick={() => setShowAddTaskModal(true)}
//                           >
//                             <i className="fas fa-plus me-1"></i> Create Task
//                           </button>
//                         </div>
//                       </div>
//                       <div className="card-body">
//                         {/* Filter Tabs */}
//                         <div className="d-flex justify-content-between align-items-center mb-3">
//                           <h6 className="mb-0">Recent Tasks</h6>
//                           <div className="btn-group" role="group">
//                             <button
//                               type="button"
//                               className={`btn btn-sm ${taskFilterTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                               onClick={() => setTaskFilterTab('all')}
//                             >
//                               All
//                             </button>
//                             <button
//                               type="button"
//                               className={`btn btn-sm ${taskFilterTab === 'assigned' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                               onClick={() => setTaskFilterTab('assigned')}
//                             >
//                               Assigned
//                             </button>
//                             <button
//                               type="button"
//                               className={`btn btn-sm ${taskFilterTab === 'completed' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                               onClick={() => setTaskFilterTab('completed')}
//                             >
//                               Completed
//                             </button>
//                           </div>
//                         </div>

//                         {/* Tasks Table */}
//                         <div className="table-responsive">
//                           <table className="table table-hover">
//                             <thead style={{ backgroundColor: '#f8f9fa' }}>
//                               <tr>
//                                 <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Task Name</th>
//                                 <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Assignee</th>
//                                 <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project</th>
//                                 <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Priority</th>
//                                 <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Due Date</th>
//                                 <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Status</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {(() => {
//                                 let filteredTasks = assignedTasks;

//                                 if (taskFilterTab === 'assigned') {
//                                   filteredTasks = filteredTasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
//                                 } else if (taskFilterTab === 'completed') {
//                                   filteredTasks = filteredTasks.filter(t => t.status === 'completed');
//                                 }

//                                 if (filteredTasks.length === 0) {
//                                   return (
//                                     <tr>
//                                       <td colSpan="6" className="text-center py-4">
//                                         <div className="text-muted">
//                                           <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
//                                           <p className="mb-0">No tasks found</p>
//                                           <button
//                                             className="btn btn-sm btn-primary mt-2"
//                                             onClick={() => setShowAddTaskModal(true)}
//                                           >
//                                             <i className="fas fa-plus me-1"></i>Create First Task
//                                           </button>
//                                         </div>
//                                       </td>
//                                     </tr>
//                                   );
//                                 }

//                                 return filteredTasks.map((task, index) => (
//                                   <tr key={index}>
//                                     <td>
//                                       <div>
//                                         <div className="fw-semibold">{task.title}</div>
//                                         <small className="text-muted">{task.description?.substring(0, 50)}{task.description?.length > 50 ? '...' : ''}</small>
//                                       </div>
//                                     </td>
//                                     <td>
//                                       <div className="d-flex align-items-center">
//                                         <div
//                                           className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
//                                           style={{ width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold' }}
//                                         >
//                                           {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
//                                         </div>
//                                         <div>
//                                           <div className="fw-semibold small">{task.assignedTo || 'Unassigned'}</div>
//                                         </div>
//                                       </div>
//                                     </td>
//                                     <td>
//                                       <div className="fw-semibold text-primary small">{task.projectName || task.project}</div>
//                                     </td>
//                                     <td>
//                                       <span style={{
//                                         padding: '4px 12px',
//                                         borderRadius: '20px',
//                                         fontSize: '0.75rem',
//                                         fontWeight: '500',
//                                         backgroundColor: task.priority === 'high' ? '#dc3545' :
//                                           task.priority === 'medium' ? '#ffc107' : '#28a745',
//                                         color: task.priority === 'medium' ? '#000' : '#fff'
//                                       }}>
//                                         ● {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
//                                       </span>
//                                     </td>
//                                     <td>
//                                       <div className="fw-semibold small">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
//                                     </td>
//                                     <td>
//                                       <select
//                                         className="form-select form-select-sm"
//                                         value={task.status}
//                                         onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
//                                         style={{
//                                           width: 'auto',
//                                           fontSize: '0.75rem',
//                                           fontWeight: '500',
//                                           backgroundColor: task.status === 'completed' ? '#28a745' :
//                                             task.status === 'in-progress' ? '#007bff' : '#ffc107',
//                                           color: '#fff',
//                                           border: 'none',
//                                           borderRadius: '20px',
//                                           padding: '4px 12px'
//                                         }}
//                                       >
//                                         <option value="pending" style={{ backgroundColor: '#fff', color: '#000' }}>Pending</option>
//                                         <option value="in-progress" style={{ backgroundColor: '#fff', color: '#000' }}>In Progress</option>
//                                         <option value="completed" style={{ backgroundColor: '#fff', color: '#000' }}>Completed</option>
//                                       </select>
//                                     </td>
//                                   </tr>
//                                 ));
//                               })()}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Assigned Tasks View for Employee */}
//                 {(currentRole === 'employee' || currentRole === 'intern') && activeView === 'assigned-tasks' && (
//                   <div>
//                     <div className="mb-3">
//                       <button className="btn btn-outline-primary" onClick={() => setActiveView('dashboard')}>
//                         <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//                       </button>
//                     </div>

//                     <div className="card">
//                       <div className="card-header d-flex justify-content-between align-items-center">
//                         <h5 className="card-title mb-0">
//                           <i className="fas fa-tasks me-2"></i>All Assigned Tasks
//                         </h5>
//                         <div className="d-flex align-items-center gap-2">
//                           <span className="badge bg-primary">{assignedTasks.length} Total Tasks</span>
//                           <button
//                             className="btn btn-primary btn-sm"
//                             onClick={() => setShowAddTaskModal(true)}
//                           >
//                             <i className="fas fa-plus me-1"></i> New Task
//                           </button>
//                         </div>
//                       </div>
//                       <div className="card-body">
//                         {/* Filter Tabs */}
//                         <ul className="nav nav-tabs mb-4" role="tablist">
//                           <li className="nav-item">
//                             <a className="nav-link active" data-bs-toggle="tab" href="#all-tasks">
//                               All ({assignedTasks.length})
//                             </a>
//                           </li>
//                           <li className="nav-item">
//                             <a className="nav-link" data-bs-toggle="tab" href="#pending-tasks">
//                               Pending ({assignedTasks.filter(t => t.status === 'pending').length})
//                             </a>
//                           </li>
//                           <li className="nav-item">
//                             <a className="nav-link" data-bs-toggle="tab" href="#inprogress-tasks">
//                               In Progress ({assignedTasks.filter(t => t.status === 'in-progress').length})
//                             </a>
//                           </li>
//                           <li className="nav-item">
//                             <a className="nav-link" data-bs-toggle="tab" href="#completed-tasks">
//                               Completed ({assignedTasks.filter(t => t.status === 'completed').length})
//                             </a>
//                           </li>
//                         </ul>

//                         {/* Tab Content */}
//                         <div className="tab-content">
//                           {/* All Tasks Tab */}
//                           <div id="all-tasks" className="tab-pane fade show active">
//                             <div className="row">
//                               {assignedTasks.map((task) => (
//                                 <div key={task.id} className="col-md-6 mb-4">
//                                   <div className="card h-100 shadow-sm">
//                                     <div className="card-body">
//                                       <div className="d-flex justify-content-between align-items-start mb-2">
//                                         <h5 className="card-title mb-0">{task.title}</h5>
//                                         <span className={`badge ${task.priority === 'urgent' ? 'bg-danger' :
//                                           task.priority === 'high' ? 'bg-warning' :
//                                             task.priority === 'medium' ? 'bg-info' : 'bg-secondary'
//                                           }`}>
//                                           {task.priority.toUpperCase()}
//                                         </span>
//                                       </div>
//                                       <p className="text-muted small mb-2">
//                                         <i className="fas fa-project-diagram me-1"></i>{task.project}
//                                       </p>
//                                       <p className="card-text">{task.description}</p>
//                                       <div className="mb-3">
//                                         <span className={`badge ${task.status === 'completed' ? 'bg-success' :
//                                           task.status === 'in-progress' ? 'bg-primary' : 'bg-warning'
//                                           }`}>
//                                           {task.status === 'in-progress' ? 'In Progress' :
//                                             task.status.charAt(0).toUpperCase() + task.status.slice(1)}
//                                         </span>
//                                       </div>
//                                       <div className="d-flex justify-content-between align-items-center text-muted small">
//                                         <div>
//                                           <i className="fas fa-user me-1"></i>
//                                           Assigned by: {task.assignedBy}
//                                         </div>
//                                         <div className={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-danger' : ''}>
//                                           <i className="fas fa-calendar me-1"></i>
//                                           Due: {new Date(task.dueDate).toLocaleDateString()}
//                                         </div>
//                                       </div>
//                                       <div className="mt-3 d-flex gap-2">
//                                         {task.status !== 'completed' && (
//                                           <>
//                                             <button className="btn btn-sm btn-primary">
//                                               <i className="fas fa-play me-1"></i>
//                                               {task.status === 'pending' ? 'Start Task' : 'Continue'}
//                                             </button>
//                                             <button className="btn btn-sm btn-success">
//                                               <i className="fas fa-check me-1"></i>Mark Complete
//                                             </button>
//                                           </>
//                                         )}
//                                         <button className="btn btn-sm btn-outline-secondary">
//                                           <i className="fas fa-eye me-1"></i>Details
//                                         </button>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                           {/* Pending Tasks Tab */}
//                           <div id="pending-tasks" className="tab-pane fade">
//                             <div className="row">
//                               {assignedTasks.filter(t => t.status === 'pending').map((task) => (
//                                 <div key={task.id} className="col-md-6 mb-4">
//                                   <div className="card h-100 shadow-sm">
//                                     <div className="card-body">
//                                       <div className="d-flex justify-content-between align-items-start mb-2">
//                                         <h5 className="card-title mb-0">{task.title}</h5>
//                                         <span className={`badge ${task.priority === 'urgent' ? 'bg-danger' :
//                                           task.priority === 'high' ? 'bg-warning' :
//                                             task.priority === 'medium' ? 'bg-info' : 'bg-secondary'
//                                           }`}>
//                                           {task.priority.toUpperCase()}
//                                         </span>
//                                       </div>
//                                       <p className="text-muted small mb-2">
//                                         <i className="fas fa-project-diagram me-1"></i>{task.project}
//                                       </p>
//                                       <p className="card-text">{task.description}</p>
//                                       <div className="d-flex justify-content-between align-items-center text-muted small">
//                                         <div>
//                                           <i className="fas fa-user me-1"></i>
//                                           Assigned by: {task.assignedBy}
//                                         </div>
//                                         <div className={new Date(task.dueDate) < new Date() ? 'text-danger' : ''}>
//                                           <i className="fas fa-calendar me-1"></i>
//                                           Due: {new Date(task.dueDate).toLocaleDateString()}
//                                         </div>
//                                       </div>
//                                       <div className="mt-3 d-flex gap-2">
//                                         <button className="btn btn-sm btn-primary">
//                                           <i className="fas fa-play me-1"></i>Start Task
//                                         </button>
//                                         <button className="btn btn-sm btn-outline-secondary">
//                                           <i className="fas fa-eye me-1"></i>Details
//                                         </button>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                           {/* In Progress Tasks Tab */}
//                           <div id="inprogress-tasks" className="tab-pane fade">
//                             <div className="row">
//                               {assignedTasks.filter(t => t.status === 'in-progress').map((task) => (
//                                 <div key={task.id} className="col-md-6 mb-4">
//                                   <div className="card h-100 shadow-sm border-primary">
//                                     <div className="card-body">
//                                       <div className="d-flex justify-content-between align-items-start mb-2">
//                                         <h5 className="card-title mb-0">{task.title}</h5>
//                                         <span className={`badge ${task.priority === 'urgent' ? 'bg-danger' :
//                                           task.priority === 'high' ? 'bg-warning' :
//                                             task.priority === 'medium' ? 'bg-info' : 'bg-secondary'
//                                           }`}>
//                                           {task.priority.toUpperCase()}
//                                         </span>
//                                       </div>
//                                       <p className="text-muted small mb-2">
//                                         <i className="fas fa-project-diagram me-1"></i>{task.project}
//                                       </p>
//                                       <p className="card-text">{task.description}</p>
//                                       <div className="d-flex justify-content-between align-items-center text-muted small">
//                                         <div>
//                                           <i className="fas fa-user me-1"></i>
//                                           Assigned by: {task.assignedBy}
//                                         </div>
//                                         <div className={new Date(task.dueDate) < new Date() ? 'text-danger' : ''}>
//                                           <i className="fas fa-calendar me-1"></i>
//                                           Due: {new Date(task.dueDate).toLocaleDateString()}
//                                         </div>
//                                       </div>
//                                       <div className="mt-3 d-flex gap-2">
//                                         <button className="btn btn-sm btn-primary">
//                                           <i className="fas fa-play me-1"></i>Continue
//                                         </button>
//                                         <button className="btn btn-sm btn-success">
//                                           <i className="fas fa-check me-1"></i>Mark Complete
//                                         </button>
//                                         <button className="btn btn-sm btn-outline-secondary">
//                                           <i className="fas fa-eye me-1"></i>Details
//                                         </button>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                           {/* Completed Tasks Tab */}
//                           <div id="completed-tasks" className="tab-pane fade">
//                             <div className="row">
//                               {assignedTasks.filter(t => t.status === 'completed').map((task) => (
//                                 <div key={task.id} className="col-md-6 mb-4">
//                                   <div className="card h-100 shadow-sm border-success">
//                                     <div className="card-body">
//                                       <div className="d-flex justify-content-between align-items-start mb-2">
//                                         <h5 className="card-title mb-0">{task.title}</h5>
//                                         <span className="badge bg-success">
//                                           <i className="fas fa-check me-1"></i>COMPLETED
//                                         </span>
//                                       </div>
//                                       <p className="text-muted small mb-2">
//                                         <i className="fas fa-project-diagram me-1"></i>{task.project}
//                                       </p>
//                                       <p className="card-text">{task.description}</p>
//                                       <div className="d-flex justify-content-between align-items-center text-muted small">
//                                         <div>
//                                           <i className="fas fa-user me-1"></i>
//                                           Assigned by: {task.assignedBy}
//                                         </div>
//                                         <div>
//                                           <i className="fas fa-calendar me-1"></i>
//                                           Completed: {new Date(task.dueDate).toLocaleDateString()}
//                                         </div>
//                                       </div>
//                                       <div className="mt-3">
//                                         <button className="btn btn-sm btn-outline-secondary">
//                                           <i className="fas fa-eye me-1"></i>View Details
//                                         </button>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                   </div>
//                 )}

//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* External JS (Bootstrap bundle) should be included in public/index.html */}

//       {showAddEmployeeModal && (
//         <AddEmployeeModal
//           show={showAddEmployeeModal}
//           onClose={() => setShowAddEmployeeModal(false)}
//           onSave={handleAddEmployee}
//         />
//       )}

//       {showAddPointsModal && (
//         <AddPointsSchemeModal
//           show={showAddPointsModal}
//           onClose={() => {
//             setShowAddPointsModal(false);
//             setEditingPointsScheme(null);
//           }}
//           editingScheme={editingPointsScheme}
//           onSave={handleSavePointsScheme}
//         />
//       )}

//       {showAddProjectModal && (
//         <AddProjectModal
//           show={showAddProjectModal}
//           onClose={() => {
//             setShowAddProjectModal(false);
//             setEditingProject(null);
//           }}
//           onSave={handleSaveProject}
//           editingProject={editingProject}
//           availableEmployees={[
//             ...allUsers,
//             ...teamLeaders.filter(tl => !allUsers.some(user => (user.id || user._id) === (tl.id || tl._id))),
//             ...projectManagers.filter(pm => !allUsers.some(user => (user.id || user._id) === (pm.id || pm._id)))
//           ]}
//           projectManagers={projectManagers}
//         />
//       )}

//       {showAddUserModal && (
//         <AddUserModal
//           show={showAddUserModal}
//           onClose={() => {
//             setShowAddUserModal(false);
//             setEditingUser(null);
//           }}
//           onSave={editingUser ? handleUpdateUser : handleAddUser}
//           editingUser={editingUser}
//           projects={projects}
//           teamLeaders={teamLeaders}
//         />
//       )}

//       {showAddTaskModal && (
//         <AddTaskModal
//           show={showAddTaskModal}
//           onClose={() => {
//             setShowAddTaskModal(false);
//             setEditingTask(null);
//           }}
//           onSave={editingTask ? handleUpdateTask : handleAddTask}
//           editingTask={editingTask}
//           allUsers={allUsers}
//           projects={projects}
//         />
//       )}

//       {/* Task Notes Modal */}
//       {showTaskNotesModal && selectedTaskForNotes && (
//         <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowTaskNotesModal(false)}>
//           <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   <i className="fas fa-comments me-2"></i>
//                   Task Discussion: {selectedTaskForNotes.title}
//                 </h5>
//                 <button type="button" className="btn-close" onClick={() => setShowTaskNotesModal(false)}></button>
//               </div>
//               <div className="modal-body">
//                 {/* Existing Notes */}
//                 <div className="mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                   {(taskDiscussions[selectedTaskForNotes.id || selectedTaskForNotes._id] || []).length === 0 ? (
//                     <div className="text-center text-muted py-4">
//                       <i className="fas fa-comments fa-2x mb-2"></i>
//                       <p>No discussion yet. Be the first to add a note!</p>
//                     </div>
//                   ) : (
//                     (taskDiscussions[selectedTaskForNotes.id || selectedTaskForNotes._id] || []).map((note, index) => (
//                       <div key={note.id} className="card mb-3">
//                         <div className="card-body p-3">
//                           <div className="d-flex justify-content-between align-items-start mb-2">
//                             <div className="d-flex align-items-center">
//                               <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
//                                 {note.author.charAt(0).toUpperCase()}
//                               </div>
//                               <div>
//                                 <div className="fw-bold">{note.author}</div>
//                                 <small className="text-muted">{note.authorRole}</small>
//                               </div>
//                             </div>
//                             <small className="text-muted">{new Date(note.timestamp).toLocaleString()}</small>
//                           </div>
//                           <p className="mb-0">{note.text}</p>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>

//                 {/* Add New Note */}
//                 <div className="border-top pt-3">
//                   <div className="mb-3">
//                     <label className="form-label fw-bold">Add a note:</label>
//                     <textarea
//                       className="form-control"
//                       rows="3"
//                       value={newNote}
//                       onChange={(e) => setNewNote(e.target.value)}
//                       placeholder="Type your note here..."
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-secondary" onClick={() => setShowTaskNotesModal(false)}>
//                   Close
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   onClick={handleAddNote}
//                   disabled={!newNote.trim()}
//                 >
//                   <i className="fas fa-plus me-1"></i>
//                   Add Note
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showAddProjectManagerModal && (
//         <AddProjectManagerModal
//           show={showAddProjectManagerModal}
//           onHide={() => {
//             setShowAddProjectManagerModal(false);
//             setEditingProjectManager(null);
//           }}
//           onSave={handleSaveProjectManager}
//           editingManager={editingProjectManager}
//         />
//       )}

//       {showAddTeamLeaderModal && (
//         <AddTeamLeaderModal
//           key={editingTeamLeader ? editingTeamLeader.id : 'new'}
//           show={showAddTeamLeaderModal}
//           onHide={() => {
//             setShowAddTeamLeaderModal(false);
//             setEditingTeamLeader(null);
//           }}
//           onSave={handleSaveTeamLeader}
//           editingLeader={editingTeamLeader}
//           employees={allUsers}
//         />
//       )}

//       {showAddRoleModal && (
//         <AddRoleModal
//           show={showAddRoleModal}
//           onHide={() => setShowAddRoleModal(false)}
//           onSave={handleAddCustomRole}
//         />
//       )}

//       {/* Task Assignment Modal */}
//       {showTaskAssignModal && (
//         <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog modal-lg">
//             <div className="modal-content">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">
//                   <i className="fas fa-tasks me-2"></i>
//                   Assign Task - {selectedProjectForTask?.name}
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close btn-close-white"
//                   onClick={() => {
//                     setShowTaskAssignModal(false);
//                     setSelectedProjectForTask(null);
//                   }}
//                 ></button>
//               </div>
//               <form onSubmit={(e) => {
//                 e.preventDefault();
//                 const formData = new FormData(e.target);
//                 const taskData = {
//                   title: formData.get('title'),
//                   description: formData.get('description'),
//                   projectId: selectedProjectForTask?.id,
//                   projectName: selectedProjectForTask?.name,
//                   assignedTo: formData.get('assignedTo'),
//                   dueDate: formData.get('dueDate'),
//                   priority: formData.get('priority'),
//                   estimatedHours: parseInt(formData.get('estimatedHours'))
//                 };
//                 handleTaskAssignment(taskData);
//                 setShowTaskAssignModal(false);
//                 setSelectedProjectForTask(null);
//               }}>
//                 <div className="modal-body">
//                   <div className="row">
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Task Title *</label>
//                       <input
//                         type="text"
//                         className="form-control"
//                         name="title"
//                         placeholder="e.g., Complete Admin UI Design"
//                         required
//                       />
//                     </div>
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Priority *</label>
//                       <select className="form-select" name="priority" required>
//                         <option value="">Select Priority</option>
//                         <option value="low">Low</option>
//                         <option value="medium">Medium</option>
//                         <option value="high">High</option>
//                         <option value="urgent">Urgent</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Task Description *</label>
//                     <textarea
//                       className="form-control"
//                       name="description"
//                       rows="3"
//                       placeholder="Describe the task requirements, deliverables, and any specific instructions..."
//                       required
//                     ></textarea>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Assign To *</label>
//                       <select className="form-select" name="assignedTo" required>
//                         <option value="">Select Employee</option>
//                         {allUsers.map((user, index) => (
//                           <option key={index} value={user.email}>
//                             {user.name} ({user.role || 'Employee'})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Due Date *</label>
//                       <input
//                         type="date"
//                         className="form-control"
//                         name="dueDate"
//                         min={new Date().toISOString().split('T')[0]}
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Estimated Hours</label>
//                       <input
//                         type="number"
//                         className="form-control"
//                         name="estimatedHours"
//                         placeholder="8"
//                         min="1"
//                         max="40"
//                       />
//                     </div>
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Project</label>
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={selectedProjectForTask?.name || ''}
//                         disabled
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={() => {
//                       setShowTaskAssignModal(false);
//                       setSelectedProjectForTask(null);
//                     }}
//                   >
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-primary">
//                     <i className="fas fa-plus me-2"></i>Assign Task
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Project Update Modal */}
//       {showProjectUpdateModal && (
//         <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog modal-lg">
//             <div className="modal-content">
//               <div className="modal-header bg-info text-white">
//                 <h5 className="modal-title">
//                   <i className="fas fa-clipboard-list me-2"></i>
//                   Submit Project Update
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close btn-close-white"
//                   onClick={() => setShowProjectUpdateModal(false)}
//                 ></button>
//               </div>
//               <form onSubmit={(e) => {
//                 e.preventDefault();
//                 const formData = new FormData(e.target);
//                 const updateData = {
//                   projectId: formData.get('projectId'),
//                   projectName: projects.find(p => p.id === formData.get('projectId'))?.name,
//                   status: formData.get('status'),
//                   description: formData.get('description'),
//                   completionPercentage: parseInt(formData.get('completionPercentage')),
//                   nextSteps: formData.get('nextSteps'),
//                   blockers: formData.get('blockers')
//                 };
//                 handleProjectUpdate(updateData);
//                 setShowProjectUpdateModal(false);
//               }}>
//                 <div className="modal-body">
//                   <div className="row">
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Project *</label>
//                       <select className="form-select" name="projectId" required>
//                         <option value="">Select Project</option>
//                         {(currentRole === 'employee' ? getEmployeeProjects(localStorage.getItem('userEmail')) :
//                           currentRole === 'project-manager' ? getProjectManagerProjects(localStorage.getItem('userEmail')) :
//                             projects).map((project, index) => (
//                               <option key={index} value={project.id}>
//                                 {project.name} - {project.clientName}
//                               </option>
//                             ))}
//                       </select>
//                     </div>
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Status *</label>
//                       <select className="form-select" name="status" required>
//                         <option value="">Select Status</option>
//                         <option value="on-track">On Track</option>
//                         <option value="in-progress">In Progress</option>
//                         <option value="at-risk">At Risk</option>
//                         <option value="delayed">Delayed</option>
//                         <option value="completed">Completed</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Progress Update *</label>
//                     <textarea
//                       className="form-control"
//                       name="description"
//                       rows="3"
//                       placeholder="Describe what has been accomplished, current progress, and any important updates..."
//                       required
//                     ></textarea>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Completion Percentage</label>
//                       <div className="input-group">
//                         <input
//                           type="number"
//                           className="form-control"
//                           name="completionPercentage"
//                           placeholder="25"
//                           min="0"
//                           max="100"
//                         />
//                         <span className="input-group-text">%</span>
//                       </div>
//                     </div>
//                     <div className="col-md-6 mb-3">
//                       <label className="form-label">Update Date</label>
//                       <input
//                         type="date"
//                         className="form-control"
//                         value={new Date().toISOString().split('T')[0]}
//                         disabled
//                       />
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Next Steps</label>
//                     <textarea
//                       className="form-control"
//                       name="nextSteps"
//                       rows="2"
//                       placeholder="What are the planned next steps or upcoming milestones?"
//                     ></textarea>
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Blockers / Issues</label>
//                     <textarea
//                       className="form-control"
//                       name="blockers"
//                       rows="2"
//                       placeholder="Any blockers, issues, or help needed?"
//                     ></textarea>
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={() => setShowProjectUpdateModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-info">
//                     <i className="fas fa-paper-plane me-2"></i>Submit Update
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Project Tasks Modal */}
//       {showProjectTasksModal && selectedProjectForTasks && (
//         <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog modal-xl">
//             <div className="modal-content">
//               <div className="modal-header" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', color: 'white' }}>
//                 <div>
//                   <h5 className="modal-title mb-1">
//                     <i className="fas fa-tasks me-2"></i>
//                     {selectedProjectForTasks.name} - Tasks
//                   </h5>
//                   <small className="opacity-75">Client: {selectedProjectForTasks.clientName}</small>
//                 </div>
//                 <button
//                   type="button"
//                   className="btn-close btn-close-white"
//                   onClick={() => {
//                     setShowProjectTasksModal(false);
//                     setSelectedProjectForTasks(null);
//                     setTaskFilterTab('all');
//                   }}
//                 ></button>
//               </div>
//               <div className="modal-body p-4">
//                 {/* Task Stats Cards */}
//                 <div className="row mb-4">
//                   <div className="col-md-3 mb-3">
//                     <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
//                       <div className="card-body text-center p-3">
//                         <div className="mb-2">
//                           <i className="fas fa-tasks fa-2x"></i>
//                         </div>
//                         <h3 className="mb-1">{assignedTasks.filter(t => t.projectId === selectedProjectForTasks.id).length}</h3>
//                         <small>TASKS</small>
//                         <div className="mt-2">
//                           <small><i className="fas fa-arrow-up me-1"></i>+10%</small>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-3 mb-3">
//                     <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
//                       <div className="card-body text-center p-3">
//                         <div className="mb-2">
//                           <i className="fas fa-hourglass-half fa-2x"></i>
//                         </div>
//                         <h3 className="mb-1">{assignedTasks.filter(t => t.projectId === selectedProjectForTasks.id && t.status === 'pending').length}</h3>
//                         <small>PENDING</small>
//                         <div className="mt-2">
//                           <small><i className="fas fa-minus me-1"></i>0%</small>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-3 mb-3">
//                     <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
//                       <div className="card-body text-center p-3">
//                         <div className="mb-2">
//                           <i className="fas fa-spinner fa-2x"></i>
//                         </div>
//                         <h3 className="mb-1">{assignedTasks.filter(t => t.projectId === selectedProjectForTasks.id && t.status === 'in-progress').length}</h3>
//                         <small>IN PROGRESS</small>
//                         <div className="mt-2">
//                           <small><i className="fas fa-arrow-up me-1"></i>+5%</small>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-3 mb-3">
//                     <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
//                       <div className="card-body text-center p-3">
//                         <div className="mb-2">
//                           <i className="fas fa-check-circle fa-2x"></i>
//                         </div>
//                         <h3 className="mb-1">{assignedTasks.filter(t => t.projectId === selectedProjectForTasks.id && t.status === 'completed').length}</h3>
//                         <small>COMPLETED</small>
//                         <div className="mt-2">
//                           <small><i className="fas fa-arrow-up me-1"></i>+15%</small>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Filter Tabs and Create Task Button */}
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <h6 className="mb-0">Recent Tasks</h6>
//                   <div className="d-flex gap-2 align-items-center">
//                     <div className="btn-group" role="group">
//                       <button
//                         type="button"
//                         className={`btn btn-sm ${taskFilterTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                         onClick={() => setTaskFilterTab('all')}
//                       >
//                         All
//                       </button>
//                       <button
//                         type="button"
//                         className={`btn btn-sm ${taskFilterTab === 'assigned' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                         onClick={() => setTaskFilterTab('assigned')}
//                       >
//                         Assigned
//                       </button>
//                       <button
//                         type="button"
//                         className={`btn btn-sm ${taskFilterTab === 'completed' ? 'btn-primary' : 'btn-outline-secondary'}`}
//                         onClick={() => setTaskFilterTab('completed')}
//                       >
//                         Completed
//                       </button>
//                     </div>
//                     <button
//                       className="btn btn-success btn-sm"
//                       onClick={() => {
//                         setSelectedProjectForTask(selectedProjectForTasks);
//                         setShowTaskAssignModal(true);
//                         setShowProjectTasksModal(false);
//                       }}
//                     >
//                       <i className="fas fa-plus me-1"></i>Create Task
//                     </button>
//                   </div>
//                 </div>

//                 {/* Tasks Table */}
//                 <div className="table-responsive">
//                   <table className="table table-hover">
//                     <thead style={{ backgroundColor: '#f8f9fa' }}>
//                       <tr>
//                         <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Task Name</th>
//                         <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Assignee</th>
//                         <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Project</th>
//                         <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Priority</th>
//                         <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Due Date</th>
//                         <th style={{ borderTop: 'none', fontWeight: '600', color: '#4361ee' }}>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {(() => {
//                         let filteredTasks = assignedTasks.filter(t => t.projectId === selectedProjectForTasks.id);

//                         if (taskFilterTab === 'assigned') {
//                           filteredTasks = filteredTasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
//                         } else if (taskFilterTab === 'completed') {
//                           filteredTasks = filteredTasks.filter(t => t.status === 'completed');
//                         }

//                         if (filteredTasks.length === 0) {
//                           return (
//                             <tr>
//                               <td colSpan="6" className="text-center py-4">
//                                 <div className="text-muted">
//                                   <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
//                                   <p className="mb-0">No tasks found for this project</p>
//                                   <button
//                                     className="btn btn-sm btn-primary mt-2"
//                                     onClick={() => {
//                                       setSelectedProjectForTask(selectedProjectForTasks);
//                                       setShowTaskAssignModal(true);
//                                       setShowProjectTasksModal(false);
//                                     }}
//                                   >
//                                     <i className="fas fa-plus me-1"></i>Create First Task
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         }

//                         return filteredTasks.map((task, index) => (
//                           <tr key={index}>
//                             <td>
//                               <div>
//                                 <div className="fw-semibold">{task.title}</div>
//                                 <small className="text-muted">{task.description?.substring(0, 50)}{task.description?.length > 50 ? '...' : ''}</small>
//                               </div>
//                             </td>
//                             <td>
//                               <div className="d-flex align-items-center">
//                                 <div
//                                   className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
//                                   style={{ width: '32px', height: '32px', fontSize: '12px', fontWeight: 'bold' }}
//                                 >
//                                   {task.assignedTo ? task.assignedTo.charAt(0).toUpperCase() : 'U'}
//                                 </div>
//                                 <div>
//                                   <div className="fw-semibold small">{task.assignedTo || 'Unassigned'}</div>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <div className="fw-semibold text-primary small">{task.projectName || selectedProjectForTasks.name}</div>
//                             </td>
//                             <td>
//                               <span style={{
//                                 padding: '4px 12px',
//                                 borderRadius: '20px',
//                                 fontSize: '0.75rem',
//                                 fontWeight: '500',
//                                 backgroundColor: task.priority === 'high' ? '#dc3545' :
//                                   task.priority === 'medium' ? '#ffc107' : '#28a745',
//                                 color: task.priority === 'medium' ? '#000' : '#fff'
//                               }}>
//                                 ● {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
//                               </span>
//                             </td>
//                             <td>
//                               <div className="fw-semibold small">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
//                             </td>
//                             <td>
//                               <span style={{
//                                 padding: '4px 12px',
//                                 borderRadius: '20px',
//                                 fontSize: '0.75rem',
//                                 fontWeight: '500',
//                                 backgroundColor: task.status === 'completed' ? '#28a745' :
//                                   task.status === 'in-progress' ? '#007bff' : '#ffc107',
//                                 color: '#fff'
//                               }}>
//                                 {task.status === 'completed' ? 'Completed' :
//                                   task.status === 'in-progress' ? 'In Progress' : 'Pending'}
//                               </span>
//                             </td>
//                           </tr>
//                         ));
//                       })()}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => {
//                     setShowProjectTasksModal(false);
//                     setSelectedProjectForTasks(null);
//                     setTaskFilterTab('all');
//                   }}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Task Selection Modal for Employees and Team Leaders */}
//       {showTaskSelectionModal && (
//         <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
//           <div className="modal-dialog modal-lg modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">
//                   <i className="fas fa-play-circle me-2"></i>
//                   Start Your Work Day
//                 </h5>
//               </div>
//               <div className="modal-body">
//                 <div className="text-center mb-4">
//                   <div className="mb-3">
//                     <i className="fas fa-tasks fa-3x text-primary mb-3"></i>
//                     <h4>Welcome back, {userName}!</h4>
//                     <p className="text-muted">Choose a task to start working on today</p>
//                   </div>
//                 </div>

//                 <div className="row">
//                   {(() => {
//                     // Show loading state while refreshing
//                     if (isRefreshing) {
//                       return (
//                         <div className="col-12 text-center py-5">
//                           <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
//                             <span className="visually-hidden">Loading...</span>
//                           </div>
//                           <h5 className="text-primary">Refreshing your tasks...</h5>
//                           <p className="text-muted">Please wait while we fetch the latest data</p>
//                         </div>
//                       );
//                     }

//                     const userEmail = localStorage.getItem('userEmail');
//                     const currentUserName = localStorage.getItem('userName') || userName;

//                     console.log('🔍 Task Selection Debug:', {
//                       userEmail,
//                       currentUserName,
//                       userName,
//                       totalTasks: assignedTasks.length,
//                       allTasks: assignedTasks.map(t => ({
//                         id: t.id,
//                         title: t.title,
//                         assignedTo: t.assignedTo,
//                         assignedMembers: t.assignedMembers
//                       }))
//                     });

//                     const employeeTasks = assignedTasks.filter(task => {
//                       const isAssignedByEmail = isUserAssignedToTask(task, userEmail);
//                       const isAssignedByName = isUserAssignedToTask(task, currentUserName);
//                       const isAssignedByUserName = isUserAssignedToTask(task, userName);
//                       const isAssigned = isAssignedByEmail || isAssignedByName || isAssignedByUserName;

//                       console.log(`Task "${task.title}" assigned to "${task.assignedTo}" - Match: ${isAssigned} (Email: ${isAssignedByEmail}, Name: ${isAssignedByName}, UserName: ${isAssignedByUserName})`);
//                       return isAssigned;
//                     });

//                     if (employeeTasks.length === 0) {
//                       return (
//                         <div className="col-12 text-center py-4">
//                           <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
//                           <h5 className="text-muted">No Tasks Assigned</h5>
//                           <p className="text-muted">You don't have any tasks assigned at the moment.</p>
//                           <div className="d-flex justify-content-center gap-2 mt-3">
//                             <button
//                               className="btn btn-primary"
//                               onClick={async () => {
//                                 console.log('🔄 Refresh Tasks button clicked in modal');
//                                 await forceRefreshEmployeeTasks();
//                                 // Force modal to re-render with updated data
//                                 setShowTaskSelectionModal(false);
//                                 setTimeout(() => {
//                                   setShowTaskSelectionModal(true);
//                                 }, 100);
//                               }}
//                               disabled={isRefreshing}
//                             >
//                               <i className={`fas fa-sync-alt me-1 ${isRefreshing ? 'fa-spin' : ''}`}></i>
//                               {isRefreshing ? 'Refreshing...' : 'Refresh Tasks'}
//                             </button>
//                             <button
//                               className="btn btn-secondary"
//                               onClick={handleSkipTaskSelection}
//                             >
//                               Continue to Dashboard
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     }

//                     return employeeTasks.map((task, index) => {
//                       // Format due date properly
//                       const formatDueDate = (dateString) => {
//                         if (!dateString) return 'Not Set';
//                         try {
//                           const date = new Date(dateString);
//                           return date.toLocaleDateString('en-US', {
//                             year: 'numeric',
//                             month: 'short',
//                             day: 'numeric'
//                           });
//                         } catch {
//                           return dateString;
//                         }
//                       };

//                       return (
//                         <div key={task.id || index} className="col-md-6 mb-3">
//                           <div
//                             className="card h-100 border-0 shadow-sm task-card"
//                             style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
//                             onClick={() => handleTaskSelection(task)}
//                             onMouseEnter={(e) => {
//                               e.currentTarget.style.transform = 'translateY(-2px)';
//                               e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
//                             }}
//                             onMouseLeave={(e) => {
//                               e.currentTarget.style.transform = 'translateY(0)';
//                               e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
//                             }}
//                           >
//                             <div className="card-body">
//                               {/* Task Number Header */}
//                               <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
//                                 <h5 className="mb-0 fw-bold text-primary">Task {index + 1}</h5>
//                                 <span className={`badge ${task.status === 'completed' ? 'bg-success' :
//                                   task.status === 'in-progress' ? 'bg-primary' :
//                                     task.status === 'review' ? 'bg-warning' : 'bg-secondary'
//                                   }`}>
//                                   {task.status || 'pending'}
//                                 </span>
//                               </div>

//                               {/* Task Title */}
//                               <div className="mb-2">
//                                 <strong className="text-dark">{task.title || task.name || 'Untitled Task'}</strong>
//                               </div>

//                               {/* Task Details */}
//                               <div className="mb-2">
//                                 <div className="d-flex align-items-start mb-1">
//                                   <i className="fas fa-tasks text-muted me-2 mt-1" style={{ fontSize: '0.85rem' }}></i>
//                                   <div>
//                                     <small className="text-muted d-block">Task assigned to {userName}</small>
//                                     <small className="text-dark">for project: <strong>{task.project || task.projectName || 'General'}</strong></small>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Assigned By */}
//                               {task.assignedBy && (
//                                 <div className="mb-2">
//                                   <div className="d-flex align-items-center">
//                                     <i className="fas fa-user-tie text-muted me-2" style={{ fontSize: '0.85rem' }}></i>
//                                     <small className="text-muted">Assigned by: <strong className="text-dark">{task.assignedBy}</strong></small>
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Progress Bar */}
//                               <div className="mb-3">
//                                 <div className="d-flex justify-content-between align-items-center mb-1">
//                                   <small className="text-muted fw-semibold">Progress</small>
//                                   <small className="text-primary fw-bold">{task.progress || 0}%</small>
//                                 </div>
//                                 <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
//                                   <div
//                                     className={`progress-bar ${(task.progress || 0) >= 75 ? 'bg-success' :
//                                       (task.progress || 0) >= 50 ? 'bg-info' :
//                                         (task.progress || 0) >= 25 ? 'bg-warning' : 'bg-danger'
//                                       }`}
//                                     style={{ width: `${task.progress || 0}%` }}
//                                   ></div>
//                                 </div>
//                               </div>

//                               {/* Project Name and Due Date */}
//                               <div className="row g-2 mb-2">
//                                 <div className="col-6">
//                                   <div className="p-2 bg-light rounded">
//                                     <small className="text-muted d-block mb-1">Project Name</small>
//                                     <strong className="small text-dark">{task.project || task.projectName || 'General'}</strong>
//                                   </div>
//                                 </div>
//                                 <div className="col-6">
//                                   <div className="p-2 bg-light rounded">
//                                     <small className="text-muted d-block mb-1">Due Date</small>
//                                     <strong className="small text-dark">{formatDueDate(task.dueDate)}</strong>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     });
//                   })()}
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <div className="d-flex justify-content-between w-100">
//                   <button
//                     type="button"
//                     className="btn btn-outline-secondary"
//                     onClick={handleSkipTaskSelection}
//                   >
//                     <i className="fas fa-forward me-1"></i>
//                     Skip for Now
//                   </button>
//                   <div className="text-muted small">
//                     <i className="fas fa-info-circle me-1"></i>
//                     You can change your active task anytime from the dashboard
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Password Management Modal */}
//       {showPasswordManagementModal && (
//         <PasswordManagementModal
//           show={showPasswordManagementModal}
//           onHide={() => {
//             setShowPasswordManagementModal(false);
//             setSelectedUserForPasswordManagement(null);
//           }}
//           user={selectedUserForPasswordManagement}
//           allUsers={allUsers}
//           onResetPassword={handleResetPassword}
//           onDeleteUser={handleDeleteUserFromPasswordModal}
//           currentUserRole={currentRole}
//         />
//       )}


//       <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
//         {toastNotifications.map((toast) => (
//           <div
//             key={toast.id}
//             className={`toast show align-items-center text-white bg-${toast.type === 'success' ? 'success' :
//               toast.type === 'warning' ? 'warning' :
//                 toast.type === 'error' ? 'danger' : 'info'
//               } border-0`}
//             role="alert"
//             aria-live="assertive"
//             aria-atomic="true"
//           >
//             <div className="d-flex">
//               <div className="toast-body">
//                 <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' :
//                   toast.type === 'warning' ? 'fa-exclamation-triangle' :
//                     toast.type === 'error' ? 'fa-times-circle' : 'fa-info-circle'
//                   } me-2`}></i>
//                 {toast.message}
//               </div>
//               <button
//                 type="button"
//                 className="btn-close btn-close-white me-2 m-auto"
//                 onClick={() => removeToastNotification(toast.id)}
//                 aria-label="Close"
//               ></button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Employee Create Task Modal */}
//       {showEmployeeCreateTaskModal && (
//         <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} onClick={() => setShowEmployeeCreateTaskModal(false)}>
//           <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-content border-0 shadow-lg">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">
//                   <i className="fas fa-plus-circle me-2"></i>
//                   Create New Task
//                 </h5>
//                 <button type="button" className="btn-close btn-close-white" onClick={() => setShowEmployeeCreateTaskModal(false)}></button>
//               </div>
//               <div className="modal-body p-4">
//                 <div className="text-center mb-4">
//                   <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3" style={{ width: '80px', height: '80px' }}>
//                     <i className="fas fa-tasks text-primary" style={{ fontSize: '2rem' }}></i>
//                   </div>
//                   <h4>Add a New Task</h4>
//                   <p className="text-muted">Create and assign tasks to team members</p>
//                 </div>
//                 <div className="d-grid gap-3">
//                   <button
//                     className="btn btn-primary btn-lg py-3"
//                     onClick={() => {
//                       setShowEmployeeCreateTaskModal(false);
//                       setShowAddTaskModal(true);
//                     }}
//                   >
//                     <i className="fas fa-plus me-2"></i>
//                     Create Task
//                   </button>
//                   <button
//                     className="btn btn-outline-secondary btn-lg py-3"
//                     onClick={() => setShowEmployeeCreateTaskModal(false)}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Employee View All Tasks Modal */}
//       {showEmployeeTaskListModal && (
//         <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} onClick={() => setShowEmployeeTaskListModal(false)}>
//           <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-content border-0 shadow-lg">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">
//                   <i className="fas fa-list me-2"></i>
//                   All Tasks
//                 </h5>
//                 <button type="button" className="btn-close btn-close-white" onClick={() => setShowEmployeeTaskListModal(false)}></button>
//               </div>
//               <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
//                 {(() => {
//                   const userEmail = localStorage.getItem('userEmail');
//                   const employeeTasks = assignedTasks.filter(task => isUserAssignedToTask(task, userEmail));

//                   if (employeeTasks.length === 0) {
//                     return (
//                       <div className="text-center py-5">
//                         <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
//                         <h5 className="text-muted">No Tasks Found</h5>
//                         <p className="text-muted">You don't have any tasks assigned yet.</p>
//                       </div>
//                     );
//                   }

//                   return (
//                     <div className="row g-3">
//                       {employeeTasks.map((task, index) => (
//                         <div key={task.id || index} className="col-md-6">
//                           <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: `4px solid ${task.status === 'completed' ? '#28a745' : task.status === 'in-progress' ? '#17a2b8' : '#6c757d'}` }}>
//                             <div className="card-body">
//                               <div className="d-flex justify-content-between align-items-start mb-2">
//                                 <h6 className="fw-bold text-dark mb-0">{task.title || `Task ${index + 1}`}</h6>
//                                 <span className={`badge ${task.status === 'completed' ? 'bg-success' :
//                                   task.status === 'in-progress' ? 'bg-info' :
//                                     'bg-secondary'
//                                   }`}>
//                                   {task.status || 'Pending'}
//                                 </span>
//                               </div>
//                               <p className="text-muted small mb-2">{task.description || 'No description'}</p>
//                               <div className="mb-2">
//                                 <small className="text-muted">
//                                   <i className="fas fa-project-diagram me-1"></i>
//                                   Project: <strong>{task.project || task.projectName || 'General'}</strong>
//                                 </small>
//                               </div>
//                               {task.assignedBy && (
//                                 <div className="mb-2">
//                                   <small className="text-muted">
//                                     <i className="fas fa-user-tie me-1"></i>
//                                     Assigned by: <strong>{task.assignedBy}</strong>
//                                   </small>
//                                 </div>
//                               )}
//                               <div className="mb-2">
//                                 <small className="text-muted">
//                                   <i className="fas fa-calendar me-1"></i>
//                                   Due: <strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}</strong>
//                                 </small>
//                               </div>
//                               <div className="mt-3">
//                                 <div className="d-flex justify-content-between align-items-center mb-1">
//                                   <small className="text-muted">Progress</small>
//                                   <small className="fw-bold text-primary">{task.progress || 0}%</small>
//                                 </div>
//                                 <div className="progress" style={{ height: '6px' }}>
//                                   <div
//                                     className={`progress-bar ${(task.progress || 0) >= 75 ? 'bg-success' :
//                                       (task.progress || 0) >= 50 ? 'bg-info' :
//                                         (task.progress || 0) >= 25 ? 'bg-warning' : 'bg-danger'
//                                       }`}
//                                     style={{ width: `${task.progress || 0}%` }}
//                                   ></div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   );
//                 })()}
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setShowEmployeeTaskListModal(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MultiRoleDashboard;
