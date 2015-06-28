var Q 		= require("q"),
	http 	= require("http"),
	url 	= require("url");

var httpGet = function (opts) {
     var deferred = Q.defer();
     http.get(opts, deferred.resolve);
     return deferred.promise;
};

httpGet(url.parse("http://www.google.com"))
	.then(function (res) {
        console.log("#0");
	    httpGet(url.parse(res.headers["location"]))
	    .then(function (res) {
	        var body = "";
	        console.log("#1");
	        res.on("data", function (chunk) {
	            body += chunk;
	            console.log(body);
	        });
	        res.on("end", function () {
	            console.log(body);
	        });
	    });
});
