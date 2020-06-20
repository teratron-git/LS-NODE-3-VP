const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config/serverConfig').jwt;
const authHelper = require('../utils/authHelper');
const serialize = require('../utils/serialize');
const userModel = require('../models/userModel');

const User = mongoose.model('User');

module.exports.registration = async (req, res) => {
  try {
    const { username } = req.body;
    const foundedUser = await User.findOne({ username });
    if (foundedUser) {
      throw new Error(`Пользователь ${username} уже зарегистрирован!`);
    }

    const otherData = {
      _id: mongoose.Types.ObjectId(),
      image:
        'https://icons-for-free.com/iconfiles/png/512/profile+user+icon-1320166082804563970.png',
      permission: {
        chat: { C: true, R: true, U: true, D: true },
        news: { C: true, R: true, U: true, D: true },
        settings: { C: true, R: true, U: true, D: true },
      },
    };

    const hash = bcrypt.hashSync(req.body.password, 10);
    const tokens = await authHelper.createTokens(otherData._id);
    const preparedForCreate = {
      ...req.body,
      ...otherData,
      password: hash,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
    };

    const createdUser = await User.create(preparedForCreate);

    res.json({
      ...serialize.serializeAuthUser(createdUser),
      accessToken: tokens.accessToken,
      accessTokenExpiredAt: tokens.accessTokenExpiredAt,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.logIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const foundedUser = await User.findOne({ username });
    console.log('module.exports.logIn -> foundedUser', foundedUser);
    if (!foundedUser) {
      throw new Error(`Пользователь ${username} не зарегистрирован!`);
    }

    const isValidPass = bcrypt.compareSync(password, foundedUser.password);

    if (isValidPass) {
      const tokens = await authHelper.createTokens(foundedUser._id);
      const updatedUser = await User.findOneAndUpdate(
        { _id: foundedUser._id },
        {
          refreshToken: tokens.refreshToken,
          refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
        },
        { new: true }
      );
      res.json({
        ...serialize.serializeAuthUser(updatedUser),
        accessToken: tokens.accessToken,
        accessTokenExpiredAt: tokens.accessTokenExpiredAt,
      });
      console.log(
        'module.exports.logIn -> tokens.accessToken',
        tokens.accessToken
      );
    } else {
      throw new Error(`Неверные учетные данные!`);
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.refreshTokens = async (req, res) => {
  try {
    const refreshToken = req.headers['authorization'];
    console.log('\n !!!Это рефреш от фронта:', refreshToken);

    const foundedUser = await User.findOne({ refreshToken });

    if (!foundedUser) {
      throw new Error(`Неправильный refresh токен!`);
    }

    const tokens = await authHelper.createTokens(foundedUser._id);
    await User.findOneAndUpdate(
      { username: foundedUser.username },
      { ...tokens },
      { new: true }
    );

    res.setHeader('Authorization', tokens.refreshToken);
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.getProfile = async (req, res) => {
  try {
    const accessToken = req.headers['authorization'];
    console.log('module.exports.getProfile -> accessToken', accessToken);
    const result = await jwt.verify(accessToken, secret);
    console.log('module.exports.getProfile -> result', result);
    if (result) {
      const foundedUser = await User.findOne({ _id: result.payload });
      console.log('module.exports.getProfile -> foundedUser', foundedUser);
      if (!foundedUser) {
        throw new Error(`Неправильный access токен!`);
      }

      res.json(serialize.serializeUser(foundedUser));
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
