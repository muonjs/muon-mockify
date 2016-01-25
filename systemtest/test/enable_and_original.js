'use strict';

var path = require("path");

describe("Mockify.enable and mockify.original.",function(){
    var path = require("path");

    describe("Enable and disable.",function(){
        function RunTest(modulePath,mockPath) {
            var originalModule,testModule,testOriginalModule,mockModule;

            describe("test: "+modulePath+".",function(){
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

        describe("Tests for mocked modules.",function(){
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

    describe("Enable method with argument.",function(){
        var RunTestWidthArguments = function(args) {
            var originalModule,testModule,testOriginalModule,mockModule,
                disabledModule,disabledModuleOriginal;

            var modulePath = "../lib/mymodule",
                mockPath = "../mock_modules/lib/mymodule",
                disabledPath = "../main";

            describe("test: "+JSON.stringify(args),function(){
                before(function(){
                    originalModule = require(modulePath);
                    mockModule = require(mockPath);
                    disabledModuleOriginal = require(disabledPath);
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
        RunTestWidthArguments(["./lib/mymodule","./lib/secondmodule"]);
    });

    describe("Multiple times enable call with first simple call (with no args).",function(){
        var MODULE_1 = path.resolve("./lib/mymodule");
        var MODULE_2 = path.resolve("./lib/secondmodule");
        var MOCK_MODULE_1 = path.resolve("./mock_modules/lib/mymodule");
        var MOCK_MODULE_2 = path.resolve("./mock_modules/lib/secondmodule");
        var originalModule,testModule,testOriginalModule,mockModule,
            originalModule2,testModule2,testOriginalModule2,mockModule2;

        before(function(){
            originalModule = require(MODULE_1);
            originalModule2 = require(MODULE_2);
            mockModule = require(MOCK_MODULE_1);
            mockModule2 = require(MOCK_MODULE_2);
            mockify.enable();
            mockify.enable(MODULE_2);
            testModule = require(MODULE_1);
            testModule2 = require(MODULE_2);
            testOriginalModule = mockify.original(MODULE_1);
            testOriginalModule2 = mockify.original(MODULE_2);
        });

        it("original 1 should not match to test module",function(){
            expect(testModule.filename).not.to.be.equal(originalModule.filename);
        });

        it("original 1 mock should match to test module",function(){
            expect(testModule.filename).to.be.equal(mockModule.filename);
        });

        it("original 1 should match to mockify.original",function(){
            expect(testOriginalModule.filename).to.be.equal(originalModule.filename);
        });

        it("original 2 should not match to test module",function(){
            expect(testModule2.filename).not.to.be.equal(originalModule2.filename);
        });

        it("original 2 mock should match to test module",function(){
            expect(testModule2.filename).to.be.equal(mockModule2.filename);
        });

        it("original 2 should match to mockify.original",function(){
            expect(testOriginalModule2.filename).to.be.equal(originalModule2.filename);
        });

        after(function(){
            mockify.disable();
        });
    });

    describe("Enable call with no argument should discard previously set mock filter.",function(){
        var MODULE_1 = path.resolve("./lib/mymodule");
        var MODULE_2 = path.resolve("./lib/secondmodule");
        var MOCK_MODULE_1 = path.resolve("./mock_modules/lib/mymodule");
        var MOCK_MODULE_2 = path.resolve("./mock_modules/lib/secondmodule");
        var originalModule,testModule,testOriginalModule,mockModule,
            originalModule2,testModule2,testOriginalModule2,mockModule2;

        before(function(){
            originalModule = require(MODULE_1);
            originalModule2 = require(MODULE_2);
            mockModule = require(MOCK_MODULE_1);
            mockModule2 = require(MOCK_MODULE_2);
            mockify.enable(MODULE_2);
            mockify.enable();
            testModule = require(MODULE_1);
            testModule2 = require(MODULE_2);
            testOriginalModule = mockify.original(MODULE_1);
            testOriginalModule2 = mockify.original(MODULE_2);
        });

        it("original 1 should not match to test module",function(){
            expect(testModule.filename).not.to.be.equal(originalModule.filename);
        });

        it("original 1 mock should match to test module",function(){
            expect(testModule.filename).to.be.equal(mockModule.filename);
        });

        it("original 1 should match to mockify.original",function(){
            expect(testOriginalModule.filename).to.be.equal(originalModule.filename);
        });

        it("original 2 should not match to test module",function(){
            expect(testModule2.filename).not.to.be.equal(originalModule2.filename);
        });

        it("original 2 mock should match to test module",function(){
            expect(testModule2.filename).to.be.equal(mockModule2.filename);
        });

        it("original 2 should match to mockify.original",function(){
            expect(testOriginalModule2.filename).to.be.equal(originalModule2.filename);
        });

        after(function(){
            mockify.disable();
        });
    });

    describe("Multiple times enable call.",function(){
        var MODULE_1 = path.resolve("./lib/mymodule");
        var MODULE_2 = path.resolve("./lib/secondmodule");
        var MOCK_MODULE_1 = path.resolve("./mock_modules/lib/mymodule");
        var MOCK_MODULE_2 = path.resolve("./mock_modules/lib/secondmodule");
        var DISABLED_MODULE = path.resolve("./main");
        var originalModule,testModule,testOriginalModule,mockModule,
            originalModule2,testModule2,testOriginalModule2,mockModule2,
            disabledModule,disabledModuleOriginal;

        before(function(){
            originalModule = require(MODULE_1);
            originalModule2 = require(MODULE_2);
            mockModule = require(MOCK_MODULE_1);
            mockModule2 = require(MOCK_MODULE_2);
            disabledModuleOriginal = require(DISABLED_MODULE);
            mockify.enable(MODULE_1);
            mockify.enable(MODULE_2);
            testModule = require(MODULE_1);
            testModule2 = require(MODULE_2);
            testOriginalModule = mockify.original(MODULE_1);
            testOriginalModule2 = mockify.original(MODULE_2);
            disabledModule = require(DISABLED_MODULE)
        });

        it("original 1 should not match to test module",function(){
            expect(testModule.filename).not.to.be.equal(originalModule.filename);
        });

        it("original 1 mock should match to test module",function(){
            expect(testModule.filename).to.be.equal(mockModule.filename);
        });

        it("original 1 should match to mockify.original",function(){
            expect(testOriginalModule.filename).to.be.equal(originalModule.filename);
        });

        it("original 2 should not match to test module",function(){
            expect(testModule2.filename).not.to.be.equal(originalModule2.filename);
        });

        it("original 2 mock should match to test module",function(){
            expect(testModule2.filename).to.be.equal(mockModule2.filename);
        });

        it("original 2 should match to mockify.original",function(){
            expect(testOriginalModule2.filename).to.be.equal(originalModule2.filename);
        });

        it("module not in arguments should match to original module",function(){
            expect(disabledModule.filename).to.be.equal(disabledModuleOriginal.filename);
        });

        after(function(){
            mockify.disable();
        });
    });
});