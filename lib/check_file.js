require("./config");

var dns = require('dns')
    , argv = require('optimist').argv
    , path = require('path')
    , fs = require('fs')
    , url = require('url')
    , http = require('http')
    , util = require('util');


(function(){

  var dir_name = argv.p;

  if (!PROJECT_ROOT) {
      global.PROJECT_ROOT = process.cwd();
  }

  if (!dir_name) {
    console.log("\nPlease select your project(number/name): \n");
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        dir_name = chunk.toString().trim();

        if (mem[dir_name]) { dir_name = mem[dir_name]; }

        process.nextTick(function () { run_checker(dir_name); });
    });

    var files = fs.readdirSync(PROJECT_ROOT)
      , out = [], mem = [];

      files.forEach(function(item){
        if (item.indexOf(".") !== 0 && !(/^css|js|libs|res$/.test(item))) {
          out.push(item);
          mem.push(item);
        }
      });

    for (var i = 0, n = 0, l = out.length; i < l; i+=3) {
      console.log(util.format('%s%s%s', format(out.shift(), n++), format(out.shift(), n++), format(out.shift(), n++)));
    }

  } else {
    run_checker(dir_name);
  }

  function format(str, index){

    var length = 20;

    str = str || "";

    length = length - str.length;

    return str ? index + ". " + str + new Array(length + 1).join(" ") : "";
  }

})();

function run_checker(dir_name){

  var project_dir = path.join(PROJECT_ROOT, dir_name)
    , srclist = [];

  fs.readFile(path.join(project_dir, VER_FILE), function(err, data){
    if (err) {
      console.log("[ERROR]: " + path.join(project_dir, VER_FILE) + " does not exists .");
      process.exit(0);
    }

    data = data.toString().trim();

    var files = deepLoopFiles(project_dir);

    files.forEach(function(item){

      if (/srclist\.(css|js)$/.test(item)) {

        var p = item.replace(PROJECT_ROOT, "")
			.replace("srclist", data)
			.replace(/\\/g, "/")
			.replace("/src/", "/prd/");


        srclist[srclist.length] = {
          port: 80,
          path: p,
          headers: { "Host": SERVER_DOMAIN },
          method: "HEAD"
        };
      }

    });

  });

  dns.resolve4(SERVER_DOMAIN, function (err, addresses) {
    if (err) throw err;

    var error = 0;

    (function(){

      var one = addresses.shift()
          , self = arguments.callee
          , length = srclist.length;

      if (!one) {
        console.log("[RESULT]: TEST END >>>>>>>>>>>>>>> ERRORS: " + error);
        process.exit(0);
      }
      else {

          console.log("[LOG] :HOST " + one + ":");

          srclist.forEach(function(addr){
            addr.host = one;

            http.request(addr, function(res) {
              console.log("[LOG] :" + addr.path + " >>>>>>> " + res.statusCode);
              handle(res.statusCode);
            }).on('error', function(e) {
              console.log("[ERROR] :" + e);
              handle();
            }).end();
          });

          function handle(code){

            if (code !== 200) {
              error ++;
            }

            length --;

            if (length <= 0) {
              console.log("\n");
              self();
            }
          }
      }

    })();


  });

}


function deepLoopFiles(root){

  var res = []
      , files = fs.readdirSync(root);

  files.forEach(function(file){

    var pathname = path.join(root, file)
        , stat = fs.lstatSync(pathname);

    if (!stat.isDirectory()){
       res.push(pathname);
    } else {
       res = res.concat(deepLoopFiles(pathname));
    }

  });

  return res;
}