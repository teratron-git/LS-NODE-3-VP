module.exports.serializeUser = (user) => {
  return {
    firstName: user.firstName,
    id: user._id,
    image: user.image,
    middleName: user.middleName,
    permission: user.permission,
    surName: user.surName,
    username: user.userName,
  };
};

module.exports.serializeAuthUser = (user) => {
  return {
    firstName: user.firstName,
    id: user._id,
    image: user.image,
    middleName: user.middleName,
    permission: user.permission,
    surName: user.surName,
    username: user.userName,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    accessTokenExpiredAt: user.accessTokenExpiredAt,
    refreshTokenExpiredAt: user.refreshTokenExpiredAt,
  };
};

module.exports.serializeNews = (news) => {
  return {
    id: news._id,
    title: news.title,
    text: news.text,
    created_at: news.created_at,
    user: news.user,
  };
};
