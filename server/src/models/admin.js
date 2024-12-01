const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
   adminId: { type: Number, unique: true },
   username: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   email: { type: String },
   notificationPreferences: {
      email: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
   },
   roles: [{
      type: String,
      required: true,
      enum: [
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
      ]
   }],
   firstName: { type: String },
   lastName: { type: String },
   themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
   }
});

AdminSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   if (!this.notificationPreferences) {
      this.notificationPreferences = {
         email: false,
         inApp: true,
         sms: false
      };
   }
   next();
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
