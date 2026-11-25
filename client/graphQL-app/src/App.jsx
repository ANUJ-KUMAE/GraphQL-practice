import { useState, useEffect } from 'react';
import {
  fetchGraphQL,
  GET_INITIAL_DATA,
  ME_QUERY,
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  CREATE_DEPARTMENT,
  CREATE_EMPLOYEE,
  DELETE_EMPLOYEE,
  CREATE_PROJECT,
  DELETE_PROJECT,
  ASSIGN_PROJECT,
  REMOVE_ASSIGNMENT,
} from './services/graphql';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employeeProjects, setEmployeeProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('projects'); // 'assignments' | 'projects' | 'employees' | 'departments'

  // Auth Form states
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('EMPLOYEE');
  const [authError, setAuthError] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Department Form state
  const [deptName, setDeptName] = useState('');

  // Employee Form states
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [empDeptId, setEmpDeptId] = useState('');

  // Project Form states
  const [projName, setProjName] = useState('');
  const [projResources, setProjResources] = useState('');
  const [projStatus, setProjStatus] = useState('In Progress');
  const [projStartDate, setProjStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [projEndDate, setProjEndDate] = useState('');

  // Assign Project Form states
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignProjId, setAssignProjId] = useState('');

  // 1. Fetch dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGraphQL(GET_INITIAL_DATA);
      setDepartments(data.departments || []);
      setEmployees(data.employees || []);
      setProjects(data.projects || []);
      setEmployeeProjects(data.employeeProjects || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to GraphQL backend');
    } finally {
      setLoading(false);
    }
  };

  // 2. Initial Auth Check on page load
  useEffect(() => {
    const checkInitialAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await fetchGraphQL(ME_QUERY);
          if (data?.me) {
            setCurrentUser(data.me);
            await loadData();
          } else {
            localStorage.removeItem('token');
          }
        } catch {
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }
      setAuthChecking(false);
    };

    checkInitialAuth();
  }, []);

  // --- Auth Handlers ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      if (authMode === 'login') {
        const data = await fetchGraphQL(LOGIN_MUTATION, {
          email: authEmail,
          password: authPassword,
        });
        localStorage.setItem('token', data.login.token);
        setCurrentUser(data.login.user);
        setMessage(`Welcome back, ${data.login.user.name}!`);
      } else {
        const data = await fetchGraphQL(REGISTER_MUTATION, {
          name: authName,
          email: authEmail,
          password: authPassword,
          role: authRole,
        });
        localStorage.setItem('token', data.register.token);
        setCurrentUser(data.register.user);
        setMessage(`Account created successfully as ${data.register.user.role}!`);
      }

      setAuthPassword('');
      await loadData();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setDepartments([]);
    setEmployees([]);
    setProjects([]);
    setEmployeeProjects([]);
    setMessage('Logged out successfully.');
  };

  // --- CRUD Handlers ---
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    try {
      setError(null);
      await fetchGraphQL(CREATE_DEPARTMENT, { name: deptName });
      setMessage(`Department "${deptName}" added successfully!`);
      setDeptName('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim()) return;

    try {
      setError(null);
      await fetchGraphQL(CREATE_EMPLOYEE, {
        name: empName,
        email: empEmail,
        salary: empSalary ? parseFloat(empSalary) : null,
        departmentId: empDeptId ? parseInt(empDeptId) : null,
      });

      setMessage(`Employee "${empName}" added successfully!`);
      setEmpName('');
      setEmpEmail('');
      setEmpSalary('');
      setEmpDeptId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projName.trim() || !projResources.trim()) return;

    try {
      setError(null);
      await fetchGraphQL(CREATE_PROJECT, {
        projectName: projName,
        resources: projResources,
        status: projStatus,
        startDate: projStartDate || null,
        endDate: projEndDate || null,
      });

      setMessage(`Project "${projName}" created successfully!`);
      setProjName('');
      setProjResources('');
      setProjStatus('In Progress');
      setProjStartDate(new Date().toISOString().split('T')[0]);
      setProjEndDate('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    if (!assignEmpId || !assignProjId) {
      setError('Please select both an Employee and a Project');
      return;
    }

    try {
      setError(null);
      const res = await fetchGraphQL(ASSIGN_PROJECT, {
        employeeId: assignEmpId,
        projectId: assignProjId,
      });

      const empNameText = res.assignProject?.employee?.name || 'Employee';
      const projNameText = res.assignProject?.project?.projectName || 'Project';

      setMessage(`Successfully assigned ${empNameText} to ${projNameText}!`);
      setAssignEmpId('');
      setAssignProjId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveAssignment = async (id, empName, projName) => {
    if (
      !window.confirm(
        `Remove assignment of ${empName || 'Employee'} from ${projName || 'Project'}?`
      )
    )
      return;

    try {
      setError(null);
      await fetchGraphQL(REMOVE_ASSIGNMENT, { id });
      setMessage('Assignment removed successfully.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      setError(null);
      await fetchGraphQL(DELETE_EMPLOYEE, { id });
      setMessage(`Employee "${name}" deleted.`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      setError(null);
      await fetchGraphQL(DELETE_PROJECT, { id });
      setMessage(`Project "${name}" deleted.`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'badge-success';
      case 'in progress':
        return 'badge-primary';
      case 'planning':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  // ================= 1. INITIAL SESSION CHECKING SCREEN =================
  if (authChecking) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner"></div>
        <p>Connecting to GraphQL Server...</p>
      </div>
    );
  }

  // ================= 2. UNPROTECTED: LOGIN / SIGNUP PAGE ONLY =================
  if (!currentUser) {
    return (
      <div className="auth-page-container">
        <div className="auth-page-card">
          <div className="auth-brand">
            <div className="auth-logo-badge">⚡</div>
            <h1>GraphQL Portal</h1>
            <p className="auth-subtitle">
              Sign in or create an account to access the enterprise dashboard
            </p>
          </div>

          {authError && <div className="alert alert-error">{authError}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          {/* Toggle Login / Register */}
          <div className="auth-tab-group">
            <button
              type="button"
              className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="form">
            {authMode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="e.g. user@company.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />
            </div>

            {authMode === 'register' && (
              <div className="form-group">
                <label>Role</label>
                <select
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value)}
                >
                  <option value="EMPLOYEE">Employee (Standard Access)</option>
                  <option value="ADMIN">Admin (Full Control)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={authSubmitting}
            >
              {authSubmitting
                ? 'Processing...'
                : authMode === 'login'
                ? 'Sign In to Dashboard'
                : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer-hint">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. PROTECTED: FULL DASHBOARD (ONLY WHEN LOGGED IN) =================
  return (
    <div className="container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="logo-title">⚡ GraphQL Dashboard</div>

        <div className="auth-profile-section">
          <div className="user-profile">
            <span className="user-avatar">
              {currentUser.name.charAt(0).toUpperCase()}
            </span>
            <span className="user-name">{currentUser.name}</span>
            <span
              className={`role-pill ${
                currentUser.role === 'ADMIN' ? 'role-admin' : 'role-employee'
              }`}
            >
              {currentUser.role}
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <header className="header">
        <h1>Enterprise Management Dashboard</h1>
        <p className="subtitle">
          Manage Departments, Employees, Projects & Assignments in PostgreSQL
        </p>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            🚀 Projects ({projects.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            👥 Employees ({employees.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            🏢 Departments ({departments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            🔗 Project Assignments ({employeeProjects.length})
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* ================= TAB 1: PROJECTS ================= */}
      {activeTab === 'projects' && (
        <div className="tab-content">
          <div className="card form-card">
            <h2>Add New Project</h2>
            <form onSubmit={handleAddProject} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mobile App Redesign"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value)}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Resources / Tech Stack</label>
                <input
                  type="text"
                  placeholder="e.g. React Native, Node.js, PostgreSQL, Figma"
                  value={projResources}
                  onChange={(e) => setProjResources(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={projStartDate}
                    onChange={(e) => setProjStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Date (Optional)</label>
                  <input
                    type="date"
                    value={projEndDate}
                    onChange={(e) => setProjEndDate(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Create Project
              </button>
            </form>
          </div>

          <div className="data-section">
            <div className="section-header">
              <h2>Projects List ({projects.length})</h2>
              <button onClick={loadData} className="btn btn-secondary">
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="loading">Loading projects from GraphQL...</p>
            ) : projects.length === 0 ? (
              <p className="empty-state">No projects found. Create one above!</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Project Name</th>
                      <th>Resources</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((proj) => (
                      <tr key={proj.id}>
                        <td>#{proj.id}</td>
                        <td>
                          <strong>{proj.projectName}</strong>
                        </td>
                        <td>
                          <span className="resources-text">
                            {proj.resources}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${getStatusClass(proj.status)}`}
                          >
                            {proj.status}
                          </span>
                        </td>
                        <td>
                          {proj.startDate
                            ? new Date(proj.startDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          {proj.endDate
                            ? new Date(proj.endDate).toLocaleDateString()
                            : <span className="text-muted">Ongoing</span>}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleDeleteProject(proj.id, proj.projectName)
                            }
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: EMPLOYEES ================= */}
      {activeTab === 'employees' && (
        <div className="tab-content">
          <div className="card form-card">
            <h2>Add Employee</h2>
            <form onSubmit={handleAddEmployee} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Salary ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={empDeptId}
                    onChange={(e) => setEmpDeptId(e.target.value)}
                  >
                    <option value="">-- None / Select --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                Add Employee
              </button>
            </form>
          </div>

          <div className="data-section">
            <div className="section-header">
              <h2>Employees List ({employees.length})</h2>
              <button onClick={loadData} className="btn btn-secondary">
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="loading">Loading employees from GraphQL...</p>
            ) : employees.length === 0 ? (
              <p className="empty-state">No employees found. Add one above!</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Salary</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id}>
                        <td>#{emp.id}</td>
                        <td>
                          <strong>{emp.name}</strong>
                        </td>
                        <td>{emp.email}</td>
                        <td>
                          {emp.salary
                            ? `$${emp.salary.toLocaleString()}`
                            : '-'}
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {emp.department?.name || 'Unassigned'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleDeleteEmployee(emp.id, emp.name)
                            }
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: DEPARTMENTS ================= */}
      {activeTab === 'departments' && (
        <div className="tab-content">
          <div className="card form-card">
            <h2>Add Department</h2>
            <form onSubmit={handleAddDepartment} className="form">
              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Marketing"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Department
              </button>
            </form>
          </div>

          <div className="data-section">
            <h2>Departments Overview ({departments.length})</h2>
            {departments.length === 0 ? (
              <p className="empty-state">No departments created yet.</p>
            ) : (
              <div className="departments-grid">
                {departments.map((dept) => (
                  <div key={dept.id} className="dept-badge-card">
                    <h3>{dept.name}</h3>
                    <p className="dept-count">
                      {dept.employees?.length || 0} employees
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ASSIGN PROJECTS ================= */}
      {activeTab === 'assignments' && (
        <div className="tab-content">
          <div className="card form-card">
            <h2>Assign Employee to Project</h2>
            <form onSubmit={handleAssignProject} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Select Employee</label>
                  <select
                    value={assignEmpId}
                    onChange={(e) => setAssignEmpId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Project</label>
                  <select
                    value={assignProjId}
                    onChange={(e) => setAssignProjId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.projectName} [{proj.status}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={employees.length === 0 || projects.length === 0}
              >
                Assign Project
              </button>
            </form>
          </div>

          <div className="data-section">
            <div className="section-header">
              <h2>Project Assignments ({employeeProjects.length})</h2>
              <button onClick={loadData} className="btn btn-secondary">
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="loading">Loading assignments from GraphQL...</p>
            ) : employeeProjects.length === 0 ? (
              <p className="empty-state">
                No employees are currently assigned to any projects.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Assignment ID</th>
                      <th>Employee Name</th>
                      <th>Email</th>
                      <th>Project Name</th>
                      <th>Project Status</th>
                      <th>Assigned At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeProjects.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>
                          <strong>{item.employee?.name || `ID #${item.employeeId}`}</strong>
                        </td>
                        <td>{item.employee?.email || '-'}</td>
                        <td>
                          <span className="project-highlight">
                            {item.project?.projectName || `ID #${item.projectId}`}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${getStatusClass(
                              item.project?.status
                            )}`}
                          >
                            {item.project?.status || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleRemoveAssignment(
                                item.id,
                                item.employee?.name,
                                item.project?.projectName
                              )
                            }
                            className="btn btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
