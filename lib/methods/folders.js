var BaseMethod = require('./basemethod');

var FoldersMethods = {
    create: BaseMethod.extend({
        path:'folders',
        method: 'POST',
        requiredParams: [
            'account_id',
            'name'
        ],
        dataFunction: function(data, cb){
            if(!data['parent_id']) data['parent_id'] = "root";
            cb(null,data);
        }
    }),
    get: BaseMethod.extend({
        requiredParams: [
            'account_id',
            'folder_id'
        ],
        dataFunction: function(data, cb){
            this.path = "folders/"+data['folder_id'];
            cb(null, data);
        }
    }),
    move: BaseMethod.extend({
        method: 'PATCH',
        requiredParams: [
            'account_id',
            'folder_id',
            'parent_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "folders/"+data['folder_id'];
            cb(null, data);
        }
    }),
    rename: BaseMethod.extend({
        method: 'PATCH',
        requiredParams: [
            'account_id',
            'folder_id',
            'name'
        ],
        dataFunction: function(data, cb) {
            this.path = "folders/"+data['folder_id'];
            cb(null, data);
        }
    }),
    delete: BaseMethod.extend({
        method:'DELETE',
        requiredParams: [
            'account_id',
            'folder_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "folders/"+data['folder_id'];
            cb(null, data);
        }
    }),
    contents: BaseMethod.extend({
        requiredParams: [
            'account_id',
            'folder_id'
        ],
        dataFunction: function(data, cb){
            this.path = "folders/"+data['folder_id']+"/contents";
            cb(null, data);
        }
    })
}

module.exports = FoldersMethods;