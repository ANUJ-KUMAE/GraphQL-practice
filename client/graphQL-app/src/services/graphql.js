const GRAPHQL_ENDPOINT = 'http://localhost:8001/graphql';

export async function fetchGraphQL(query, variables = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
