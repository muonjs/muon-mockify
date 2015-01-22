var Readable = require("stream").Readable,
    _ = require("underscore"),
    util = require("util");

/// Реализация поведения IncommingMessage модуля 'http'
function IncomingMessageMock(status,data){
    Readable.apply(this,arguments);
    this.__offset = 0;
    this.status = status;
    this.headers = {};
    this.__data = data;
}
util.inherits(IncomingMessageMock,Readable);
_.extend(IncomingMessageMock.prototype,{
    _read: function(size){
        var ret = Buffer([].slice.apply(Buffer(this.__data),[this.__offset,this.__offset+size]));
        if (ret.length == 0) return this.push(null);
        this.__offset += size;
        this.push(ret);
    }
});

module.exports = function HttpMock(httpMockStatus,httpMockRet){
    _.extend(this,{
        get: function(url,callback){
            callback(new IncomingMessageMock(httpMockStatus,httpMockRet))
        }
    });
}