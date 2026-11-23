import pool, { SCHEMA } from '../db/index.js';

export const employeeTypeDefs = `
  type Employee {
    id: ID!
    name: String!
    email: String!
    salary: Float
    departmentId: Int
    department: Department
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    employees: [Employee!]!
    employee(id: ID!): Employee
  }

  extend type Mutation {
    createEmployee(name: String!, email: String!, salary: Float, departmentId: Int): Employee!
    updateEmployee(id: ID!, name: String, salary: Float, departmentId: Int): Employee!
    deleteEmployee(id: ID!): Boolean!
  }
`;

export const employeeResolvers = {
  Employee: {
    department: async (parent) => {
      if (!parent.departmentId) return null;
      const query = `SELECT * FROM "${SCHEMA}"."Department" WHERE id = $1;`;
      const { rows } = await pool.query(query, [parent.departmentId]);
      return rows[0] || null;
    },
  },

  Query: {
    employees: async () => {
      const query = `SELECT * FROM "${SCHEMA}"."Employee" ORDER BY id ASC;`;
      const { rows } = await pool.query(query);
      return rows;
    },

    employee: async (_, { id }) => {
      const query = `SELECT * FROM "${SCHEMA}"."Employee" WHERE id = $1;`;
      const { rows } = await pool.query(query, [parseInt(id)]);
      return rows[0] || null;
    },
  },

  Mutation: {
    createEmployee: async (_, { name, email, salary, departmentId }) => {
      const query = `
        INSERT INTO "${SCHEMA}"."Employee" (name, email, salary, "departmentId", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *;
      `;
      const values = [
        name,
        email,
        salary !== undefined ? salary : null,
        departmentId !== undefined ? parseInt(departmentId) : null,
      ];
      const { rows } = await pool.query(query, values);
      return rows[0];
    },

    updateEmployee: async (_, { id, name, salary, departmentId }) => {
      const updates = [];
      const values = [];
      let index = 1;

      if (name !== undefined) {
        updates.push(`name = $${index++}`);
        values.push(name);
      }
      if (salary !== undefined) {
        updates.push(`salary = $${index++}`);
        values.push(salary);
      }
      if (departmentId !== undefined) {
        updates.push(`"departmentId" = $${index++}`);
        values.push(departmentId ? parseInt(departmentId) : null);
      }

      updates.push(`"updatedAt" = NOW()`);
      values.push(parseInt(id));

      const query = `
        UPDATE "${SCHEMA}"."Employee"
        SET ${updates.join(', ')}
        WHERE id = $${index}
        RETURNING *;
      `;

      const { rows } = await pool.query(query, values);
      return rows[0];
    },

    deleteEmployee: async (_, { id }) => {
      const query = `DELETE FROM "${SCHEMA}"."Employee" WHERE id = $1;`;
      const result = await pool.query(query, [parseInt(id)]);
      return (result.rowCount ?? 0) > 0;
    },
  },
};
