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
      enum: ['user'], // Add other roles as needed
      default: 'user'
   }],
   lastPasswordChange: { type: Date, default: Date.now }
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

UserSchema.methods.comparePassword = async function(candidatePassword) {
   try {
      return await bcrypt.compare(candidatePassword, this.password);
   } catch (error) {
      throw new Error('Error comparing passwords');
   }
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
