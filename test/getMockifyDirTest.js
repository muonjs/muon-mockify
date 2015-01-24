var path = require("path");

describe("getMockifyDirs test",function() {
    var testDirs, initDirs = [path.resolve(process.cwd(),"mock_modules")];
    before(function(){
        testDirs = main.getMockifyDirs();
    });

    it("should be an array",function(){
        expect(testDirs).to.be.an("array");
    });

    it ("should be set to default ./mock_modules",function(){
        testDirs.should.be.eql(initDirs);
    });
});