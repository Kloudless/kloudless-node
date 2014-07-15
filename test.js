"use strict";

var kloudless = require('./lib/kloudless')
                       ('your-api-key-here!');
var async = require('async');
var fs = require('fs');

var randString = function() { return (Math.random() + 1).toString(36).substring(7) };

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

        console.log("account base test...");
        kloudless.accounts.base({},
            function(err, res){
                if (err) {
                    cb("Accounts base: "+err)
                } else {
                    accountId = res["objects"][1]["id"];
                    console.log("accounts base test pass");
                    cb(null)
                }
            }
        );

    },

    function(cb) {

        console.log("account search test...");
        kloudless.accounts.search({
            "account_id": accountId,
            "q": "txt"
            },
            function(err, res){
                if (err) {
                    cb("Accounts base: "+err)
                } else {
                    console.log("accounts search test pass");
                    cb(null)
                }
            }
        );

    },

    function(cb) {
        // create the Buffer to pass in to files.upload()
        // this variable can be a Buffer created through any valid method
        // i.e. new Buffer("hello world")
        var filebuffer = fs.readFileSync("test.txt");

        console.log("files upload test...");
        kloudless.files.upload(
            {"name": fileName,
            "account_id": accountId,
            "parent_id": "root",
            "file": filebuffer,
            // all API calls can specify URL query parameters by defining "queryParams"
            "queryParams": {
                    "overwrite": "true"
                }  
            },
            function(err, res) {
                if (err) {
                    cb("Files upload: "+err);
                } else {
                    fileId = res['id'];
                    console.log("files upload test pass");
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        console.log("link create test...");
        kloudless.links.create(
            {"account_id": accountId,
            "file_id": fileId},
            function(err, res) {
                if(err) {
                    cb("Link create: "+err);
                } else {
                    linkId = res['id'];
                    console.log("link create test pass");
                    cb(null)
                }
            }
        );

    },

    function(cb) {
        console.log("link update test...");
        kloudless.links.update(
            {"account_id": accountId,
            "link_id": linkId,
            "expiration": new Date(3),
            "active": false},
            function(err, res) {
                if(err) {
                    cb("Link update: "+err);
                    console.error(err);
                } else {
                    console.log("link update test pass");
                    console.log(res);
                    cb(null)
                }
            }
        );
        
    },

    function(cb) {
        console.log("files contents test...");
        kloudless.files.contents(
            {"account_id": accountId,
            "file_id": fileId},
            function(err, filestream) {
                if (err) {
                    cb("Files contents: "+err);
                } else {
                    var filecontents = '';
                    console.log("got the filestream:");
                    filestream.on('data', function(chunk){
                        console.log("reading in data chunk...");
                        console.log(chunk);
                        filecontents += chunk;
                    });
                    filestream.on('end',function(){
                        console.log("finished reading file!");
                        console.log(filecontents);
                        console.log("files contents test pass");
                        return cb(null);
                    });
                }
            }
        );
    },

    function(cb) {

        console.log("folders create test...");
        kloudless.folders.create(
            {"account_id": accountId,
            "name": folderName,
            "parent_id": "root"},
            function(err, res) {
                if (err) {
                    cb("Folders create: "+err);
                } else {
                    folderId = res['id'];
                    console.log("folders create test pass");
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        
        console.log("files move test...");
        kloudless.files.move(
            {"parent_id": folderId,
            "account_id": accountId,
            "file_id": fileId},
            function(err, res) {
                if (err) {
                    cb("Files move: "+err);
                } else {
                    fileId = res['id'];
                    console.log("files move test pass");
                    cb(null);
                }
            }
        );

    },


    function(cb) {
        
        console.log("files rename test...");
        kloudless.files.rename(
            {"name": fileReName,
            "account_id": accountId,
            "file_id": fileId},
            function(err, res) {
                if (err) {
                    cb("Files rename: "+err);
                } else {
                    fileId = res['id'];
                    console.log("files rename test pass");
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        
        console.log("files get test...");
        kloudless.files.get(
            {"account_id": accountId,
            "file_id": fileId},
            function(err, res) {
                if (err) {
                    cb("Files get: "+err);
                } else {
                    console.log("files get test pass");
                    cb(null);
                }
            }
        );

    },

    function(cb) {

        console.log("files contents test...");
        kloudless.folders.contents(
            {"account_id": accountId,
            "folder_id": folderId},
            function(err, res) {
                if (err) {
                    cb("Folders contents: "+err);
                } else {
                    console.log("folders contents test pass");
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        console.log("files delete test...");
        kloudless.files.delete(
            {"account_id": accountId,
            "file_id": fileId},
            function(err, res) {
                if (err) {
                    cb("Files delete: "+err);
                } else {
                    console.log("files delete test pass");
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        console.log("folders delete test...");
        kloudless.folders.delete(
            {"account_id": accountId,
            "folder_id": folderId},
            function(err, res) {
                if (err) {
                    cb("Folders delete: "+err);
                } else {
                    console.log("folders delete test pass");
                    cb(null);
                }
            }
        );

    },

],function(err){
    if (err) {
        console.log("Test failed: ");
        console.error(err);
    } else {
        console.log("Tests complete!");
    }
})

