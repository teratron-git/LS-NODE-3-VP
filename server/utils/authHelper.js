const jwt = require('jsonwebtoken');
const { secret, tokens } = require('../../config/serverConfig').jwt;

module.exports.createTokens = async (_id) => {
  const aToken = await jwt.sign({ payload: _id.toString() }, secret, {
    expiresIn: tokens.access.expiresIn,
  });
  const rToken = await jwt.sign({ payload: _id.toString() }, secret, {
    expiresIn: tokens.refresh.expiresIn,
  });

  const verifyA = jwt.verify(aToken, secret);
  const verifyR = jwt.verify(rToken, secret);

  return {
    accessToken: aToken,
    refreshToken: rToken,
    accessTokenExpiredAt: verifyA.exp * 1000,
    refreshTokenExpiredAt: verifyR.exp * 1000,
  };
};
