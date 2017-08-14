# Kloudless Node API

## Installation

Install `kloudless` to your application with the following command:

```
npm install --save kloudless
```

You can also install the latest version from our GitHub page:
```
npm install git://github.com/Kloudless/kloudless-node
```

## Node-specific docs and examples

REST API docs available here: https://developers.kloudless.com/docs

API methods are called in the scheme of...
```
kloudless.<resource>.<method>(<data-json>, <callback>);
```

We'll start with a couple of examples:

```javascript
var async = require('async'); // for clean demonstration

var kloudless = require('kloudless')('your-api-key-here');
var fs = require('fs');

var accountId, fileId;

async.series([
  function(cb) {
    // to get the base account data
    kloudless.accounts.base({}, function(err, data, response) {
      if (err) {
        return console.log("Error getting the account data: " + err);
      }
      // assuming you authorized at least one service (Dropbox, Google Drive, etc.)
      console.log("We got the account data!");
      accountId = data["objects"][0]["id"];
      cb();
    });
  },

  function(cb) {
    // create the fs.ReadStream to pass in to files.upload()
    var filestream = fs.createReadStream('./test.txt');

    // to upload a file to the account we just got data for
    kloudless.files.upload({
      "name": "test.txt",
      "account_id": accountId,
      "parent_id": "root",
      "file": filestream,
      // all API calls can specify URL query parameters by defining "queryParams"
      "queryParams": {
        "overwrite": "true"
      }
    }, function(err, data, response) {
      if (err) {
        console.log("Error uploading file: " + err);
        return cb(err);
      }
      console.log("We uploaded the file!");
      fileId = data['id'];
      cb();
    });
  },

  function(cb){
    // and now we're going to download that file we just uploaded
    kloudless.files.contents({
      "account_id": accountId,
      "file_id": fileId
    }, function(err, filestream) {
      if (err) {
        return console.log("Files contents: " + err);
      }
      var filecontents = '';
      console.log("got the filestream:");
      filestream.on('data', function(chunk) {
        console.log("reading in data chunk...");
        console.log(chunk);
        filecontents += chunk;
      });
      filestream.on('end',function() {
        console.log("finished reading file!");
        console.log(filecontents);
        cb();
      });
    });
  }
]);
```

## Resources and Methods

**All API calls can specify URL query parameters by defining "queryParams".**
_See file upload example above._
***

### accounts.base()
**_No required parameters for accounts.base()_**
***
### accounts.get()
**Required params:** ```account_id```
***
### accounts.delete()
**Required params:** ```account_id```
***

### files.upload()
**Required params:** ```account_id, parent_id, file, name```
"file" should be an instance of Buffer.
You can create a Buffer like this: ```var your_var_name = new Buffer("the file contents go here")```
"name" should be the name of the file after it's uploaded.
***
### files.uploadMultipart()
**Parameters:** `options`

`options` is an options object with keys:
* `account_id` -- the ID of the account you're uploading to (i.e. the account which owns the S3/Azure bucket)
* `parent_id` -- the ID of the folder you're uploading the file to
* `file` -- a `Buffer` or `ReadStream` of the file being uploaded
* `name` -- the name of the file after it's uploaded
* `overwrite` -- (optional) a boolean to overwrite a file with the same name
* `max_connections` -- (optional) the maximum number of concurrent connections, defaults to 5
* `max_retries` -- (optional) the maximum number of times a dropped connection is retried, defaults to 3

This method returns a `MultipartUpload extends EventEmitter` that emits the following events:
* `start(session_id)` -- fired after the initialisation completes and file transfer begins, passing the multipart session ID
* `progress(completion)` -- fired after every successful chunk transfer, passing a completion state
* `complete` -- fired after a transfer is finished, regardless of whether it succeeds. Fires after success state events
* `success(result)` -- fires after a transfer completes successfully, passing the metadata of the newly uploaded file
* `error(err, completion)` -- fires after a transfer encounters a fatal error, passing the error and a completion state
* `abort` -- fires after a transfer is aborted

Completion states are objects with keys:
* `completed` -- some integer of completed parts
* `account_id` -- the current account ID, used to resume interrupted uploads
* `session_id` -- the current session ID, used to resume interrupted uploads
* `offset` -- the offset of completed parts, used to resume interrupted uploads

Completion states can be committed to disk and then passed into resumeMultipart to resume uploads that were interrupted by server crashes.

The `MultipartUpload` also exposes the following methods:
<!-- * `pause()` -- pauses the transfer -->
<!-- * `resume()` -- resumes the transfer -->
* `abort()` -- aborts the transfer
***

### files.resumeMultipart()
**Parameters:** `options`

`options` is a completion state, with at least keys:
* `account_id` -- the account ID to resume
* `session_id` -- the session ID to resume
* `offset` -- the current session offset

This method returns a `MultipartUpload` which behaves exactly as if constructed in a standard upload.

### files.stopMultipart()
**Parameters:** `options`

`options` is an options object with keys:
* `account_id` -- the ID of the account with a session to abort
* `session_id` -- the ID of the session to abort
Aborts the specified multipart upload session to prevent storage leaks.
***

### files.get()
**Required params:** ```account_id, file_id```
Gets metadata for the file. **Not for downloading. If you want to download, use** ```contents()```**.**
***
### files.delete()
**Required params:** ```account_id, file_id```
***
### files.move()
**Required params:** ```account_id, file_id, parent_id```
"parent_id" should be the ID of the folder you wish to move the file to.
***
### files.rename()
**Required params:** ```account_id, file_id, name```
This is a vanity method, files can also be renamed using the ```move()``` method by including the desired "name" parameter.
***
### files.contents()
**Required params:** ```account_id, file_id```
Returns a FileStream. See code example for ```files.contents()``` above. Example also in test.js.
***

### folders.create()
**Required params:** ```account_id, parent_id, name```
***
### folders.get()
**Required params:** ```account_id, folder_id```
***
### folders.delete()
**Required params:** ```account_id, folder_id```
***
### folders.move()
**Required params:** ```account_id, folder_id, parent_id```
***
### folders.rename()
**Required params:** ```account_id, folder_id, name```
This is a vanity function just like ```files.rename()```. ```folders.move()``` can be used to rename as well.
***
### folders.contents()
**Required params:** ```account_id, folder_id```
***

### links.base()
**Required params:** ```account_id```
***
### links.create()
**Required params:** ```account_id, file_id```
"file_id" should be the file you want to link to.
***
### links.get()
**Required params:** ```account_id, link_id```
***
### links.update()
**Required params:** ```account_id, link_id```

Optional parameters:
* `active`: enables the link if true, disables the link if false.
* `password`: set a password for the link.
* `expiration`: set an expiration date for the link. Can be an instance of Date() or a number (in milliseconds).
***
### links.delete()
**Required params:** ```account_id, link_id```
***

### events.getLastCursor()
**Required params:** ```account_id```
***
### events.get()
**Required params:** ```account_id```

Optional parameters:
* `cursor`: The cursor to begin obtaining events at.
* `page_size`: The number of entries to retrieve.
***

### users.get()
**Required params:** ```account_id```

Optional parameters:
* `user_id`: The id of the particular user.
***
### users.groups()
**Required params:** ```account_id, user_id```
***

## Testing

`API_KEY=<api key> node index.js`

Some other env vars that may be useful are:

* TEST_ACCOUNT_ID
* API_HOST
* API_CA
* TEST_ACCOUNT_FOLDER (multipart.js only)

