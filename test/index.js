'use strict';

var kloudless = require('../lib/kloudless')(process.env.API_KEY || 'your-api-key-here')
  , async = require('async')
  , fs = require('fs')
  , path = require('path');

if (process.env.API_HOST)
    kloudless.setHost(process.env.API_HOST, process.env.API_PORT || 443);
if (process.env.API_CA != null)
    kloudless.setCA(process.env.API_CA);

var randString = function() {return (Math.random() + 1).toString(36).substring(7);};

var fileName = randString();
var fileReName = randString();
var folderName = randString();
var folderReName = randString();
var fileId;
var fileBuffer = fs.readFileSync(path.join(__dirname, 'fixtures/test.txt'));
var linkId;
var folderId;
var accountId;

async.waterfall([
  function(cb) {
    console.log('account base test...');
    kloudless.accounts.base({active: true}, function(err, res, response){
      if (err) {
        return cb('Accounts base: ' + err);
      }
      if (res.objects.length === 0)
        return cb('No accounts available.');

      // console.log('accounts:', res.objects);

      if (process.env.TEST_ACCOUNT_ID)
        accountId = process.env.TEST_ACCOUNT_ID;
      else
        accountId = res.objects[0].id;

      var cType = response.headers['content-type'];
      var expectedCType = 'application/json';
      if (!cType || cType.toLowerCase().indexOf(expectedCType) !== 0) {
        cb("Header data incorrect.");
      }

      kloudless.accounts.get({
        active: true,
        account_id: accountId
      }, function(err, accountData) {
        if (err)
          return cb('Account retrieval: ' + err);

        console.log("Using", accountData.service, "account", accountData.id,
                    ':', accountData.account);
        console.log('accounts base and retrieval tests pass');
        cb(null);
      });
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
    console.log('files upload test...');
    kloudless.files.upload({
      name: fileName,
      account_id: accountId,
      parent_id: 'root',
      file: fileBuffer,
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
        if (filecontents === fileBuffer.toString()) {
          console.log('files contents test pass');
          return cb(null);
        }
        else {
          return cb("File contents fail test: " + filecontents)
        }
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
    console.log('folders contents test...');
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
  },

  function(adminCB) {
    console.log('Admin tests.');
    kloudless.accounts.base({admin: true, active: true}, function(err, res){
      if (err)
        return adminCB('Admin tests: ' + err);

      if (res.objects.length === 0) {
        console.log('No admin accounts available. Skipping admin tests.');
        adminCB(null);
      }

      let adminId;
      if (process.env.TEST_ACCOUNT_ID)
        adminId = process.env.TEST_ACCOUNT_ID;
      else {
        let accountData = res.objects[0];
        adminId = accountData.id;
        console.log("Using", accountData.service, "admin account", accountData.id,
                    ':', accountData.account);
      }

      /*
       * Admin tests
       */
      async.waterfall([

        function(userCB) {
          console.log('users test...');
          kloudless.users.get({account_id: adminId}, function(err, res){
            if (err) {
              return userCB('Users test: ' + err);
            }
            console.log('users test pass');

            if (res.objects.length === 0) {
              console.log("No users available. Skipping user tests.");
              userCB(null);
            }

            let userId = res.objects[0].id;

            async.waterfall([

              function(cb) {
                console.log('user memberships test...');
                kloudless.users.groups({
                  account_id: adminId,
                  user_id: userId,
                }, function(err, res){
                  if (err) {
                    return cb('User Memberships test: ' + err);
                  }
                  console.log('user memberships test pass');
                  cb(null);
                });
              },

            ], userCB);

          });
        },

      ], adminCB);
    });
  },

], function(err){
  if (err) {
    console.log('Test failed: ');
    return console.error(err);
  }
  console.log('Tests complete!');
});
