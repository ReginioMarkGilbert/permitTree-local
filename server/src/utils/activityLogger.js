const UserActivity = require('../models/UserActivity');
const Admin = require('../models/admin');
const User = require('../models/User');

const logUserActivity = async ({
   userId,
   type,
   details,
   metadata = {},
   req = null
}) => {
   try {
      // Check if the user is an admin
      let userModel = await User.findById(userId);
      let isAdmin = false;

      if (!userModel) {
         userModel = await Admin.findById(userId);
         isAdmin = true;
      }

      if (!userModel) {
         console.error('No user or admin found for ID:', userId);
         return;
      }

      const activity = new UserActivity({
         userId,
         userModel: isAdmin ? 'Admin' : 'User',
         type,
         details,
         metadata: {
            ...metadata,
            ip: req?.ip,
            userAgent: req?.headers['user-agent'],
            timestamp: new Date(),
            isAdmin,
            userType: isAdmin ? 'Admin' : 'User'
         }
      });

      await activity.save();
      return activity;
   } catch (error) {
      console.error('Error logging user activity:', error);
   }
};

module.exports = { logUserActivity };
