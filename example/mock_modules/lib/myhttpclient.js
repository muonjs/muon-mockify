var mockErr,mockStatus,mockData;
exports.setup = function(err,status,data){
    mockStatus = status;
    mockData = data;
}

exports.get = function(source,callback) {
    callback(mockErr,mockStatus,mockData);
}