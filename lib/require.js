var mockifyDirs = require("./dirs"),
    mockifySearch = require("./search"),
    mockifyUtils = require("./utils"),
    mockifyCache = require("./cache");

var m = require('module'),
    originalLoader = null,
    onlyMockedObjectsList = false,
    directMocks = {},
    excludes = [];

var path = require("path"),
    _ = require("underscore"),
    stacktrace = require("stacktrace-js");

function checkOriginal(request){
    return /\:original$/.test(request)
}

function isExcluded(id){
    return (excludes.indexOf(id) != -1);
}

function hookedLoader(request, parent, isMain) {
    if (!originalLoader) {
        throw new Error("Loader has not been hooked");
    }

    if (checkOriginal(request)) {
        request = request.replace(/\:original$/,"");
        return originalLoader(request,parent,isMain);
    }

    var requestedPath = mockifyUtils.resolve(request,parent.id);

    if (onlyMockedObjectsList !== false && onlyMockedObjectsList.indexOf(requestedPath) == -1){
        return originalLoader(request,parent,isMain);
    }

    if (isExcluded(requestedPath)){
        return originalLoader(request,parent,isMain);
    }

    if (requestedPath in directMocks){
        return directMocks[requestedPath];
    }

    var resolvedPath;
    resolvedPath = mockifyCache.getMock(request,parent);

    if (resolvedPath === null) {
        resolvedPath = mockifySearch.search(request,parent.id);

        if (resolvedPath !== null) {
            mockifyCache.add(resolvedPath,request,parent.id);
        }
    }

    if (resolvedPath !== null) {
        request = resolvedPath;
    }

    var ret = originalLoader(request,parent,isMain);

    return ret;
}

function enable(list) {
    if (!originalLoader && list !== undefined) {
        onlyMockedObjectsList = [];
    }

    if (list === undefined) {
        onlyMockedObjectsList = false;
    }

    if (onlyMockedObjectsList !== false) {
        var newList = _.flatten(_.compact([list])).map(function(id){
            return mockifyUtils.resolve(id);
        });

        onlyMockedObjectsList = _.uniq(onlyMockedObjectsList.concat(newList));
    }

    if (!originalLoader) {
        mockifyCache.flush();
        originalLoader = m._load;
        m._load = hookedLoader;
    }
}

function disable() {
    if (originalLoader === null){
        return;
    }

    mockifyCache.clean();
    onlyMockedObjectsList = false;
    m._load = originalLoader;
    originalLoader = null;

    for(var i in directMocks){
        delete directMocks[i];
    }

    directMocks = {};
    excludes = [];
};

function isEnabled(){
    return (originalLoader !== null);
}

function enableMock(id,obj) {
    if (originalLoader === null){
        enable();
    }
    id = mockifyUtils.resolve(id);

    directMocks[id] = obj;

    if (isExcluded(id)){
        excludes.splice(excludes.indexOf(id),1);
    }
};

function removeMock(list) {
    list = _.flatten([list]);

    list.forEach(function(id){
        id = mockifyUtils.resolve(id);
        if (excludes.indexOf(id) == -1){
            excludes.push(id);
        }
    })
};

function original(modulePath){
    if (!mockifyUtils.isAbsolute(modulePath)){
        var trace = stacktrace();
        while(!trace.shift().match(module.filename) && trace.length > 0);
        var relativeModule = trace.shift().split("@")[1].split(":")[0];
        modulePath = path.resolve(path.dirname(relativeModule),modulePath);
    }
    return require(modulePath+":original");
};

exports.enable = enable;
exports.isEnabled = isEnabled;
exports.disable = disable;
exports.original = original;
exports.enableMock = enableMock;
exports.removeMock = removeMock;
exports.excludeMock = removeMock;
exports.getMockifyDirs = mockifyDirs.get;
exports.setMockifyDir = mockifyDirs.set
exports.addMockifyDir = mockifyDirs.add;
exports.resetMockifyDir = mockifyDirs.reset;