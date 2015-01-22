require("chai").should();
var expect = require("chai").expect,
    mockify = require("muon-mockify");

describe("test case for HTTP Mock",function(){

    // Исходные данные
    var httpMockRet = "<strong>Success</strong>",
        httpMockStatus = 200,
        HttpMock = require("./http-mock");

    var retData, retStatus, retErr;

    before(function() {
        /// Активируем враппер require и замещаем модуль 'http' mock-объектом
        mockify.enableMock("http",new HttpMock(httpMockStatus,httpMockRet));
    });

    // Выполняем метод
    before(function(done){
        mockify.original("./lib/myhttpclient").get("http://foo.bar",function(err,status,data){
            retErr = err;
            retData = data;
            retStatus = status;
            done();
        });
    });

    // Выполняем серию проверок
    it("err should be null",function(){
        expect(retErr).to.be.a("null");
    });

    it("data should exist",function(){
        expect(retData).to.be.a("string");
    });

    it("status should exist",function(){
        expect(retStatus).to.be.a("number");
    });

    it("data should be success",function(){
        retData.shoud.be.equal(httpMockRet);
    });

    it("status should be ok",function(){
        retStatus.shoud.be.equal(httpMockStatus);
    });

    // Отключаем враппер, чтобы не влиять на другие тесты
    after(mockify.disable);
});