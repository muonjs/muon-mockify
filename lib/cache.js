var _cache = {},
    mockfiyUtils = require("./utils"),
    path = require("path"),
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

exports.clean = function(cacheObj) {
    cacheObj = cacheObj || require.cache;

    var cachedIdList = _.keys(cacheObj);

    _.values(_cache).forEach(function(id){

        cachedIdList.filter(function(cachedId){
            return (cachedId === id) || (cachedId.indexOf(id+".") === 0);
        }).filter(function(cachedId) {
            /** this is for newest node.js version where repeated require of built modules cause an exception */
            return !cachedId.match(/\.node$/);
        }).forEach(function(cachedId){
            delete cacheObj[cachedId];
        });

        delete _cache[id];
    });

    return cacheObj;
};

exports.get = function(){
    return _.clone(_cache);
};

exports.getMock = function(requested,parent){
    requested = mockfiyUtils.resolve(requested,parent);
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
        /** this is for newest node.js version where repeated require of built modules cause an exception */
        if (!i.match(/\.node$/)) {
            delete require.cache[i];
        }
    }
};