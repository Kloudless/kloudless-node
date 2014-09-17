var util = require('util')
  , EventEmitter = require('events').EventEmitter

  , Promise = require('bluebird')
  , request = Promise.promisify(require('request'))

  , stream = require('stream')
  , streamifier = require('streamifier');

var API_KEY = process.env.KLOUDLESS_API_KEY || '';

var Logger = function(options) {
  this.LEVELS = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4
  };

  options.level = options.level || 'none';
  this.level = this.LEVELS[options.level.toUpperCase()] || 1;
};
Logger.prototype.error = function() {
  if (this.level >= this.LEVELS.ERROR) {
    console.error.apply(console, arguments);
  }
};
Logger.prototype.log = function() {
  if (this.level >= this.LEVELS.DEBUG) {
    console.log.apply(console, arguments);
  }
};

var MultipartUploadFactory = function(key) {
  API_KEY = key;
  return MultipartUpload;
};

var MultipartUpload = function(options){
  EventEmitter.call(this);

  this.account_id = options.account_id;
  this.parent_id = options.parent_id;
  this.name = options.name;
  this.overwrite = options.overwrite;

  this.max_connections = options.max_connections || 5;
  this.max_retries = options.max_retries || 3;

  this.file = options.file;
  if (!(this.file instanceof stream.Readable)) {
    this.file = streamifier.createReadStream(this.file);
  }

  this.session_id = options.session_id;
  this.offset = options.offset || 0;

  this.logger = new Logger({
    level: options.logging || 'none'
  });

  this.completed_chunks = [];

  this.logger.log('Multipart upload started for file', this.name);
  this.logger.log();

  var self = this;
  self.chain = Promise.resolve(true)
    .cancellable()
    .then(function() {
      return Promise.resolve(options.resuming? true : self.initialise());
    })
    .then(function() {
      return self.loadSession();
    })
    .then(function() {
      return self.upload();
    })
    .then(function() {
      return self.finalise();
    })
    .then(function() {
      return self.complete();
    })
    .catch(function(err) {
      self.logger.error('Fatal error encountered:', err);
      self.emit('error', err, {
        completed: self.completed_chunks.length,
        offset: self.offset
      });
    });
};

util.inherits(MultipartUpload, EventEmitter);

MultipartUpload.prototype.initialise = function() {
  this.logger.log('Initialising upload session...');

  var self = this;
  self.logger.log('Pinging: https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart' + (self.overwrite? '?overwrite=True':''));
  self.logger.log('Sending body:', JSON.stringify({
    parent_id: self.parent_id,
    name: self.name
  }));

  return request({
    url: 'https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart' + (self.overwrite? '?overwrite=True':''),
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
        self.logger.error('Could not initialise session:', response);
        throw new Error('Could not initialise session: ' + JSON.stringify(response));
      }
      self.session_id = response.id;
      self.emit('start', self.session_id);

      self.logger.log('...upload session initialised!');
      self.logger.log();
    });
};

MultipartUpload.prototype.loadSession = function() {
  this.logger.log('Loading session metadata...');

  var self = this;
  self.logger.log('Pinging: https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart/' + self.session_id);

  return request({
    url: 'https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart/' + self.session_id,
    headers: {
      'Authorization': 'ApiKey ' + API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'GET'
  })
    .then(function(res) {
      var http_response = res[0]
        , body = res[1];
      response = JSON.parse(body);
      if(response.error_code) {
        self.logger.error('Could not load session metadata:', response);
        throw new Error('Could not load session metadata: ' + JSON.stringify(response));
      }
      self.chunk_size = response.part_size;
      self.logger.log('Upload session takes chunks of', self.chunk_size);

      self.logger.log('...session metadata loaded!');
      self.logger.log();
    });
};


MultipartUpload.prototype.upload = function() {
  this.logger.log('Beginning upload...');
  this.logger.log();

  var self = this;

  return new Promise(function(resolve) {
    var chunk = new Buffer(0)
      , part = 1
      , connections = {};

    self.file.on('data', function(datum) {
      // self.logger.log('Stream data received:', datum, datum.length);

      if (chunk.length + datum.length >= self.chunk_size) {
        var delta = chunk.length + datum.length - self.chunk_size;
        chunk = Buffer.concat([chunk, datum.slice(0, datum.length - delta)]);
        var extra = datum.slice(delta);

        self.logger.log('Delta:', delta);
        self.logger.log('Chunk created:', chunk.length + delta);
        self.logger.log('Queueing upload of part', part);
        self.logger.log();

        connections[part] = (function(c, p) {
          return self.uploadChunk(c, p)
            .then(function() {
              self.logger.log('Upload of chunk', p, 'complete');
              delete connections[p];
              if (Object.keys(connections).length < self.max_connections) {
                self.file.resume();
              }
            });
        })(chunk, part);

        part++;
        self.total_chunks++;

        chunk = extra;
      } else {
        chunk = Buffer.concat([chunk, datum]);
      }

      if (Object.keys(connections).length >= self.max_connections) {
        self.file.pause();
      }
    });

    self.file.on('end', function() {
      self.logger.log('File end reached.');
      self.logger.log('Chunk created:', chunk.length);
      self.logger.log('Queueing upload of part', part);
      self.logger.log();
      connections[part] = self.uploadChunk(chunk, part);

      self.logger.log('...uploads queued!');
      self.logger.log();
      var promises = Object.keys(connections).map(function(key) {
        return connections[key];
      });
      resolve(Promise.all(promises).then(function() {
        self.logger.log('...uploads complete!');
        self.logger.log();
      }));
    });
  });
};

MultipartUpload.prototype.uploadChunk = function(chunk, part, attempt) {
  var self = this;

  attempt = attempt || 0;
  if (attempt >= self.max_retries) {
    throw new Error('Could not connect to server.');
  }

  self.logger.log('Uploading chunk:', part);

  if (self.offset > part) {
    return new Promise(function(resolve) {
      self.logger.log('Chunk already uploaded, skipping...');
      self.logger.log();
      resolve();
    });
  }

  self.logger.log('Pinging: ' + 'https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart/' + self.session_id);
  self.logger.log('Chunk:', chunk);
  self.logger.log();

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
      if (status != 200) {
        throw body;
      }

      self.completed_chunks.push(part);
      for (var i = 1; i <= self.completed_chunks.length + 1; i++) {
        self.logger.log('Offset computation:', i, self.completed_chunks, self.completed_chunks.indexOf(i));
        if (self.completed_chunks.indexOf(i) == -1) {
          self.offset = i - 1;
          break;
        }
      }
      self.emit('progress', {
        completed: self.completed_chunks.length,
        account_id: self.account_id,
        session_id: self.session_id,
        offset: self.offset
      });

      self.logger.log('Received status', status, 'for chunk', part);
      self.logger.log();
    })
    .catch(function(err) {
      return err.name == 'OperationalError';
    }, function(err) {
      self.logger.error('Connection error:', err);
      self.logger.error('Retrying upload of chunk:', part);
      self.logger.error();
      return self.uploadChunk(chunk, part, attempt + 1);
    })
    .catch(function(err) {
      self.logger.error('Fatal error encountered:', err);
      self.emit('error', err, {
        completed: self.completed_chunks.length,
        offset: self.offset
      });
    });
};

MultipartUpload.prototype.finalise = function() {
  this.logger.log('Finalising upload...');
  var self = this;
  return request({
    url: 'https://api.kloudless.com/v0/accounts/' + self.account_id + '/multipart/' + self.session_id + '/complete',
    headers: {
      'Authorization': 'ApiKey ' + API_KEY,
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
    .then(function(res) {
      var http_response = res[0]
        , body = res[1];
      response = JSON.parse(body);
      if(response.error_code) {
        self.logger.error('Could not finalise session:', response);
        throw new Error('Could not finalise session: ' + JSON.stringify(response));
      }
      self.logger.log('Uploaded file:', JSON.stringify(response));
      self.emit('success', response);

      self.logger.log('...upload finalised!');
      self.logger.log();
    });
};

MultipartUpload.prototype.abort = function() {
  var self = this;
  self.chain.cancel();
  return MultipartUpload.stopSession(self.account_id, self.session_id)
    .then(function(res) {
      self.logger.log('Aborting...');
      self.emit('abort');
    });
};

MultipartUpload.prototype.complete = function() {
  this.emit('complete');
};

MultipartUpload.resumeSession = function(options) {
  options.resuming = true;
  return new MultipartUpload(options);
};

MultipartUpload.stopSession = function(options) {
  var account_id = options.account_id
    , session_id = options.session_id;

  var self = this;
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
      self.logger.log(body);
    });
};

module.exports = MultipartUploadFactory;
