const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/serverConfig');

const User = mongoose.model('User');

module.exports.registration = (req, res) => {
  console.log('Регистрация пользователя:', req.body);
  req.body.password = bcrypt.hashSync(req.body.password, 10);

  User.create(req.body)
    .then((newUser) => res.json(newUser))
    .catch((err) => res.status(500).json(err));
};

module.exports.logIn = (req, res) => {
  const { username, password } = req.body;
  console.log('Вход пользователя:', req.body);

  User.findOne({ username }, { __v: 0 })
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
        const token = jwt.sign(user._id.toString(), jwtSecret);
        const temp = {
          firstName: 'String',
          id: 'String',
          image: 'String',
          middleName: 'String',
          permission: {
            chat: { C: true, R: true, U: true, D: true },
            news: { C: true, R: true, U: true, D: true },
            settings: { C: true, R: true, U: true, D: true },
          },
          surName: 'String',
          username: '3',
          password:
            '$2b$10$Q1116tXfw6ly8/Jc/9BWa.GSEDspQBpjxhvJHXKaGQt4g2s5NW5ju',

          accessToken: token,
          refreshToken: 'String',
          accessTokenExpiredAt: (Math.floor(Date.now()) + 60 * 1000).toString(),
          refreshTokenExpiredAt: (
            Math.floor(Date.now()) +
            60 * 2 * 1000
          ).toString(),
        };
        res.json(temp);
      } else {
        res.status(401).json({ message: 'Неправильный логин или пароль!' });
      }
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};
