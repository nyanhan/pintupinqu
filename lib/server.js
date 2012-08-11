#! /usr/bin/env node

var fs = require("fs")
    , URL = require("url")
    , connect = require("connect")
    , path = require("path")
    , url = require("url")
    , http = require("http")
    , util = require('./util')
    , build_mustache = require("./handlebars_clr").build
    , Qzzpack = require("./pack").pack
    , filter_package = require("./filter_package")
    , system = require('./system');

var mime_config = {
    "js" : "application/javascript",
    "css" : "text/css"
};

var PROJECT_ROOT = process.cwd();
var PACK_OUTPUT = false;

function localServer(port, pintupinquServer){
    var Route = function(req, res, next){

        var p  = URL.parse( req.url ).pathname;
        var pp = p.replace(/\/\d{12}\//, "/_src_/");

        if (/([^\/]+)\.handlebars$/.test(p)) {
            
            var l = path.join(PROJECT_ROOT, pp);

            fs.exists( l, function(exists){

                if (exists) {

                    res.writeHead(200, { 'Content-Type': mime_config["js"] });

                    var builded = build_mustache(l);

                    res.end(builded);

                } else {
                    console.log("[ERROR]: " + l + " does not exists.");
                    next();
                }

            });

        } else if (/\/\d{12}\/.+\.min\.(js|css)$/.test(p)){

            var host = req.headers["host"]
                , protocol = "http"
                , type = "js"
                , pack = !!PACK_OUTPUT;

            type = /\.css$/.test(p) ? "css" : "js";

            fs.exists( path.join(PROJECT_ROOT, pp), function(exists){

                if (exists) {

                    res.writeHead(200, { 'Content-Type': mime_config[type] });

                    if (pack) {
                        var returnData = Qzzpack(path.join(PROJECT_ROOT, pp), type);

                        res.end(returnData);
                    } else {

                        var list = util.readLinesSync(path.join(PROJECT_ROOT, pp));

                        if (type === "css") {
                            data = filter_package.makeupCssList(list, host, pp, port, protocol);
                        } else if (type === "js"){
                            data = filter_package.makeupJsList(list, host, pp, port, protocol);
                        }

                        res.end(data.join(system.EOF));
                    }

                } else {
                    console.log("[ERROR]: %s do not exists...", p);
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
            .use(connect.static(process.cwd()))
            .use(connect.logger());

    listenPort(app, port);
}

function listenPort(server, port){

    server.listen(port, function(e){
        console.log("[LOG]: " + "Running success on port " + port + ".");
        console.log("[LOG]: " + "Press Ctrl + C to exit.");
    });

}

exports.listen = function(port, pintupinquServer){
    port = port || 80;

    PACK_OUTPUT = false;

    localServer(port, pintupinquServer);
}
