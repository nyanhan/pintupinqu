var fs = require("fs");
var iconv = require("iconv-lite");


var WINNT, Hosts, Charset, Spliter;

exports.WINNT = WINNT = (/win/i).test(process.platform) && !(/darwin/i).test(process.platform);
exports.Hosts = Hosts = WINNT ? "C:\\windows\\system32\\drivers\\etc\\hosts" : "/etc/hosts";
exports.Charset = Charset = WINNT ? "gbk" : "utf-8";
exports.Spliter = Spliter = WINNT ? "\r\n" : "\n";


exports.get = function(){
    return iconv.encode(fs.readFileSync(Hosts), Charset).toString();
};

exports.set = function(str){
    var buf = new Buffer(str);
    var data = iconv.decode(buf, Charset);

    fs.writeFile(Hosts, data, function (err) {
        if (err && err.code === "EACCES") {
            console.log("[Error]: No permition to write to %s.", err.path);
        }
    });
};