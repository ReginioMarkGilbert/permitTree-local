const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { User } = require('../User/modules/userAuthModule'); // Use destructuring here
const Admin = require('../Admin/models/admin_models/adminAuthSchema');

require('dotenv').config();

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'default_secret'
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        // First, try to find a user
        let user = await User.findById(jwt_payload.id);

        // If user not found, try to find an admin
        if (!user) {
            user = await Admin.findById(jwt_payload.id);
        }

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

module.exports = passport;
