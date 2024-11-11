const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/admin');
const UserActivity = require('../models/UserActivity');

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
      login: async (_, { username, password }) => {
         try {
            console.log('Login attempt for username:', username);
            let user = await User.findOne({ username });

            if (!user) {
               console.log('User not found in User model, checking Admin model');
               user = await Admin.findOne({ username });
            }

            if (!user) {
               console.log('User not found in either model');
               throw new Error('Invalid credentials');
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
            await UserActivity.create({
               userId: user.id,
               type: 'LOGIN',
               details: 'User logged in'
            });

            return {
               token,
               user: {
                  id: user.id,
                  username: user.username,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  roles: user.roles
               }
            };
         } catch (error) {
            console.error('Login error:', error);
            throw new Error('Invalid credentials');
         }
      },
      logout: async (_, __, context) => {
         // Here you would typically invalidate the token on the server side
         // For now, we'll just return true to indicate successful
         return true;
      }
   }
};

module.exports = authResolvers;
