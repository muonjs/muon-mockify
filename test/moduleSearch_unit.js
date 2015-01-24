var path = require("path");
var lib = require("../lib/moduleSearch");

function RunTestWithCWD(name,method,path,cwd,result){
    describe(name,function(){
        var ret;

        before(function(){
            ret = lib[method](path,cwd);
        });

        it(path+" : "+cwd,function(){
            expect(ret).to.be.equal(result);
        });
    });
}

function RunTest(name,method,path,result){
    describe(name,function(){
        var ret;

        before(function(){
            ret = lib[method](path);
        });

        it(path,function(){
            expect(ret).to.be.equal(result);
        });
    });
}

describe("module search mock unit test",function(){
    var tempFs = [
        "./lib/mymodule.coffee",
        "./main.js",
        "./node_modules/http.js",
        "./node_modules/foo.js",
        "./node_modules/foo/optional.js",
        "./node_modules/foo/lib/foo.js"
    ].map(function(dir){
        return path.resolve("./mock_modules",dir);
    });

    var dirs = [
       "."
    ].map(function(dir){
        return path.resolve("./mock_modules",dir);
    });

    var testData = [
        { mockId: "http", parentId: path.resolve("./"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/node_modules/http") },
        { mockId: "path", parentId: path.resolve("./"), dirs: dirs, files: tempFs, result: "path" },
        { mockId: "./main.js", parentId: path.resolve("./"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/main.js") },
        { mockId: "./lib/mymodule", parentId: path.resolve("./"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/lib/mymodule") },
        { mockId: "./lib/mymodule.coffee", parentId: path.resolve("./"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/lib/mymodule.coffee") },
        { mockId: "./lib/../lib/mymodule", parentId: path.resolve("./temp/"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/lib/mymodule") },
        { mockId: "../lib/mymodule", parentId: path.resolve("./temp/"), dirs: dirs, files: tempFs, result: "../lib/mymodule" }
    ];


    testData.forEach(function(searchData){
        describe(searchData.mockId+" : "+searchData.parentId,function(){
            var ret;

            before(function(){
                ret = lib.search(searchData.mockId,searchData.parentId,searchData.dirs,searchData.files);
            });

            it("should find: "+searchData.result,function(){
                ret.should.equal(searchData.result);
            });
        });
    });
});

describe("module search check local unit",function(){
    var lib = require("../lib/moduleSearch");

    [
        "./lib/mymodule.js",
        "./main.js",
        "./lib/some",
        "./lib/some.coffee"
    ].forEach(function(i){
        RunTestWithCWD("check proper local files: "+i,"isLocal",i,path.resolve("."),true)
    });

    [
        "http",
        "../main.js",
        "./node_modules/foo/foo.js"
    ].forEach(function(i){
        RunTestWithCWD("check proper remote files: "+i,"isLocal",i,path.resolve("."),false)
    });
});

describe("module search isAbsolute unit test",function(){
    var lib = require("../lib/moduleSearch");

    [
        "./lib/mymodule.js",
        "./main.js",
        "./lib/some",
        "./lib/some.coffee"
    ].forEach(function(i){
            RunTest("check proper relative files: "+i,"isAbsolute",i,false)
        });

    [
        "http",
        "/main.js",
        "/node_modules/foo/foo.js"
    ].forEach(function(i){
            RunTest("check proper absolute files: "+i,"isAbsolute",i,true)
        });
});

describe("module search isPackage unit test",function(){
    var lib = require("../lib/moduleSearch");

    [
        "some",
        "some/foo"
    ].forEach(function(i){
            RunTest("check proper package path: "+i,"isPackage",i,true)
        });

    [
        "./main.js",
        "../main.js",
        "/node_modules/foo/foo.js"
    ].forEach(function(i){
            RunTest("check proper filesystem path: "+i,"isPackage",i,false)
        });
});

describe("module search isSubPackage unit test",function(){
    [
        "some/foo",
        "some/foo/moo"
    ].forEach(function(i){
            RunTest("check proper subpackage path: "+i,"isSubPackage",i,true)
        });

    [
        "./main.js",
        "../main.js",
        "some"
    ].forEach(function(i){
            RunTest("is not subpackage: "+i,"isSubPackage",i,false)
        });
});

describe("module search hasExtension unit test",function(){
    [
        "some/foo.js",
        "some/foo/moo.coffee",
        "./some.js",
        ".some.js",
        "/some.js",
        "/moo/some.js",
        "/moo/some.coffee"
    ].forEach(function(i){
        RunTest("should find extension: "+i,"hasExtension",i,true)
    });

    [
        "some/foo",
        "some/foo/moo",
        ".some",
        "./some",
        "/some",
        "/moo/some",
        "/moo/some."
    ].forEach(function(i){
        RunTest("has no extension: "+i,"hasExtension",i,false)
    });
});

describe("module search isHidden unit test",function(){
    [
        ".foo.js",
        "some/foo/.moo.coffee",
        "./.some.js",
        "/.some.js"
    ].forEach(function(i){
        RunTest("should be hidden: "+i,"isHidden",i,true)
    });

    [
        "some/foo",
        "some/foo/moo",
        "./some",
        "/some",
        "/moo/some."
    ].forEach(function(i){
        RunTest("regular not hidden: "+i,"isHidden",i,false)
    });
});

describe("module search getExtension unit test",function(){
    var testData = {
        "some/foo": null,
        "some/foo/moo": null,
        ".some": null,
        "./some.coffee": "coffee",
        "/some": null,
        "/moo/some.":null,
        "/moo/some.js":"js",
        ".some.js":"js"
    };

    for(var i in testData){
        RunTest("should make: "+i+" to be: "+testData[i],"getExtension",i,testData[i]);
    }
});

describe("module search removeExtension unit test",function(){
    var testData = {
        "some/foo": "some/foo",
        "some/foo/moo": "some/foo/moo",
        ".some": ".some",
        "./some": "./some",
        "/some": "/some",
        "/moo/some.":"/moo/some.",
        "/moo/some.js":"/moo/some",
        ".some.js":".some"
    };

    for(var i in testData){
        RunTest("should make: "+i+" to be: "+testData[i],"removeExtension",i,testData[i]);
    }
});