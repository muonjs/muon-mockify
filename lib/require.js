"use strict";

var mockifyDirs = require("./dirs");

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

function checkMocked(request,absPath) {
    if (mockedObjects.length > 0 && mockedObjects.indexOf(request) == -1 && mockedObjects.map(function(path){ return process.cwd() + "/"+path }).indexOf(absPath) == -1) return false;
    return true;
}

function resolve(resolvePath){
    return path.resolve(process.cwd(),resolvePath);
}

function original(request,parent,isMain){
    return originalLoader(request, parent, isMain);
}

function mocked(request,parent,isMain){
    try {
        var ret = originalLoader(process.cwd()+"/mock_modules/"+request, parent, isMain);
        objectIdMap[request] = process.cwd()+"/mock_modules/"+request;
        return ret;
    }
    catch(e){
        return original.apply(null,arguments);
    }
}

function getAbsolute(request){
    var ret = path.resolve(path.dirname(parent.id),request);
    if (fs.existsSync(ret+".js")) return ret+".js";
    else if (fs.existsSync(ret+".coffee")) return ret+".coffee";
    else {
        if (fs.existsSync(ret+"/index.js")) return ret+"/index.js";
        if (fs.existsSync(ret+"/index.coffee")) return ret+"/index.coffee";
        else return "";
    }
}

function hookedLoader(request, parent, isMain) {
    if (!originalLoader) {
        throw new Error("Loader has not been hooked");
    }

    if (/\:original$/.test(request)) {
        request = request.replace(/\:original$/,"");
        return original.apply(null,[request,parent,isMain]);
    }

    if (parent.id.match(process.cwd()+"/node_modules") || !parent.id.match(process.cwd())) return original.apply(null,arguments);

    var absPath = getAbsolute(request);

    if (absPath.match(process.cwd()+"/test")) return original.apply(null,arguments);

    if (!checkMocked(request,absPath))  return originalLoader(request, parent, isMain);

    if (!fs.existsSync(absPath)) return mocked.apply(null,arguments);
    else {
        if (absPath.match(process.cwd()+"/node_modules")) return original.apply(null,arguments);
        else return mocked.apply(null,arguments);
    }
}

function cleanCache(){
    _.keys(objectIdMap).forEach(function(key){
        delete m._cache[objectIdMap[key]];
    });
}

exports.enable = function(list) {
    cleanCache();
    mockedObjects = _.flatten(_.compact([list]));

    if (originalLoader) {
        return;
    }

    originalLoader = m._load;
    m._load = hookedLoader;
}

exports.enableMock = function(id,obj) {}
exports.removeMock = function(list) {}

exports.disable = function() {
    cleanCache();
    mockedObjects = [];

    m._load = originalLoader;
    originalLoader = null;
}

exports.original = function(modulePath){
    if (!mockifyDirs.isAbsolute(modulePath)){
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