var exec = require('child_process').exec;
var os = require("os");
var path = require("path");

var scp = os.platform().toLowerCase() !== "win32" ?
        "/usr/bin/scp" : path.resolve(__dirname, "tools/pscp.exe")




/*
 * Transfer a file to a remote host
  * file
  * user
  * host
  * port
  * path
  * key 
 */
exports.send = function (options, cb) {
  var command = [
    scp,
    '-r -C',
    "-P " + (options.port || '22'),
    options.file,
    (options.user == undefined ? '' : options.user+'@') + options.host + ':' + options.path
  ];

  if (options.key) {
      command.push("-i " + options.key);
  }
  console.log(command.join(' '));
  exec(command.join(' '), function (err, stdout, stderr) {
    if (cb) {
      cb(err, stdout, stderr);
    } else {
      if (err) throw new Error(err);
    }
  });
}