
require("chai").should();
var expect = require("chai").expect,
    mockify = require("muon-mockify");

describe("test case for data processor",function(){
    var dummySource = "http://foo.bar",
        initialStatus = 200,
        initialData = "{ \"status\": \"Success\" }",
        initialObject = JSON.parse(initialData),
        testError,testObject;

    // // Подключаем MOCKIFY_DIR и настраиваем mock-объект
    before(function(){
        mockify.enable();
        require("../lib/myhttpclient.js").setup(null,initialStatus,initialData);
    });

    // Запускаем сценарий
    before(function(done) {
        mockify.original("../lib/dataproc.js").jsonify(dummySource,function(err,data){
            testError = err;
            testData = data;
            done();
        });
    });

    // Проверяем результат
    it("err should be a null",function(){
        expect(testError).to.be.a("null");
    });

    it("ret data should match to initial object",function(){
        testObject.should.be.equal(initialObject);
    });

    // Отключаем враппер
    after(mockify.disable);
});