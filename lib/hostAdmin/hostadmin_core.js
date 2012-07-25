var host_file_wrapper = require("./hostadmin_file_wrapper");

const ip_regx = /^((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/;
// copy from http://forums.intermapper.com/viewtopic.php?t=452
const ip6_regx = /^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?$/;


var lines, hosts, groups;

/**
 * load hosts
 * copy from hostAdmin
 */

var line_enable = function(ip){
	if(!ip.using){
		lines[ip.line] = lines[ip.line].replace(/^(\s*#\s*)+/,"");
	}
	ip.using = true;
};

var line_disable = function(ip){
	if(ip.using){
		lines[ip.line] = "# " + lines[ip.line];
	}
	ip.using = false;
};

var host_enable = function(host_name, ip_p){

	var host = hosts[host_name] || [];

	host.forEach(function(ip, i){
		if (ip_p) {
		    if (ip.addr == ip_p) {
		        line_enable(ip);
		    }
		} else {
			line_enable(ip);
		}
	});
};

var host_disable = function(host_name, ip_p){

	var host = hosts[host_name] || [];

	host.forEach(function(ip, i){
		if (ip_p) {
		    if (ip.addr == ip_p) {
		        line_disable(ip);
		    }
		} else {
			line_disable(ip);
		}
	});
};

var get_group_by_name = function(group_name){

	var ids = [];

	for(var k in groups){
		if (group_name == groups[k]) {
		    ids.push(k);
		}
	}

	return ids;
};

var get_ip_by_group = function(id){

	var host, ips = [];

	for(var k in hosts){
		host = hosts[k];

		host.forEach(function(ip){
			if (ip.group == id) {
			    ips.push(ip);
			}
		});
	}

	return ips;
};

var group_enable = function(group_name){
	var ids = get_group_by_name(group_name);
	var ips = [];

	if (ids.length) {
	    console.log("#==== Group [%s] open. ====", length10(group_name));
	} else {
		console.log("#==== No group named [%s]. ====", length10(group_name));
	}

	ids.forEach(function(id){
		ips = ips.concat(get_ip_by_group(id));
	});

	ips.forEach(function(ip){
		line_enable(ip);
	});
	
};

var group_disable = function(group_name){
	var ids = get_group_by_name(group_name);
	var ips = [];

	if (ids.length) {
	    console.log("#==== Group [%s] closed. ====", length10(group_name));
	} else {
		console.log("#==== No group named [%s]. ====", length10(group_name));
	}

	ids.forEach(function(id){
		ips = ips.concat(get_ip_by_group(id));
	});

	ips.forEach(function(ip){
		line_disable(ip);
	});
	
};

var mk_host = function(){
	var str = "";
	for (var i in lines){
		str += lines[i];
	}
	return str;
};

var length10 = function(str){
	if (str.length >= 10) {
	    return str;
	} else {
		return new Array(Math.floor(5 - str.length/2)).join(" ")
			+ str + new Array(Math.ceil(5 - str.length/2)).join(" ");
	}
};

exports.group_enable = group_enable;
exports.group_disable = group_disable;
exports.output = function(){
	var data = mk_host();

	host_file_wrapper.set(data);
};

(function() {

	lines = [];
	hosts = {};
	groups = {};
	//read
	var host = host_file_wrapper.get();
	
	if (host && host.charAt(host.length - 1) != "\n"){ //fix no lf
		host += host_file_wrapper.Spliter;
	}

	var l_p = 0; //pointer to line
	const regx = /(.*?)\r?\n/mg
	var l = null;
	var group_id = 0;
	var group_c = 0;

	while(l = regx.exec(host)){
		l = l[0];
		
		lines[l_p++] = l;
		
		l = l.replace(/^(\s*#)+/,"#");
		l = l.replace(/#/g," # ");
		l = l.replace(/^\s+|\s+$/g,"");
		l = l.replace(/\s+/g," ");
		
		var tks = l.split(" ");

		if (tks[0] == "#" && tks[1] == "===="){
			if(group_c == 0){
				group_id++;
			}

			if(group_c++ % 2 == 0){
				tks.splice(0,2);

				var group_name = tks.join(" ");

				if(!group_name){
					group_name = "Group " + group_id;
				}

				groups[group_id] = group_name;
			}else{
				group_id++;
			}
			continue;	
		}
					
		var using = true;
		if (tks[0] == "#"){
			using = false;
			tks.splice(0,1);
		}
		
		var ip = "";
		if (ip_regx.test(tks[0]) || ip6_regx.test(tks[0])){
			ip = tks[0];
			tks.splice(0,1);
		}else{
			continue;
		}
		
		var comment = "";

		var names = [];
		var findc = false;
		for (var i in tks){
			if(tks[i] == "#"){
				findc = true;
				continue;
			}
			
			if(findc){
				comment += tks[i] + " ";
			}else{
				names.push(tks[i]);
			}
		}


		ip = {
			addr : ip, 
			using : using ,
			line : l_p - 1,
			comment : comment,
			group : group_id
		};

		for (var i in names){
			var name = names[i];
			if(typeof hosts[name] == "undefined"){
				hosts[name] = [];
			}
		
			hosts[name].push(ip);
		}
	}
})();

