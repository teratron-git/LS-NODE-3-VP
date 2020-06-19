const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
  firstName: String,
  image: String,
  middleName: String,
  permission: {
    chat: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
    news: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
    settings: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
  },
  surName: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 1 },

  accessToken: String,
  refreshToken: String,
  accessTokenExpiredAt: String,
  refreshTokenExpiredAt: String,
});

UserSchema.plugin(uniqueValidator);

mongoose.model('User', UserSchema);
