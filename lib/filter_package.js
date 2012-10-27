var util       = require("./util");
var handlebars = require('./handlebars_clr');
var path       = require('path');
var url        = require('url');

var CSS_REG = /@import\s+url\(\s*(['"]?)([^'"\)]*)?\1\s*\)/;
var JS_REG  = /!!document\.write.+src\s*=\s*(['"])([^'"]*)\1/;

exports.css_readlines = loopCSSFilter;
exports.js_readlines = loopJSFilter;

function loopJSFilter(file){
    var lines = util.readLinesSync(file),
        dirname = path.dirname(file);

    lines.forEach(function(line, i){
        if (~line.indexOf("!!document.write")) {
            var ls = line.match(JS_REG);
            if (!ls) { return; }

            var pt = path.join(dirname, ls[2]);
            var mu;

            if (/.handlebars$/.test(pt)) {
                mu = handlebars.build(pt);
            } else {
                mu = loopJSFilter(pt);
            }

            lines[i] = mu;
            console.log(" >> include %s", pt);
        }
    });

    return lines;
}

function loopCSSFilter(file){
    var lines = util.readLinesSync(file),
        dirname = path.dirname(file);

    lines.forEach(function(line, i){
        if (~line.indexOf("@import")) {
            var ls = line.match(CSS_REG);
            if (!ls) { return; }

            var pt = path.join(dirname, ls[2]);
            var mu = loopCSSFilter(pt);
            lines[i] = mu;
            console.log(" >> include %s", pt);
        }
    });

    return lines;
}


exports.makeup_path = function(data, type, pathObject){
    switch(type) {
        case "js":

            return data.map(function(d){
                return d.replace(JS_REG, function(a, f, s){

                    var temp = url.format(pathObject);

                    if (f) {
                        f = "\\" + f;   
                    }
                    
                    s = s.replace(/\\/g, "/");

                    return "!!document.write('<script src=" + f + url.resolve(temp, s) + f;
                });

            });

        case "css":

            return data.map(function(d){
                return d.replace(CSS_REG, function(a, f, s){

                    var temp = url.format(pathObject);

                    s = s.replace(/\\/g, "/");

                    return "@import url(" + url.resolve(temp, s) + ")";
                });
            });

        default:
            break;
    }
};