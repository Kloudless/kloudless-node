var BaseMethod = require('./basemethod');

var LinksMethods = {
    base: BaseMethod.extend({
        path:'links',
        requiredParams: [
            'account_id'
        ],
    }),
    create: BaseMethod.extend({
        path:'links',
        method: 'POST',
        requiredParams: [
            'account_id',
            'file_id'
        ]
    }),
    get: BaseMethod.extend({
        requiredParams: [
            'account_id',
            'link_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "links/"+data['link_id'];
            cb(null,data);
        }
    }),
    update: BaseMethod.extend({
        method: 'PATCH',
        requiredParams: [
            'account_id',
            'link_id',
            'active'
        ],
        dataFunction: function(data, cb) {
            this.path = "links/"+data['link_id'];
            cb(null,data);
        }
    }),
    delete: BaseMethod.extend({
        method:'DELETE',
        requiredParams: [
            'account_id',
            'link_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "links/"+data['link_id'];
            cb(null,data);
        }
    })
}

module.exports = LinksMethods;