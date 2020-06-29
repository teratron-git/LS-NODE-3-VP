const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config/serverConfig').jwt;
const authHelper = require('../utils/authHelper');
const serialize = require('../utils/serialize');
const userModel = require('../models/userModel');
const path = require('path');
const fs = require('fs');

module.exports.registration = async (req, res) => {
  try {
    const { username } = req.body;
    const foundedUser = await userModel.getUserByUsername(username);
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

    const createdUser = await userModel.createUser(preparedForCreate);
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
    const foundedUser = await userModel.getUserByUsername(username);
    if (!foundedUser) {
      throw new Error(`Пользователь ${username} не зарегистрирован!`);
    }

    const isValidPass = bcrypt.compareSync(password, foundedUser.password);
    if (isValidPass) {
      const tokens = await authHelper.createTokens(foundedUser._id);
      const updatedUser = await userModel.updateUser(
        foundedUser._id,
        {
          refreshToken: tokens.refreshToken,
          refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
        },
        true
      );

      res.json({
        ...serialize.serializeAuthUser(updatedUser),
        accessToken: tokens.accessToken,
        accessTokenExpiredAt: tokens.accessTokenExpiredAt,
      });
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
    const result = await jwt.verify(refreshToken, secret);
    if (result) {
      const foundedUser = await userModel.getUserById(result.payload);
      if (!foundedUser) {
        throw new Error(`Неправильный refresh токен!`);
      }

      const tokens = await authHelper.createTokens(result.payload);
      await userModel.updateUser(result.payload, tokens, true);

      res.setHeader('authorization', tokens.refreshToken);
      res.json(tokens);
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.getProfile = async (req, res) => {
  try {
    const foundedUser = await userModel.getUserById(req.accessTokenData.payload);
    if (!foundedUser) {
      throw new Error(`Пользователь не найден!`);
    }

    res.json(serialize.serializeUser(foundedUser));
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.changeProfile = async (req, res) => {
  try {
    const foundedUser = await userModel.getUserById(req.accessTokenData.payload);
    if (!foundedUser) {
      throw new Error(`Пользователь не найден!`);
    }

    const avatar = req.file
      ? path.join('/uploads', req.file.filename)
      : foundedUser.image;

    let passIsNotReceived = false;
    let isValidPass = false;
    let password = foundedUser.password;

    if (req.body.oldPassword && req.body.newPassword) {
      const newHash = bcrypt.hashSync(req.body.newPassword, 10);
      isValidPass = await bcrypt.compareSync(req.body.oldPassword, foundedUser.password);
      password = isValidPass ? newHash : foundedUser.password;
    } else if (!req.body.oldPassword && !req.body.newPassword) {
      passIsNotReceived = true;
    } else {
      throw new Error(`Нужно заполнить поля со старым и новым паролем!`);
    }

    if (isValidPass || passIsNotReceived) {
      const foundedUser = await userModel.updateUser(
        req.accessTokenData.payload,
        { ...req.body, password: password, image: avatar },
        true
      );
      if (!foundedUser) {
        throw new Error(`Ошибка обновления данных!`);
      }

      res.json(serialize.serializeUser(foundedUser));
    } else {
      throw new Error(`Старый пароль неверен!`);
    }
  } catch (err) {
    if (req.file) {
      fs.unlink(
        path.join(__dirname, '..', '..', 'build', 'uploads', req.file.filename),
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
    const foundedUsers = await userModel.getAllUsers();
    if (!foundedUsers) {
      throw new Error(`Пользователь не найден!`);
    }

    const preparedUsers = [];
    foundedUsers.map((user) => preparedUsers.push(serialize.serializeUser(user)));

    res.json(preparedUsers);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.changeUserPermission = async (req, res) => {
  try {
    const foundedUser = await userModel.updateUser(req.params.id, req.body, true);
    if (!foundedUser) {
      throw new Error(`Пользователь не найден!`);
    }

    res.json(foundedUser.permission);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const foundedUser = await userModel.deleteUser(req.params.id);
    if (!foundedUser) {
      throw new Error(`Пользователь не найден!`);
    }

    res.json({ message: `Пользователь удалён!` });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
