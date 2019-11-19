const url = require('url');
const http2 = require('http2');
const fs = require('fs');
const path = require('path');

const server = http2.createServer();

let config = {};

const h2server = {
  directive_stream: null,
  boundary: 'this-is-a-boundary',
  start: (port, configName) => {
    config = JSON.parse(fs.readFileSync(path.resolve(__dirname, `config_${configName}.json`)));

    console.log('Config:', config);

    server.listen(port);
    console.log('control page started');
  },
  sendDirectives: listDirectives => {
    const data = JSON.stringify({ directives: listDirectives }, null, 2);

    const output = `
  Content-Type: application/json;\r
  Content-Length: ${data.length}\r
  \r
  ${data}\r
  \r
  --${h2server.boundary}\r`;

    console.log('sendDirectives:\n', output);

    if (h2server.directive_stream == null) {
      console.log('directive stream is not ready.');
      return;
    }

    h2server.directive_stream.write(output);
  },
};

function pathV1Echo(stream) {
  stream.respond({ ':status': config.token });
  stream.end();
}

function pathV1Event(stream) {
  stream.respond({ ':status': config.token });
  stream.on('close', () => {
    console.log('event stream closed');
  });
  stream.on('data', chunk => {
    console.log(`event data: ${chunk}`);
  });
  stream.on('error', code => {
    console.log('event stream error:', code);
  });
  stream.end();
}

function pathV1EventAttachment(stream) {
  stream.respond({ ':status': config.token });
  stream.on('error', code => {
    console.log('event stream error:', code);
  });
  stream.end();
}

function pathV1Directives(stream) {
  h2server.directive_stream = stream;

  stream.respond({
    ':status': config.token,
    'Content-Type': `multipart/related; boundary=${h2server.boundary}`,
  });

  if (parseInt(config.token, 10) !== 200) {
    stream.end();
    return;
  }

  stream.write(`--${h2server.boundary}\r`);

  const noop = {
    header: {
      dialogRequestId: '1055e49d02c0479ce236c085ce1ff2cb',
      messageId: 'd4027439c9a16d72',
      name: 'Noop',
      namespace: 'System',
      version: '1.0',
    },
    payload: {},
  };

  h2server.sendDirectives([noop]);

  stream.on('error', code => {
    console.log('event stream error:', code);
  });
}

function pathV1Ping(stream) {
  /* Update no activity timeout to 5 minutes */
  console.log('update no-activity-timeout to 5 minutes');
  stream.session.setTimeout(5 * 60 * 1000);

  stream.respond({ ':status': config.token });
  stream.on('error', code => {
    console.log('event stream error:', code);
  });
  stream.end();
}

server.on('stream', (stream, headers) => {
  console.log('\nStream:', stream.id, ', Received new request:', headers);
  const reqPath = url.parse(headers[':path']);

  switch (reqPath.pathname) {
    case '/echo':
      pathV1Echo(stream, headers);
      break;
    case '/v1/event':
      pathV1Event(stream, headers);
      break;
    case '/v1/event-attachment':
      pathV1EventAttachment(stream, headers);
      break;
    case '/v1/directives':
      pathV1Directives(stream, headers);
      break;
    case '/v1/ping':
      pathV1Ping(stream, headers);
      break;
    default:
      console.log(`not supported path: ${reqPath.pathname}`);
      stream.respond({ ':status': 404 });
      stream.end();
      break;
  }
});

server.on('session', session => {
  console.log('\n ---- new session ----', session.socket.remoteAddress);

  /* ping test (only for test purpose) */
  session.ping(Buffer.from('12345678'), (err, duration, payload) => {
    if (!err) {
      console.log(`Ping acknowledged in ${duration} milliseconds`);
      console.log(`With payload '${payload.toString()}'`);
    }
  });

  /* Set no activity timeout to 5 minutes */
  console.log('set no-activity-timeout to 5 minutes');
  session.setTimeout(5 * 60 * 1000);

  session.on('close', () => {
    console.log('session: close event');
  });
  session.on('error', () => {
    console.log('session: error event');
  });
  session.on('goaway', () => {
    console.log('session: goaway event');
  });
  session.on('timeout', () => {
    console.log('session: timeout event');
  });
});

module.exports = h2server;
