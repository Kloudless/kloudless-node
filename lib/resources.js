var https = require("https");
var utils = require("./utils");
var fs = require("fs");
var FormData = require("form-data");

function BaseResource(kloudless, urlData) {
    this._kloudless = kloudless;
}

BaseResource.prototype = {
    path: '',
    setMethods: function(methods) {
        for(var methodName in methods) {
            if(!this['_methods']) this['_methods'] = {};
            this['_methods'][methodName] = new methods[methodName](this);
            this[methodName] = (function(mN, cR){
                return function(args,callback) {
                    cR['_methods'][mN].call(args,callback,mN);
                } 
            })(methodName, this);
        }
    },
    _responseHandler: function(req, callback) {
        var self = this;
        return function(res) {
            var response = '';

            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                response += chunk;
            });
            res.on('end', function() {
                if(res.statusCode == 204) {
                    callback(null,{'content':'204, no content'});
                } else {
                    var parsedResponse;
                    var endResponse;
                    try {
                        parsedResponse = JSON.parse(response);
                    } catch(e) {
                        endResponse = {'content':response};
                    }
                    if(parsedResponse) endResponse = parsedResponse;
                    if (endResponse.error) {
                        return callback(endResponse.error);
                    }
                    callback(null, endResponse);
                }
            });
        };
    },
    _timeoutHandler: function(timeout, req, callback) {
        var self = this;
        return function() {
            req._isAborted = true;
            req.abort();

            callback.call('Timeout reached in request to Kloudless API, request aborted (' + timeout + 'ms)');
        }
    },
    _errorHandler: function(req, callback) {
        return function(error) {
            if (req._isAborted) return;
            callback('There was an error during the call to the Kloudless API: '+error);
        }
    },
    _request: function(fileUpload, method, path, data, callback) {
        var self = this;
        var headers = {}
        var requestData = JSON.stringify(data || {});
        var requestForm = new FormData();
        if(fileUpload) {
            for (var thing in data) {
                var appendData = data[thing];
                requestForm.append(thing,appendData);
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

        makeRequest();

        function makeRequest() {
            var timeout = self._kloudless.getApiField('timeout');

            var req = https.request({
                host: self._kloudless.getApiField('host'),
                port: self._kloudless.getApiField('port'),
                path: self._kloudless.getApiField('basePath')+"/"+path,
                method: method,
                headers: headers
            });

            req.setTimeout(timeout, self._timeoutHandler(timeout, req, callback));
            req.on('response', self._responseHandler(req, callback));
            req.on('error', self._errorHandler(req, callback));

            if (fileUpload) requestForm.pipe(req);
            else req.write(requestData, "utf8");
        }
    }
}

BaseResource.extend = utils.protoExtend;

Accounts = BaseResource.extend({
    path:'accounts'
});

Files = BaseResource.extend({
    path:'accounts'
});

Folders = BaseResource.extend({
    path:'accounts'
});

Links = BaseResource.extend({
    path:'accounts'
});

module.exports = {
    Accounts: Accounts,
    Files: Files,
    Folders: Folders,
    Links: Links,
}