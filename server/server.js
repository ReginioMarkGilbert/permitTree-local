const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

const typeDefs = require('./src/schema/typeDefs');
const resolvers = require('./src/resolvers');

const startServer = async () => {
   const app = express();

   await mongoose.connect(process.env.MONGO_URI_NEW);
   console.log('MongoDB connected');

   const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({ req }),
      formatError: (error) => {
         console.error('GraphQL Error:', error);
         return error;
      },
   });

   await server.start();
   server.applyMiddleware({ app });

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`);
   });
};

startServer();
