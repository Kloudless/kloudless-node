var path = require('path')
  , fs = require('fs')

  , MultipartUpload = require('../lib/methods/multipart')(process.env.API_KEY || 'your-api-key-here');

var mpu = new MultipartUpload(
  process.env.TEST_ACCOUNT_ID || 'some-test-account-id-here',
  process.env.TEST_ACCOUNT_FOLDER || 'some-folder-id-here',
  fs.createReadStream(path.join(__dirname, 'fixtures', 'big-test.deb')),
  'big-test.tar.gz'
);

// MultipartUpload.stopSession(process.env.TEST_ACCOUNT_ID, 368)
//   .then(function() {
//     MultipartUpload.stopSession(process.env.TEST_ACCOUNT_ID, 369);
//   })
//   .then(function() {
//     MultipartUpload.stopSession(process.env.TEST_ACCOUNT_ID, 370);
//   })
//   .then(function() {
//     MultipartUpload.stopSession(process.env.TEST_ACCOUNT_ID, 371);
//   })
//   .then(function() {
//     console.log('All stopped.');
//   });
