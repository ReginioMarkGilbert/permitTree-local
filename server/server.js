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
const { scheduleCertificateExpirationCheck } = require('./src/utils/certificateExpirationChecker');

const startServer = async () => {
   const app = express();
   // await mongoose.connect(process.env.MONGO_URI_NEW);
   try {
      await mongoose.connect(process.env.MONGO_URI_ONLINE, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');

      // Schedule certificate expiration check
      scheduleCertificateExpirationCheck();

      // Create Apollo Server instance
      const server = new ApolloServer({
         typeDefs,
         resolvers,
      });

      // Start the Apollo Server
      await server.start();

      const corsOptions = {
         origin: [
            'http://localhost:5174',
            'https://permittree-frontend-dev.vercel.app',
            'https://permittree-backend-dev.vercel.app',
            'https://permittree-staging.vercel.app',
            'https://permittree-frontend.vercel.app',
            'https://permittree-backend.vercel.app'
         ],
         credentials: true,
         methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
         allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight'],
         exposedHeaders: ['Access-Control-Allow-Origin']
      };

      app.use(cors(corsOptions));
      app.options('*', cors(corsOptions));
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ limit: '50mb', extended: true }));
      app.use(graphqlUploadExpress());

      app.get('/', (req, res) => {
         res.send('PermiTree API is running!');
      });

      app.get('/favicon.ico', (req, res) => {
         res.status(204).end(); // No content response
      });

      app.use('/graphql', expressMiddleware(server, {
         context: async ({ req }) => {
            const token = req.headers.authorization || '';
            if (token) {
               try {
                  const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

                  // First check if it's an admin
                  let admin = await Admin.findById(decoded.id);
                  if (admin) {
                     console.log('Admin found in context:', admin.id, admin.roles);
                     return { admin }; // Return admin context
                  }

                  // If not admin, check if it's a regular user
                  let user = await User.findById(decoded.id);
                  if (user) {
                     console.log('User found in context:', user.id, user.roles);
                     return { user }; // Return user context
                  }
               } catch (error) {
                  console.error('Error verifying token:', error);
               }
            }
            console.log('No user/admin in context - server');
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
   } catch (error) {
      console.error('Error starting server:', error);
   }
};

startServer();
