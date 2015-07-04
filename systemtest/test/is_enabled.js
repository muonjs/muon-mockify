describe("isEnabled",function(){
    describe("on bare enable",function(){
        var enabled = null;
        before(function(){
            mockify.enable();
        });

        before(function(){
            enabled = mockify.isEnabled();
        });

        it ("should be true",function(){
            expect(enabled).to.be.true;
        });

        after(function(){
            mockify.disable();
        });
    });
    describe("on mock",function(){
        var enabled = null;

        before(function(){
            mockify.enableMock("http",{});
        });

        before(function(){
            enabled = mockify.isEnabled();
        });

        it("should be true",function(){
            expect(enabled).to.be.true;
        });

        after(function(){
            mockify.disable();
        });
    });

    describe("after enable/disable",function(){
        var enabled = null;

        before(function(){
            mockify.enable();
            mockify.disable();
        });

        before(function(){
            enabled = mockify.isEnabled();
        });

        it ("should be true",function(){
            expect(enabled).to.be.false;
        });
    });
});