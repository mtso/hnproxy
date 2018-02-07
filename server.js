require('dotenv').config();
const express = require('express');
const app = express();

const proxyHandler = require('./controllers/proxy');
const methods = [
  'get',
  'post',
  'put',
  'head',
  'delete',
];

methods.forEach((method) => app[method]('*', proxyHandler));

const listener = app.listen(process.env.PORT, function () {
  console.log('Listening on ' + listener.address().port);
});
