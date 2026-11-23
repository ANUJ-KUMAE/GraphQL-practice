import pool, { SCHEMA } from '../db/index.js';

export const projectTypeDefs = `
  type Project {
    id: ID!
    projectName: String!
    resources: String!
    status: String!
    startDate: String!
    endDate: String
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    projects: [Project!]!
    project(id: ID!): Project
  }

  extend type Mutation {
    createProject(
      projectName: String!
      resources: String!
      status: String!
      startDate: String
      endDate: String
    ): Project!

    updateProject(
      id: ID!
      projectName: String
      resources: String
      status: String
      startDate: String
      endDate: String
    ): Project!

    deleteProject(id: ID!): Boolean!
  }
`;

export const projectResolvers = {
  Query: {
    projects: async () => {
      const query = `SELECT * FROM "${SCHEMA}"."Project" ORDER BY id ASC;`;
      const { rows } = await pool.query(query);
      return rows;
    },

    project: async (_, { id }) => {
      const query = `SELECT * FROM "${SCHEMA}"."Project" WHERE id = $1;`;
      const { rows } = await pool.query(query, [parseInt(id)]);
      return rows[0] || null;
    },
  },

  Mutation: {
    createProject: async (_, { projectName, resources, status, startDate, endDate }) => {
      const query = `
        INSERT INTO "${SCHEMA}"."Project" ("projectName", resources, status, "startDate", "endDate", "createdAt", "updatedAt")
        VALUES (
          $1, 
          $2, 
          $3, 
          COALESCE($4::timestamp, NOW()), 
          $5::timestamp, 
          NOW(), 
          NOW()
        )
        RETURNING *;
      `;
      const values = [
        projectName,
        resources,
        status,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null,
      ];
      const { rows } = await pool.query(query, values);
      return rows[0];
    },

    updateProject: async (_, { id, projectName, resources, status, startDate, endDate }) => {
      const updates = [];
      const values = [];
      let index = 1;

      if (projectName !== undefined) {
        updates.push(`"projectName" = $${index++}`);
        values.push(projectName);
      }
      if (resources !== undefined) {
        updates.push(`resources = $${index++}`);
        values.push(resources);
      }
      if (status !== undefined) {
        updates.push(`status = $${index++}`);
        values.push(status);
      }
      if (startDate !== undefined) {
        updates.push(`"startDate" = $${index++}::timestamp`);
        values.push(startDate ? new Date(startDate) : null);
      }
      if (endDate !== undefined) {
        updates.push(`"endDate" = $${index++}::timestamp`);
        values.push(endDate ? new Date(endDate) : null);
      }

      updates.push(`"updatedAt" = NOW()`);
      values.push(parseInt(id));

      const query = `
        UPDATE "${SCHEMA}"."Project"
        SET ${updates.join(', ')}
        WHERE id = $${index}
        RETURNING *;
      `;

      const { rows } = await pool.query(query, values);
      return rows[0];
    },

    deleteProject: async (_, { id }) => {
      const query = `DELETE FROM "${SCHEMA}"."Project" WHERE id = $1;`;
      const result = await pool.query(query, [parseInt(id)]);
      return (result.rowCount ?? 0) > 0;
    },
  },
};
