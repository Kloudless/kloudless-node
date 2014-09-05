var path = require('path')
  , fs = require('fs')

  , MultipartUpload = require('../lib/methods/multipart')(process.env.API_KEY || 'your-api-key-here');

// var test_file = 'bigger-test.deb';
var test_file = 'big-test.tar.gz';

var mpu = new MultipartUpload({
  account_id: process.env.TEST_ACCOUNT_ID || 'some-test-account-id-here',
  parent_id: process.env.TEST_ACCOUNT_FOLDER || 'some-folder-id-here',
  file: fs.createReadStream(path.join(__dirname, 'fixtures', test_file)),
  name: test_file,
  logging: 'debug'
});

var capitalise = function(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
};

var add_listener = function(event, emitter) {
  emitter.on(event, function() {
    var args = Array.prototype.splice.call(arguments, 0);
    console.log.apply(console, [capitalise(event) + ' event fired:'].concat(args));
    console.log();
  });
};

['start', 'progress', 'complete', 'success', 'error', 'abort'].map(function(event) {
  add_listener(event, mpu);
});
