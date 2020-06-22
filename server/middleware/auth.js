const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/serverConfig');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    res.status(401).json({ message: 'Токен не предоставлен!' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    jwt.verify(token, jwtSecret);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Неверный токен!' });
    }
  }

  next();
};
