describe("should exclude mock from mocked objects",function(){
    before(function(){

    });

    it("should fail",function(){
        (true).should.not.be.ok;
    });
});