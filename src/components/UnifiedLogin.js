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

  // Clear form on component mount to prevent autofill
  useEffect(() => {
    // Clear immediately
    setFormData({
      identifier: '',
      password: '',
      role: ''
    });
    
    // Clear again after a short delay to override any browser autofill
    const timer = setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        identifier: '',
        password: ''
      }));
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

    // Handle common admin usernames (not email format) - suggest but don't force
    const commonAdminUsernames = ['admin', 'administrator', 'root'];
    if (commonAdminUsernames.includes(email.toLowerCase())) {
      console.log('🔍 Detected admin username:', email);
      setUserActualRole('admin');
      setAvailableRoles(['admin', 'project-manager', 'team-leader', 'employee']);
      // Only auto-select if no role is currently selected
      if (!formData.role) {
        setFormData(prev => ({ ...prev, role: 'admin' }));
      }
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

    console.log('🚀 Login attempt started for role:', formData.role);
    console.log('📝 Form data:', { identifier: formData.identifier, password: formData.password ? '***' : 'empty', role: formData.role });

    // Add timeout to prevent hanging
    const loginTimeout = setTimeout(() => {
      setIsLoading(false);
      setError('Login timeout. Please try again.');
    }, 5000); // 5 second timeout (reduced from 10)

    // Basic validation
    if (!formData.role) {
      setError('Please select your role first');
      setIsLoading(false);
      clearTimeout(loginTimeout);
      return;
    }
    
    if (!formData.identifier.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      clearTimeout(loginTimeout);
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      clearTimeout(loginTimeout);
      return;
    }

    // Skip role verification for admin to speed up login
    if (formData.role !== 'admin') {
      console.log('🔍 Checking user role restrictions...');
      
      try {
        // Get all users from localStorage to check their actual role
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const usersCurrent = JSON.parse(localStorage.getItem('users_current') || '[]');
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const combinedUsers = [...users, ...usersCurrent, ...employees];
        
        // Find the user by email first (regardless of role selection)
        const actualUser = combinedUsers.find(user => 
          user.email && user.email.toLowerCase() === formData.identifier.trim().toLowerCase()
        );
        
        if (actualUser) {
          const actualRole = actualUser.role || actualUser.userType || 'employee';
          const normalizedActualRole = actualRole.toLowerCase();
          const selectedRole = formData.role.toLowerCase();
          
          console.log(`👤 Found user: ${actualUser.name}`);
          console.log(`🏷️ User's actual role: ${actualRole}`);
          console.log(`🎯 Selected role: ${formData.role}`);
          
          // Role matching with intern→employee mapping
          const isValidRoleMatch = normalizedActualRole === selectedRole || 
            // Allow interns to access employee dashboard
            (normalizedActualRole === 'intern' && selectedRole === 'employee');
          
          if (!isValidRoleMatch) {
            console.log(`❌ Role mismatch! User role: ${actualRole}, Selected: ${formData.role}`);
            setError(`Access denied. Your account is registered as "${actualRole}" and cannot access the "${formData.role}" dashboard.`);
            setIsLoading(false);
            return;
          }
          
          if (normalizedActualRole === 'intern' && selectedRole === 'employee') {
            console.log('✅ Role verification passed (intern accessing employee dashboard)');
          } else {
            console.log('✅ Role verification passed');
          }
        }
      } catch (roleCheckError) {
        console.log('⚠️ Role check failed, proceeding with authentication');
      }
    }

    // Handle different authentication methods separately
    if (formData.role === 'admin') {
      try {
        console.log('👑 Admin login attempt');
        
        // Fast admin authentication - check common admin credentials first
        const commonAdminCredentials = [
          { username: 'admin', password: 'admin123' },
          { username: 'admin', password: 'admin' },
          { email: 'admin@company.com', password: 'admin123' },
          { email: 'admin@admin.com', password: 'admin' }
        ];
        
        const isCommonAdmin = commonAdminCredentials.some(cred => 
          (cred.username && formData.identifier.toLowerCase() === cred.username.toLowerCase() && formData.password === cred.password) ||
          (cred.email && formData.identifier.toLowerCase() === cred.email.toLowerCase() && formData.password === cred.password)
        );
        
        if (isCommonAdmin) {
          // Fast admin login for common credentials
          localStorage.setItem('adminToken', 'admin-token-' + Date.now());
          localStorage.setItem('adminAuth', JSON.stringify({ 
            token: 'admin-token-' + Date.now(), 
            admin: { username: formData.identifier, role: 'admin' } 
          }));
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userEmail', formData.identifier);
          localStorage.setItem('userName', 'Admin User');
          localStorage.setItem('isAuthenticated', 'true');
          
          console.log('✅ Fast admin login successful');
          clearTimeout(loginTimeout);
          navigate('/dashboard');
          return;
        }
        
        // Fallback to API authentication for other admin credentials
        try {
          const { adminLogin } = await import('../services/api');
          const response = await adminLogin({
            username: formData.identifier,
            password: formData.password
          });
          
          localStorage.setItem('adminToken', response.token);
          localStorage.setItem('adminAuth', JSON.stringify({ token: response.token, admin: response.admin }));
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('isAuthenticated', 'true');
          
          console.log('✅ API admin login successful');
          clearTimeout(loginTimeout);
          navigate('/dashboard');
        } catch (apiError) {
          console.error('❌ API admin login failed:', apiError);
          setError('Invalid admin credentials');
        }
      } catch (adminError) {
        console.error('❌ Admin login error:', adminError);
        setError('Invalid admin credentials');
      }
    } else {
      try {
        // Handle Project Manager authentication - check dynamic user database
        if (formData.role === 'project-manager') {
          console.log('👨‍💼 Project Manager login attempt');
          
          try {
            // Get all users from the main user database
            const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const usersCurrent = JSON.parse(localStorage.getItem('users_current') || '[]');
            const projectManagers = JSON.parse(localStorage.getItem('projectManagers') || '[]');
            
            console.log('📊 Data sources:');
            console.log('- allUsers:', allUsers.length, allUsers.map(u => ({name: u.name, email: u.email, role: u.role})));
            console.log('- usersCurrent:', usersCurrent.length, usersCurrent.map(u => ({name: u.name, email: u.email, role: u.role})));
            console.log('- projectManagers:', projectManagers.length, projectManagers.map(u => ({name: u.name, email: u.email, role: u.role})));
            
            // Combine all user sources
            const combinedUsers = [...allUsers, ...usersCurrent, ...projectManagers];
            
            console.log('🔍 Checking all users for Project Manager role:', combinedUsers.length);
            
            // Check if raw@gmail.com exists, if not create it
            const rawExists = combinedUsers.find(user => 
              user.email && user.email.toLowerCase() === 'raw@gmail.com'
            );
            
            if (!rawExists) {
              console.log('⚠️ raw@gmail.com not found, creating Project Manager entry...');
              const rawPM = {
                id: 'PM_RAW_' + Date.now(),
                name: 'Raw Manager',
                email: 'raw@gmail.com',
                role: 'project-manager',
                userType: 'Project Manager',
                password: 'raw123',
                department: 'Operations',
                status: 'Active',
                phone: '9876543210',
                experience: '4-6 years',
                specialization: 'Project Management',
                salary: '70000',
                joiningDate: new Date().toISOString().split('T')[0]
              };
              
              // Add to all relevant storage locations
              const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
              const currentPMs = JSON.parse(localStorage.getItem('projectManagers') || '[]');
              
              currentUsers.push(rawPM);
              currentPMs.push(rawPM);
              
              localStorage.setItem('users', JSON.stringify(currentUsers));
              localStorage.setItem('projectManagers', JSON.stringify(currentPMs));
              
              combinedUsers.push(rawPM);
              console.log('✅ Created raw@gmail.com as Project Manager');
            }
            
            // If no users found at all, create some sample data for testing
            if (combinedUsers.length === 0) {
              console.log('⚠️ No users found, creating sample Project Managers...');
              const samplePMs = [
                {
                  id: 'PM001',
                  name: 'John Doe',
                  email: 'john@company.com',
                  role: 'project-manager',
                  userType: 'Project Manager',
                  password: 'john123',
                  department: 'Web Developer',
                  status: 'Active'
                },
                {
                  id: 'PM002', 
                  name: 'Raw Manager',
                  email: 'raw@gmail.com',
                  role: 'project-manager',
                  userType: 'Project Manager',
                  password: 'raw123',
                  department: 'Operations',
                  status: 'Active'
                }
              ];
              
              // Save to localStorage
              localStorage.setItem('users', JSON.stringify(samplePMs));
              localStorage.setItem('projectManagers', JSON.stringify(samplePMs));
              combinedUsers.push(...samplePMs);
              console.log('✅ Created sample Project Managers');
            }
            
            // Find users with project-manager role
            const projectManagerUsers = combinedUsers.filter(user => {
              const isProjectManager = 
                user.role === 'project-manager' || 
                user.userType === 'Project Manager' ||
                user.role === 'Project Manager' ||
                user.userType === 'project-manager';
              
              console.log(`User ${user.name}: role=${user.role}, userType=${user.userType}, isProjectManager=${isProjectManager}`);
              return isProjectManager;
            });
            
            console.log('📋 Found Project Manager users:', projectManagerUsers.length);
            console.log('📋 PM users:', projectManagerUsers.map(pm => ({ 
              name: pm.name, 
              email: pm.email, 
              role: pm.role, 
              userType: pm.userType 
            })));
            
            // Find matching Project Manager by email
            const matchingPM = projectManagerUsers.find(pm => {
              const emailMatch = pm.email && pm.email.toLowerCase() === formData.identifier.trim().toLowerCase();
              const passwordMatch = pm.password === formData.password.trim();
              
              console.log(`Checking PM ${pm.name}:`, {
                email: pm.email,
                emailMatch,
                passwordMatch,
                storedPassword: pm.password,
                enteredPassword: formData.password.trim()
              });
              
              return emailMatch && passwordMatch;
            });
            
            console.log('🎯 Matching PM found:', matchingPM ? matchingPM.name : 'None');
            
            if (matchingPM) {
              // Store PM info in localStorage
              localStorage.setItem('userRole', 'project-manager');
              localStorage.setItem('userEmail', matchingPM.email);
              localStorage.setItem('userName', matchingPM.name);
              localStorage.setItem('pmToken', 'pm-token-' + (matchingPM.id || matchingPM._id || Date.now()));
              localStorage.setItem('isAuthenticated', 'true');
              localStorage.setItem('userData', JSON.stringify(matchingPM));
              
              console.log('✅ Dynamic PM login successful for:', matchingPM.name);
              clearTimeout(loginTimeout);
              setIsLoading(false);
              navigate('/dashboard');
              return;
            } else {
              // Check if email exists but wrong password
              const emailExists = projectManagerUsers.find(pm => 
                pm.email && pm.email.toLowerCase() === formData.identifier.trim().toLowerCase()
              );
              
              if (emailExists) {
                console.log('❌ Email found but wrong password');
                setError('Incorrect password for this Project Manager account');
              } else {
                console.log('❌ Email not found in Project Manager database');
                console.log('Available PM emails:', projectManagerUsers.map(pm => pm.email));
                setError(`Email "${formData.identifier}" is not registered as a Project Manager. Please contact admin to add you as a Project Manager.`);
              }
              
              clearTimeout(loginTimeout);
              setIsLoading(false);
              return;
            }
          } catch (pmError) {
            console.error('❌ PM authentication error:', pmError);
            setError('Error during Project Manager authentication');
            clearTimeout(loginTimeout);
            setIsLoading(false);
            return;
          }
        } else if (formData.role === 'team-leader') {
          // Team Leader authentication - check all users with team-leader role
          try {
            console.log('🔍 Attempting Team Leader login...');
            
            // Get all users from localStorage and filter for team leaders
            const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const teamLeaderUsers = allUsers.filter(user => user.role === 'team-leader');
            
            console.log('📋 Available Team Leader Users:', teamLeaderUsers.length);
            
            // Find matching team leader by email, username, or name
            const matchingTL = teamLeaderUsers.find(user => {
              const emailMatch = user.email && user.email.toLowerCase() === formData.identifier.trim().toLowerCase();
              const usernameMatch = user.username && user.username.toLowerCase() === formData.identifier.trim().toLowerCase();
              const nameMatch = user.name && user.name.toLowerCase() === formData.identifier.trim().toLowerCase();
              
              return emailMatch || usernameMatch || nameMatch;
            });
            
            console.log('🎯 Matching Team Leader found:', matchingTL ? matchingTL.name : 'None');
            
            if (matchingTL && matchingTL.password === formData.password.trim()) {
              // Store team leader info in localStorage
              localStorage.setItem('userRole', 'team-leader');
              localStorage.setItem('userEmail', matchingTL.email);
              localStorage.setItem('userName', matchingTL.name);
              localStorage.setItem('tlToken', 'tl-token-' + (matchingTL.id || matchingTL._id));
              localStorage.setItem('isAuthenticated', 'true');
              localStorage.setItem('userData', JSON.stringify(matchingTL));
              
              console.log('✅ Team leader login successful:', matchingTL.name);
              clearTimeout(loginTimeout);
              setIsLoading(false);
              navigate('/dashboard');
              return;
            } else {
              console.log('❌ Team leader login failed - Invalid credentials or no team leader role');
              setError('Invalid Team Leader credentials or user does not have team leader role');
              clearTimeout(loginTimeout);
              setIsLoading(false);
              return;
            }
          } catch (tlError) {
            console.error('❌ Team Leader authentication error:', tlError);
            setError('Error during Team Leader authentication');
            clearTimeout(loginTimeout);
            setIsLoading(false);
            return;
          }
        } else {
          // For employee role (including interns), check against actual user management system
          console.log('👤 Employee login attempt (includes users with intern role)');
          
          try {
            // Get all users from localStorage (from user management system)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const usersCurrent = JSON.parse(localStorage.getItem('users_current') || '[]');
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            
            console.log('📋 Available users:', users.length);
            console.log('📋 Available users_current:', usersCurrent.length);
            console.log('📋 Available employees:', employees.length);
            
            // Combine all user sources (prioritize the main 'users' key)
            const combinedUsers = [...users, ...usersCurrent, ...employees];
            
            // Find matching user by email and password
            const matchingUser = combinedUsers.find(user => {
              const emailMatch = user.email && user.email.toLowerCase() === formData.identifier.trim().toLowerCase();
              const passwordMatch = user.password === formData.password.trim();
              
              // Check role matching - be flexible with role types
              const roleMatch = 
                user.role === formData.role || 
                user.userType === formData.role ||
                (user.role && user.role.toLowerCase() === formData.role.toLowerCase()) ||
                (user.userType && user.userType.toLowerCase() === formData.role.toLowerCase()) ||
                // IMPORTANT: Allow users with 'intern' role to login using 'Employee' button
                // This enables interns to access the system since we removed the Intern button
                (formData.role === 'employee' && (user.role === 'intern' || user.userType === 'intern' || user.userType === 'Intern'));
              
              console.log(`🔍 Checking user ${user.name}: email=${emailMatch}, password=${passwordMatch}, role=${roleMatch} (user.role=${user.role}, user.userType=${user.userType}, formData.role=${formData.role}, intern->employee: ${formData.role === 'employee' && (user.role === 'intern' || user.userType === 'intern')})`);
              
              return emailMatch && passwordMatch && roleMatch;
            });
            
            console.log('🔍 Looking for user:', formData.identifier);
            console.log('🔍 User found:', matchingUser ? matchingUser.name : 'No match');
            
            if (matchingUser) {
              // Store user info in localStorage
              // For interns, store role as 'employee' to ensure they get employee dashboard
              const effectiveRole = (matchingUser.role === 'intern' || matchingUser.userType === 'intern' || matchingUser.userType === 'Intern') 
                ? 'employee' 
                : (matchingUser.role || matchingUser.userType || formData.role);
              
              localStorage.setItem('userRole', effectiveRole);
              localStorage.setItem('userEmail', matchingUser.email);
              localStorage.setItem('userName', matchingUser.name);
              localStorage.setItem('userData', JSON.stringify(matchingUser));
              localStorage.setItem('isAuthenticated', 'true');
              
              console.log('✅ Employee login successful:', matchingUser.name, 
                `(Original role: ${matchingUser.role || matchingUser.userType}, Effective role: ${effectiveRole})`);
              clearTimeout(loginTimeout);
              setIsLoading(false);
              navigate('/dashboard');
            } else {
              console.log('❌ Employee login failed - Invalid credentials');
              setError('Invalid credentials for the selected role');
              clearTimeout(loginTimeout);
              setIsLoading(false);
            }
          } catch (employeeError) {
            console.error('❌ Employee authentication error:', employeeError);
            setError('Error during authentication');
            clearTimeout(loginTimeout);
            setIsLoading(false);
          }
        }
      } catch (otherRoleError) {
        console.error('❌ Other role login error:', otherRoleError);
        setError('Login failed. Please check your credentials.');
      }
    }
    
    // Clear timeout and reset loading state
    clearTimeout(loginTimeout);
    setIsLoading(false);
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
            onClick={() => setFormData(prev => ({...prev, role: 'admin'}))}
          >
            <i className="bx bx-crown"></i> Admin
          </button>
          <button 
            type="button" 
            className={`role-btn ${formData.role === 'project-manager' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({...prev, role: 'project-manager'}))}
          >
            <i className="bx bx-briefcase"></i> Project Manager
          </button>
          <button 
            type="button" 
            className={`role-btn ${formData.role === 'team-leader' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({...prev, role: 'team-leader'}))}
          >
            <i className="bx bx-group"></i> Team Leader
          </button>
          <button 
            type="button" 
            className={`role-btn ${formData.role === 'employee' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({...prev, role: 'employee'}))}
          >
            <i className="bx bx-user"></i> Employee
          </button>

        </div>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {/* Hidden dummy fields to prevent autofill */}
          <input type="text" style={{display: 'none'}} />
          <input type="password" style={{display: 'none'}} />
          
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

          <div className="signup-link">
            <p>Don't have an account? <a href="#" className="link">Sign up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedLogin;
