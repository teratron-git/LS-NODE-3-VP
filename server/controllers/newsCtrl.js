const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const newsModel = require('../models/newsModel');
const { secret } = require('../../config/serverConfig').jwt;
const serialize = require('../utils/serialize');

const User = mongoose.model('User');
const News = mongoose.model('News');

module.exports.getAllNews = async (req, res) => {
  try {
    const accessToken = req.headers['authorization'];
    const result = await jwt.verify(accessToken, secret);
    if (result) {
      const foundedNews = await News.find();
      if (!foundedNews) {
        throw new Error(`Новости не найдены!`);
      }

      const preparedAllNews = [];
      foundedNews.map((news) =>
        preparedAllNews.push(serialize.serializeNews(news))
      );

      res.json(preparedAllNews);
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.createNews = async (req, res) => {
  try {
    const accessToken = req.headers['authorization'];
    const result = await jwt.verify(accessToken, secret);
    if (result) {
      const foundedUser = await User.findOne({ _id: result.payload });
      if (!foundedUser) {
        throw new Error(`Пользователь не найден!`);
      }

      const preparedForCreate = {
        _id: mongoose.Types.ObjectId(),
        ...req.body,
        created_at: Date.now(),
        user: {
          id: foundedUser.id,
          firstName: foundedUser.firstName,
          middleName: foundedUser.middleName,
          surName: foundedUser.surName,
          image: foundedUser.image,
          username: foundedUser.username,
        },
      };

      const createdNews = await News.create(preparedForCreate);
      const foundedNews = await News.find();
      if (!foundedNews) {
        throw new Error(`Новости не найдены!`);
      }

      const preparedAllNews = [];
      foundedNews.map((news) =>
        preparedAllNews.push(serialize.serializeNews(news))
      );

      res.json(preparedAllNews);
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.changeNews = async (req, res) => {
  try {
    const accessToken = req.headers['authorization'];
    const result = await jwt.verify(accessToken, secret);
    if (result) {
      const foundedNews = await News.findOneAndUpdate(
        { _id: req.params.id },
        { ...req.body },
        { new: true }
      );
      if (!foundedNews) {
        throw new Error(`Ошибка при обновлении новости!`);
      }

      const foundedAllNews = await News.find();
      if (!foundedAllNews) {
        throw new Error(`Новости не найдены!`);
      }

      const preparedAllNews = [];
      foundedAllNews.map((news) =>
        preparedAllNews.push(serialize.serializeNews(news))
      );

      res.json(preparedAllNews);
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.deleteNews = async (req, res) => {
  try {
    const accessToken = req.headers['authorization'];
    const result = await jwt.verify(accessToken, secret);
    if (result) {
      const foundedNews = await News.deleteOne({ _id: req.params.id });
      if (!foundedNews) {
        throw new Error(`Такая новость не существует!`);
      }

      const foundedAllNews = await News.find();
      if (!foundedAllNews) {
        throw new Error(`Новости не найдены!`);
      }

      const preparedAllNews = [];
      foundedAllNews.map((news) =>
        preparedAllNews.push(serialize.serializeNews(news))
      );

      res.json(preparedAllNews);
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
