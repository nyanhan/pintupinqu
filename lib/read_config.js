var fs = require("fs");

var VERSION_FILE = "version";

exports.write_version = function(ver){
    fs.writeFileSync(VERSION_FILE, ver);
    console.log("[NOTICE]: New timestamp %s", ver);
}

exports.read_version = function(){
    var ver = null;

    try {
        ver = fs.readFileSync(VERSION_FILE).toString().trim();
    } catch(e) {
        console.log("[ERROR]: File %s parse Error. %s", VERSION_FILE, e);
        process.exit(0);
    }

    return ver;
}

