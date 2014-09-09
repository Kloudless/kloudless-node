var kloudless = require('../lib/kloudless')(process.env.API_KEY || 'your-api-key-here')
  , async = require('async')
  , fs = require('fs')
  , path = require('path');

var randString = function() {return (Math.random() + 1).toString(36).substring(7);};

var fileName = randString();
var fileReName = randString();
var folderName = randString();
var folderReName = randString();
var fileId;
var linkId;
var folderId;
var accountId;

async.waterfall([
  function(cb) {
    console.log('account base test...');
    kloudless.accounts.base({}, function(err, res){
      if (err) {
        return cb('Accounts base: ' + err);
      }
      accountId = res.objects[0].id;
      console.log('accounts base test pass');
      console.log('accounts:', res.objects);
      cb(null);
    });
  },

  function(cb) {
    console.log('account search test...');
    kloudless.accounts.search({
      account_id: accountId,
      q: 'txt'
    }, function(err, res){
      if (err) {
        return cb('Accounts base: ' + err);
      }
      console.log('accounts search test pass');
      cb(null);
    });
  },

  function(cb) {
    // create the Buffer to pass in to files.upload()
    // this variable can be a Buffer created through any valid method
    // i.e. new Buffer('hello world')
    var filebuffer = fs.readFileSync(path.join(__dirname, 'fixtures/test.txt'));

    console.log('files upload test...');
    kloudless.files.upload({
      name: fileName,
      account_id: accountId,
      parent_id: 'root',
      file: filebuffer,
      // all API calls can specify URL query parameters by defining 'queryParams'
      queryParams: {
        overwrite: true
      }
    }, function(err, res) {
      if (err) {
        return cb('Files upload: ' + err);
      }
      fileId = res.id;
      console.log('files upload test pass');
      cb(null);
    });
  },

  function(cb) {
    console.log('link create test...');
    kloudless.links.create({
      account_id: accountId,
      file_id: fileId
    }, function(err, res) {
      if(err) {
        cb('Link create: ' + err);
      }
      linkId = res.id;
      console.log('link create test pass');
      cb(null);
    });
  },

  function(cb) {
    console.log('link update test...');
    kloudless.links.update({
      account_id: accountId,
      link_id: linkId,
      expiration: new Date(3),
      active: false
    }, function(err, res) {
      if(err) {
        cb('Link update: ' + err);
        return console.error(err);
      }
      console.log('link update test pass');
      console.log(res);
      cb(null);
    });
  },

  function(cb) {
    console.log('files contents test...');
    kloudless.files.contents({
      account_id: accountId,
      file_id: fileId
    }, function(err, filestream) {
      if (err) {
        return cb('Files contents: ' + err);
      }
      var filecontents = '';
      console.log('got the filestream:');
      filestream.on('data', function(chunk){
        console.log('reading in data chunk...');
        console.log(chunk);
        filecontents += chunk;
      });
      filestream.on('end',function(){
        console.log('finished reading file!');
        console.log(filecontents);
        console.log('files contents test pass');
        return cb(null);
      });
    });
  },

  function(cb) {
    console.log('folders create test...');
    kloudless.folders.create({
      account_id: accountId,
      name: folderName,
      parent_id: 'root'
    }, function(err, res) {
      if (err) {
        return cb('Folders create: ' + err);
      }
      folderId = res.id;
      console.log('folders create test pass');
      cb(null);
    });
  },

  function(cb) {
    console.log('files move test...');
    kloudless.files.move({
      parent_id: folderId,
      account_id: accountId,
      file_id: fileId
    }, function(err, res) {
      if (err) {
        return cb('Files move: ' + err);
      }
      fileId = res.id;
      console.log('files move test pass');
      cb(null);
    });
  },

  function(cb) {
    console.log('files rename test...');
    kloudless.files.rename({
      name: fileReName,
      account_id: accountId,
      file_id: fileId
    }, function(err, res) {
      if (err) {
        return cb('Files rename: ' + err);
      }
      fileId = res.id;
      console.log('files rename test pass');
      cb(null);
    });
  },

  function(cb) {
    console.log('files get test...');
    kloudless.files.get({
      account_id: accountId,
      file_id: fileId
    }, function(err, res) {
      if (err) {
        return cb('Files get: ' + err);
      }
      console.log('files get test pass');
      cb(null);
    });
  },

  function(cb) {
    console.log('files contents test...');
    kloudless.folders.contents({
      account_id: accountId,
      folder_id: folderId
    }, function(err, res) {
      if (err) {
        return cb('Folders contents: ' + err);
      }
      console.log('folders contents test pass');
      cb(null);
    });
  },

  function(cb) {
    console.log('files delete test...');
    kloudless.files.delete({
      account_id: accountId,
      file_id: fileId
    }, function(err, res) {
      if (err) {
        return cb('Files delete: ' + err);
      }
      console.log('files delete test pass');
      cb(null);
    });
  },

  function(cb) {
    console.log('folders delete test...');
    kloudless.folders.delete({
      account_id: accountId,
      folder_id: folderId
    }, function(err, res) {
      if (err) {
        return cb('Folders delete: ' + err);
      }
      console.log('folders delete test pass');
      cb(null);
    });
  }
], function(err){
  if (err) {
    console.log('Test failed: ');
    return console.error(err);
  }
  console.log('Tests complete!');
});
