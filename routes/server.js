const express = require('express');
const child_process = require('child_process');
const url = require('url');

const settings = require('../settings');

const router = express.Router();

/* GET server page. */
router.get('/', (req, res) => {
  console.log('Server status:', settings.server);

  res.render('server', {
    active_menu: '/server',
    title: settings.title,
    server_list: settings.server.list,
    registry: settings.registry,
    server: settings.server,
    url: url.parse(`${req.protocol}://${req.get('host')}${req.originalUrl}`),
  });
});

router.post('/', (req, res) => {
  let maxPort = settings.server.base_port;

  settings.server.list.forEach(element => {
    if (element.port >= maxPort) maxPort = element.port + 1;
  });

  settings.server.list.push({
    port: maxPort,
    config: 'default',
    webport: maxPort + settings.server.base_webport,
  });
  settings.server.SaveList();

  res.redirect('/server');
});

router.post('/:port', (req, res) => {
  if (req.body._method === 'delete') {
    console.log('remove:', req.params.port, req.params);

    settings.server.list = settings.server.list.filter(item => {
      return item.port !== parseInt(req.params.port, 10);
    });
    settings.server.SaveList();
  } else {
    console.log('invalid request:', req.body);
  }

  res.redirect('/server');
});

router.post('/:port/start', (req, res) => {
  console.log('start:', req.params, req.body);

  let item = null;

  settings.server.list.forEach(i => {
    if (i.port === parseInt(req.params.port, 10)) {
      item = i;
    }
  });

  if (item == null) {
    console.log('invalid item');
    res.redirect('/server');
    return;
  }

  item.config = req.body.config;

  console.log(item);

  const child = child_process.spawn('node', ['services/server/index.js', item.port, item.config]);

  child.on('close', code => {
    console.log(`\x1b[36m(server[${item.port}]) destroyed with ${code}\x1b[0m`);
    item.child = null;
  });

  child.on('exit', code => {
    console.log(`\x1b[36m(server[${item.port}]) exited with ${code}\x1b[0m`);
  });

  child.on('error', () => {
    console.log(`\x1b[36m(server[${item.port}]) error\x1b[0m`);
    item.child = null;
  });

  child.stdout.on('data', data => {
    console.log(`\x1b[36m(server[${item.port}]) stdout: \x1b[0m${data}`);
  });

  child.stderr.on('data', data => {
    console.error(`\x1b[36m(server[${item.port}]) stderr: \x1b[0m${data}`);
  });

  item.child = child;

  res.redirect('/server');
});

router.post('/:port/stop', (req, res) => {
  console.log('stop:', req.params);

  let item = null;

  settings.server.list.forEach(i => {
    if (i.port === parseInt(req.params.port, 10)) {
      item = i;
    }
  });

  if (item == null) {
    console.log('invalid item');
    res.redirect('/server');
    return;
  }

  if (item.child) item.child.kill();

  item.child = null;
  res.redirect('/server');
});

module.exports = router;
