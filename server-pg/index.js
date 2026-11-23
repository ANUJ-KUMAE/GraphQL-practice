import express from 'express';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express4';
import 'dotenv/config';
import { typeDefs, resolvers } from './src/graphql/index.js';
import { initDb } from './src/db/initDb.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 8001;

  // Ensure WithPostgreSQL schema and tables exist
  try {
    await initDb();
  } catch (err) {
    console.error('❌ Failed to initialize database tables:', err.message);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server)
  );

  app.listen({ port: PORT }, () => {
    console.log(`🚀 Apollo + PostgreSQL (Raw SQL) running at http://localhost:${PORT}/graphql`);
  });
}

startServer();
