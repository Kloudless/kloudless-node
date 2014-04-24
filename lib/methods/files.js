var BaseMethod = require('./basemethod');
var fs = require('fs');
var Error = require('../error');

var FilesMethods = {
    upload: BaseMethod.extend({
        path:'files',
        method: 'POST',
        requiredParams: [
            'name',
            'account_id',
            'parent_id',
            'file'
        ],
        dataFunction: function(data, cb) {
            if (data['file'] instanceof fs.ReadStream || data['file'] instanceof Buffer) {
                data['metadata'] = JSON.stringify({'parent_id': data['parent_id'], 'name': data['name']});
                cb(null, data);
            } else {
                cb(new Error.KloudlessError(
                    {message: "The 'file' parameter for files.upload()"+
                              " must be an instance of either Buffer or fs.ReadStream."}
                ));
            }
        }
    }),
    get: BaseMethod.extend({
        requiredParams: [
            'account_id',
            'file_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "files/" + data['file_id'];
            cb(null, data);
        }
    }),
    delete: BaseMethod.extend({
        method: 'DELETE',
        requiredParams: [
            'account_id',
            'file_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "files/" + data['file_id'];
            cb(null, data);
        }
    }),
    move: BaseMethod.extend({
        method: 'PATCH',
        requiredParams : [
            'parent_id',
            'account_id',
            'file_id'
        ],
        dataFunction: function(data, cb) {
            if (data['new_account_id']) data['account'] = data['new_account_id'];
            this.path = "files/" + data['file_id'];
            cb(null, data);
        }
    }),
    rename: BaseMethod.extend({
        method: 'PATCH',
        requiredParams: [
            'name',
            'account_id',
            'file_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "files/" + data['file_id'];
            cb(null, data);
        }
    }),
    contents: BaseMethod.extend({
        requiredParams: [
            'account_id',
            'file_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "files/" + data['file_id'] + "/contents";
            cb(null, data);
        }
    })
}

module.exports = FilesMethods;