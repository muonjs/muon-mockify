var _cache = {},
    mockfiyUtils = require("./utils"),
    path = require("path"),
    dirs = require("./dirs");
    _ = require("underscore");

exports.add = function(mocked,requested,parent){
    if (mockfiyUtils.isPackage(requested)){
        return;
    }

    requested = mockfiyUtils.resolve(requested,parent);

    if (mockfiyUtils.isLocal(requested) && !(requested in _cache)){
        _cache[requested] = mocked;
    }
};

exports.get = function(){
    return _.clone(_cache);
};

exports.getMock = function(requested,parent){
    requested = mockfiyUtils.resolveFromParent(requested,parent);
    if (requested in _cache) {
        return _cache[requested];
    }
    else {
        return null;
    }
}

exports.flush = function(){
    _cache = {};
    for(var i in require.cache){
        var isMock = dirs.get().some(function(dir) {
            return (i.indexOf(dir) == 0)
        });
        if (isMock) {
            delete require.cache[i];
        }
    }
};