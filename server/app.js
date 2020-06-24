const mongoose = require('mongoose');
const http = require('http');
// require('./models/userModel');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes');
const app = express();
const config = require('../config/serverConfig');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const fs = require('fs');
const chat = require('./controllers/chatCtrl');

mongoose
  .connect(config.dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    server.listen(process.env.PORT || config.port, function () {
      console.log(`Сервер запущен на порту ${server.address().port}...`);
    });
  });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

app.use('/api', routes);
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

chat(io);

app.use((req, res, next) => {
  const err = new Error('Такая страница не найдена!');
  err.status = 404;
  next(err);
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { message: err.message });
});
