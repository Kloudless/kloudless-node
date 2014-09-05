var BaseMethod = require('./basemethod');
var Error = require('../error');

var AccountsMethods = {
    base: BaseMethod.extend({
        dataFunction: function(data, cb){
            if (typeof(data['account_id']) != 'undefined') delete data['account_id'];
            cb(null, data);
        }
    }),
    get: BaseMethod.extend({
        requiredParams: [
            'account_id'
        ]
    }),
    delete: BaseMethod.extend({
        requiredParams: [
            'account_id'
        ],
        method: "DELETE"
    }),
    search: BaseMethod.extend({
        requiredParams: [
            'q'
        ],
        method: "GET",
        dataFunction: function(data, cb) {
            this.path = "search/?q=" + data['q'];
            cb(null, data);
        }
    })
}

module.exports = AccountsMethods;
