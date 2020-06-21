const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config/serverConfig').jwt;
const authHelper = require('../utils/authHelper');
const serialize = require('../utils/serialize');
const userModel = require('../models/userModel');
const path = require('path');
const fs = require('fs');

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
    const result = await jwt.verify(accessToken, secret);
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

module.exports.changeProfile = async (req, res) => {
  try {
    const accessToken = req.headers['authorization'];
    const result = await jwt.verify(accessToken, secret);
    if (!req.body.oldPassword) {
      throw new Error(`Пароль не может быть пустым!`);
    }

    const oldHash = bcrypt.hashSync(req.body.oldPassword, 10);
    const newHash = bcrypt.hashSync(req.body.newPassword, 10);

    const foundedUser = await User.findOne({ _id: result.payload });
    if (!foundedUser) {
      throw new Error(`Пользователь ${username} не зарегистрирован!`);
    }

    const isValidPass = bcrypt.compareSync(
      req.body.oldPassword,
      foundedUser.password
    );

    const password = newHash || oldHash;
    const avatar = req.file
      ? path.join('/uploads', req.file.filename)
      : foundedUser.image;

    if (isValidPass && result) {
      const foundedUser = await User.findOneAndUpdate(
        { _id: result.payload },
        { ...req.body, password: password, image: avatar },
        { new: true }
      );
      if (!foundedUser) {
        throw new Error(`Неправильный access токен или пароль!`);
      }

      res.json(serialize.serializeUser(foundedUser));
    } else {
      throw new Error(`Старый пароль неверен!`);
    }
  } catch (err) {
    if (req.file) {
      fs.unlink(
        path.join(__dirname, '../../build/uploads', req.file.filename),
        (err) => {
          console.log(err ? err : 'file deleted');
        }
      );
    }

    res.status(401).json({ message: err.message });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const accessToken = req.headers['authorization'];
    const result = await jwt.verify(accessToken, secret);

    if (result) {
      const foundedUsers = await User.find();
      if (!foundedUsers) {
        throw new Error(`Неправильный access токен!`);
      }

      const preparedUsers = [];
      foundedUsers.map((user) =>
        preparedUsers.push(serialize.serializeUser(user))
      );

      res.json(preparedUsers);
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
