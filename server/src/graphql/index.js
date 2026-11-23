import { departmentTypeDefs, departmentResolvers } from './department.js';
import { employeeTypeDefs, employeeResolvers } from './employee.js';
import { projectTypeDefs, projectResolvers } from './project.js';

const baseTypeDefs = `
  type Query
  type Mutation
`;

export const typeDefs = [baseTypeDefs, departmentTypeDefs, employeeTypeDefs, projectTypeDefs];

export const resolvers = {
  Query: {
    ...departmentResolvers.Query,
    ...employeeResolvers.Query,
    ...projectResolvers.Query,
  },
  Mutation: {
    ...departmentResolvers.Mutation,
    ...employeeResolvers.Mutation,
    ...projectResolvers.Mutation,
  },
  Department: departmentResolvers.Department,
  Employee: employeeResolvers.Employee,
};
