#! /usr/bin/env node

var path = require('path'),
    fs = require('fs'),
    util = require('./util'),
    mkdirp = require('mkdirp'),
    child_process = require('child_process'),
    temp = require('temp'),
    filter_package = require("./filter_package"),
    system = require('./system'),
    read_config = require("./read_config");


var RE_DOMAINS_CONF = /\/\*@source(.+)\*\//;
var RE_DOMAINS = /[^\s@*\/]+/g;
var RE_SOURCE = /(http:\/\/)source.qunar.com(\/[^"'\s\)]+)/g;

var EOF = system.EOF;
var QPATH = __dirname;


function replaceDomains(lines){

    var first = lines[0],
        mc = first.match(RE_DOMAINS_CONF);

    if (!mc) { return lines; }

    var dms = mc[1].match(RE_DOMAINS);

    var summary = dms.map(function(){ return 0; }),
        summary_map = {};

    lines = lines.map(function(line, i){

         return line = line.replace(RE_SOURCE, function(a, p, f){

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

    return lines_array.join(EOF);
}

function makeupLines(file, type){

    var lines;

    if (type === "js") {
        lines = filter_package.loopJSFilter(file);
    } else if (type === "css"){
        lines = filter_package.loopCSSFilter(file);
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

    read_config.write_version(version);
};
exports.min = function(min){

    var ver = read_config.read_version();

    if (!ver) {
        console.log("[ERROR]: Version file do not exsits.");
        process.exit(0);
    }

        var root = path.resolve(".");

    var files = util.readFilesDeep(path.join(root, "_src_"), /\.min\.(?:js|css)$/);

    var i = 0;

    (function(){

        var file = files[ i++ ],
            next = arguments.callee;

        if (!file) {
            return;
        }

        var dest = file.replace("_src_", ver);

        var mime = /\.css$/.test(file) ? "css" : "js";

        console.log("%s[NOTICE]: Dealing with %s", EOF, dest);

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
                if (error) { console.log(error); }
                next();
            });

        } else if (mime === "js") {

            var uglifyjs = path.resolve(QPATH, "../node_modules/uglify-js/bin/uglifyjs");
            var command = uglifyjs + " --no-copyright -c -o " + dest + " " + tempfile.path;

            console.log(command);

            child_process.exec(command, function(error, stdout, stderr){
                if (error) { console.log(error); }
                next();
            });

        }


    })();

};