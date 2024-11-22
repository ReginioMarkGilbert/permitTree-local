const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { graphqlUploadExpress } = require('graphql-upload-minimal');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
const Admin = require('./src/models/admin');

const { permitTypes } = require('./src/schema/permitTypes');
const typeDefs = require('./src/schema');
const resolvers = require('./src/resolvers');

const startServer = async () => {
   const app = express();

   // await mongoose.connect(process.env.MONGO_URI_NEW);
   // console.log('MongoDB connected');
   try {
      await mongoose.connect(process.env.MONGO_URI_ONLINE, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      });
      console.log('MongoDB Atlas connected successfully');
   } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1); // Exit process with failure
   }

   const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
         const token = req.headers.authorization || '';
         if (token) {
            try {
               const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
               let user = await User.findById(decoded.id);
               if (!user) {
                  user = await Admin.findById(decoded.id);
               }
               if (user) {
                  console.log('User found in context:', user.id, user.roles);
                  return { user };
               }
            } catch (error) {
               console.error('Error verifying token:', error);
            }
         }
         console.log('No user in context');
         return {};
      },
   });

   await server.start();

   const corsOptions = {
      origin: ['http://localhost:5174', 'https://permittree.vercel.app'],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
   };

   app.use(cors(corsOptions));
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ limit: '50mb', extended: true }));
   app.use(graphqlUploadExpress());

   app.get('/', (req, res) => {
      res.send('PermiTree API is running!');
   });

   app.use('/graphql', expressMiddleware(server, {
      context: async ({ req }) => {
         const token = req.headers.authorization || '';
         if (token) {
            try {
               const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
               let user = await User.findById(decoded.id);
               if (!user) {
                  user = await Admin.findById(decoded.id);
               }
               if (user) {
                  console.log('User found in context:', user.id, user.roles);
                  return { user };
               }
            } catch (error) {
               console.error('Error verifying token:', error);
            }
         }
         console.log('No user in context - server');
         return {};
      },
   }));

   // const PORT = process.env.PORT || 3001;
   // const HOST = process.env.HOST || 'localhost';
   // app.listen(PORT, HOST, () => {
   //    console.log(`Server running on http://${HOST}:${PORT}/graphql`);
   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/graphql`);
   });
};

startServer();
