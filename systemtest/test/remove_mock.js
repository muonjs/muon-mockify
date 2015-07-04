describe("mockify.removeMock",function(){
    describe("should remove mock from mocked objects",function(){
        var mocked, original, testIt;
        var module = "http";
        var _ = require("underscore");

        before(function(){
            original = require(module);
            mockify.enable();
            mocked = require(module);
            mockify.removeMock(module);
            testIt = require(module);
        });

        it("should not match to mocked",function(){
            (mocked === testIt).should.not.be.ok;
        });

        it("should match to original by interface",function(){
            _.keys(testIt).should.be.eql(_.keys(original));
        });

        after(function(){
            mockify.disable();
        });
    });

    describe("should exclude mock from mocked after enableMock objects",function(){
        var mock = { mocked: true }, original, testIt;
        var module = "http";
        var _ = require("underscore");

        before(function(){
            original = require(module);
            mockify.enableMock(module,mock);
            mockify.removeMock(module);
            testIt = require(module);
        });

        it("should not match to mocked",function(){
            (mock === testIt).should.not.be.ok;
        });

        it("should match to original by interface",function(){
            _.keys(testIt).should.be.eql(_.keys(original));
        });

        after(function(){
            mockify.disable();
        });
    });


    describe("should remove list of mocks from mocked objects",function(){
        var mocked, original, testIt;
        var module = "http";
        var _ = require("underscore");

        before(function(){
            original = require(module);
            mockify.enable();
            mocked = require(module);
            mockify.removeMock([module]);
            testIt = require(module);
        });

        it("should not match to mocked",function(){
            (mocked === testIt).should.not.be.ok;
        });

        it("should match to original by interface (should not be the same)",function(){
            _.keys(testIt).should.be.eql(_.keys(original));
        });

        after(function(){
            mockify.disable();
        });
    });

    describe("should recover removed mock after enableMock again",function(){
        var mock = { mocked: true }, excluded, testIt;
        var module = "http";
        var _ = require("underscore");

        before(function(){
            mockify.enable();
            mockify.removeMock(module);
            excluded = require(module);
            mockify.enableMock(module,mock);
            testIt = require(module);
        });

        it("should not match to exluded",function(){
            (excluded === testIt).should.not.be.ok;
        });

        it("recovered mock should match to mock",function(){
            (testIt === mock).should.be.ok;
        });

        after(function(){
            mockify.disable();
        });
    });

    describe("should not affect after mockify disable and enable again",function(){
        var mocked, testIt;
        var module = "http";
        var _ = require("underscore");

        before(function(){
            mockify.enable();
            mocked = require(module);
            mockify.removeMock(module);
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

    describe("check fo excludeMock presence",function(){
        it ("should be duplication of removeMock",function(){
            expect(mockify.excludeMock === mockify.removeMock).to.be.true;
        });
    });
});