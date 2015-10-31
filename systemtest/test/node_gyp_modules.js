describe("run mockify with node-gyp modules installed",function(){
    var iconvLoad = function() {
        /** iconv is good example of native built node.js modules */
        require("iconv");
    };

    before(function(){
       iconvLoad();
    });

    before(function(){
        mockify.enable();
    });

    it("repeated require of 'iconv' should not throw an error",function() {
        expect(iconvLoad).to.not.throw(Error);
    });

    after(function(){
        mockify.disable();
    });
})