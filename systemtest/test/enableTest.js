/** как проверить? */

var path = require("path");

describe("system test fo mockify",function(){
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

    describe("Tests for localmodules",function(){
        var testModules = {
            "../lib/mymodule": "../mock_modules/lib/mymodule"
        };

        for(var i in testModules)
            RunTest(i,testModules[i]);
    });

    describe("For node_modules and submodules",function(){
        var testModules = {

        };

        for(var i in testModules)
            RunTest(i,testModules[i]);
    });

    describe("For native modules",function(){
        var testModules = {

        };

        for(var i in testModules)
            RunTest(i,testModules[i]);
    });
});