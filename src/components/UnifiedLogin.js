import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UnifiedLogin.css';

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: '' // no default role - user must select
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableRoles, setAvailableRoles] = useState(['admin', 'project-manager', 'team-leader', 'employee']);
  const [userActualRole, setUserActualRole] = useState(null);

  // Clear session and Firebase Auth on component mount
  useEffect(() => {
    const performLogout = async () => {
      try {
        const { AuthService } = await import('../firebase/authService');
        await AuthService.logout();
      } catch (e) {
        console.log('No active session to clear');
      }

      // Clear localStorage session items
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('pmToken');
      localStorage.removeItem('tlToken');
      localStorage.removeItem('userData');
    };

    performLogout();

    // Clear form
    setFormData({
      identifier: '',
      password: '',
      role: ''
    });

    const timer = setTimeout(() => {
      setFormData(prev => ({ ...prev, identifier: '', password: '' }));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types

    // Check user's actual role when email is entered
    if (name === 'identifier' && value.includes('@')) {
      checkUserRole(value);
    }
  };

  const checkUserRole = (email) => {
    if (!email) {
      setAvailableRoles(['admin', 'project-manager', 'team-leader', 'employee']);
      setUserActualRole(null);
      return;
    }


    // For non-email formats, don't auto-select
    if (!email.includes('@')) {
      setAvailableRoles(['admin', 'project-manager', 'team-leader', 'employee']);
      setUserActualRole(null);
      return;
    }

    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersCurrent = JSON.parse(localStorage.getItem('users_current') || '[]');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const combinedUsers = [...users, ...usersCurrent, ...employees];

    // Find the user by email
    const user = combinedUsers.find(u =>
      u.email && u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (user) {
      const actualRole = user.role || user.userType || 'employee';
      const normalizedRole = actualRole.toLowerCase();

      console.log(`🔍 Found user ${user.name} with role: ${actualRole}`);
      setUserActualRole(actualRole);

      // Auto-select the user's role but allow all roles to be clickable
      // The restriction will be enforced during login validation instead
      setAvailableRoles(['admin', 'project-manager', 'team-leader', 'employee']);

      // Auto-select the user's actual role only if no role is currently selected
      if (!formData.role) {
        if (normalizedRole === 'admin') {
          setFormData(prev => ({ ...prev, role: 'admin' }));
        } else if (normalizedRole === 'project-manager') {
          setFormData(prev => ({ ...prev, role: 'project-manager' }));
        } else if (normalizedRole === 'team-leader') {
          setFormData(prev => ({ ...prev, role: 'team-leader' }));
        } else if (normalizedRole === 'employee') {
          setFormData(prev => ({ ...prev, role: 'employee' }));
        } else if (normalizedRole === 'intern') {
          setFormData(prev => ({ ...prev, role: 'employee' })); // Treat interns as employees
        }
      }
    } else {
      // User not found, allow all roles
      setAvailableRoles(['admin', 'project-manager', 'team-leader', 'employee']);
      setUserActualRole(null);
    }
  };

  // MongoDB deletion test function (can be called from browser console)
  window.testMongoDBDeletion = async (userId) => {
    console.log(`🧪 Testing MongoDB deletion for user ID: ${userId}`);

    try {
      // Import the API functions
      const { deleteUser, deleteProjectManager, deleteTeamLeader } = await import('../services/api');

      console.log('🔄 Trying deleteUser endpoint...');
      try {
        const result1 = await deleteUser(userId);
        console.log('✅ deleteUser successful:', result1);
        return { success: true, method: 'deleteUser', result: result1 };
      } catch (e1) {
        console.log('❌ deleteUser failed:', e1.message);

        console.log('🔄 Trying deleteProjectManager endpoint...');
        try {
          const result2 = await deleteProjectManager(userId);
          console.log('✅ deleteProjectManager successful:', result2);
          return { success: true, method: 'deleteProjectManager', result: result2 };
        } catch (e2) {
          console.log('❌ deleteProjectManager failed:', e2.message);

          console.log('🔄 Trying deleteTeamLeader endpoint...');
          try {
            const result3 = await deleteTeamLeader(userId);
            console.log('✅ deleteTeamLeader successful:', result3);
            return { success: true, method: 'deleteTeamLeader', result: result3 };
          } catch (e3) {
            console.log('❌ deleteTeamLeader failed:', e3.message);
            console.log('💥 All deletion methods failed');
            return { success: false, errors: [e1.message, e2.message, e3.message] };
          }
        }
      }
    } catch (importError) {
      console.error('❌ Failed to import API functions:', importError);
      return { success: false, error: 'Failed to import API functions' };
    }
  };

  // Test function for debugging (can be called from browser console)
  window.testPMLogin = () => {
    const testCredentials = {
      identifier: 'john@company.com',
      password: 'john123',
      role: 'project-manager'
    };

    console.log('🧪 Testing PM login with:', testCredentials);

    let storedPMs = JSON.parse(localStorage.getItem('projectManagers') || '[]');
    console.log('📋 Available PMs:', storedPMs);

    if (storedPMs.length === 0) {
      console.log('⚠️ No PMs found, creating sample data...');
      // Create sample PMs for testing
      const samplePMs = [
        {
          id: 'PM001',
          name: 'John Doe',
          email: 'john@company.com',
          password: 'john123'
        }
      ];
      localStorage.setItem('projectManagers', JSON.stringify(samplePMs));
      storedPMs = samplePMs;
    }

    const matchingPM = storedPMs.find(pm =>
      pm.email && pm.email.toLowerCase() === testCredentials.identifier.toLowerCase()
    );

    console.log('🎯 Matching PM:', matchingPM);
    console.log('🔐 Password match:', matchingPM ? matchingPM.password === testCredentials.password : false);

    return { storedPMs, matchingPM, passwordMatch: matchingPM ? matchingPM.password === testCredentials.password : false };
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { identifier, password, role } = formData;

    // Basic validation
    if (!role) {
      setError('Please select your role first');
      setIsLoading(false);
      return;
    }

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`🚀 Attempting Login for ${identifier} as ${role}`);


      // Import the dynamic auth service
      const { AuthService } = await import('../firebase/authService');

      // Authenticate with Firebase
      const result = await AuthService.login(identifier, password, role);

      if (result && result.user) {
        const { user, token } = result;

        // Store session data for dashboard compatibility
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', identifier);
        localStorage.setItem('userName', user.name || 'User');
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('token', token);

        // Role-specific tokens for legacy components
        if (role === 'admin') localStorage.setItem('adminToken', token);
        if (role === 'project-manager') localStorage.setItem('pmToken', token);
        if (role === 'team-leader') localStorage.setItem('tlToken', token);

        console.log('✅ Login successful, redirecting...');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('❌ Detailed Login error:', err);
      console.error('❌ Error Code:', err.code);
      console.error('❌ Error Message:', err.message);

      let friendlyMessage = 'Login failed. Please check your credentials and role.';

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password. Please verify your credentials in Firebase Auth.';
      } else if (err.code === 'ROLE_MISMATCH' || err.message.includes('Access Denied')) {
        friendlyMessage = err.message;
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Too many failed login attempts. Please try again later.';
      }

      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="unified-login">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <i className='bx bx-cube-alt'></i>
            <h1>Welcome</h1>
          </div>
          <p>Select your role to continue</p>
        </div>

        {/* Role Selection Buttons */}
        <div className="role-buttons">

          <button
            type="button"
            className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
          >
            <i className="bx bx-crown"></i> Admin
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'project-manager' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, role: 'project-manager' }))}
          >
            <i className="bx bx-briefcase"></i> Project Manager
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'team-leader' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, role: 'team-leader' }))}
          >
            <i className="bx bx-group"></i> Team Leader
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'employee' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, role: 'employee' }))}
          >
            <i className="bx bx-user"></i> Employee
          </button>

        </div>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {/* Hidden dummy fields to prevent autofill */}
          <input type="text" style={{ display: 'none' }} />
          <input type="password" style={{ display: 'none' }} />

          <div className="form-group">
            <label htmlFor="identifier" className="form-label">Email address</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="name@example.com"
              required
              className="form-input"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              key="email-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              className="form-input"
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              key="password-input"
            />
          </div>

          <div className="form-check">
            <input type="checkbox" id="remember" className="form-check-input" />
            <label htmlFor="remember" className="form-check-label">Remember me</label>
          </div>

          {error && (
            <div className="error-message">
              <i className='bx bx-error-circle'></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? (
              <>
                <i className='bx bx-loader-alt bx-spin'></i>
                Signing In...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Connection Test Section */}
          <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={async () => {
                const { testFirestoreConnection } = await import('../firebase/testFirestore');
                const result = await testFirestoreConnection();
                alert(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
              }}
              style={{
                background: 'transparent',
                border: '1px solid #ddd',
                padding: '8px 15px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#666',
                width: 'fit-content'
              }}
            >
              <i className='bx bx-signal-5'></i> Test Firestore Connection
            </button>

            <button
              type="button"
              onClick={async () => {
                const confirmSeed = window.confirm("This will populate your Firestore with sample data. Continue?");
                if (!confirmSeed) return;
                const { seedFirestore } = await import('../firebase/seedFirestore');
                const result = await seedFirestore();
                alert(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
              }}
              style={{
                background: 'transparent',
                border: '1px solid #e3f2fd',
                padding: '8px 15px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#1976d2',
                width: 'fit-content'
              }}
            >
              <i className='bx bx-cloud-upload'></i> Seed Mock Data to Firestore
            </button>
          </div>

          <div className="signup-link">
            <p>Don't have an account? <a href="#" className="link">Sign up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedLogin;
