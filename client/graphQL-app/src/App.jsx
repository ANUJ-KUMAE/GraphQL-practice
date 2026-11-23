import { useState, useEffect } from 'react';
import {
  fetchGraphQL,
  GET_INITIAL_DATA,
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
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employeeProjects, setEmployeeProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'projects' | 'employees' | 'departments'

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

  // Fetch initial data from GraphQL backend
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

  useEffect(() => {
    loadData();
  }, []);

  // 1. Add Department
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

  // 2. Add Employee
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

  // 3. Add Project
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

  // 4. Assign Employee to Project
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

  // 5. Remove Project Assignment
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

  // Delete Handlers
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

  return (
    <div className="container">
      <header className="header">
        <h1>GraphQL + PostgreSQL Dashboard</h1>
        <p className="subtitle">
          Manage Departments, Employees, Projects & Assignments via Apollo Server
        </p>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            🔗 Assign Projects ({employeeProjects.length})
          </button>
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
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* ================= TAB: ASSIGN PROJECTS ================= */}
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

              {employees.length === 0 && (
                <p className="hint-text">
                  ⚠️ No employees found. Please add an employee first.
                </p>
              )}
              {projects.length === 0 && (
                <p className="hint-text">
                  ⚠️ No projects found. Please add a project first.
                </p>
              )}
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
                No employees are currently assigned to any projects. Use the form above to assign one!
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

      {/* ================= TAB: PROJECTS ================= */}
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

      {/* ================= TAB: EMPLOYEES ================= */}
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

      {/* ================= TAB: DEPARTMENTS ================= */}
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
    </div>
  );
}

export default App;
