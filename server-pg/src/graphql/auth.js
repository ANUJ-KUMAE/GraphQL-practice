import pool, { SCHEMA } from '../db/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_123456789';

// Auth Guard Helpers for Authorization
export function requireAuth(context) {
  if (!context?.user) {
    throw new Error('Authentication required: Please log in to continue.');
  }
  return context.user;
}

export function requireRole(context, role = 'ADMIN') {
  const user = requireAuth(context);
  if (user.role !== role) {
    throw new Error(`Forbidden: Access requires ${role} role.`);
  }
  return user;
}

export const authTypeDefs = `
    type User {
      id: ID!
      name: String!
      email: String!
      role: String!
      createdAt: String
    }

    type AuthPayload {
      token: String!
      user: User!
    }

    extend type Query {
      me: User
      users: [User!]!
    }

    extend type Mutation {
      register(name: String!, email: String!, password: String!, role: String): AuthPayload!
      login(email: String!, password: String!): AuthPayload!
    }
`;

// Backwards compatibility alias
export const UserDef = authTypeDefs;

export const authResolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) return null;
      const { rows } = await pool.query(
        `SELECT id, name, email, role, "createdAt" FROM "${SCHEMA}"."User" WHERE id = $1;`,
        [context.user.id]
      );
      return rows[0] || null;
    },

    users: async (_, __, context) => {
      requireRole(context, 'ADMIN'); // Only admins can view user list
      const { rows } = await pool.query(
        `SELECT id, name, email, role, "createdAt" FROM "${SCHEMA}"."User" ORDER BY id ASC;`
      );
      return rows;
    },
  },

  Mutation: {
    register: async (_, { name, email, password, role }) => {
      // 1. Check if user already exists
      const existing = await pool.query(
        `SELECT id FROM "${SCHEMA}"."User" WHERE email = $1;`,
        [email.toLowerCase().trim()]
      );
      if (existing.rows.length > 0) {
        throw new Error('User with this email already exists.');
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';

      // 3. Insert into database
      const { rows } = await pool.query(
        `INSERT INTO "${SCHEMA}"."User" (name, email, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, name, email, role, "createdAt";`,
        [name.trim(), email.toLowerCase().trim(), hashedPassword, userRole]
      );
      const user = rows[0];

      // 4. Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { token, user };
    },

    login: async (_, { email, password }) => {
      // 1. Fetch user by email
      const { rows } = await pool.query(
        `SELECT * FROM "${SCHEMA}"."User" WHERE email = $1;`,
        [email.toLowerCase().trim()]
      );
      const user = rows[0];
      if (!user) {
        throw new Error('Invalid email or password.');
      }

      // 2. Verify password with bcrypt
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid email or password.');
      }

      // 3. Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    },
  },
};
