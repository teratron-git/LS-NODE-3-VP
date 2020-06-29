const mongoose = require('mongoose');
const newsModel = require('../models/newsModel');
const userModel = require('../models/userModel');
const serialize = require('../utils/serialize');

module.exports.getAllNews = async (req, res) => {
  try {
    const foundedUser = await userModel.getUserById(req.accessTokenData.payload);
    if (!foundedUser.permission.news.R) {
      throw new Error(`Нет прав на чтение новостей!`);
    }

    const foundedAllNews = await newsModel.getAllNews();
    if (!foundedAllNews) {
      res.json([]);
    }

    const preparedAllNews = foundedAllNews.map((news) => {
      return serialize.serializeNews(news);
    });
    res.json(preparedAllNews);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.createNews = async (req, res) => {
  try {
    const foundedUser = await userModel.getUserById(req.accessTokenData.payload);
    if (!foundedUser.permission.news.C) {
      throw new Error(`Нет прав на создание новостей!`);
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
    await newsModel.createNews(preparedForCreate);

    const foundedAllNews = await newsModel.getAllNews();
    if (!foundedAllNews) {
      res.json([]);
    }

    const preparedAllNews = foundedAllNews.map((news) => {
      return serialize.serializeNews(news);
    });

    res.json(preparedAllNews);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.changeNews = async (req, res) => {
  try {
    const foundedUser = await userModel.getUserById(req.accessTokenData.payload);
    if (!foundedUser.permission.news.U) {
      throw new Error(`Нет прав на обновление новостей!`);
    }

    const foundedNews = await newsModel.updateNews(req.params.id, req.body, true);
    if (!foundedNews) {
      throw new Error(`Ошибка при обновлении новости!`);
    }

    const foundedAllNews = await newsModel.getAllNews();
    if (!foundedAllNews) {
      res.json([]);
    }

    const preparedAllNews = foundedAllNews.map((news) => {
      return serialize.serializeNews(news);
    });

    res.json(preparedAllNews);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports.deleteNews = async (req, res) => {
  try {
    const foundedUser = await userModel.getUserById(req.accessTokenData.payload);
    if (!foundedUser.permission.news.D) {
      throw new Error(`Нет прав на удаление новостей!`);
    }

    const foundedNews = await newsModel.deleteNews(req.params.id);
    if (!foundedNews) {
      throw new Error(`Такая новость не существует!`);
    }

    const foundedAllNews = await newsModel.getAllNews();
    if (!foundedAllNews) {
      res.json([]);
    }

    const preparedAllNews = foundedAllNews.map((news) => {
      return serialize.serializeNews(news);
    });

    res.json(preparedAllNews);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
