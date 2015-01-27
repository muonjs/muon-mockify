var _ = require("underscore"),
    path = require("path");

function isAbsolute(path){
    return !/^\.{1,2}\//.test(path);
}

function isPackage(path){
    return !/^\.{0,2}\//.test(path) && !/^\.{1,2}$/.test(path);
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
    cwd = cwd || process.cwd();
    if (isPackage(fileName)) return false;
    fileName = path.resolve(fileName);
    cwd = path.resolve(cwd);
    if (fileName.match(path.resolve(cwd,"./node_modules"))) return false;
    if (fileName.match(cwd)) return true;
    return false;
};

function resolveFromParent(child,parent){
    return path.resolve(path.dirname(parent),child);
}

exports.isLocal = isLocal;
exports.isAbsolute = isAbsolute;
exports.isPackage = isPackage;
exports.isSubPackage = isSubPackage;
exports.hasExtension = hasExtension;
exports.getExtension = getExtension;
exports.removeExtension = removeExtension;
exports.isHidden = isHidden;
exports.resolveFromParent = resolveFromParent;