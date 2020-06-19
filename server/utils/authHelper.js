const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const uuid = require('uuid/v4');
const { secret, tokens } = require('../../config/serverConfig').jwt;
const model = require('../models/userModel');

const User = mongoose.model('User');

module.exports.createTokens = async (username) => {
  const user = await User.findOne({ username }).exec();
  const aToken = await jwt.sign({ payload: user._id.toString() }, secret, {
    expiresIn: tokens.access.expiresIn,
  });
  const rToken = await jwt.sign({ payload: user._id.toString() }, secret, {
    expiresIn: tokens.refresh.expiresIn,
  });

  const verifyA = jwt.verify(aToken, secret);
  const verifyR = jwt.verify(rToken, secret);

  // console.log('module.exports.createTokens -> verifyA', verifyA);
  // console.log('module.exports.createTokens -> verifyR', verifyR);
  // console.log('module.exports.createTokens -> aToken', aToken);
  // console.log('module.exports.createTokens -> rToken', rToken);

  return {
    accessToken: aToken,
    refreshToken: rToken,
    accessTokenExpiredAt: verifyA.exp * 1000,
    refreshTokenExpiredAt: verifyR.exp * 1000,
  };
};
// module.exports.generateAccessToken = (userId) => {
//   console.log('Внутри');
//   const payload = {
//     userId,
//     type: tokens.access.type,
//   };
//   const options = { expiresIn: tokens.access.expiresIn };
//   console.log(jwt.sign(payload, secret, options));
//   return jwt.sign(payload, secret, options);
// };

// module.exports.generateRefreshToken = () => {
//   console.log('Внутри ref');
//   const payload = {
//     id: uuid(),
//     type: tokens.refresh.type,
//   };
//   const options = { expiresIn: tokens.refresh.expiresIn };
//   console.log(jwt.sign(payload, secret, options));
//   return {
//     id: payload.id,
//     token: jwt.sign(payload, secret, options),
//   };
// };

// module.exports.replaceDbRefreshToken = (tokenId, userId) => {
//   console.log('Внутри replace');
//   Token.findOneAndRemove({ userId })
//     .exec()
//     .then(() => {
//       Token.create({ tokenId, userId });
//       console.log('!!!', tokenId, userId);
//     });
// };
