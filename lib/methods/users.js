var BaseMethod = require('./basemethod');

var UsersMethods = {
    get: BaseMethod.extend({
        requiredParams: [
            'account_id'
        ],
        dataFunction: function(data, cb) {
            this.path = 'team/users/';
            if (data['user_id'] !== undefined) {
                this.path += data['user_id'];
            }
            cb(null, data);
        }
    }),
    groups: BaseMethod.extend({
        requiredParams: [
            'account_id',
            'user_id'
        ],
        dataFunction: function(data, cb) {
            this.path = 'team/users/' + data['user_id'] + '/memberships/';
            cb(null, data);
        }
    }),
};

module.exports = UsersMethods;
