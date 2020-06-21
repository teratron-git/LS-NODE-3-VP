const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const newsModel = require('../models/newsModel');
const { secret } = require('../../config/serverConfig').jwt;
const serialize = require('../utils/serialize');

const News = mongoose.model('News');

module.exports.getAllNews = async (req, res) => {
  try {
    const accessToken = req.headers['authorization'];
    const result = await jwt.verify(accessToken, secret);

    if (result) {
      const foundedNews = await News.find();
      if (!foundedNews) {
        throw new Error(`Неправильный access токен!`);
      }

      const preparedNews = [];
      foundedNews.map((news) =>
        preparedNews.push(serialize.serializeNews(news))
      );

      res.json(preparedNews);
    }
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
