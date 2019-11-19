const express = require('express');
const child_process = require('child_process');
const os = require('os');

const settings = require('../settings');

const router = express.Router();
const addrs = [];

(() => {
  const ifaces = os.networkInterfaces();

  Object.entries(ifaces).forEach(item => {
    item[1].forEach(addr => {
      if (addr.family === 'IPv4') {
        addrs.push(addr);
      }
    });
  });

  console.log('Network interfaces:', addrs);
})();

/* GET registry page. */
router.get('/', (req, res) => {
  const servers = JSON.stringify(settings.registry.policy.serverPolicies, null, 2);

  res.render('registry', {
    active_menu: '/registry',
    title: settings.title,
    server_list: settings.server.list,
    registry: settings.registry,
    lines: servers.split('\n').length,
    address: addrs,
    serverPolicies: servers,
  });
});

router.post('/health', (req, res) => {
  settings.registry.policy.healthCheckPolicy = {
    accumulationTime: parseInt(req.body.accumulationTime, 10),
    beta: parseInt(req.body.beta, 10),
    healthCheckTimeout: parseInt(req.body.healthCheckTimeout, 10),
    retryCountLimit: parseInt(req.body.retryCountLimit, 10),
    retryDelay: parseInt(req.body.retryDelay, 10),
    ttl: parseInt(req.body.ttl, 10),
    ttlMax: parseInt(req.body.ttlMax, 10),
  };

  console.log(settings.registry.policy);
  settings.registry.SavePolicy();

  res.redirect('/registry');
});

router.post('/servers', (req, res) => {
  console.log(req.body.serverPolicies);
  settings.registry.policy.serverPolicies = JSON.parse(req.body.serverPolicies);

  console.log(settings.registry.policy);
  settings.registry.SavePolicy();

  res.redirect('/registry');
});

router.post('/start', (req, res) => {
  console.log(req.body);

  settings.registry.config.port = req.body.port;
  settings.registry.config.token = req.body.token;
  settings.registry.SaveConfig();

  const child = child_process.spawn('node', ['services/registry/index.js']);

  child.on('close', code => {
    console.log(
      `\x1b[32m(registry[${settings.registry.config.port}]) destroyed with ${code}\x1b[0m`,
    );
    settings.registry.child = null;
  });

  child.on('exit', code => {
    console.log(`\x1b[32m(registry[${settings.registry.config.port}]) exited with ${code}\x1b[0m`);
  });

  child.on('error', () => {
    console.log(`\x1b[32m(registry[${settings.registry.config.port}]) error\x1b[0m`);
    settings.registry.child = null;
  });

  child.stdout.on('data', data => {
    console.log(`\x1b[32m(registry[${settings.registry.config.port}]) stdout:\x1b[0m ${data}`);
  });

  child.stderr.on('data', data => {
    console.error(`\x1b[32m(registry[${settings.registry.config.port}]) stderr:\x1b[0m ${data}`);
  });

  settings.registry.child = child;
  res.redirect('/registry');
});

router.get('/stop', (req, res) => {
  if (settings.registry.child) settings.registry.child.kill();

  settings.registry.child = null;
  res.redirect('/registry');
});

module.exports = router;
