module.exports = {
  port: 3000,
  dbUrlProd:
    'mongodb+srv://admin:admin@ls-node-3-vp-uu18v.gcp.mongodb.net/LS-NODE-3-VP',
  dbUrlDev:
    'mongodb+srv://admin:admin@ls-node-3-vp-uu18v.gcp.mongodb.net/LS-NODE-3-VP',
  jwt: {
    secret: 'test',
    tokens: {
      access: {
        type: 'access',
        expiresIn: '5m',
      },
      refresh: {
        type: 'refresh',
        expiresIn: '60m',
      },
    },
  },
  chatHistoryLimit: 30,
};
