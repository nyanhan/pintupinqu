var util       = require("./util");
var handlebars = require('./handlebars_clr');
var path       = require('path');
var url        = require('url');

var CSS_REG = /@import\s+url\(\s*(['"]?)([^'"\)]*)?\1\s*\).+/;
var JS_REG  = /!!document\.write.+src\s*=\s*(['"])([^'"]*)\1.+/;

exports.css_readlines = loopCSSFilter;
exports.js_readlines = loopJSFilter;

function loopJSFilter(file){
    var lines = util.readLinesSync(file),
        dirname = path.dirname(file),
        exist = {};

    lines.forEach(function(line, i){
        if (~line.indexOf("!!document.write")) {
            var ls = line.match(JS_REG);
            if (!ls) { return; }

            var pt = path.resolve(dirname, ls[2]);
            var mu;

            if (!exist[pt]) {
                if (/.handlebars$/.test(pt)) {
                    mu = handlebars.build(pt);
                } else {
                    mu = loopJSFilter(pt);
                }

                lines[i] = mu;
                console.log(" >> include %s", pt);
                exist[pt] = 1;
            } else {
                console.log("%s already exist..", pt);
            }

            
        }
    });

    return lines;
}

function loopCSSFilter(file){
    var lines = util.readLinesSync(file),
        dirname = path.dirname(file),
        exist = {};

    lines.forEach(function(line, i){

        if (~line.indexOf("@import")) {
            var ls = line.match(CSS_REG);
            if (!ls) { return; }

            var pt = path.resolve(dirname, ls[2]);
            var mu;

            if (!exist[pt]) {

                if (/.less$/.test(pt)) {
                    mu = loopCSSFilter(pt.replace("/_src_/less/", "/_src_/less_temp/"));
                } else {
                    mu = loopCSSFilter(pt);
                }
                lines[i] = mu;
                console.log(" >> include %s", pt);
                exist[pt] = 1;
            } else {
                console.log("%s already exist..", pt);
            }

        }
    });

    return lines;
}


exports.makeup_path = function(data, type, pathObject){

    var exist = {};

    switch(type) {
        case "js":

            return data.map(function(d){

                var returnString = "";

                d.replace(JS_REG, function(a, f, s){

                    var temp = url.format(pathObject);

                    if (f) {
                        f = "\\" + f;   
                    }
                    
                    s = s.replace(/\\/g, "/");

                    returnString = f + url.resolve(temp, s) + f;

                });

                if (returnString.trim()) {
                    if (!exist[returnString]) {
                        exist[returnString] = 1;
                        return "!!document.write('<script src=" + returnString + "></script>')";
                    } else {
                        console.log("%s already exist..", returnString);
                        return "";
                    }    
                } else {
                    return "";
                }

                
                
            });

        case "css":

            return data.map(function(d){

                var returnString = "";

                d.replace(CSS_REG, function(a, f, s){

                    var temp = url.format(pathObject);

                    s = s.replace(/\\/g, "/");

                    returnString = url.resolve(temp, s);
                });

                if (returnString.trim()) {
                    if (!exist[returnString]) {
                        exist[returnString] = 1;
                        return "@import url(" + returnString + ");";
                    } else {
                        console.log("%s already exist..", returnString);
                        return "";
                    }

                } else {
                    return "";
                }
            });

        default:
            break;
    }
};