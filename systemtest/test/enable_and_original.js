describe("mockify.enable and mockify.original",function(){
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

    describe("system test for enable  method with arguments of mockify",function(){
        var RunTestWidthArguments = function(args) {
            var originalModule,testModule,testOriginalModule,mockModule,
                disabledModule,disabledModuleOriginal,disabledMockOriginal;

            var modulePath = "../lib/mymodule",
                mockPath = "../mock_modules/lib/mymodule",
                disabledPath = "../main",
                disabledMockPath = "../mock_modules/main";

            describe("test: "+JSON.stringify(args),function(){
                before(function(){
                    originalModule = require(modulePath);
                    mockModule = require(mockPath);
                    disabledModuleOriginal = require(disabledPath);
                    disabledMockOriginal = require(disabledMockPath);
                    mockify.enable(args);
                    testModule = require(modulePath);
                    testOriginalModule = mockify.original(modulePath);
                    disabledModule = require(disabledPath)
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

                it("module not in arguments should match to original module",function(){
                    expect(disabledModule.filename).to.be.equal(disabledModuleOriginal.filename);
                });

                after(function(){
                    mockify.disable();
                });
            });
        };

        RunTestWidthArguments("./lib/mymodule");
        RunTestWidthArguments(["./lib/mymodule"]);
        RunTestWidthArguments(["./lib/mymodule","./lib/mymodule2"]);
    });
});