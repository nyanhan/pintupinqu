var util = require("./util");
var handlebars = require('./handlebars_clr');
var path = require('path');
var system = require('./system');
var url = require('url');

var CSS_REG = /@import\s+url\(\s*(['"]?)([^'"\)]*)?\1\s*\)/;
var JS_REG  = /!!document\.write.+src\s*=\s*(['"])([^'"]*)\1/;

function loopJSFilter(file){
    var lines = util.readLinesSync(file),
        dirname = path.dirname(file);

    lines.forEach(function(line, i){
        if (~line.indexOf("!!document.write")) {
            var ls = line.match(JS_REG);
            if (!ls) { return; }

            var pt = path.join(dirname, ls[2]).replace(/[\\\/]/g, system.SLASH);
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

            var pt = path.join(dirname, ls[2]).replace(/[\\\/]/g, system.SLASH);
            var mu = loopCSSFilter(pt);
            lines[i] = mu;
            console.log(" >> include %s", pt);
        }
    });

    return lines;
}


function makeupCssList(list, host, p, port, protocol){

    return list.map(function(data){

        return data.replace(CSS_REG, function(a, f, s){

            var temp = url.format({
                host: host,
                port: port,
                pathname: p,
                protocol: protocol
            });

            s = s.replace(/\\/g, "/");

            return "@import url(" + url.resolve(temp, s) + ")";
        });
    });
}

function makeupJsList(list, host, p, port, protocol){

    return list.map(function(data){

        return data.replace(JS_REG, function(a, f, s){

            var temp = url.format({
                host: host,
                port: port,
                pathname: p,
                protocol: protocol
            });

            f = "\\" + f;
            s = s.replace(/\\/g, "/");

            return "!!document.write('<script src=" + f + url.resolve(temp, s) + f;
        });

    });
}

exports.loopJSFilter = loopJSFilter;
exports.loopCSSFilter = loopCSSFilter;
exports.makeupCssList = makeupCssList;
exports.makeupJsList = makeupJsList;