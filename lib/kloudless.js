// kloudless node sdk v0.1
'use strict';

Kloudless.defaultConfig = {
    host: "api.kloudless.com",
    port: 443,
    basePath: "/v0/"
}

var resources = require('./resources');

function Kloudless(key) {
    if(!(this instanceof Kloudless)) {
        return new Kloudless(key);
    }

    this._api = {
        auth: null,
        host: Kloudless.defaultConfig.host,
        port: Kloudless.defaultConfig.port,
        basePath: Kloudless.defaultConfig.basePath
    };

    this._createResources();
    this.setApiKey(key);
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
    setApiKey: function(key) {
        if(key) {
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
    // TODO: make this less messy
    _createResources: function() {
        var path = require('path');
        for(var resourceName in resources) {
            var lcResourceName = resourceName[0].toLowerCase() + resourceName.substring(1);
            var createdResource = new resources[resourceName](this);
            var methods = require("./methods/"+lcResourceName);
            createdResource.setMethods(methods);
            this[lcResourceName] = createdResource;
        }
    }
}

module.exports = Kloudless;