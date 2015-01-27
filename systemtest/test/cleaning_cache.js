describe("cleaning cache",function(){
    describe("should check whether cache cleaned on enable and disable",function(){
        var RunTest = function(module){
            describe("should be clean cache for: "+module,function(){
                var original,mocked,cleaned;

                before(function(){
                    original = require(module);
                    mockify.enable();
                    mocked = require(module);
                    mockify.disable();
                    cleaned = require(module);
                });

                it("should not match original and mocked",function(){
                    (original === mocked).should.not.be.ok;
                });

                it("should not match original and post disabled",function(){
                    (original === cleaned).should.not.be.ok;
                });
            });

        };

        ([
            "../main",
            "../lib/mymodule",
            "../mock_modules/main",
            "../mock_modules/lib/mymodule",
            "../mock_modules/node_modules/foo",
            "../mock_modules/node_modules/foo/optional"
        ]).forEach(RunTest);
    });
});