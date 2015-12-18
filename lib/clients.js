//TODO: shared client storage
var crypto = require('crypto');
var Message = require('./message');
var sec = require('./sec');
var clients = [];

function getClient(token) {
  for(var i in clients) {
    if(clients[i].session_token === token) {
      return clients[i].socket;
    }
  }
  return null;
}

function getClientsById(account) {
  var result = [];
  for(var i in clients) {
    if(clients[i].account === account) {
      result.push(clients[i].socket);
    }
  }
  return result;
}

exports.parsePacket = function(sock, cb) {
  var action = null;
  var session_token = null;
  var buffer = new Buffer(0);
  var data_size = null;
  var I;
  function onData(data) {
    buffer = Buffer.concat([buffer, data]);
    clearTimeout(I);
    I = setTimeout(function(){
      sock.removeAllListeners();
      sock.end();
    }, 10000);
    if(action === null) {
      action = data[0];
    }
    if(session_token === null) {
      if(buffer.length >= 33) {
        session_token = buffer.slice(1, 33).toString();
        buffer = buffer.slice(33);
      }
    }
    if(session_token) {
      var cli = getClient(session_token);
      if(!cli) {
        cli = {
          session_token: session_token,
          socket: sock
        };
        clients.push(cli);
        cli = sock;
      }
      if (data_size === null) {
        if(buffer.length >= 4) {
          data_size = buffer.readUInt32BE(0);
          buffer = buffer.slice(4);
        }
      }
      if (data_size !== null) {
        switch(action) {
          case ACTION_ACK:
          //TODO: client update
          break;
          case ACTION_AUTH:
            if(!cli.account && buffer.length >= 4) {
              var account = buffer.readUInt32BE(0);
              cli.account = account;
              buffer = buffer.slice(4);
            }
            if(cli.account && buffer.length === data_size - 4) {
              cli.publicKey = buffer;
              var dh = crypto.getDiffieHellman('modp14');
              dh.generateKeys();
              cli.dh = dh;
              cli.secret = dh.computeSecret(buffer);
              cli.write(Message.prepare(STATUS_OK, dh.getPublicKey()));
              sock.removeListener('data', onData);
              cb(null, {
                action: action,
                session_token: session_token,
                data: buffer
              });
            }
          break;
          case ACTION_MSG:
            console.log(action, session_token, data_size);
            if(buffer.length === data_size) {
              var msg = sec.decrypt(buffer, cli.secret).toString('utf8');
              try {
                var data = JSON.parse(msg);
              } catch (e) {
                sock.removeListener('data', onData);
                cli.write(Message.prepare(STATUS_ERROR, "Error parsing request"));
                return cb(e, msg);
              } finally {
                if(!data.account || !Array.isArray(data.account) || data.account.length === 0) {
                  sock.removeListener('data', onData);
                  cli.write(Message.prepare(STATUS_ERROR, "No accounts to send"));
                  return cb(new Error("No accounts to send"));
                }
                var deliveries = [];
                data.account.forEach(function(acc) {
                  var recs = getClientsById(acc);
                  var _msg = {
                    account_from: cli.account,
                    account_to: acc,
                    message: data.message
                  };
                  if(recs.length > 0) {
                    recs.forEach(function(rec) {
                      rec.write(Message.prepare(STATUS_OK, sec.encrypt(JSON.stringify(_msg), rec.secret)), function() {
                        deliveries.push({account: acc, status: "delivered"});
                      });
                    });
                  } else {
                    deliveries.push({account: acc, status: "queued"});
                    Message.queue.push(_msg);
                  }
                });
                cli.write(Message.prepare(STATUS_OK, sec.encrypt(JSON.stringify(deliveries), cli.secret)));
                sock.removeListener('data', onData);
                cb(null, {
                  action: action,
                  session_token: session_token,
                  data: msg
                });
              }
            }
          break;
          default:
            cli.end();
            cb(new Error('Wrong action'));
        }
      }
    }
  }
  sock.on('data', onData);
  I = setTimeout(function(){
    sock.removeAllListeners();
    sock.end();
  }, 10000);
  //TODO: on error, on close, timeout
};
