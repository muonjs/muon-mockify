var cache = [],
    mockfiyUtils = require("./utils"),
    path = require("path"),
    _ = require("underscore");

exports.add = function(request,parent){
    if (mockfiyUtils.isPackage(request)){
        return;
    }
    request = mockfiyUtils.resolveFromParent(request,parent);
    if (mockfiyUtils.isLocal(request) && cache.indexOf(request) == -1){
        cache.push(request);
    }
};

exports.clean = function(cacheObj) {
    cacheObj = cacheObj || require.cache;

    var cachedIdList = _.keys(cacheObj);

    cache.forEach(function(id){
        var idList = cachedIdList.filter(function(cachedId){
            return (cachedId === id) || (cachedId.indexOf(id+".") === 0);
        });
        idList.forEach(function(id){
            delete cacheObj[id];
        });
    });

    return cacheObj;
};

exports.get = function(){
    return cache.slice();
};

exports.flush = function(){
    cache = [];
};