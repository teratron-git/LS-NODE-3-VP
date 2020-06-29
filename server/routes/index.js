const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const newsCtrl = require('../controllers/newsCtrl');
const authCheck = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'build/uploads/' });
const resize = require('../middleware/resize');

router.post('/registration', userCtrl.registration);
router.post('/login', userCtrl.logIn);
router.post('/refresh-token', userCtrl.refreshTokens);

router.get('/profile', authCheck, userCtrl.getProfile);
router.patch(
  '/profile',
  authCheck,
  upload.single('avatar'),
  resize,
  userCtrl.changeProfile
);

router.get('/users', authCheck, userCtrl.getAllUsers);
router.patch('/users/:id/permission', authCheck, userCtrl.changeUserPermission);
router.delete('/users/:id', authCheck, userCtrl.deleteUser);

router.get('/news', authCheck, newsCtrl.getAllNews);
router.post('/news', authCheck, newsCtrl.createNews);
router.patch('/news/:id', authCheck, newsCtrl.changeNews);
router.delete('/news/:id', authCheck, newsCtrl.deleteNews);

module.exports = router;
