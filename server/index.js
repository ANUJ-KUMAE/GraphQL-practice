import express from 'express';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express4';
import { typeDefs, resolvers } from './src/graphql/index.js';

async function startServer() {
    const app = express();

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

    app.listen({ port: 8000 }, () => {
        console.log(`Server is running at http://localhost:8000/graphql`);
    });
}

startServer();
