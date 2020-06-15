const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

app.use('/api', require(routes));
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.use((req, res, next) => {
  const err = new Error('Такая страница не найдена!');
  err.status = 404;
  next(err);
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { message: err.message });
});

const server = app.listen(process.env.PORT || 3000, function () {
  console.log(`Сервер запущен на порту ${server.address().port}...`);
});
