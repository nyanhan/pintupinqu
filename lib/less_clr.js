var less   = require("less");
var fs     = require("fs");
var util   = require("./util");
var async  = require("async");
var mkdirp = require('mkdirp');
var path   = require('path');

exports.build = function(l, callback){

    var file = fs.readFileSync(l, "utf-8").toString();

    less.render(file, function (e, css) {

        if (e) {
            console.error("Build less file %s failed.. \n %s", l, e);
            process.exit(1);
        }

        callback(css);
    });
};

function iterator(l, callback){

    var file = fs.readFileSync(l, "utf-8").toString();

    less.render(file, function (e, css) {

        if (e) {
            console.error("Build less file %s failed.. \n %s", l, e);
        }

        var temp_file = l.replace("/_src_/less/", "/_src_/less_temp/");

        mkdirp.sync(path.dirname(temp_file));

        fs.writeFileSync(temp_file, css);

        callback();
    });
}

exports.build_temp = function(folder, fn){
    var files = util.readFilesDeep(folder, /\.less$/);

    async.map(files, iterator, function(err, results){
        fn(!err);
    });
};