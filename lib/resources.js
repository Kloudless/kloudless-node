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
            if(res.statusCode == 204) {
                res.on('data',function(c){});
                res.on('end',function(){
                    return callback(null, {});
                })
            } else {
                console.log(res['headers']);
                var contentTypeParams = res['headers']['content-type'].split(';');
                var contentType = contentTypeParams[0];
                var charEncoding;
                if(contentTypeParams[1]) charEncoding = contentTypeParams[1].split("=")[1];
                res.setEncoding(charEncoding || 'utf8');

                if(contentType == "application/octet-stream") {
                    return callback(null, res);
                } else {
                    var response = '';
                    var parsedResponse;
                    res.on('data', function(chunk){
                        response += chunk;
                    });
                    res.on('end', function() {
                        try {
                             parsedResponse = JSON.parse(response || '{}');
                        } catch(e) {
                            return callback(new Error("The Kloudless API returned invalid JSON."));
                        }
                        return callback(null, parsedResponse);
                    });
                }
            }
        };
    },
    _timeoutHandler: function(timeout, req, callback) {
        var self = this;
        return function() {
            req._isAborted = true;
            req.abort();

            callback.call(new Error('Timeout reached in request to Kloudless API, request aborted (' + timeout + 'ms)'));
        }
    },
    _errorHandler: function(req, callback) {
        return function(error) {
            if (req._isAborted) return;
            callback(new Error('There was an error during the call to the Kloudless API: \n'+error));
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