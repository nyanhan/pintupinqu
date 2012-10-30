var exec = require('child_process').exec;
var os = require("os");
var path = require("path");

var rsync = os.platform().toLowerCase() !== "win32" ?
        "/usr/bin/rsync" : path.resolve(__dirname, "tools/rsync.exe")


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
    rsync,
    '-rzvh --chmod=a+rwx',
    options.file,
    (options.user == undefined ? '' : options.user+'@') + options.host + ':' + options.path
  ];

  if (options.key) {
      command.push("-e \"ssh -i " + options.key + "\"");
  }

  command.push("--exclude .git/");
  command.push("--exclude .gitignore");
  command.push("--exclude sftp-config.json");
  command.push("--exclude *.pyc");

  console.log(command.join(' '));
  exec(command.join(' '), function (err, stdout, stderr) {
    if (cb) {
      cb(err, stdout, stderr);
    } else {
      if (err) throw new Error(err);
    }
  });
}