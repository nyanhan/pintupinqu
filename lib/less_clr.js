var path = require("path");
var child_process = require("child_process");

exports.build = function(from, to){
    var lessc = path.resolve(__dirname, "../node_modules/.bin/lessc");
    var command = lessc + " " + from + " > " + to;

    console.log(to + "\n\033[32m---------- " + new Date() + " ----------\033[0m");

    child_process.exec(command, function(error, stdout, stderr){
        if (error) {  console.error(error); }
    });
}

exports.buildAll = function(p) {

}