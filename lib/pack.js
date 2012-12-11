#! /usr/bin/env node

var path           = require('path');
var fs             = require('fs');
var util           = require('./util');
var mkdirp         = require('mkdirp');
var child_process  = require('child_process');
var filter_package = require("./filter_package");
var os             = require("os");
var temp           = require("temp");


var RE_DOMAINS_CONF = /\/\*@source(.+)\*\//;
var RE_DOMAINS = /[^\s@*\/]+/g;
var RE_SOURCE = /(http:\/\/)img.pintupinqu.com(\/[^"'\s\)]+)/g;

var QPATH = __dirname;


function replaceDomains(lines){

    var first = lines[0],
        mc = first.match(RE_DOMAINS_CONF);

    if (!mc) { return lines; }

    var dms = mc[1].match(RE_DOMAINS);

    var summary = dms.map(function(){ return 0; }),
        summary_map = {};

    lines = lines.map(function(line, i){

         return line.replace(RE_SOURCE, function(a, p, f){

            if (summary_map.hasOwnProperty(f)) {
                return p + dms[summary_map[f]] + f;
            } else {
                var i = util.pathToInt(f, dms.length);
                summary[i]++;
                summary_map[f] = i;
                return p + dms[i] + f;
            }
        });
    });

    summary.forEach(function(item, i){
        console.log("%s: %s", dms[i], item);
    });

    return lines;
}

function packSrcList(file, mime){
    var lines_array = makeupLines(file, mime);

    if (mime === "css") {
        lines_array = replaceDomains(lines_array);
    }

    return lines_array.join(os.EOL);
}

function makeupLines(file, type){

    var lines = [];

    if (type === "js") {
        lines = filter_package.js_readlines(file);
    } else if (type === "css"){
        lines = filter_package.css_readlines(file);
    }

    return util.floorArray(lines);
}

exports.pack = packSrcList;

exports.version = function(){

    var today = new Date();

    var version = today.getFullYear().toString()
                + (today.getMonth() + 1).toString().replace(/^(\d)$/, "0$1")
                + today.getDate().toString().replace(/^(\d)$/, "0$1")
                + today.getHours().toString().replace(/^(\d)$/, "0$1")
                + today.getMinutes().toString().replace(/^(\d)$/, "0$1");

    try {
        fs.writeFileSync(global.PROJECT_ROOT + "/version", version);
    } catch(e){
        console.error("Output version file failed.. \n%s", e);
        process.exit(1);
    }
};

exports.min = function(min){

    var ver   = global.PACK_VERSION;
    var files = util.readFilesDeep(path.join(global.PROJECT_ROOT, "_src_"), /\.min\.(?:js|css)$/);
    var i     = 0;

    (function(){

        var file = files[ i++ ],
            next = arguments.callee;

        if (!file) {
            return;
        }

        var dest = file.replace("_src_", ver);

        var mime = /\.css$/.test(file) ? "css" : "js";

        console.log("%s[NOTICE]: Dealing with %s", os.EOL, dest);

        var linesData = packSrcList(file, mime);

        var tempfile = temp.openSync();

        fs.writeSync(tempfile.fd, linesData);

        mkdirp.sync(path.dirname(dest));

        if (!min) {

            console.log("%s >> %s", tempfile.path, dest);

            fs.writeFileSync(dest, fs.readFileSync(tempfile.path));

            next();

        } else if (mime === "css") {

            var cleancss = path.resolve(QPATH, "../node_modules/clean-css/bin/cleancss");
            var command = cleancss + " -o " + dest + " " + tempfile.path;

            console.log(command);

            child_process.exec(command, function(error, stdout, stderr){
                
                if (error) { 
                    console.error(error);
                    process.exit(1);
                }
                
                next();
            });

        } else if (mime === "js") {

            var uglifyjs = path.resolve(QPATH, "../node_modules/uglify-js/bin/uglifyjs");
            var command = uglifyjs + " -c -o " + dest + " " + tempfile.path;

            console.log(command);

            child_process.exec(command, function(error, stdout, stderr){

                if (error) { 
                    console.error(error);
                    process.exit(1);
                }

                next();
            });

        }


    })();

};