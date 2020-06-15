const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports.registration = (req, res) => {
  console.log('Регистрация пользователя:', req.body);
  User.create(req.body)
    .then((newUser) => res.json(newUser))
    .catch((err) => res.starus(500).json(err));
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
      res.json(user);
    });
};
