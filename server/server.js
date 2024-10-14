const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { graphqlUploadExpress } = require('graphql-upload-minimal');
const mongoose = require('mongoose');
const cors = require('cors');
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
      csrfPrevention: false,
   });

   await server.start();

   app.use(cors());
   // Increase the payload size limit (e.g., to 10MB)
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ extended: true, limit: '10mb' }));
   app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 })); // 10MB limit

   app.use('/graphql', expressMiddleware(server, {
      context: async ({ req }) => {
         const token = req.headers.authorization || '';
         return { token };
      },
   }));

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/graphql`);
   });
};

startServer();
