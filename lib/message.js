var Message = function(){};
Message.queue = [];

Message.prepare = function(status, body) {
  if(!(body instanceof Buffer)) {
    body = new Buffer(String(body));
  }
  var length = new Buffer(4);
  length.writeUInt32BE(body.length);
  return Buffer.concat([
    new Buffer([status]),
    length,
    body
  ]);
};

module.exports = Message;
