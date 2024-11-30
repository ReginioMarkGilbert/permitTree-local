const UserActivity = require('../models/UserActivity');
const Admin = require('../models/admin');
const User = require('../models/User');

const activityResolvers = {
   Query: {
      allActivities: async (_, { filter, page = 1, limit = 10 }, { admin }) => {
         if (!admin || !admin.roles.includes('superadmin')) {
            throw new Error('Not authorized to view activities');
         }

         try {
            let query = {};

            // Apply filters
            if (filter) {
               if (filter.searchTerm) {
                  // Search in both User and Admin collections for matching names
                  const searchRegex = new RegExp(filter.searchTerm, 'i');
                  const users = await User.find({
                     $or: [
                        { firstName: searchRegex },
                        { lastName: searchRegex },
                        { username: searchRegex }
                     ]
                  }).select('_id');
                  const admins = await Admin.find({
                     $or: [
                        { firstName: searchRegex },
                        { lastName: searchRegex },
                        { username: searchRegex }
                     ]
                  }).select('_id');

                  const userIds = [...users, ...admins].map(u => u._id);
                  query.userId = { $in: userIds };
               }

               if (filter.type && filter.type !== 'ALL') {
                  query.type = filter.type;
               }

               if (filter.dateFrom || filter.dateTo) {
                  query.timestamp = {};
                  if (filter.dateFrom) {
                     query.timestamp.$gte = new Date(filter.dateFrom);
                  }
                  if (filter.dateTo) {
                     query.timestamp.$lte = new Date(filter.dateTo);
                  }
               }
            }

            // Count total documents for pagination
            const total = await UserActivity.countDocuments(query);
            const totalPages = Math.ceil(total / limit);

            // Get paginated activities
            const activities = await UserActivity.find(query)
               .sort({ timestamp: -1 })
               .skip((page - 1) * limit)
               .limit(limit)
               .populate('metadata.applicationId', 'applicationNumber applicationType');

            const processedActivities = [];

            for (const activity of activities) {
               let user;
               let userType;
               let specificRole = '';

               if (activity.userModel === 'Admin') {
                  user = await Admin.findById(activity.userId);
                  userType = 'Personnel';
                  specificRole = user?.roles?.[0] || '';
                  specificRole = specificRole
                     .replace(/_/g, ' ')
                     .replace(/([A-Z])/g, ' $1')
                     .trim();
               } else {
                  user = await User.findById(activity.userId);
                  userType = user?.roles?.includes('user') ? 'User' : 'Personnel';
               }

               const displayName = user ?
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username :
                  'Unknown User';

               const displayNameWithRole = userType === 'Personnel' && specificRole
                  ? `${displayName} (${userType} - ${specificRole})`
                  : `${displayName} (${userType})`;

               processedActivities.push({
                  id: activity._id,
                  type: activity.type,
                  username: displayNameWithRole,
                  timestamp: activity.timestamp.toISOString(),
                  description: getActivityDescription(activity),
                  metadata: {
                     ...activity.metadata,
                     userType,
                     specificRole
                  }
               });
            }

            return {
               activities: processedActivities,
               pagination: {
                  total,
                  currentPage: page,
                  totalPages
               }
            };
         } catch (error) {
            console.error('Error fetching activities:', error);
            throw new Error('Failed to fetch activities');
         }
      }
   }
};

function getActivityDescription(activity) {
   const descriptions = {
      LOGIN: 'logged into the system',
      LOGOUT: 'logged out',
      PROFILE_UPDATE: 'updated their profile',
      PASSWORD_CHANGE: 'changed their password',
      APPLICATION_SUBMIT: `submitted a ${activity.metadata?.applicationId?.applicationType || 'new'} application`,
      PAYMENT_MADE: `made a payment of ₱${activity.metadata?.amount || 0}`,
      DOCUMENT_UPLOAD: `uploaded a ${activity.metadata?.documentType || 'document'}`,
      ACCOUNT_CREATED: 'created a new account',
      PERMIT_RECEIVED: 'received a permit',
      EMAIL_VERIFIED: 'verified their email',
      SETTINGS_UPDATED: 'updated their settings'
   };
   return descriptions[activity.type] || 'performed an action';
}

module.exports = activityResolvers;
