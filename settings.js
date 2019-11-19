const fs = require('fs');

const files = {
  policy: './services/registry/policy.json',
  config: './services/registry/config.json',
  serverList: './services/server/list.json',
};

if (fs.existsSync(files.policy) === false) {
  console.log('Generate registry policy file');
  fs.copyFileSync('./services/registry/default_policy.json', files.policy);
}

if (fs.existsSync(files.config) === false) {
  console.log('Generate registry config file');
  fs.copyFileSync('./services/registry/default_config.json', files.config);
}

if (fs.existsSync(files.serverList) === false) {
  console.log('Generate empty server list file');
  fs.writeFileSync(files.serverList, '[]');
}

const registry_policy = JSON.parse(fs.readFileSync(files.policy));
const registry_config = JSON.parse(fs.readFileSync(files.config));
const server_list = JSON.parse(fs.readFileSync(files.serverList));

const settings = {
  title: 'DUT Mock',
  registry: {
    child: null,
    config: registry_config,
    policy: registry_policy,
    SavePolicy: () => {
      fs.writeFileSync(files.policy, JSON.stringify(settings.registry.policy, null, 2));
    },
    SaveConfig: () => {
      fs.writeFileSync(files.config, JSON.stringify(settings.registry.config, null, 2));
    },
  },
  server: {
    base_port: 8081,
    base_webport: 1000,
    list: server_list,
    configs: [
      {
        name: 'default',
        desc: 'Default configuration',
      },
      {
        name: 'reject',
        desc: 'Always reject the token',
      },
    ],
    SaveList: () => {
      const listFiltered = [];

      settings.server.list.forEach(item => {
        listFiltered.push({
          port: item.port,
          config: item.config,
          webport: item.webport,
        });
      });

      fs.writeFileSync(files.serverList, JSON.stringify(listFiltered, null, 2));
    },
  },
};

module.exports = settings;
