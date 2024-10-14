const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
   userId: { type: Number, unique: true },
   username: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   firstName: { type: String, required: true },
   lastName: { type: String, required: true },
   role: {
      type: String,
      enum: ['superadmin', 'Chief_RPS', 'user', 'Technical_Staff', 'Chief_TSD', 'Recieving_Clerk', 'Releasing_Clerk', 'Accountant', 'Bill_Collector', 'PENR_CENR_Officer'],
      default: 'user'
   },
   email: { type: String, required: false, unique: false },
   phone: { type: String, required: false },
   company: { type: String, required: false },
   address: { type: String, required: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();
   this.password = await bcrypt.hash(this.password, 12);
   next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
