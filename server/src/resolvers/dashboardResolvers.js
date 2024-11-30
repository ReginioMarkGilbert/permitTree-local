const User = require('../models/User');
const Permit = require('../models/permits/Permit');
const UserActivity = require('../models/UserActivity');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');
const Admin = require('../models/admin');

const dashboardResolvers = {
   Query: {
      dashboardStats: async (_, __, { admin }) => {
         if (!admin || !admin.roles.includes('superadmin')) {
            throw new Error('Not authorized to access dashboard stats');
         }

         try {
            // Get current and previous month dates
            const currentMonth = new Date();
            const previousMonth = subMonths(currentMonth, 1);

            // Get total users count
            const totalUsers = await User.countDocuments();
            const totalUsersPrevMonth = await User.countDocuments({
               createdAt: { $lte: endOfMonth(previousMonth) }
            });

            // Get active users (users who logged in within last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const activeUsers = await User.countDocuments({
               lastLoginDate: { $gte: thirtyDaysAgo }
            });
            const activeUsersPrevMonth = await User.countDocuments({
               lastLoginDate: {
                  $gte: subMonths(thirtyDaysAgo, 1),
                  $lte: thirtyDaysAgo
               }
            });

            // Get applications counts
            const totalApplications = await Permit.countDocuments();
            const totalApplicationsPrevMonth = await Permit.countDocuments({
               createdAt: { $lte: endOfMonth(previousMonth) }
            });

            const pendingApplications = await Permit.countDocuments({
               status: { $in: ['Submitted', 'In Progress', 'Returned'] }
            });
            const pendingApplicationsPrevMonth = await Permit.countDocuments({
               status: { $in: ['Submitted', 'In Progress', 'Returned'] },
               createdAt: { $lte: endOfMonth(previousMonth) }
            });

            // Calculate trends
            const calculateTrend = (current, previous) => {
               if (previous === 0) return '100% increase';
               const percentChange = ((current - previous) / previous) * 100;
               return `${Math.abs(percentChange).toFixed(1)}% ${percentChange >= 0 ? 'increase' : 'decrease'}`;
            };

            // Get user growth data for the last 6 months
            const userActivity = await getUserGrowthData();

            // Get recent activities
            const recentActivities = await getRecentActivities();

            return {
               totalUsers,
               activeUsers,
               totalApplications,
               pendingApplications,
               usersTrend: calculateTrend(totalUsers, totalUsersPrevMonth),
               activeUsersTrend: calculateTrend(activeUsers, activeUsersPrevMonth),
               applicationsTrend: calculateTrend(totalApplications, totalApplicationsPrevMonth),
               pendingApplicationsTrend: calculateTrend(pendingApplications, pendingApplicationsPrevMonth),
               userActivity,
               recentActivities
            };
         } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw new Error('Failed to fetch dashboard statistics');
         }
      }
   }
};

// Helper function to get user growth data
async function getUserGrowthData() {
   const sixMonthsAgo = subMonths(new Date(), 5);
   const users = await User.aggregate([
      {
         $match: {
            createdAt: { $gte: startOfMonth(sixMonthsAgo) }
         }
      },
      {
         $group: {
            _id: {
               year: { $year: '$createdAt' },
               month: { $month: '$createdAt' }
            },
            users: { $sum: 1 }
         }
      },
      {
         $sort: { '_id.year': 1, '_id.month': 1 }
      }
   ]);

   return users.map(item => ({
      date: format(new Date(item._id.year, item._id.month - 1), 'yyyy-MM'),
      users: item.users
   }));
}

// Helper function to get recent activities
async function getRecentActivities() {
   const activities = await UserActivity.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('metadata.applicationId', 'applicationNumber applicationType');

   const processedActivities = [];

   for (const activity of activities) {
      // Try to find user in both User and Admin models
      let user;
      let userType;
      let specificRole = '';

      if (activity.userModel === 'Admin') {
         user = await Admin.findById(activity.userId);
         userType = 'Personnel';
         // Get the first role for personnel (assuming it's their main role)
         specificRole = user?.roles?.[0] || '';
         // Format the role to be more readable
         specificRole = specificRole
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .trim(); // Remove extra spaces
      } else {
         user = await User.findById(activity.userId);
         userType = user?.roles?.includes('user') ? 'User' : 'Personnel';
      }

      // Get user display name with role
      const displayName = user ?
         `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username :
         'Unknown User';

      // Create display name with role (and specific role for personnel)
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

   return processedActivities;
}

// Helper function to get activity description
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

module.exports = dashboardResolvers;
