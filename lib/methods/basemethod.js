var utils = require('../utils');
var async = require('async');

function BaseMethod(parent) {
    this.parent = parent;
}

BaseMethod.prototype = {
    parent: {},
    path: '',
    method: 'GET',
    requiredParams: [],
    fileUpload: false,
    makeMethodPath: function(account_id){
        var idPath = ""
        if(typeof(account_id) != 'undefined' && account_id != null) idPath = "/"+account_id;
        var methodPath = this.parent.path+idPath;
        if(this.path != "") methodPath += "/"+this.path;
        return methodPath;
    },
    verifyData:function(data,endCallback){
        // check for variables that need to exist for a method
        var self = this;
        async.each(self.requiredParams,function(reqParamName,cb){
            if(!data[reqParamName]) {
                var pD = JSON.stringify(data);
                cb("Missing required parameter '"+reqParamName+"' for Kloudless API call.\n" +
                   "Here's what you passed in:\n"+pD);
            } else {
                cb();
            }
        },function(err){
            if(err) endCallback(err);
            else endCallback(null,data);
        });
    },
    dataFunction: function(data,endCallback){
        // if data manipulation by us is necessary at all
        // just redefine this function in the method that extends BaseMethod
        // a good example probably is changing the 'path' by a param passed in through the args
        // ex. data = {"folder_id":10}; this.path = "folders/"+data.folder_id;
        // seems slightly hacky to me, but probably comes off pretty clean to the end-user (end-developer??)
        endCallback(null,data);
    },
    call: function(args,endCallback){
        var self = this;
        async.waterfall([
            function(cb){
                self.verifyData(args,cb)
            },
            function(data,cb){
                self.dataFunction(data,cb)
            },
            function(data,cb){
                self.parent._request(self.fileUpload,
                                     self.method,
                                     self.makeMethodPath(data['account_id']),
                                     data,
                                     cb);
            }
        ],function(err,res){
            if(err) {
                endCallback(err)
            } else {
                endCallback(null,res);
            }
        });
    }
}

BaseMethod.extend = utils.protoExtend;

module.exports = BaseMethod;