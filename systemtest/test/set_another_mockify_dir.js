describe("mockify.setMockifyDir & mockify.addMockifyDir\n",function(){

    describe("should find second module in mock_modules and third module in mock_modules2\n",function(){
        var secondMock, thirdMock,
            secondTest, thirdTest;

        var secondModule = "../lib/secondmodule", thirdModule = "../lib/thirdmodule";
        var secondMockModule = "../mock_modules/lib/secondmodule", thirdMockModule = "../mock_modules2/lib/thirdmodule";

        before(function(){
            secondMock = require(secondMockModule);
            thirdMock = require(thirdMockModule);

            mockify.enable();
            mockify.addMockifyDir("./mock_modules2");
            secondTest = require(secondModule);
            thirdTest = require(thirdModule);
        });

        it("should find secondmodule in default mock_modules",function(){
            secondTest.filename.should.be.eql(secondMock.filename);
        });

        it("should find thirdmodule in default mock_modules2",function(){
            thirdTest.filename.should.be.eql(thirdMock.filename);
        });

        after(function(){
            mockify.disable();
        });
    });

    describe("should find second module and third module in mock_modules2\n",function(){
        var secondMock, thirdMock,
            secondTest, thirdTest;

        var secondModule = "../lib/secondmodule", thirdModule = "../lib/thirdmodule";
        var secondMockModule = "../mock_modules2/lib/secondmodule", thirdMockModule = "../mock_modules2/lib/thirdmodule";

        before(function(){
            secondMock = require(secondMockModule);
            thirdMock = require(thirdMockModule);

            mockify.enable();
            mockify.setMockifyDir("./mock_modules2");
            secondTest = require(secondModule);
            thirdTest = require(thirdModule);
        });

        it("should find second module in default mock_modules2",function(){
            secondTest.filename.should.be.eql(secondMock.filename);
        });

        it("should find third module in default mock_modules2",function(){
            thirdTest.filename.should.be.eql(thirdMock.filename);
        });

        after(function(){
            mockify.disable();
        });
    });
});