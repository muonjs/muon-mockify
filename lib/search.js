var walk = require("walk"),
    _ = require("underscore"),
    path = require("path"),
    utils = require("./utils"),
    mockifyDir = require("./dirs");

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

exports.search = function(mockId,parentId,dirList,testFilesList){
    var cwd = process.cwd();

    testFilesList = testFilesList || [];

    dirList = dirList || mockifyDir.get();
    dirList = _.compact(_.flatten([dirList]));


    if (!utils.isAbsolute(mockId)){
        mockId = path.resolve(path.dirname(parentId),mockId);
    }



    var result = _.compact(dirList.map(function(mockifyPath){
        var filesList;

        if (testFilesList.length == 0) {
            filesList = pathWalk(mockifyPath);
        }
        else {
            filesList = testFilesList;
        }

        if (!utils.hasExtension(mockId)){
            filesList = filesList.map(function(file){
                return utils.removeExtension(file);
            });
        }

        var mockPath = false;

        if (utils.isPackage(mockId)){
            mockPath = path.resolve(mockifyPath,"node_modules",mockId);
        }
        else if (utils.isLocal(mockId,cwd)){
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
        return null;
    }
}
