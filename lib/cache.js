var _cache = {},
    mockfiyUtils = require("./utils"),
    path = require("path"),
    _ = require("underscore");

exports.add = function(mocked,requested,parent){
    if (mockfiyUtils.isPackage(requested)){
        return;
    }

    requested = mockfiyUtils.resolveFromParent(requested,parent);

    if (mockfiyUtils.isLocal(requested) && !(requested in _cache)){
        _cache[requested] = mocked;
    }
};

exports.clean = function(cacheObj) {
    cacheObj = cacheObj || require.cache;

    var cachedIdList = _.keys(cacheObj);

    _.values(_cache).forEach(function(id){
        var idList = cachedIdList.filter(function(cachedId){
            return (cachedId === id) || (cachedId.indexOf(id+".") === 0);
        });

        idList.forEach(function(id){
            delete cacheObj[id];
        });

        delete _cache[id];
    });

    return cacheObj;
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
        delete require.cache[i];
    }
};