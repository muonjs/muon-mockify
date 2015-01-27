var path = require("path");
var lib = require("../lib/utils");

function RunTestWith2Args(name,method,first,second,result){
    describe(name,function(){
        var ret;

        before(function(){
            ret = lib[method](first,second);
        });

        it(first+" : "+second,function(){
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


describe("module utils check local unit",function(){
    [
        "./lib/mymodule.js",
        "./main.js",
        "./lib/some",
        "./lib/some.coffee",
        "./mock_modules/some.coffee",
        "./mock_modules/node_modules/some.coffee",
    ].forEach(function(i){
            RunTestWith2Args("check proper local files: "+i,"isLocal",i,path.resolve("."),true)
        });

    [
        "http",
        "../main.js",
        "./node_modules/foo/foo.js"
    ].forEach(function(i){
            RunTestWith2Args("check proper remote files: "+i,"isLocal",i,path.resolve("."),false)
        });
});

describe("module utils isAbsolute unit test",function(){
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

describe("module utils isPackage unit test",function(){
    [
        "some",
        "some/foo"
    ].forEach(function(i){
            RunTest("check proper package path: "+i,"isPackage",i,true)
        });

    [
        ".",
        "..",
        "./main.js",
        "../main.js",
        "/node_modules/foo/foo.js"
    ].forEach(function(i){
            RunTest("check proper filesystem path: "+i,"isPackage",i,false)
        });
});

describe("module utils isSubPackage unit test",function(){
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

describe("module utils hasExtension unit test",function(){
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

describe("module utils isHidden unit test",function(){
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

describe("module utils getExtension unit test",function(){
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

describe("module utils removeExtension unit test",function(){
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

describe("module utils should properly resolve path from parent",function(){
    var testData = {
        "foo": "./main",
        "moo": null,
        "some/foo": "./main",
        "../some": "./main",
        "/.some": "./lib/some",
        "./mock_modules/some": "./some",
        "./mock_modules/other": null,
        "../node_modules/some/main.js": "./lib/some",
        "./other":"/moo/some"
    };

    var result = [
        "foo",
        "moo",
        "some/foo",
        path.resolve("../some"),
        path.resolve("/.some"),
        path.resolve("./mock_modules/some"),
        path.resolve("./mock_modules/other"),
        path.resolve("./node_modules/some/main.js"),
        "/moo/other"
    ];

    for(var i in testData){
        var resultDir = result.shift();
        RunTestWith2Args("file "+i+" from "+testData[i] +" is: "+resultDir,"resolve",i,testData[i],resultDir);
    }
});