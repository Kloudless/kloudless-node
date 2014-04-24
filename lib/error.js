'use strict';

var utils = require('./utils');

module.exports = _Error;

function _Error(raw) {
    this.init.apply(this, arguments);
}

_Error.prototype = Object.create(Error.prototype);

_Error.prototype.type = 'GenericError';
_Error.prototype.init = function(type, message) {
    this.type = type;
    this.message = message;
};

_Error.extend = utils.protoExtend;

var KloudlessError = _Error.KloudlessError = _Error.extend({
    type: 'KloudlessError',
    init: function(raw) {
        this.type = this.type;

        if (raw.message) {
            if (this.defaultMessage) this.message = this.defaultMessage + "\n" + raw.message;
            else this.message = raw.message;
        } else {
            this.message = (this.defaultMessage || "");
        }

        if (raw.exception) this.exception = raw.exception;

        if (raw.errorData) this.errorData = raw.errorData;

        if (raw.statusCode) this.status = raw.statusCode;

        this.populate(raw);
    },
    populate: function(raw) {
        this.raw = raw;
    }
});

_Error.KloudlessAPIError = KloudlessError.extend({
    type: 'KloudlessAPIError',
    defaultMessage: 'Request failed.',
    populate: function(raw) {
        if (raw.code) this.code = raw.code;
        this.raw = raw;
    }
});
_Error.KloudlessAuthError = KloudlessError.extend({
    type: 'KloudlessAuthError',
    defaultMessage:
        "Authentication failed. Verify the API Key you are using is "+
        "correct.",
});
_Error.KloudlessServerError = KloudlessError.extend({
    type: 'KloudlessServerError',
    defaultMessage:
        "An unknown error occurred! Please contact support@kloudless.com "+
        "with the Request ID for more details.",
});