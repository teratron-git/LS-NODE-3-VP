const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const uuid = require('uuid/v4');
const { secret, tokens } = require('../../config/serverConfig').jwt;
const model = require('../models/userModel');

const User = mongoose.model('User');

module.exports.createTokens = async (_id) => {
  // const user = await User.findOne({ username });
  const aToken = await jwt.sign({ payload: _id.toString() }, secret, {
    expiresIn: tokens.access.expiresIn,
  });
  const rToken = await jwt.sign({ payload: _id.toString() }, secret, {
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
