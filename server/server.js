const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { graphqlUploadExpress } = require('graphql-upload-minimal');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');

const typeDefs = require('./src/schema');
const resolvers = require('./src/resolvers');

const startServer = async () => {
   const app = express();

   await mongoose.connect(process.env.MONGO_URI_NEW);
   console.log('MongoDB connected');

   const server = new ApolloServer({
      typeDefs,
      resolvers,
   });

   await server.start();

   app.use(cors());

   // Increase the payload size limit (adjust the limit as needed)
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ limit: '50mb', extended: true }));

   app.use(graphqlUploadExpress());

   app.use('/graphql', expressMiddleware(server, {
      context: async ({ req }) => {
         const token = req.headers.authorization || '';
         if (token) {
            try {
               const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
               const user = await User.findById(decoded.id);
               return { user };
            } catch (error) {
               console.error('Error verifying token:', error);
            }
         }
         return {};
      },
   }));

   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/graphql`);
   });
};

startServer();
