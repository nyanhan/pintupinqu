var hogan = require('hogan.js'),
    path = require('path'),
    fs = require('fs');

exports.build = function(l){

    var builded = 'if(typeof QTMPL === "undefined"){var QTMPL={};}\n';
    var name = path.basename(l, '.mustache');

    var file = fs.readFileSync(l);

    try{
        builded += 'QTMPL.' + name + ' = new Hogan.Template(' + hogan.compile(file.toString(), { asString: 1 }) + ');';
    } catch(e){
        console.log(e);
    }

    return builded;
}