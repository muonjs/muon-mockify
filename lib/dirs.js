var path = require("path"),
    _ = require("underscore"),
    fs = require("fs");

var mockifyDirs = [];

function isAbsolute(dir){
    if (typeof dir != "string") throw new Error("argument should be a string");
    return !/^\./.test(dir);
}

exports.get = function() {
    return mockifyDirs.slice();
}

exports.set = function(dirs){
    mockifyDirs = [];
    add(dirs);
}

function add(dirs){
    dirs = _.flatten([dirs]);
    dirs.forEach(function(dir){
        var original_dir = dir;
        if (!isAbsolute(dir)) dir = path.resolve(process.cwd(),dir);
        if (!fs.existsSync(dir)) console.error("muon-mockify: Directory '"+original_dir+"' not exists");
        mockifyDirs.push(dir);
    });
}

function reset(){
    mockifyDirs = [path.resolve(process.cwd(),"mock_modules")];
}

exports.add = add;
exports.reset = reset;

reset();
