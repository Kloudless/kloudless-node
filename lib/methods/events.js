var BaseMethod = require('./basemethod');
var Error = require('../error');

var EventsMethods = {
  getLastCursor : BaseMethod.extend({
    requiredParams: [
      'account_id'
    ],
    dataFunction: function(data, cb) {
      this.path = "events/latest";
      cb(null, data);
    }
  }),
  get: BaseMethod.extend({
    requiredParams: [
      'account_id'
    ],
    dataFunction: function(data, cb) {
      this.path = "events";
      cb(null, data);
    }
  })
}

module.exports = EventsMethods;
