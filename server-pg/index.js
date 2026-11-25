import express from 'express';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express4';
import 'dotenv/config';
import { typeDefs, resolvers } from './src/graphql/index.js';
import { initDb } from './src/db/initDb.js';
import jwt from 'jsonwebtoken';

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
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) return { user: null };

        try {
          const secret = process.env.JWT_SECRET || 'supersecretjwtkey_123456789';
          const decoded = jwt.verify(token, secret);
          return { user: decoded };
        } catch (err) {
          return { user: null };
        }
      }
    })
  );

  app.listen({ port: PORT }, () => {
    console.log(`🚀 Apollo + PostgreSQL (Raw SQL) running at http://localhost:${PORT}/graphql`);
  });
}

startServer();
