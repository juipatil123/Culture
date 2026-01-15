import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import ProjectManagerDashboard from './components/ProjectManagerDashboard';
import TeamLeaderDashboard from './components/TeamLeaderDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import InternDashboard from './components/InternDashboard';
import UnifiedLogin from './components/UnifiedLogin';
import { AuthProvider } from './context/AuthContext';
import { getAllTasks, getAllProjects, subscribeToTasks } from './services/api';
import 'boxicons/css/boxicons.min.css';
import './App.css';

// Wrapper component for EmployeeDashboard to load data
function EmployeeDashboardWrapper({ userData, onLogout }) {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userEmail = userData?.email || localStorage.getItem('userEmail');
  const userName = userData?.name || localStorage.getItem('userName');

  const isUserAssignedToTask = (task, email, name) => {
    if (!task) return false;

    const checkMatch = (val) => {
      if (!val) return false;
      const strVal = (typeof val === 'object' ? (val.email || val.name || '') : val).toString().toLowerCase();
      // Check if it matches email OR name
      return (email && strVal === email.toLowerCase()) || (name && strVal === name.toLowerCase());
    };

    const assignedTo = task.assignedTo;
    if (Array.isArray(assignedTo)) {
      return assignedTo.some(e => checkMatch(e));
    }
    return checkMatch(assignedTo);
  };

  const loadTasks = async () => {
    try {
      const allTasks = await getAllTasks();
      const myTasks = allTasks.filter(task => isUserAssignedToTask(task, userEmail, userName));
      setAssignedTasks(myTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const allProjects = await getAllProjects();
      const myProjects = allProjects.filter(project =>
        project.assignedMembers && project.assignedMembers.some(member =>
          member === userEmail ||
          member === userName ||
          (typeof member === 'object' && (member.email === userEmail || member.name === userName))
        )
      );
      setProjects(myProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const manualRefreshTasks = async () => {
    setIsRefreshing(true);
    await loadTasks();
    await loadProjects();
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Initial project load
    loadProjects();

    // Subscribe to tasks for real-time updates
    const unsubscribe = subscribeToTasks((allTasks) => {
      // Filter tasks for the current user (using both email and name)
      const myTasks = allTasks.filter(task => isUserAssignedToTask(task, userEmail, userName));
      setAssignedTasks(myTasks);
    });

    return () => {
      // Cleanup subscription
      if (unsubscribe) unsubscribe();
    };
  }, [userEmail, userName]);

  return (
    <EmployeeDashboard
      userData={userData}
      assignedTasks={assignedTasks}
      projects={projects}
      onLogout={onLogout}
      isRefreshing={isRefreshing}
      manualRefreshTasks={manualRefreshTasks}
      openTaskNotesModal={() => { }}
      getTaskNoteCount={() => 0}
    />
  );
}

function DashboardWrapper() {
  // Get user data from localStorage
  const userRole = localStorage.getItem('userRole');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  // Ensure userData has the basic info even if not stored
  const completeUserData = {
    ...userData,
    email: userData.email || userEmail,
    name: userData.name || userName,
    role: userData.role || userRole
  };

  // Logout function
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('pmToken');
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('teamLeaderToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('selectedTask');
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('currentTaskId');
    localStorage.removeItem('currentProjectName');
    localStorage.removeItem('userData');

    // Redirect to login
    window.location.href = '/login';
  };

  // Render appropriate dashboard based on user role
  if (userRole === 'admin') {
    return (
      <AdminDashboard
        userData={completeUserData}
        onLogout={handleLogout}
      />
    );
  }

  if (userRole === 'project-manager') {
    return (
      <ProjectManagerDashboard
        userData={completeUserData}
        onLogout={handleLogout}
      />
    );
  }

  if (userRole === 'team-leader') {
    return (
      <TeamLeaderDashboard
        userData={completeUserData}
        onLogout={handleLogout}
        getUserWorkStatus={(user) => {
          return { status: user.status || 'Offline', task: null };
        }}
      />
    );
  }

  if (userRole === 'employee') {
    return (
      <EmployeeDashboardWrapper
        userData={completeUserData}
        onLogout={handleLogout}
      />
    );
  }

  if (userRole === 'intern') {
    return (
      <InternDashboard
        userData={completeUserData}
        allUsers={[]}
        allProjects={[]}
        allTasks={[]}
        showPasswordManagementModal={false}
        setShowPasswordManagementModal={() => { }}
        handleResetPassword={() => { }}
        handleDeleteUserFromPasswordModal={() => { }}
        currentRole="intern"
      />
    );
  }

  return (
    <div className="p-5 text-center">
      <h3>Access Denied</h3>
      <p>Your role ({userRole}) does not have a dashboard assigned. Please contact your administrator.</p>
      <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <UnifiedLogin />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardWrapper />
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
