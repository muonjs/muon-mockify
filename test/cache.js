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
            path.resolve("./mock_modules/node_modules/some.js"),
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

    describe("module cache should properly clean passed cache object",function(){
        var initialCache = [
            path.resolve("./some"),
            path.resolve("./lib/other"),
            path.resolve("./mock_modules/some"),
            path.resolve("./mock_modules/node_modules/some")
        ].sort();

        var additionalCache = [
            path.resolve("./mock_modules/some.js"),
            path.resolve("./mock_modules/some.coffee")
        ];

        var otherCache = [
            path.resolve("./some_do_not_touch"),
            path.resolve("./lib/some_do_not_touch"),
            path.resolve("./mock_modules/some_do_not_touch"),
            path.resolve("./mock_modules/some/some_do_not_touch")
        ];

        var cacheMock = {}, resultingCache = {}, ret;

        initialCache.forEach(function(c){
            cacheMock[c] = {};
        });

        additionalCache.forEach(function(c){
            cacheMock[c] = {};
        });

        otherCache.forEach(function(c){
            cacheMock[c] = {};
            resultingCache[c] = {};
        });

        before(function(){
            var counter = 0;
            initialCache.forEach(function(file){
                lib.add(file,"./original"+String(counter),"./some.js");
                counter++;
            });
            additionalCache.forEach(function(file){
                lib.add(file,"./original"+String(counter),"./some.js");
                counter++;
            });

            ret = lib.clean(cacheMock);
        });

        it("should match reduces object",function(){
            ret.should.be.eql(resultingCache);
        });

        after(lib.flush);
    });

});