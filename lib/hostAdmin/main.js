#!/usr/bin/env node

var hostAdmin = require("./hostadmin_core");
var argv = require('optimist').argv;

var open = argv.o;
var close = argv.c;
var rule = argv.r;

if (typeof open !== "string" && typeof close !== "string" 
    && typeof rule !== "string") {
    console.log("Help:");
    console.log("    hosts -o example, open  [ example ] group in Hosts.");
    console.log("    hosts -c example, close [ example ] group in Hosts.");
    console.log("    hosts -r local, open [ local ] group, close theris.");
    console.log("\nGroup defined:");
    console.log("    #==== example");
    console.log("    127.0.0.1 example.com");
    console.log("    #==== ");
    process.exit(0);
}


if (open) {
    hostAdmin.group_enable(open);
}

if (close) {
    hostAdmin.group_disable(close);
}

function closeAll(){
    hostAdmin.group_disable("local");
    hostAdmin.group_disable("dev");
    hostAdmin.group_disable("beta");
}

if (rule === "local" || rule === "dev" || rule === "beta" || rule === "prd") {
    closeAll();

    if (rule !== "prd") {
        hostAdmin.group_enable(rule);    
    }
    
}

hostAdmin.output();