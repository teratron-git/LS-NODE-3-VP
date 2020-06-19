const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config/serverConfig').jwt;
const authHelper = require('../utils/authHelper');
const serialize = require('../utils/serialize');
const userModel = require('../models/userModel');

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

module.exports.logIn = async (req, res) => {
  const { username, password } = req.body;
  console.log('Вход пользователя:', req.body);
  try {
    const foundedUser = await User.findOne({ username }).exec();
    console.log('module.exports.logIn -> foundedUser', foundedUser);
    if (!foundedUser) {
      res
        .status(401)
        .json({ message: `Пользователь ${username} не зарегистрирован!` });
    }

    const isValidPass = bcrypt.compareSync(password, foundedUser.password);

    console.log('pass', password, foundedUser.password, isValidPass);
    if (isValidPass) {
      const tokens = await authHelper.createTokens(foundedUser.username);
      const userToFrontend = await User.findOneAndUpdate(
        { username: foundedUser.username },
        { ...tokens },
        { new: true }
      );
      res.json(serialize.serializeAuthUser(userToFrontend));
    } else {
      res.status(401).json({ message: 'Неправильный логин или пароль!' });
    }
  } catch (err) {
    console.log('err', err);
  }
};

module.exports.refreshTokens = async (req, res) => {
  const refreshToken = req.headers['authorization'];
  console.log('\n !!!Это рефреш от фронта:', refreshToken);

  try {
    const foundedUser = await User.findOne({ refreshToken }).exec();

    if (!foundedUser) {
      res.status(401).json({ message: `Пользователь не зарегистрирован!` });
    }

    const tokens = await authHelper.createTokens(foundedUser.username);
    const userToFrontend = await User.findOneAndUpdate(
      { username: foundedUser.username },
      { ...tokens },
      { new: true }
    );
    refreshToken;
    res.setHeader('authorization', tokens.refreshToken);
    res.json(serialize.serializeAuthUser(tokens));
  } catch (err) {
    console.log('err', err);
  }
};

// module.exports.getProfile = async (req, res) => {
//   try {
//     const foundedUser = await User.findOne({ username }).exec();
//     console.log('module.exports.logIn -> foundedUser', foundedUser);
//     if (!foundedUser) {
//       res
//         .status(401)
//         .json({ message: `Пользователь ${username} не зарегистрирован!` });
//     }

//     res.json(serialize.serializeUser(foundedUser));
//   } catch (err) {
//     console.log('err', err);
//   }
// };
