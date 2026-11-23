import pool, { SCHEMA } from '../db/index.js';

export const assignProjectTypeDefs = `
  type EmployeeProject {
    id: ID!
    employeeId: Int!
    projectId: Int!
    employee: Employee
    project: Project
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    employeeProjects: [EmployeeProject!]!
    employeeProject(id: ID!): EmployeeProject
    getProjectsByEmployee(employeeId: ID!): [EmployeeProject!]!
    getEmployeesByProject(projectId: ID!): [EmployeeProject!]!
  }

  extend type Mutation {
    assignProject(employeeId: ID!, projectId: ID!): EmployeeProject!
    removeProjectAssignment(id: ID!): Boolean!
  }
`;

export const assignProjectResolvers = {
  EmployeeProject: {
    employee: async (parent) => {
      const { rows } = await pool.query(
        `SELECT * FROM "${SCHEMA}"."Employee" WHERE id = $1;`,
        [parent.employeeId]
      );
      return rows[0] || null;
    },
    project: async (parent) => {
      const { rows } = await pool.query(
        `SELECT * FROM "${SCHEMA}"."Project" WHERE id = $1;`,
        [parent.projectId]
      );
      return rows[0] || null;
    },
  },

  Query: {
    employeeProjects: async () => {
      const { rows } = await pool.query(
        `SELECT * FROM "${SCHEMA}"."EmployeeProject" ORDER BY id ASC;`
      );
      return rows;
    },

    employeeProject: async (_, { id }) => {
      const { rows } = await pool.query(
        `SELECT * FROM "${SCHEMA}"."EmployeeProject" WHERE id = $1;`,
        [parseInt(id)]
      );
      return rows[0] || null;
    },

    getProjectsByEmployee: async (_, { employeeId }) => {
      const { rows } = await pool.query(
        `SELECT * FROM "${SCHEMA}"."EmployeeProject" WHERE "employeeId" = $1 ORDER BY id ASC;`,
        [parseInt(employeeId)]
      );
      return rows;
    },

    getEmployeesByProject: async (_, { projectId }) => {
      const { rows } = await pool.query(
        `SELECT * FROM "${SCHEMA}"."EmployeeProject" WHERE "projectId" = $1 ORDER BY id ASC;`,
        [parseInt(projectId)]
      );
      return rows;
    },
  },

  Mutation: {
    assignProject: async (_, { employeeId, projectId }) => {
      const empId = parseInt(employeeId);
      const projId = parseInt(projectId);

      // 1. Check if assignment already exists
      const existing = await pool.query(
        `SELECT * FROM "${SCHEMA}"."EmployeeProject" WHERE "employeeId" = $1 AND "projectId" = $2;`,
        [empId, projId]
      );

      if (existing.rows.length > 0) {
        return existing.rows[0];
      }

      // 2. Insert new assignment
      const insertQuery = `
        INSERT INTO "${SCHEMA}"."EmployeeProject" ("employeeId", "projectId", "createdAt", "updatedAt")
        VALUES ($1, $2, NOW(), NOW())
        RETURNING *;
      `;
      const { rows } = await pool.query(insertQuery, [empId, projId]);
      return rows[0];
    },

    removeProjectAssignment: async (_, { id }) => {
      const result = await pool.query(
        `DELETE FROM "${SCHEMA}"."EmployeeProject" WHERE id = $1;`,
        [parseInt(id)]
      );
      return (result.rowCount ?? 0) > 0;
    },
  },
};
