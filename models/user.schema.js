// models/user.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  role: { type: Schema.Types.ObjectId, ref: 'Role' }, // Reference to Role
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;
