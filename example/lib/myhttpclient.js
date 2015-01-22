var http = require("http");

exports.get = function(url,callback){
    http.get(url,function(resp){
        var chunks = [];
        resp.on("data",function(chunk) {
            chunks.push(chunk)
        }).on("end",function(){
            callback(null,resp.status,Buffer.concat(chunks).toString("utf-8"));
        });
    }).on("error",callback);
}