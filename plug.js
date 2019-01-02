/*
Copyright(C) 2019 Brandan Tyler Lasley

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
GNU General Public License for more details.
*/

/* Usage:
Turn on plug: node test.js [ip addr]
Turn off plug: node test.js [ip addr] poweroff
*/

var 		args 			= process.argv.slice(2);
const 		fs 				= require('fs');
const 		{ Client } 		= require('tplink-smarthome-api');
const 		client 			= new Client();
var 		ip_addr 		= undefined;
var 		powerstatus 	= true;
var 		data_dir		= "C:\\Users\\Brandan Lasley\\Documents\\ttest\\"

if (args[0] !== undefined)
{
	ip_addr = args[0];
	console.log(ip_addr);
}

if (args[1] !== undefined)
{
	console.log("Powering off..");
	powerstatus = false;
}

var			data_path 		= data_dir + ip_addr + "-cam.txt"
let 		plug 			= client.getPlug({host: ip_addr});
var 		j 				= Promise.resolve(plug.getSysInfo());
var 		relay_status 	= -1;

j.then(function(data) 
{
	var sysinfo = (data);
    relay_status = sysinfo.relay_state;
	
	// If plug is off and power on is true.
	if (!relay_status && powerstatus)
	{
		console.log("Power is off and trying to turn on");
		plug.setPowerState(powerstatus);
		// Make a note that this script turned on the plug.
		fs.writeFile(data_path, "0", {flag: "w"}, function(err) 
		{
			if(err) 
			{
				return console.log(err);
			}
		}); 
	}
	// If plug is on and power status is on aka this plug 
	// is already turned on at the time of activation meaning 
	// we should leave it alone and not mess with it.
	else if (relay_status && powerstatus)
	{
		console.log("Power is on and trying to turn on");
		// Make a note that WE DID NOT turn on this plug.
		fs.writeFile(data_path, "1", {flag: "w"}, function(err) 
		{
			if(err) {
				return console.log(err);
			}
		}); 
	} 
	else if (relay_status && !powerstatus)
	{
		console.log("Power is on and trying to turn off");	
		fs.exists(data_path, function(exists) 
		{
			if (exists) 
			{ 
				fs.readFile(data_path, 'utf8', (err, data) => 
				{
					if (err) throw err;
					// If we did not turn on this plug abort!
					if (data === "1")
					{
						console.log("Power shut off aborted!");
						process.exit(-1);
					}
				}); 
			} 
		}); 
		// If we did turn on this plug turn it off.
		plug.setPowerState(powerstatus);
	}
});