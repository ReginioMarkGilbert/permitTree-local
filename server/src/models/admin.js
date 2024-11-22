const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
   adminId: { type: Number, unique: true },
   username: { type: String, required: true, unique: true },
   password: { type: String, required: true },
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
   lastName: { type: String }
});

AdminSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   next();
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
