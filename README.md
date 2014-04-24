#Kloudless Node API

##Installation

```
npm install git://github.com/Kloudless/kloudless-node
```


##Node-specific docs and examples

Normal API docs available here: https://developers.kloudless.com/docs

API methods are called in the scheme of...
```
kloudless.<resource>.<method>(<data-json>, <callback>);
```

We'll start with a couple of examples:

```javascript
var async = require('async'); // for clean demonstration

var kloudless = require('kloudless')
                       ('your-api-key-goes-here!');
var fs = require('fs');

var accountId;
var fileId;

async.series([
function(cb) {

    // to get the base account data
    kloudless.accounts.base({}, // needs no data passed in
        function(err,res){
            if (err) { console.log("Error getting the account data: "+err); }
            else {
                // assuming you authorized at least one service (Dropbox, Google Drive, etc.)
                console.log("We got the account data!");
                accountId = res["objects"][0]["id"];
                cb();
            }
        }
    );

},
function(cb) {
    // create the fs.ReadStream to pass in to files.upload()
    var filestream = fs.createReadStream('./test.txt');

    // to upload a file to the account we just got data for
    kloudless.files.upload(
        {"name": "test.txt",
        "account_id": accountId,
        "parent_id": "root",
        "file": filestream,
        // all API calls can specify URL query parameters by defining "queryParams"
        "queryParams": {
                "overwrite": "true"
            }
        },
        function(err, res) {
            if (err) {
                console.log("Error uploading file: "+err);
                cb(err);
            } else {
                console.log("We uploaded the file!");
                fileId = res['id'];
                cb();
            }
        }
    );
},
function(cb){
    // and now we're going to download that file we just uploaded
    kloudless.files.contents(
        {"account_id": accountId,
        "file_id": fileId},
        function(err, filestream) {
            if (err) {
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
                    cb();
                });
            }
        }
    );
}
]);
```

##Resources and Methods

**All API calls can specify URL query parameters by defining "queryParams".**
_See file upload example above._
***

###accounts.base()
**_No required parameters for accounts.base()_**
***
###accounts.get()
**Required params:** ```account_id```
***
###accounts.delete()
**Required params:** ```account_id```
***

###files.upload()
**Required params:** ```account_id, parent_id, file, name```  
"file" should be an instance of Buffer or fs.ReadStream.
You can create a ReadStream by calling ```fs.createReadStream(<file name here>)```
"name" should be the name of the file after it's uploaded.
***
###files.get()
**Required params:** ```account_id, file_id```
Gets metadata for the file. **Not for downloading. If you want to download, use** ```contents()```**.**
***
###files.delete()
**Required params:** ```account_id, file_id```
***
###files.move()
**Required params:** ```account_id, file_id, parent_id```  
"parent_id" should be the ID of the folder you wish to move the file to.
***
###files.rename()
**Required params:** ```account_id, file_id, name```  
This is a vanity method, files can also be renamed using the ```move()``` method by including the desired "name" parameter.
***
###files.contents()
**Required params:** ```account_id, file_id```
Returns a FileStream. See code example for ```files.contents()``` above. Example also in test.js.
***

###folders.create()
**Required params:** ```account_id, name```
***
###folders.get()
**Required params:** ```account_id, folder_id```
***
###folders.delete()
**Required params:** ```account_id, folder_id```
***
###folders.move()
**Required params:** ```account_id, folder_id, parent_id```
***
###folders.rename()
**Required params:** ```account_id, name```  
This is a vanity function just like ```files.rename()```. ```folders.move()``` can be used to rename as well.
***
###folders.contents()
**Required params:** ```account_id, folder_id```
***

###links.base()
**Required params:** ```account_id```
***
###links.create()
**Required params:** ```account_id, file_id```  
"file_id" should be the file you want to link to.
***
###links.get()
**Required params:** ```account_id, link_id```
***
###links.update()
**Required params:** ```account_id, link_id, active```  
Currently for setting "active" true or false. Will be able to set "expiration" and "password" in the future.
***
###links.delete()
**Required params:** ```account_id, link_id```
