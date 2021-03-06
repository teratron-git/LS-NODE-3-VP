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

const User = mongoose.model('User', UserSchema);

module.exports.getRestData = () => {
  return {
    _id: mongoose.Types.ObjectId(),
    image:
      'https://icons-for-free.com/iconfiles/png/512/profile+user+icon-1320166082804563970.png',
    permission: {
      chat: { C: true, R: true, U: true, D: true },
      news: { C: true, R: true, U: true, D: true },
      settings: { C: true, R: true, U: true, D: true },
    },
  };
};

module.exports.createUser = async (data) => {
  return await User.create(data);
};

module.exports.getAllUsers = async () => {
  return await User.find();
};

module.exports.getUserById = async (_id) => {
  return await User.findOne({ _id });
};

module.exports.getUserByUsername = async (username) => {
  return await User.findOne({ username });
};

module.exports.updateUser = async (_id, data, isUpdatedDataReturn) => {
  return await User.findOneAndUpdate({ _id }, data, { new: isUpdatedDataReturn });
};

module.exports.deleteUser = async (_id) => {
  return await User.deleteOne({ _id });
};
