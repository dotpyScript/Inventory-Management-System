const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the roles and their permissions
const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
