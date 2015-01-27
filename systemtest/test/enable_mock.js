describe("mockify.enableMock",function(){
    describe("should check proper enableMock after mockify.enable behavior",function(){
        var mock = { mocked: true }, mocked, test1, test2, postDisabled;

        before(function(){
            mockify.enable();
            mocked = require("http");
            mockify.enableMock("http",mock);
            test1 = require("http");
            mockify.disable();
            postDisabled = require("http");
        });

        before(function(){
            mockify.enableMock("http",mock);
            test2 = require("http");
            mockify.disable();
        });

        it("should not match to mock object from directory",function(){
            (mocked === mock).should.not.be.ok;
        });

        it("should match to mock object",function(){
            (test1 === mock).should.be.ok;
        });

        it("should match to mock object",function(){
            (test2 === mock).should.be.ok;
        });

        it("post disabled should return original http",function(){
            (postDisabled === mock).should.not.be.ok;
        })
    });

    describe("should not affect after mockify disable and enable again: ",function(){
        var mock = { mocked: true }, mocked, excluded, testIt;
        var module = "http";
        var _ = require("underscore");

        before(function(){
            mockify.enable();
            mocked = require(module);
            mockify.enableMock(module,mock);
            mockify.disable();
            mockify.enable();
            testIt = require(module);
        });

        it("mocked from dir and after enable again should match",function(){
            testIt.filename.should.be.eql(mocked.filename);
        });

        after(function(){
            mockify.disable();
        });
    });
});