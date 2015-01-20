"use strict";

var m = require('module'),
    originalLoader = null,
    options = {},
    enabled = false,
    mockedObjects = [],
    objectIdMap = {};

var fs = require("fs"),
    path = require("path");

var cwd = process.cwd() + "/node_modules";
var path = require("path");

function checkMocked(request,absPath) {
    if (mockedObjects.length > 0 && mockedObjects.indexOf(request) == -1 && mockedObjects.map(function(path){ return process.cwd() + "/"+path }).indexOf(absPath) == -1) return false;
    return true;
}

function hookedLoader(request, parent, isMain) {
    if (!originalLoader) {
        throw new Error("Loader has not been hooked");
    }


    function original(){
        return originalLoader(request, parent, isMain);
    }

    function mocked(){
        if (fs.existsSync(process.cwd()+"/mock_modules/"+request+".js") ||
            fs.existsSync(process.cwd()+"/mock_modules/"+request+".coffee")){
            objectIdMap[request] = process.cwd()+"/mock_modules/"+request;
            return originalLoader(process.cwd()+"/mock_modules/"+request, parent, isMain)
        }
        else{
            return original();
        }
    }

    if (!enabled || /\:original$/.test(request)) {
        request = request.replace(/\:original$/,"");
        return original();
    }
    function getAbsolute(){
        var ret = path.resolve(path.dirname(parent.id),request);
        if (fs.existsSync(ret+".js")) return ret+".js";
        else if (fs.existsSync(ret+".coffee")) return ret+".coffee";
        else {
            if (fs.existsSync(ret+"/index.js")) return ret+"/index.js";
            if (fs.existsSync(ret+"/index.coffee")) return ret+"/index.coffee";
            else return "";
        }
    }

    if (parent.id.match(process.cwd()+"/node_modules")) return original();
    var absPath = getAbsolute();
    if (absPath.match(process.cwd()+"/test")) return original();

    if (!checkMocked(request,absPath))  return originalLoader(request, parent, isMain);

    if (!fs.existsSync(absPath)) return mocked();
    else {
        if (absPath.match(process.cwd()+"/node_modules")) return original();
        else return mocked()
    }
}

function enable() {
    if (originalLoader) {
        return;
    }

    enabled = true;
    originalLoader = m._load;
    m._load = hookedLoader;
}

function cleanCache(){
    _.keys(objectIdMap).forEach(function(key){
        delete m._cache[objectIdMap[key]];
    });
}

enable();

exports.enable = function(list) {
    cleanCache();
    mockedObjects = _.flatten(_.compact([list]));
    enabled = true;
}

exports.disable = function() {
    cleanCache();
    mockedObjects = [];
    enabled = false;
}

exports.original = function(module){
    return require(module+":original");
};