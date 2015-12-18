global.APP_DIR = __dirname;

require('./lib/static');
var messenger = require('./lib/tcp');

var srv = messenger();
