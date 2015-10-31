describe("mockify.disable method",function(){
    describe("disable should stops hook and return proper original modules: ",function(){
        var originalModule, mockedModule, postDisableModule;
        var moduleName = "../lib/mymodule";
        var _ = require("underscore");

        before(function(){
            originalModule = require(moduleName);
            mockify.enable();
            mockedModule = require(moduleName);
            mockify.disable();
            postDisableModule = require(moduleName);
        });

        it("original module and mocked should not match",function(){
            originalModule.should.not.be.eql(mockedModule);
        });

        it("original module should not be the same object as post disable module (cache should be cleaned)",function(){
            originalModule.should.not.be.equal(postDisableModule);
        });

        it("original module should have the same interface as post disable module",function(){
            _.keys(originalModule).should.be.eql(_.keys(originalModule));
        });
    });
});