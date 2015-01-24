var walk = require("walk"),
    _ = require("underscore"),
    path = require("path"),
    mockifyDir = require("./dirs");

function isAbsolute(path){
    return !/^\.{1,2}\//.test(path);
}

function isPackage(path){
    return !/^\.{0,2}\//.test(path);
}

function isSubPackage(path){
    return isPackage(path) && /\//.test(path);
}

function hasExtension(pathName){
    var fileName = path.basename(pathName);
    return /[\S]+\.[\S]+$/.test(fileName);
}

function getExtension(pathName){
    var fileName = path.basename(pathName);
    if (!hasExtension(pathName)) return null;
    return fileName.match(/[\S]+\.([\S]+$)/)[1];
}

function removeExtension(pathName){
    if (!hasExtension(pathName)) return pathName;
    var fileName = path.basename(pathName);
    var dirName = path.dirname(pathName) + path.sep;
    if (pathName == fileName){
        dirName = "";
    }
    fileName = fileName.replace(RegExp("\\."+getExtension(pathName)+"$"),"");
    return dirName+fileName;

}

function isHidden(pathName){
    var fileName = path.basename(pathName);
    return /^\./.test(fileName);
}

function isLocal(fileName,cwd){
    if (isPackage(fileName)) return false;
    fileName = path.resolve(fileName);
    cwd = path.resolve(cwd);
    if (fileName.match(path.resolve(cwd,"./node_modules"))) return false;
    if (fileName.match(cwd)) return true;
    return false;
};

function pathWalk(mockifyPath){
    var filesList = [];
    walk.walkSync(mockifyPath,{
        listeners: {
            file: function(root,fileStat,next){
                filesList.push(path.resolve(root,fileStat.name));
                next();
            }
        }
    });
    return filesList;
}

exports.search = function(mockId,parentid,dirList,filesList){
    var cwd = process.cwd();

    filesList = filesList || [];

    var dirList = _.compact(_.flatten([dirList]));
    dirList = dirList || mockifyDir.get();

    var result = _.compact(dirList.map(function(mockifyPath){
        if (filesList.length == 0) {
            filesList = pathWalk(mockifyPath);
        }

        if (!hasExtension(mockId)){
            filesList = filesList.map(function(file){
                return removeExtension(file);
            });
        }

        var mockPath = false;

        if (isPackage(mockId)){
            mockPath = path.resolve(mockifyPath,"node_modules",mockId);
        }
        else if (isLocal(mockId,cwd)){
            var relativePath = path.resolve(cwd,mockId).replace(cwd+"/","");
            mockPath = path.resolve(mockifyPath,relativePath);
        }

        if (filesList.indexOf(mockPath) != -1) {
            return mockPath;
        }

        return null;
    }));

    if(result.length > 0){
        return result[0];
    }
    else {
        return mockId;
    }
}

exports.isLocal = isLocal;
exports.isAbsolute = isAbsolute;
exports.isPackage = isPackage;
exports.isSubPackage = isSubPackage;
exports.hasExtension = hasExtension;
exports.getExtension = getExtension;
exports.removeExtension = removeExtension;
exports.isHidden = isHidden;
