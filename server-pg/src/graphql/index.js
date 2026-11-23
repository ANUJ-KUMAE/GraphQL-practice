import { departmentTypeDefs, departmentResolvers } from './department.js';
import { employeeTypeDefs, employeeResolvers } from './employee.js';
import { projectTypeDefs, projectResolvers } from './project.js';
import { assignProjectTypeDefs, assignProjectResolvers } from './assignProject.js';

const baseTypeDefs = `
  type Query
  type Mutation
`;

export const typeDefs = [
  baseTypeDefs,
  departmentTypeDefs,
  employeeTypeDefs,
  projectTypeDefs,
  assignProjectTypeDefs,
];

export const resolvers = {
  Query: {
    ...departmentResolvers.Query,
    ...employeeResolvers.Query,
    ...projectResolvers.Query,
    ...assignProjectResolvers.Query,
  },
  Mutation: {
    ...departmentResolvers.Mutation,
    ...employeeResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...assignProjectResolvers.Mutation,
  },
  Department: departmentResolvers.Department,
  Employee: employeeResolvers.Employee,
  EmployeeProject: assignProjectResolvers.EmployeeProject,
};
