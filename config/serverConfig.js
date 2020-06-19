module.exports = {
  port: 3000,
  dbUrl:
    'mongodb+srv://admin:admin@ls-node-3-vp-uu18v.gcp.mongodb.net/LS-NODE-3-VP',
  jwt: {
    secret: 'test',
    tokens: {
      access: {
        type: 'access',
        expiresIn: '1m',
      },
      refresh: {
        type: 'refresh',
        expiresIn: '2m',
      },
    },
  },
};
