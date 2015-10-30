describe("cleaning cache\n",function(){
    describe("should check whether cache cleaned on enable and disable\n",function(){
        var RunTest = function(module){
            describe("should return the same module object after enable/disable: "+module+"\n",function(){
                var original,mocked,cleaned;

                before(function(){
                    original = require(module);
                    mockify.enable();
                    mocked = require(module);
                    mockify.disable();
                    cleaned = require(module);
                });

                it("should not match original and mocked",function(){
                    (original === mocked).should.be.false();
                });

                it("should not match original and post disabled",function(){
                    (original === cleaned).should.be.true();
                });
            });
        };

        var RunTestMocked = function(module){
            describe("should clean cache for mock-modules: "+module+"\n",function(){
                var original,mocked,cleaned;

                before(function(){
                    original = require(module);
                    mockify.enable();
                    mocked = require(module);
                    mockify.disable();
                    cleaned = require(module);
                });

                it("should not match original and mocked",function(){
                    (original === mocked).should.be.false();
                });

                it("should not match original and post disabled",function(){
                    (original === cleaned).should.be.false();
                });
            });
        };

        ([
            "../main",
            "../lib/mymodule"
        ]).forEach(RunTest);

        ([
            "../mock_modules/main",
            "../mock_modules/lib/mymodule",
            "../mock_modules/node_modules/foo",
            "../mock_modules/node_modules/foo/optional"
        ]).forEach(RunTestMocked)
    });
});