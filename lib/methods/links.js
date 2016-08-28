var BaseMethod = require('./basemethod');
var Error = require('../error');

var LinksMethods = {
    base: BaseMethod.extend({
        path:'storage/links',
        requiredParams: [
            'account_id'
        ],
    }),
    create: BaseMethod.extend({
        path:'storage/links',
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
            this.path = "storage/links/" + data['link_id'];
            cb(null, data);
        }
    }),
    update: BaseMethod.extend({
        method: 'PATCH',
        requiredParams: [
            'account_id',
            'link_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "storage/links/" + data['link_id'];
            if(data['expiration'] != undefined) {
                if(data['expiration'] instanceof Date) {
                    data['expiration'] = data['expiration'].toISOString();
                } else if(!isNaN(data['expiration'])) {
                    data['expiration'] = new Date(data['expiration']).toISOString();
                }
            }
            cb(null, data);
        }
    }),
    delete: BaseMethod.extend({
        method:'DELETE',
        requiredParams: [
            'account_id',
            'link_id'
        ],
        dataFunction: function(data, cb) {
            this.path = "storage/links/" + data['link_id'];
            cb(null, data);
        }
    })
}

module.exports = LinksMethods;
