var crypto = require('crypto');
var sec = require('../lib/sec');
var net = require('net');
var cli = net.createConnection(35951);
var Message = new Buffer([0x01]);
var session_id = new Buffer('12345678901234567890123456789012');
var dh = crypto.getDiffieHellman('modp14'); dh.generateKeys();
var secret;
var pubKey = dh.getPublicKey();
var len = new Buffer(4);
var acc = new Buffer(4);
acc.writeUInt32BE(1);
len.writeUInt32BE(pubKey.length + 4);
Message = Buffer.concat([Message, session_id, len, acc, dh.getPublicKey()]);
cli.on('connect', function() {
  console.log('Connect');
  var key;
  var stage = 0;
  cli.on('data', function(data) {
    switch(stage) {
      case 0:
        var msg = JSON.stringify({account: [2], message: "test"});
        key = data.slice(5);
        secret = dh.computeSecret(key);
        stage++;
        Message = new Buffer([0x02]);
        msg = sec.encrypt(new Buffer(msg), secret);
        len.writeUInt32BE(msg.length);
        console.log(sec.decrypt(msg, secret).toString());
        Message = Buffer.concat([Message, session_id, len, msg]);
        cli.write(Message);
        break;
      case 1:
        var x = data.slice(5);
        console.log(sec.decrypt(x, secret).toString());
        break;
    }
  });
  cli.write(Message);
});
cli.on('error', function(err){
  console.log(err);
});
