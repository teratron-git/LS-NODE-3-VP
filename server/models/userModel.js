const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  surName: String,
  firstName: String,
  middleName: String,
  password: String,
});

mongoose.model('User', UserSchema);
