var BaseMethod = require('./basemethod');
var Error = require('../error');

var DevelopersMethods = {
    list: BaseMethod.extend({}),
    get: BaseMethod.extend({
        requiredParams: [
            'developer_id'
        ],
        dataFunction: function (data, cb) {
            this.path = data['developer_id'];
            cb(null, data);
        }
    }),
    update: BaseMethod.extend({
        requiredParams: [
            'developer_id'
        ],
        method: "PATCH",
        dataFunction: function (data, cb) {
            this.path = data['developer_id'];
            cb(null, data);
        }
    })
}

module.exports = DevelopersMethods;