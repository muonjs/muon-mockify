describe("cache module unit test",function(){

    var lib = require("../lib/cache");
    var path = require("path"),
        _ = require("underscore");

    describe("cache module should properly add cache to list",function(){

        var data = {
            "http": "./main.js",
            "foo": "./main.js",
            "foo/optional":"./main.js",
            "./some.js":"./main.js",
            "./other.js":"./lib/main.js",
            "../mock_modules/some.js":"./lib/main.js",
            "./mock_modules/some.js":"./main.js",
            "../mock_modules/node_modules/some.js":"./lib/main.js"
        };

        var ret;
        var result = [
            path.resolve("./some.js"),
            path.resolve("./lib/other.js"),
            path.resolve("./mock_modules/some.js"),
            path.resolve("./mock_modules/node_modules/some.js")
        ].sort();

        before(function(){
            for(var i in data){
                lib.add(".",i,data[i]);
            }

            ret = _.keys(lib.get()).sort();
        });

        it("should match to result",function(){
            ret.should.be.eql(result);
        });

        after(lib.flush);
    });
});