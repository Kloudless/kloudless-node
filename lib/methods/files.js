var BaseMethod = require('./basemethod');
var fs = require('fs');

var FilesMethods = {
    upload: BaseMethod.extend({
        path:'files',
        method: 'POST',
        requiredParams: [
            'name',
            'account_id',
            'parent_id',
            'file_path',
            'name'
        ],
        fileUpload:true,
        dataFunction: function(data, cb) {
            data['metadata'] = JSON.stringify({parent_id: data['parent_id'], name:data['name']});
            var filePath = require('path').resolve(data['file_path'])
            fs.exists(filePath,function(exists){
                if(exists) {
                    data['file'] = fs.createReadStream(filePath);
                    cb(null,data);
                } else {
                    cb("File "+filePath+" does not exist!");
                }
            });
        }
    }),
    get: BaseMethod.extend({
        requiredParams: [
            'account_id',
            'file_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "files/"+data['file_id'];
            cb(null,data);
        }
    }),
    delete: BaseMethod.extend({
        method: 'DELETE',
        requiredParams: [
            'account_id',
            'file_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "files/"+data['file_id'];
            cb(null,data);
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
            if(data['new_account_id']) data['account'] = data['new_account_id'];
            this.path = "files/"+data['file_id'];
            cb(null,data);
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
            this.path = "files/"+data['file_id'];
            cb(null,data);
        }
    }),
    contents: BaseMethod.extend({
        requiredParams: [
            'account_id',
            'file_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "files/"+data['file_id']+"/contents";
            cb(null,data);
        }
    })
}

module.exports = FilesMethods;