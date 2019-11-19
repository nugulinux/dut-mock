const http = require('http');
const process = require('process');
const express = require('express');
const path = require('path');

const h2server = require('./h2server');
const templates = require('./templates.json');

const controlApp = express();
const indexRouter = express.Router();

const port = parseInt(process.env.PORT || process.argv[2], 10);
const configName = process.argv[3] || 'default';
const webport = process.argv[4] || port + 1000;

console.log(process.argv);
console.log(`Configuration - port: ${port}, webport: ${webport}, config_name: ${configName}`);

indexRouter.get('/', (req, res) => {
  res.render('index', {
    title: `Control ${port}`,
    templates,
  });
});

indexRouter.post('/send', (req, res) => {
  const directives = JSON.parse(req.body.directives);

  h2server.sendDirectives(directives.directives);
  res.redirect('/');
});

h2server.start(port, configName);

controlApp.set('views', path.join(__dirname, 'views'));
controlApp.set('view engine', 'ejs');
controlApp.use(express.json());
controlApp.use(express.urlencoded({ extended: false }));
controlApp.use(express.static(path.join(__dirname, '../../public')));

controlApp.use('/', indexRouter);

http.createServer(controlApp).listen(webport);
