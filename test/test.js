var debug = require('debug');
debug.log = console.log.bind(console);

require('./test-init.js');
require('./test-open.js');
require('./test-commits.js');
require('./test-state.js');
