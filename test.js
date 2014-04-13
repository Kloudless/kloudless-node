"use strict";

var kloudless = require('./lib/kloudless')
                       ('your-api-key-here');
var async = require('async');
var fs = require('fs');
var assert = require('assert');

var randString = function() { return (Math.random() + 1).toString(36).substring(7) };

var fileName = randString();
var fileReName = randString();
var folderName = randString();
var folderReName = randString();
var fileId;
var folderId;
var accountId;

async.waterfall([

    function(cb) {

        kloudless.accounts.base({},
            function(err,res){
                if(err) {
                    cb("Accounts base: "+err)
                } else {
                    //console.log("there was a result (accounts base)! :");
                    //console.log(res);
                    accountId = res["objects"][1]["id"];
                    assert.ok(accountId);
                    cb(null)
                }
            }
        );

    },

    function(cb) {

        kloudless.files.upload(
            {"name": fileName,
            "account_id": accountId,
            "parent_id": "root",
            "file_path": "test.txt"},
            function(err,res) {
                if(err) {
                    console.log("Files upload: "+err);
                } else {
                    //console.log("there was a result (file upload)! :");
                    //console.log(res);
                    fileId = res['id'];
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        
        kloudless.files.contents(
            {"account_id": accountId,
            "file_id": fileId},
            function(err,filestream) {
                if(err) {
                    console.log("Files contents: "+err);
                } else {
                    var filecontents = '';
                    console.log("got the filestream:");
                    filestream.on('data',function(chunk){
                        console.log("reading in data chunk...");
                        console.log(chunk);
                        filecontents += chunk;
                    });
                    filestream.on('end',function(){
                        console.log("finished reading file!");
                        console.log(filecontents);
                        return cb(null);
                    });
                }
            }
        );
    },

    function(cb) {

        kloudless.folders.create(
            {"account_id": accountId,
            "name": folderName,
            "parent_id": "root"},
            function(err,res) {
                if(err) {
                    console.log("Folders create: "+err);
                } else {
                    //console.log("there was a result (folders create)! :");
                    //console.log(res);
                    folderId = res['id'];
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        
        kloudless.files.move(
            {"parent_id": folderId,
            "account_id": accountId,
            "file_id": fileId,},
            function(err,res) {
                if(err) {
                    console.log("Files move: "+err);
                } else {
                    //console.log("there was a result (file move)! :");
                    //console.log(res);
                    fileId = res['id'];
                    cb(null);
                }
            }
        );

    },


    function(cb) {
        
        kloudless.files.rename(
            {"name": fileReName,
            "account_id": accountId,
            "file_id": fileId},
            function(err,res) {
                if(err) {
                    console.log("Files rename: "+err);
                } else {
                    //console.log("there was a result (file rename)! :");
                    //console.log(res);
                    fileId = res['id'];
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        
        kloudless.files.get(
            {"account_id": accountId,
            "file_id": fileId},
            function(err,res) {
                if(err) {
                    console.log("Files get: "+err);
                } else {
                    //console.log("there was a result (file get)! :");
                    //console.log(res);
                    cb(null);
                }
            }
        );

    },

    function(cb) {

        kloudless.folders.contents(
            {"account_id": accountId,
            "folder_id": folderId},
            function(err,res) {
                if(err) {
                    console.log("Folders contents: "+err);
                } else {
                    //console.log("there was a result (folders contents)! :");
                    //console.log(res);
                    cb(null);
                }
            }
        );

    },

    function(cb) {
        console.log("file deletion");
        kloudless.files.delete(
            {"account_id": accountId,
            "file_id": fileId},
            function(err,res) {
                if(err) {
                    console.log("Files delete: "+err);
                } else {
                    //console.log("there was a result (file delete)! :");
                    //console.log(res);
                    cb(null);
                }
            }
        );

    },

    function(cb) {

        kloudless.folders.delete(
            {"account_id": accountId,
            "folder_id": folderId},
            function(err,res) {
                if(err) {
                    console.log("Folders delete: "+err);
                } else {
                    //console.log("there was a result (folder delete)! :");
                    //console.log(res);
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

