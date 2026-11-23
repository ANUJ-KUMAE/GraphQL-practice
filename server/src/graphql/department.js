import prisma from '../lib/prisma.js';

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
    employees: (parent) => {
      return prisma.employee.findMany({
        where: { departmentId: parent.id },
      });
    },
  },
  Query: {
    departments: async () => {
      return await prisma.department.findMany();
    },
    department: async (_, { id }) => {
      return await prisma.department.findUnique({
        where: { id: parseInt(id) },
      });
    },
  },
  Mutation: {
    createDepartment: async (_, { name }) => {
      return await prisma.department.create({
        data: { name },
      });
    },
  },
};

