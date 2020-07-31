const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes');
const app = express();
const config = require('../config/serverConfig');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const chat = require('./controllers/chatCtrl');
let dbUrl = '';

if (process.env.NODE_ENV === 'production') {
  dbUrl = process.env.DB_URL_DEV || config.dbUrlDev;
  console.log('-= PRODUCTION MODE =-');
} else {
  dbUrl = process.env.DB_URL_PROD || config.dbUrlProd;
  console.log('-= DEVELOPMENT MODE =-');
}

mongoose
  .connect(dbUrl, {
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
