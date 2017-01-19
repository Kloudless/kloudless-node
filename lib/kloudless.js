'use strict';

Kloudless.defaultConfig = {
    protocol: 'https',
    host: 'api.kloudless.com',
    port: 443,
    basePath: '/v1/'
}

var fs = require('fs'),
    path = require('path');

var resources = require('./resources');

function Kloudless(key) {
    if (!(this instanceof Kloudless)) {
        return new Kloudless(key);
    }

    this._api = {
        auth: null,
        protocol: Kloudless.defaultConfig.protocol,
        host: Kloudless.defaultConfig.host,
        port: Kloudless.defaultConfig.port,
        ca: null,
        basePath: Kloudless.defaultConfig.basePath,
        timeout: 120000,
    };

    this._createResources();
    this.setApiKey(key);

    var MultipartUpload = require('./methods/multipart')(key);
    this.files.uploadMultipart = function(options) {
      return new MultipartUpload(options, this);
    }.bind(this);
    this.files.stopMultipart = MultipartUpload.stopSession;
    this.files.resumeMultipart = MultipartUpload.resumeSession;
}

Kloudless.prototype = {
    setHost: function(host, port, protocol) {
        this._setApiField('host', host);
        if (port) this.setPort(port);
        if (protocol) this.setProtocol(protocol);
    },
    setProtocol: function(protocol) {
        this._setApiField('protocol', protocol.toLowerCase());
    },
    setPort: function(port) {
        this._setApiField('port', port);
    },
    setCA: function(ca_file) {
        if (!ca_file)
            ca_file = path.join(__dirname, "kloudless.ca.crt");
        if (!(ca_file instanceof Buffer))
            ca_file = fs.readFileSync(ca_file);
        this._setApiField('ca', ca_file);
    },
    setApiKey: function(key) {
        if (key) {
            this._setApiField(
                'auth',
                'ApiKey '+key
            );
        }
    },
    _setApiField: function(key, value) {
        this._api[key] = value;
    },
    getApiField: function(key) {
        return this._api[key];
    },
    getApiEndpoint: function() {
      return this.getApiField('protocol') + '://' + this.getApiField('host') +':' + this.getApiField('port') +
        this.getApiField('basePath').replace(/\/+$/, '');
    },
    _createResources: function() {
        var path = require('path');
        for (var resourceName in resources) {
            var lcResourceName = resourceName[0].toLowerCase() + resourceName.substring(1);
            var createdResource = new resources[resourceName](this);
            var methods = require('./methods/' + lcResourceName);
            createdResource.setMethods(methods);
            this[lcResourceName] = createdResource;
        }
    }
}

module.exports = Kloudless;
