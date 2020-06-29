const jwt = require('jsonwebtoken');
const { secret } = require('../../config/serverConfig').jwt;

module.exports = async (req, res, next) => {
  try {
    const accessToken = req.headers['authorization'];
    if (!accessToken) {
      throw new Error(`Токен не предоставлен!`);
    }

    const result = await jwt.verify(accessToken, secret);
    if (!result) {
      throw new Error(`Неверный токен!`);
    }

    req.accessTokenData = result;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Неверный токен!' });
    } else {
      res.status(401).json({ message: err.message });
    }
  }
};
