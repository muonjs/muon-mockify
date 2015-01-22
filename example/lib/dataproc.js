var httpClient = require("./myhttpclient");

exports.jsonify = function(source,callback) {
    httpClient.get(source,function(err,status,data) {
        if (!!err) return callback(err);
        if (status != 200) return callback({ status: status, message: "data source is not available"});
        try {
            callback(null,JSON.parse(data));
        }
        catch(e){
            callback(e);
        }
    });
}