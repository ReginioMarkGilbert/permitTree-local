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
         console.log('Login attempt for username:', username);
         let user = await User.findOne({ username });
         // let isAdmin = false;

         if (!user) {
            console.log('User not found in User model, checking Admin model');
            user = await Admin.findOne({ username });
            // isAdmin = !!user; // if user is found, isAdmin is true, otherwise false
         }

         if (!user) {
            console.log('User not found in either model');
            throw new Error('Invalid credentials');
         }

         const isValid = await bcrypt.compare(password, user.password);
         console.log('Password valid:', isValid);

         if (!isValid) {
            throw new Error('Invalid credentials');
         }

         // const roles = isAdmin ? user.roles : [user.role] || ['user']; // if roles is null, set it to ['user']
         // const roles = isAdmin ? user.roles : [user.role];
         // const roles = () => {
         //    if (isAdmin) {
         //       return user.roles;
         //    } else if {
         // }

         const token = jwt.sign(
            // {
            //    id: user.id,
            //    username: user.username,
            //    roles,
            //    isAdmin
            // },
            {
               id: user.id,
               username: user.username,
               roles: user.roles
            },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
         );

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
      },
      logout: async (_, __, context) => {
         // Here you would typically invalidate the token on the server side
         // For now, we'll just return true to indicate successful
         return true;
      }
   }
};

module.exports = authResolvers;
