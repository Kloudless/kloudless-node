var BaseMethod = require('./basemethod');

var AccountsMethods = {
    base: BaseMethod.extend({
        dataFunction: function(data, cb){
            if(typeof(data['account_id']) != 'undefined') delete data['account_id'];
            cb(null,data);
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
    })
}

module.exports = AccountsMethods;