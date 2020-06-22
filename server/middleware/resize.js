const fs = require('fs');
const jimp = require('jimp');
const path = require('path');

module.exports = async (req, _, next) => {
  const avatar = req.file ? req.file.path : null;

  if (avatar) {
    const newImage = path.join(
      __dirname,
      '..',
      '..',
      'build',
      'uploads',
      req.file.filename
    );

    try {
      jimp.read(newImage, (err, lenna) => {
        if (err) throw err;
        lenna.resize(240, 240).write(newImage);
      });
      next();
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
};
