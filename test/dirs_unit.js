var path = require("path");
var sinon = require("sinon");

describe("./lib/dirs.js unit tests ",function(){
    var module = require("../lib/dirs");

    afterEach(function(){
        module.reset();
    });

    describe("Test dirs reset module",function(){
        var testDirs, initialDir = [path.resolve(process.cwd(),"mock_modules")];

        before(function(){
            testDirs = module.get();
        });

        it("directories should refer to mock_modles in cwd",function(){
            expect(testDirs).to.be.an("array");
            testDirs.should.eql(initialDir);
        });
    });

    describe("Test dirs set with list",function(){
        var testDirs, initialDirs = ["/a","/b"];

        before(function(){
            module.set(initialDirs)
            testDirs = module.get();
        });

        it("should match",function(){
            testDirs.should.be.eql(initialDirs);
        });
    });

    describe("Test dirs set with one item",function(){
        var testDirs, initialDir = "/a";

        before(function(){
            module.set(initialDir);
            testDirs = module.get();
        });

        it("should match to list of one dir",function(){
            testDirs.should.be.eql([initialDir]);
        });
    });

    describe("Test dirs set with one item for relative path",function(){
        var testDirs, initialDir = ".a", targetDir = [path.resolve(process.cwd(),initialDir)];

        before(function(){
            module.set(initialDir);
            testDirs = module.get();
        });

        it("should match to list of one dir",function(){
            testDirs.should.be.eql(targetDir);
        });
    });
});