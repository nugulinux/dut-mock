const express = require('express');

const settings = require('../settings');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', {
    active_menu: '/',
    title: settings.title,
    server_list: settings.server.list,
    registry: settings.registry,
  });
});

module.exports = router;
