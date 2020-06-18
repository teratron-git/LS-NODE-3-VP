const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config/serverConfig').jwt;
const authHelper = require('../utils/authHelper');
const serialize = require('../utils/serialize');
const model = require('../models/userModel');

const User = mongoose.model('User');

module.exports.registration = async (req, res) => {
  const otherData = {
    image:
      'https://icons-for-free.com/iconfiles/png/512/profile+user+icon-1320166082804563970.png',
    permission: {
      chat: { C: true, R: true, U: true, D: true },
      news: { C: true, R: true, U: true, D: true },
      settings: { C: true, R: true, U: true, D: true },
    },
  };

  req.body.password = bcrypt.hashSync(req.body.password, 10);
  const userForSave = { ...req.body, ...otherData };
  const newUser = await User.create(userForSave);
  const tokens = await authHelper.createTokens(userForSave.username);
  const userToFrontend = await User.findOneAndUpdate(
    { username: userForSave.username },
    { ...tokens },
    { new: true }
  );
  console.log('Зарегистрирован и отправлен:', userToFrontend);

  res.json(serialize.serializeAuthUser(userToFrontend));
};

module.exports.logIn = (req, res) => {
  const { username, password } = req.body;
  console.log('Вход пользователя:', req.body);

  User.findOne({ username })
    .exec()
    .then((user) => {
      if (!user) {
        res
          .status(401)
          .json({ message: `Пользователь ${username} не зарегистрирован!` });
      }

      const isValidPass = bcrypt.compareSync(password, user.password);

      console.log('pass', password, user.password, isValidPass);
      if (isValidPass) {
        // user.accessToken = authHelper.generateAccessToken(user._id);
        // user.refreshToken = authHelper.generateRefreshToken().token;

        console.log('Пароль совпадает. user:', user);
        // updateTokens(user._id)
        //   .then((tokens) => console.log('tokens', tokens))
        //   .catch((err) => console.log('err', err));
        // console.log('user', user);
        res.json(user);
      } else {
        res.status(401).json({ message: 'Неправильный логин или пароль!' });
      }
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};
