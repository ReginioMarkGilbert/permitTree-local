const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
   adminId: { type: Number, unique: true },
   username: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   role: {
      type: String,
      default: 'Chief_RPS',
      enum: ['Chief_RPS', 'superadmin', 'Technical_Staff', 'Chief_TSD', 'Recieving_Clerk', 'Releasing_Clerk', 'Accountant', 'Bill_Collector', 'PENR_CENR_Officer']
   },
   firstName: { type: String },
   lastName: { type: String }
});

adminSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();
   this.password = await bcrypt.hash(this.password, 12);
   next();
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
