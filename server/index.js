const express = require('express');
const { ApolloServer } = require('@apollo/server');
const bodyParser = require('body-parser');
const cors = require('cors');
const { expressMiddleware } = require('@as-integrations/express4');
const axios = require('axios');
const Users = require('./users');
const TODOS = require('./todo');

async function startServer() {
    const app = express();
    const server = new ApolloServer({
        typeDefs: `

           type Geo {
                lat: String
                lng: String
            }

            type Address {
                street: String
                suite: String
                city: String
                zipcode: String
                geo: Geo
            }

            type Company {
                name: String
                catchPhrase: String
                bs: String
            }

            type Users {
                id: ID!
                name: String!
                username: String!
                email: String!
                phone: String!
                website: String!
                address: Address
                company: Company
                todos: [Todo]
            }

           type Todo {
                id: ID!
                title: String!
                completed: Boolean
                userId: ID
                user: Users
            }

            type Query {
                getAllTodos: [Todo]
                getAllUsers: [Users]
                getAllUsersBasedONID(id: ID!): Users
                getUsersByCity(city: String): [Users!]!
            }
        `,

        resolvers: {
            Todo: {
                user: (todo) => Users.find(user => user.id === parseInt(todo.userId))
            },
            Users: {
                todos: (user) => TODOS.filter(todo => todo.userId === parseInt(user.id))
            },
            Query: {
                getAllTodos: () => TODOS,
                getAllUsers: () => Users,
                getAllUsersBasedONID: (_, { id }) => {
                    const user = Users.find(user => user.id === parseInt(id));
                    return user;
                },
                getUsersByCity: (_, { city }) => {
                    return Users.filter(user => user.address.city.toLowerCase() === city.toLowerCase());
                }
            }
        }


    })



    await server.start();

    app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(server)
    );
    app.listen({ port: 8000 }, () => {
        console.log(`Server is running on port 8000`)
    })
}

startServer();