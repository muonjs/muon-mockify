var path = require("path");
var lib = require("../lib/search");



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
        { mockId: "http", parentId: path.resolve("./parent.js"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/node_modules/http") },
        { mockId: "path", parentId: path.resolve("./parent.js"), dirs: dirs, files: tempFs, result: "path" },
        { mockId: "./main.js", parentId: path.resolve("./parent.js"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/main.js") },
        { mockId: "./lib/mymodule", parentId: path.resolve("./parent.js"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/lib/mymodule") },
        { mockId: "./lib/mymodule.coffee", parentId: path.resolve("./parent.js"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/lib/mymodule.coffee") },
        { mockId: "../lib/../lib/mymodule", parentId: path.resolve("./temp/parent.js"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/lib/mymodule") },
        { mockId: "../lib/mymodule", parentId: path.resolve("./temp/parent.js"), dirs: dirs, files: tempFs, result: path.resolve("./mock_modules/lib/mymodule") },
        { mockId: "../lib/mymodule", parentId: path.resolve("./parent.js"), dirs: dirs, files: tempFs, result: "../lib/mymodule" },
        { mockId: "./lib/mymodule", parentId: path.resolve("./node_modules/foo/parent.js"), dirs: dirs, files: tempFs, result: "./lib/mymodule" }
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