const jwt = require('jsonwebtoken');
const { secret } = require('../../config/serverConfig').jwt;

module.exports = async (req, res, next) => {
  try {
    const accessToken = req.headers['authorization'];
    if (!accessToken) {
      throw new Error(`Токен не предоставлен!`);
    }
    req.accessTokenData = await jwt.verify(accessToken, secret);
    next();
  } catch (err) {
    err.message =
      err instanceof jwt.JsonWebTokenError ? 'Неправильный токен!' : err.message;
    err.message =
      err instanceof jwt.TokenExpiredError ? 'Время жизни токена истекло!' : err.message;
    res.status(401).json({ message: err.message });
  }
};
