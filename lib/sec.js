var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

module.exports = {
  encrypt: function encrypt(buffer, key){
    if (!(buffer instanceof Buffer)) {
      buffer = new Buffer(String(buffer));
    }
    var cipher = crypto.createCipher(algorithm, key);
    return Buffer.concat([cipher.update(buffer), cipher.final()]);
  },
  decrypt: function decrypt(buffer, key){
    if (!(buffer instanceof Buffer)) {
      buffer = new Buffer(String(buffer));
    }
    var decipher = crypto.createDecipher(algorithm, key);
    return Buffer.concat([decipher.update(buffer) , decipher.final()]);
  }
};
