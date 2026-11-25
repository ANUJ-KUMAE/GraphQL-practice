const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  (import.meta.env.DEV ? 'http://localhost:8001/graphql' : '/graphql');

export async function fetchGraphQL(query, variables = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();
  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors.map((e) => e.message).join(', '));
  }
  return result.data;
}

// Queries
export const GET_INITIAL_DATA = `
  query GetInitialData {
    departments {
      id
      name
      employees {
        id
        name
        email
        salary
      }
    }
    employees {
      id
      name
      email
      salary
      department {
        id
        name
      }
    }
    projects {
      id
      projectName
      resources
      status
      startDate
      endDate
    }
    employeeProjects {
      id
      employeeId
      projectId
      createdAt
      employee {
        id
        name
        email
      }
      project {
        id
        projectName
        status
        resources
      }
    }
  }
`;

export const ME_QUERY = `
  query GetCurrentUser {
    me {
      id
      name
      email
      role
    }
  }
`;

// Mutations - Auth
export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = `
  mutation Register($name: String!, $email: String!, $password: String!, $role: String) {
    register(name: $name, email: $email, password: $password, role: $role) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

// Mutations - Department
export const CREATE_DEPARTMENT = `
  mutation CreateDepartment($name: String!) {
    createDepartment(name: $name) {
      id
      name
    }
  }
`;

// Mutations - Employee
export const CREATE_EMPLOYEE = `
  mutation CreateEmployee($name: String!, $email: String!, $salary: Float, $departmentId: Int) {
    createEmployee(name: $name, email: $email, salary: $salary, departmentId: $departmentId) {
      id
      name
      email
      salary
      department {
        id
        name
      }
    }
  }
`;

export const DELETE_EMPLOYEE = `
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

// Mutations - Project
export const CREATE_PROJECT = `
  mutation CreateProject(
    $projectName: String!
    $resources: String!
    $status: String!
    $startDate: String
    $endDate: String
  ) {
    createProject(
      projectName: $projectName
      resources: $resources
      status: $status
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      projectName
      resources
      status
      startDate
      endDate
    }
  }
`;

export const DELETE_PROJECT = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

// Mutations - Assign Project to Employee
export const ASSIGN_PROJECT = `
  mutation AssignProject($employeeId: ID!, $projectId: ID!) {
    assignProject(employeeId: $employeeId, projectId: $projectId) {
      id
      employeeId
      projectId
      createdAt
      employee {
        id
        name
        email
      }
      project {
        id
        projectName
        status
      }
    }
  }
`;

export const REMOVE_ASSIGNMENT = `
  mutation RemoveProjectAssignment($id: ID!) {
    removeProjectAssignment(id: $id)
  }
`;
