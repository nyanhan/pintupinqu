var fs             = require("fs");
var os             = require("os");
var URL            = require("url");
var connect        = require("connect");
var path           = require("path");
var util           = require('./util');
var build_mustache = require("./handlebars_clr").build;
var Qzzpack        = require("./pack").pack;
var filter_package = require("./filter_package");

var mime_config = {
    "js" : "application/javascript",
    "css" : "text/css"
};

function runServer(port, pintupinquServer){
    var Route = function(req, res, next){

        var raw_path  = URL.parse( req.url ).pathname;
        var real_path = raw_path.replace(/\/\d{12}\//, "/_src_/");
        var full_path = path.join(global.PROJECT_ROOT, real_path);
        var type      = /\.(css|less)$/.test(raw_path) ? "css" : "js";

        if (/([^\/]+)\.handlebars$/.test(raw_path)) {

            fs.exists( full_path, function(exists){

                if (exists) {

                    res.writeHead(200, { 'Content-Type': mime_config[type] });

                    var builded = "";

                    try {
                        builded = build_mustache(full_path);    
                    } catch (e) {
                        console.log("[ERROR]: Build mustache ERROR. %s", e);
                    }
                    
                    res.end(builded);

                } else {
                    console.log("[ERROR]: " + full_path + " does not exists.");
                    next();
                }

            });

        } else if (/\/\d{12}\/.+\.min\.(js|css)$/.test(raw_path)){

            var host = req.headers["host"];
            var protocol = "http";      
            var temp = [];  

            var pack = false;

            fs.exists( full_path, function(exists){

                if (exists) {

                    res.writeHead(200, { 'Content-Type': mime_config[type] });

                    var returnData = "";

                    temp = util.readLinesSync(full_path);

                    // 第一行定义是否 pack 
                    if (temp[0] && (/\/\*@pack(.+)\*\//).test(temp[0])) {
                        pack = true;
                    }

                    if (pack) {
                        returnData = Qzzpack(full_path, type);
                    } else {
                        returnData = filter_package.makeup_path(temp, type, {
                            host: host,
                            pathname: real_path,
                            port: port,
                            protocol: protocol
                        }).join(os.EOL);
                    }

                    res.end(returnData);

                } else {
                    console.log("[ERROR]: %s do not exists...", full_path);
                    next();
                }

            });
        } else {
            next();
        }

    };

    var app = connect()
            .use(connect.favicon())
            .use(connect.bodyParser())
            .use(pintupinquServer ? Route : function(req, res, next){ next(); })
            .use(connect.static(global.PROJECT_ROOT))
            .use(connect.logger());

    app.listen(port, function(e){
        console.log("[LOG]: " + "Running success on port " + port + ".");
        console.log("[LOG]: " + "Press Ctrl + C to exit.");
    });
}

exports.listen = function(port, pintupinquServer){
    port = port || 80;

    runServer(port, pintupinquServer);
};
