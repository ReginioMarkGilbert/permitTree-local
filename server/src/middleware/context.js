const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/admin');

const context = async ({ req }) => {
   const token = req.headers.authorization?.replace('Bearer ', '');

   if (!token) {
      return { user: null, admin: null };
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's an admin token
      if (decoded.roles && decoded.roles.some(role =>
         ['Chief_RPS', 'superadmin', 'Technical_Staff', 'Chief_TSD',
          'Receiving_Clerk', 'Releasing_Clerk', 'Accountant',
          'OOP_Staff_Incharge', 'Bill_Collector', 'Credit_Officer',
          'PENR_CENR_Officer', 'Deputy_CENR_Officer',
          'Inspection_Team'].includes(role))) {
         const admin = await Admin.findById(decoded.id);
         return { admin, user: null };
      }

      // Otherwise, it's a regular user token
      const user = await User.findById(decoded.id);
      return { user, admin: null };

   } catch (error) {
      console.error('Auth error:', error);
      return { user: null, admin: null };
   }
};

module.exports = context; 
