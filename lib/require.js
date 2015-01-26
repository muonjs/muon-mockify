"use strict";

var mockifyDirs = require("./dirs"),
    mockifySearch = require("./search"),
    mockifyUtils = require("./utils");

var m = require('module'),
    originalLoader = null,
    options = {},
    mockedObjects = [],
    objectIdMap = {};

var fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    stacktrace = require("stacktrace-js");

var cwd = process.cwd() + "/node_modules";
var path = require("path");

function hookedLoader(request, parent, isMain) {
    if (!originalLoader) {
        throw new Error("Loader has not been hooked");
    }

    if (/\:original$/.test(request)) {
        request = request.replace(/\:original$/,"");
        return originalLoader(request,parent,isMain);
    }

    var search = mockifySearch.search(request,parent.id);

    if (search === null) {
        return originalLoader(request,parent,isMain)
    }
    else {
        return originalLoader(search,parent,isMain)
    }
}

function cleanCache(){
    _.keys(objectIdMap).forEach(function(key){
        delete m._cache[objectIdMap[key]];
    });
}

exports.enable = function(list) {
    if (originalLoader) {
        return;
    }

    cleanCache();
    mockedObjects = _.flatten(_.compact([list]));

    originalLoader = m._load;
    m._load = hookedLoader;
}

exports.disable = function() {
    if (originalLoader === null){
        return;
    }

    cleanCache();
    mockedObjects = [];

    m._load = originalLoader;
    originalLoader = null;
}

exports.enableMock = function(id,obj) {}
exports.removeMock = function(list) {}

exports.original = function(modulePath){
    if (!mockifyUtils.isAbsolute(modulePath)){
        var trace = stacktrace();
        while(!trace.shift().match(module.filename) && trace.length > 0);
        var relativeModule = trace.shift().split("@")[1].split(":")[0];
        modulePath = path.resolve(path.dirname(relativeModule),modulePath);
    }
    return require(modulePath+":original");
}

exports.getMockifyDirs = mockifyDirs.get;
exports.setMockifyDir = mockifyDirs.set
exports.addMockifyDir = mockifyDirs.add;
exports.resetMockifyDir = mockifyDirs.reset;