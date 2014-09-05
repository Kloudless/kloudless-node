var util = require('util')
  , EventEmitter = require('events').EventEmitter

  , Promise = require('bluebird')
  , request = Promise.promisify(require('request'));

var API_KEY = ''
  , CHUNK_SIZE = 5 * 1024 * 1024; // 5MiB default chunk size

var MultipartUploadFactory = function(key) {
  API_KEY = key;
  return MultipartUpload;
};

var MultipartUpload = function(account_id, parent_id, file, name, session_id, offset) {
  EventEmitter.call(this);

  this.account_id = account_id;
  this.parent_id = parent_id;
  this.file = file;
  this.name = name;

  this.session_id = session_id;
  this.offset = offset;

  this.initialised = false;
  if(session_id || offset) {
    this.initialised = true;
  }

  console.log('Multipart upload started for file', name);
  console.log();

  var self = this;
  self.chain = Promise.resolve(self.initialised || self.initialise())
    .cancellable()
    .then(function() {
      self.upload();
    });
};

util.inherits(MultipartUpload, EventEmitter);

MultipartUpload.prototype.initialise = function() {
  console.log('Initialising upload session...');

  var self = this;
  console.log('Pinging: https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart');
  console.log('Sending body:', JSON.stringify({
    parent_id: self.parent_id,
    name: self.name
  }));

  return request({
    url: 'https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart',
    headers: {
      'Authorization': 'ApiKey ' + API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      parent_id: self.parent_id,
      name: self.name
    })
  })
    .then(function(res) {
      var http_response = res[0]
        , body = res[1];
      response = JSON.parse(body);
      if(response.error_code) {
        return console.error('Erroneous response encountered:', response);
      }
      self.session_id = response.id;
      self.emit('start', self.session_id);

      console.log('...upload session initialised!');
      console.log();
    });
};

MultipartUpload.prototype.upload = function() {
  console.log('Beginning upload...');

  var self = this;

  return new Promise(function(resolve) {
    var chunk = new Buffer(0)
      , part = 1
      , promises = [];

    self.file.on('data', function(datum) {
      // console.log('Stream data received:', datum, datum.length);
      chunk = Buffer.concat([chunk, datum]);
      if (chunk.length >= CHUNK_SIZE) {
        console.log('Chunk created:', chunk.length);
        console.log('Queueing upload of part', part);
        console.log();

        promises.push(self.uploadChunk(chunk, part));
        chunk = new Buffer(0);
        part++;
      }
    });

    self.file.on('end', function() {
      console.log('Chunk created:', chunk.length);
      console.log('Queueing upload of part', part);
      console.log();
      promises.push(self.uploadChunk(chunk, part));

      console.log('...uploads queued!');
      console.log();
      resolve(Promise.all(promises).then(function() {
        console.log('...uploads complete!');
        console.log();
      }));
    });
  })
    .then(function() {
      self.finalise();
    })
    .then(function() {
      self.complete();
    });
};

MultipartUpload.prototype.uploadChunk = function(chunk, part) {
  var self = this;

  console.log('Uploading chunk:', part);
  console.log('Pinging: ' + 'https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart/' + self.session_id);
  console.log('Chunk:', chunk);

  return request({
    url: 'https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart/' + self.session_id,
    qs: {
      part_number: part
    },
    headers: {
      'Authorization': 'ApiKey ' + API_KEY,
      'Content-Type': 'application/octet-stream'
    },
    method: 'PUT',
    body: chunk
  })
    .then(function(res) {
      var http_response = res[0]
        , body = res[1];

      var status = http_response.statusCode;
      self.emit('progress', {
        completed: part,
        total: null
      });

      console.log('Received status', status, 'for chunk', part);
      console.log();
    })
    .catch(function(err) {
      self.uploadChunk(chunk, part);
    });
};

MultipartUpload.prototype.finalise = function() {
  console.log('Finalising upload...');
  var self = this;
  return request({
    url: 'https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart/' + self.session_id + '/complete',
    headers: {
      'Authorization': 'ApiKey ' + API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      parent_id: self.parent_id,
      name: self.name
    })
  })
    .then(function(res) {
      var http_response = res[0]
        , body = res[1];
      response = JSON.parse(body);
      if(response.error_code) {
        return console.error('Erroneous response encountered:', response);
      }
      self.session_id = response.id;
      self.emit('success');

      console.log('...upload finalised!');
      console.log();
    });
};

MultipartUpload.prototype.abort = function() {
  var self = this;
  self.chain.cancel();
  return MultipartUpload.stopSession(self.account_id, self.session_id)
    .then(function(res) {
      self.emit('abort');
    });
};

MultipartUpload.prototype.complete = function() {
  this.emit('complete');
};

MultipartUpload.stopSession = function(account_id, session_id) {
  return request({
    url: 'https://api.kloudless.com/v0/accounts/' + account_id + '/multipart/' + session_id,
    headers: {
      'Authorization': 'ApiKey ' + API_KEY
    },
    method: 'DELETE'
  })
    .then(function(res) {
      var response = res[0]
        , body = res[1];
      console.log(body);
    });
};

module.exports = MultipartUploadFactory;
