const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: mongoose.Types.ObjectId,
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

  refreshToken: String,
  refreshTokenExpiredAt: String,
});

mongoose.model('User', UserSchema);
