import prisma from '../lib/prisma.js';

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
    department: (parent) => {
      if (!parent.departmentId) return null;
      return prisma.department.findUnique({
        where: { id: parent.departmentId },
      });
    },
  },
  Query: {
    employees: async () => {
      return await prisma.employee.findMany();
    },
    employee: async (_, { id }) => {
      return await prisma.employee.findUnique({
        where: { id: parseInt(id) },
      });
    },
  },
  Mutation: {
    createEmployee: async (_, { name, email, salary, departmentId }) => {
      return await prisma.employee.create({
        data: {
          name,
          email,
          salary,
          departmentId: departmentId ? parseInt(departmentId) : null,
        },
      });
    },
    updateEmployee: async (_, { id, name, salary, departmentId }) => {
      return await prisma.employee.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(salary !== undefined && { salary }),
          ...(departmentId !== undefined && { departmentId: parseInt(departmentId) }),
        },
      });
    },
    deleteEmployee: async (_, { id }) => {
      await prisma.employee.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },
  },
};

