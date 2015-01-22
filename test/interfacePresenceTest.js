describe("interface test",function(){
    var testModule = require("../main.js");


    // methods
    ["enable","enableMock","removeMock","disable","original","getMockifyDirs",
     "setMockifyDir","addMockifyDir","resetMockifyDir"]
        .forEach(function(method){
            it("should have mockify."+method,function(){
                expect(testModule[method]).to.be.a("function");
            });
    });
});