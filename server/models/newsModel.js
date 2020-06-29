const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    get: (createdAt) => {
      return createdAt.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  text: {
    type: String,
  },
  title: {
    type: String,
  },
  user: {
    id: String,
    firstName: String,
    middleName: String,
    surName: String,
    image: String,
    username: String,
  },
});

const News = mongoose.model('News', NewsSchema);

module.exports.getAllNews = async () => {
  return await News.find();
};

module.exports.createNews = async (data) => {
  return await News.create(data);
};

module.exports.updateNews = async (_id, data, isUpdatedDataReturn) => {
  return await News.findOneAndUpdate({ _id }, data, { new: isUpdatedDataReturn });
};

module.exports.deleteNews = async (_id) => {
  return await News.deleteOne({ _id });
};
