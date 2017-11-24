var hasOwn = {}.hasOwnProperty;
var toString = {}.toString;

var utils = module.exports = {
    isObject: function(o) {
        return toString.call(o) === '[object Object]';
    },
    protoExtend: function(sub) {
        var Super = this;
        var Constructor = hasOwn.call(sub, 'constructor') ? sub.constructor : function() {
            Super.apply(this, arguments);
        };
        Constructor.prototype = Object.create(Super.prototype);
        for (var i in sub) {
            if (hasOwn.call(sub, i)) {
                Constructor.prototype[i] = sub[i];
            }
        }
        for (i in Super) {
            if (hasOwn.call(Super, i)) {
                Constructor[i] = Super[i];
            }
        }
        return Constructor;
    },
    /**
     * convert fs.ReadStream to Buffer
     *
     * @param {fs.ReadStream} stream
     * @returns {Promise}
     */
    streamToBuffer: function (stream) {
        return new Promise(function (resolve, reject) {
            var buffers = [];
            stream.on('error', reject);
            stream.on('data', function (data) {
                return buffers.push(data);
            });
            stream.on('end', function () {
                return resolve(Buffer.concat(buffers));
            });
        })
    }
};
