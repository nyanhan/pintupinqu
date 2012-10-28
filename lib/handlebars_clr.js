var handlebars = require("handlebars");
var path       = require("path");
var fs         = require("fs");

exports.build = function(l){

    var name = path.basename(l, '.handlebars');

    var options = {
        knownHelpers     : {},
        knownHelpersOnly : false
    };

    var output = '(function() {\n  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};\n';

    var file = fs.readFileSync(l, "utf-8");

    output += 'templates[\'' + name + '\'] = template(' + handlebars.precompile(file, options) + ');\n';

    output += '})();';

    return output;
};