const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
   username: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   firstName: { type: String },
   lastName: { type: String },
   email: { type: String },
   phone: { type: String },
   company: { type: String },
   address: { type: String },
   profilePicture: {
      data: Buffer,
      contentType: String
   },
   roles: [{
      type: String,
      required: true,
      enum: [
         'user',
         'Chief_RPS',
         'superadmin',
         'Technical_Staff',
         'Chief_TSD',
         'Receiving_Clerk',
         'Releasing_Clerk',
         'Accountant',
         'OOP_Staff_Incharge',
         'Bill_Collector',
         'Credit_Officer',
         'PENR_CENR_Officer',
         'Deputy_CENR_Officer',
         'Inspection_Team'
      ],
      default: 'user'
   }],
   userType: {
      type: String,
      required: true,
      enum: ['Client', 'Personnel'],
      default: 'Client'
   },
   lastPasswordChange: { type: Date, default: Date.now },
   // for analytics
   isActive: { type: Boolean, default: true },
   lastLoginDate: { type: Date },
   createdAt: { type: Date },
   updatedAt: { type: Date },
   themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
   },
   verificationCode: {
      code: String,
      expiresAt: Date
   }
}, {
   timestamps: true // This will automatically manage createdAt and updatedAt
});

UserSchema.pre('save', async function (next) {
   try {
      if (!this.isModified('password')) return next();
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this.lastPasswordChange = new Date();
      next();
   } catch (error) {
      next(error);
   }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
   try {
      return await bcrypt.compare(candidatePassword, this.password);
   } catch (error) {
      throw new Error('Error comparing passwords');
   }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
