const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { permitTypes, resolvePermitType } = require('./schema/permitTypes');
const userResolvers = require('./resolvers/userResolvers');
const adminResolvers = require('./resolvers/adminResolvers');
const permitResolvers = require('./resolvers/permitResolvers/permitResolvers');
const covResolvers = require('./resolvers/permitResolvers/covResolvers');
const csawResolvers = require('./resolvers/permitResolvers/csawResolvers');
const pltcpResolvers = require('./resolvers/permitResolvers/pltcpResolvers');
const ptprResolvers = require('./resolvers/permitResolvers/ptprResolvers');
const pltpResolvers = require('./resolvers/permitResolvers/pltpResolvers');
const tcebpResolvers = require('./resolvers/permitResolvers/tcebpResolvers');
const { userTypes } = require('./schema/userTypes');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware to parse JWT token
const getUser = (token) => {
   if (token) {
      try {
         return jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
         throw new Error('Session invalid');
      }
   }
};

const server = new ApolloServer({
   typeDefs: [userTypes, permitTypes],
   resolvers: [
      {
         Permit: {
            __resolveType: resolvePermitType
         }
      },
      userResolvers,
      adminResolvers,
      permitResolvers,
      covResolvers,
      csawResolvers,
      pltcpResolvers,
      ptprResolvers,
      pltpResolvers,
      tcebpResolvers
   ],
   context: ({ req }) => {
      const token = req.headers.authorization || '';
      const user = getUser(token.replace('Bearer ', ''));
      return { user };
   },
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('Could not connect to MongoDB', err));

async function startServer() {
   await server.start();
   server.applyMiddleware({ app });

   const PORT = process.env.PORT || 4000;
   app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`);
   });
}

startServer();
