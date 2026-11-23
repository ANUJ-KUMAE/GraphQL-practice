import pool, { SCHEMA } from '../db/index.js';

export const departmentTypeDefs = `
  type Department {
    id: ID!
    name: String!
    employees: [Employee!]
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    departments: [Department!]!
    department(id: ID!): Department
  }

  extend type Mutation {
    createDepartment(name: String!): Department!
  }
`;

export const departmentResolvers = {
  Department: {
    employees: async (parent) => {
      const query = `
        SELECT * FROM "${SCHEMA}"."Employee"
        WHERE "departmentId" = $1
        ORDER BY id ASC;
      `;
      const { rows } = await pool.query(query, [parent.id]);
      return rows;
    },
  },

  Query: {
    departments: async () => {
      const query = `SELECT * FROM "${SCHEMA}"."Department" ORDER BY id ASC;`;
      const { rows } = await pool.query(query);
      return rows;
    },

    department: async (_, { id }) => {
      const query = `SELECT * FROM "${SCHEMA}"."Department" WHERE id = $1;`;
      const { rows } = await pool.query(query, [parseInt(id)]);
      return rows[0] || null;
    },
  },

  Mutation: {
    createDepartment: async (_, { name }) => {
      const query = `
        INSERT INTO "${SCHEMA}"."Department" (name, "createdAt", "updatedAt")
        VALUES ($1, NOW(), NOW())
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [name]);
      return rows[0];
    },
  },
};
