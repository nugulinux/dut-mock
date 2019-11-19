const http2 = require('http2');
const url = require('url');

const policy = require('./policy.json');
const config = require('./config.json');

const server = http2.createServer();

server.on('stream', (stream, headers) => {
  console.log(headers);
  const path = url.parse(headers[':path']);

  if (path.pathname !== '/v1/policies') {
    console.log(path);
    console.log(`not supported path: ${path.pathname}`);
    stream.respond({ ':status': 404 });
    stream.end();
  } else {
    stream.respond({ ':status': config.token });

    if (parseInt(config.token, 10) === 200) {
      stream.end(JSON.stringify(policy));
    } else {
      stream.end();
    }
  }
});

server.listen(process.env.PORT || config.port);

console.log(`Configuration - port: ${config.port}, policy: ${policy}`);
