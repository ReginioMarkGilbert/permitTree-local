const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/admin');
const CSAWPermit = require('../models/permits/CSAWPermit');
const COVPermit = require('../models/permits/COVPermit');
const PTPRPermit = require('../models/permits/PTPRPermit');
const PLTCPPermit = require('../models/permits/PLTCPPermit');
const PLTPPermit = require('../models/permits/PLTPPermit');
const TCEBPPermit = require('../models/permits/TCEBPPermit');
const UserActivity = require('../models/UserActivity');
const { logUserActivity } = require('../utils/activityLogger');

const authResolvers = {
   Query: {
      getUserApplications: async (_, { status, currentStage }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to view applications');
         }

         try {
            const query = {
               applicantId: user.id,
               ...(status && { status }),
               ...(currentStage && { currentStage })
            };

            // Get applications from all permit types
            const [csawPermits, covPermits, ptprPermits, pltcpPermits, pltpPermits, tcebpPermits] = await Promise.all([
               CSAWPermit.find(query),
               COVPermit.find(query),
               PTPRPermit.find(query),
               PLTCPPermit.find(query),
               PLTPPermit.find(query),
               TCEBPPermit.find(query)
            ]);

            // Combine all permits
            const allPermits = [
               ...csawPermits,
               ...covPermits,
               ...ptprPermits,
               ...pltcpPermits,
               ...pltpPermits,
               ...tcebpPermits
            ];

            return allPermits;
         } catch (error) {
            console.error('Error fetching user applications:', error);
            throw new Error('Failed to fetch applications');
         }
      }
   },

   Mutation: {
      login: async (_, { username, password }, context) => {
         try {
            console.log('Login attempt for username:', username);
            let user = await User.findOne({ username });

            if (!user) {
               user = await Admin.findOne({ username });
               if (user) {
                  console.log('AuthResolvers: User found in Admin model:', user.id, user.roles);
               }
            }

            if (!user) {
               console.log('User not found in either model');
               throw new Error('Invalid credentials');
            }

            // Check if user is active (only for regular users, not admins)
            if (!user.roles.includes('superadmin') && user.isActive === false) {
               throw new Error('Account is deactivated. Please contact administrator.');
            }

            // Use bcrypt.compare to properly compare hashed passwords
            const isValid = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isValid);

            if (!isValid) {
               throw new Error('Invalid credentials');
            }

            const token = jwt.sign(
               {
                  id: user.id,
                  username: user.username,
                  roles: user.roles
               },
               process.env.JWT_SECRET || 'default_secret',
               { expiresIn: '12h' }
            );

            // Log the login activity
            await logUserActivity({
               userId: user.id,
               type: 'LOGIN',
               details: 'User logged in successfully',
               req: context.req,
               metadata: {
                  deviceType: context.req?.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
               }
            });

            return {
               token,
               user: {
                  id: user.id,
                  username: user.username,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  roles: user.roles,
                  isActive: user.isActive
               }
            };
         } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Invalid credentials');
         }
      },
      logout: async (_, __, context) => {
         try {
            // Only log activity if there's a user in context
            if (context.user || context.admin) {
               await logUserActivity({
                  userId: context.user?.id || context.admin?.id,
                  type: 'LOGOUT',
                  details: 'User logged out',
                  req: context.req
               });
            }
            return true;
         } catch (error) {
            console.error('Logout error:', error);
            // Still return true even if logging activity fails
            return true;
         }
      }
   }
};

module.exports = authResolvers;
