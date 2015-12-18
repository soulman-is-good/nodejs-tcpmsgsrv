var net = require('net');
var Clients = require('./clients');

module.exports = function () {
  var srv = net.createServer();

  srv.on('connection', function(cli) {
    console.log('Client connected %s', cli.remoteAddress);
    Clients.parsePacket(cli, function(err, data) {
      Clients.parsePacket(cli, function(err, data) {
        console.log(err, data);
      });
    });
    //cli.on('data', onData);
  });

  srv.on('listening', function() {
    console.log('TCP server is listening on %s:%s', srv.address().address, srv.address().port);
  });

  srv.listen(35951);
  return srv;
};
