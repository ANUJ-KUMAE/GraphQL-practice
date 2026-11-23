import prisma from '../lib/prisma.js';

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
      projectId(id: ID!): Project
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
         return await prisma.project.findMany();
      },
      project: async (_, { id }) => {
         return await prisma.project.findUnique({
            where: { id: parseInt(id) },
         });
      },
      projectId: async (_, { id }) => {
         return await prisma.project.findUnique({
            where: { id: parseInt(id) },
         });
      },
   },

   Mutation: {
      createProject: async (_, { projectName, resources, status, startDate, endDate }) => {
         return await prisma.project.create({
            data: {
               projectName,
               resources,
               status,
               ...(startDate && { startDate: new Date(startDate) }),
               ...(endDate && { endDate: new Date(endDate) }),
            },
         });
      },

      updateProject: async (_, { id, projectName, resources, status, startDate, endDate }) => {
         return await prisma.project.update({
            where: { id: parseInt(id) },
            data: {
               ...(projectName && { projectName }),
               ...(resources && { resources }),
               ...(status && { status }),
               ...(startDate && { startDate: new Date(startDate) }),
               ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
            },
         });
      },

      deleteProject: async (_, { id }) => {
         await prisma.project.delete({
            where: { id: parseInt(id) },
         });
         return true;
      },
   },
};
