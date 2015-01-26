/** как проверить? */

var path = require("path");

describe("system test for enable and disable method of mockify",function(){
    function RunTest(modulePath,mockPath) {
        var originalModule,testModule,testOriginalModule,mockModule;

        describe("test: "+modulePath,function(){
            before(function(){
                originalModule = require(modulePath);
                mockModule = require(mockPath);
                mockify.enable();
                testModule = require(modulePath);
                testOriginalModule = mockify.original(modulePath);
            });

            it("original should not match to test module",function(){
                expect(testModule.filename).not.to.be.equal(originalModule.filename);
            });

            it("original mock should match to test module",function(){
                expect(testModule.filename).to.be.equal(mockModule.filename);
            });

            it("original should match to mockify.original",function(){
                expect(testOriginalModule.filename).to.be.equal(originalModule.filename);
            });

            after(function(){
                mockify.disable();
            });
        });
    }

    describe("Tests for mocked modules",function(){
        var testModules = {
            "../lib/mymodule": "../mock_modules/lib/mymodule",
            "../main.js": "../mock_modules/main.js",
            "http": "../mock_modules/node_modules/http",
            "foo": "../mock_modules/node_modules/foo",
            "foo/optional": "../mock_modules/node_modules/foo/optional",
            "foo/optional.js": "../mock_modules/node_modules/foo/optional.js"
        };

        for(var i in testModules)
            RunTest(i,testModules[i]);
    });
});