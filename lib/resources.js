var https = require('https');
var http = require('http'); // TODO: replace http(s) with request.
var utils = require('./utils');
var Error = require('./error');
var FormData = require('form-data');
var fs = require('fs');

function BaseResource(kloudless) {
    this._kloudless = kloudless;
}

BaseResource.prototype = {
    path: '',
    setMethods: function(methods) {
        for (var methodName in methods) {
            if (!this['_methods']) this['_methods'] = {};
            this['_methods'][methodName] = new methods[methodName](this);
            this[methodName] = (function(name, createdResource) {
                return function() {
                    var args = [];
                    for (var i in arguments) {
                        args.push(arguments[i]);
                    }
                    args.push(name);
                    createdResource['_methods'][name].call.apply(
                        createdResource['_methods'][name], args);
                };
            })(methodName, this);
        }
    },
    _responseHandler: function(req, parse, callback) {
        return function(res) {
            var statusCodeType = res.statusCode.toString()[0];

            if (!res['headers']['content-type']) res['headers']['content-type'] = '';
            var contentTypeParams = res['headers']['content-type'].split(';');
            var contentType = contentTypeParams[0];
            var charEncoding;
            if (contentTypeParams[1])
                charEncoding = contentTypeParams[1].split('=')[1];
            charEncoding = charEncoding || 'utf-8';

            if (!parse && statusCodeType == '2') {
                res.setEncoding('binary');
                return callback(null, res);
            } else {
                res.setEncoding(charEncoding);
                var response = '';
                var parsedResponse;
                res.on('data', function(chunk) {
                    response += chunk;
                });
                res.on('end', function() {
                    try {
                         parsedResponse = JSON.parse(response || '{}');
                    } catch (e) {
                        return callback(new Error.KloudlessError({
                            errorData: response,
                            status: res.statusCode,
                            message: 'The Kloudless API returned invalid JSON.',
                            response: res,
                            exception: e
                        }));
                    }

                    if (statusCodeType != '2') {
                        if (statusCodeType == '5') {
                            return callback(new Error.KloudlessServerError({
                                errorData: response,
                                response: res,
                                statusCode: res.statusCode
                            }));
                        } else {
                            return callback(new Error.KloudlessAPIError({
                                errorData: response,
                                response: res,
                                statusCode: res.statusCode,
                                message: (parsedResponse['message'] || ''),
                                code: (parsedResponse['error_code'] || ''),
                            }));
                        }

                    } else {
                        return callback(null, parsedResponse);
                    }
                });
            }
        };
    },
    _timeoutHandler: function(timeout, req, callback) {
        return function() {
            req._isAborted = true;
            req.abort();

            callback.call(
                new Error.KloudlessError({
                    message:'Timeout reached in request to Kloudless API, request aborted (' + timeout + 'ms)'
                })
            );
        };
    },
    _errorHandler: function(req, callback) {
        return function(error) {
            if (req._isAborted) return;
            callback(
                new Error.KloudlessError({
                    message:'There was an error during the call to the Kloudless API: \n' + error
                })
            );
        };
    },
    _request: function(method, path, data, user_headers, parseResponse, callback) {
        var self = this;
        user_headers = user_headers || {};
        var headers;
        var requestData = JSON.stringify(data || {});
        var requestForm = new FormData();
        var shouldPipeForm = false;

        if (data['file'] && (data['file'] instanceof Buffer)) {
            shouldPipeForm = true;
            for (var dataName in data) {
                var appendData = data[dataName];
                if(dataName != "queryParams") {
                    if(dataName == "file" && data['name']) requestForm.append(dataName, appendData, {filename: data['name']});
                    else requestForm.append(dataName, appendData);
                }
            }
            headers = requestForm.getHeaders();
            headers['Authorization'] = this._kloudless.getApiField('auth');
        } else {
            headers = {
                'Authorization': this._kloudless.getApiField('auth'),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': requestData.length
            };
        }

        for (var h in user_headers) {
            headers[h] = user_headers[h];
        }

        makeRequest();

        function makeRequest() {
            var timeout = self._kloudless.getApiField('timeout');

            var options = {
                host: self._kloudless.getApiField('host'),
                port: self._kloudless.getApiField('port'),
                path: self._kloudless.getApiField('basePath') + '/'+path,
                method: method,
                headers: headers
            };
            if (self._kloudless.getApiField('ca') != null)
                options['ca'] = self._kloudless.getApiField('ca');

            var mod = https;
            if (self._kloudless.getApiField('protocol') === 'http')
                mod = http;

            var req = mod.request(options);

            req.setTimeout(timeout, self._timeoutHandler(timeout, req, callback));
            req.on('response', self._responseHandler(req, parseResponse, callback));
            req.on('error', self._errorHandler(req, callback));

            if (shouldPipeForm) {
                requestForm.pipe(req);
            } else {
                req.write(requestData, 'utf8');
            }
        }
    }
};

BaseResource.extend = utils.protoExtend;

var Accounts = BaseResource.extend({
    path:'accounts'
});

var Files = BaseResource.extend({
    path:'accounts'
});

var Folders = BaseResource.extend({
    path:'accounts'
});

var Links = BaseResource.extend({
    path:'accounts'
});

var Events = BaseResource.extend({
  path:'accounts'
});


module.exports = {
    Accounts: Accounts,
    Files: Files,
    Folders: Folders,
    Links: Links,
    Events: Events
};
