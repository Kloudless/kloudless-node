var BaseMethod = require('./basemethod');
var Error = require('../error');

var ApplicationsMethods = {
    list: BaseMethod.extend({}),
    get: BaseMethod.extend({
        requiredParams: [
            'application_id'
        ],
        dataFunction: function (data, cb) {
            this.path = data['application_id'];
            cb(null, data);
        }
    }),
    create: BaseMethod.extend({
        requiredParams: [
            'name'
        ],
        method: "POST"
    }),
    update: BaseMethod.extend({
        requiredParams: [
            'application_id'
        ],
        method: "PATCH",
        dataFunction: function (data, cb) {
            this.path = data['application_id'];
            cb(null, data);
        }
    }),
    delete: BaseMethod.extend({
        requiredParams: [
            'application_id'
        ],
        method: "",
        dataFunction: function (data, cb) {
            this.path = data['application_id'];
            cb(null, data);
        }
    }),
}

module.exports = ApplicationsMethods;