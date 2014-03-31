var net = require('net');
var JSONStream = require('json-stream');
var es = require('event-stream');
var pup = require('pup');

module.exports = function(source){	
	var server = net.createServer();
	
	server.on('connection', function(socket){
		var started = false;

		var stringified = es.mapSync(function(data){
			return JSON.stringify(data) + '\n';
		});
		
		function end(){	
			pup.unpipe(source, stringified);
			pup.unpipe(stringified, socket);	
			started = false;
		};
		
		//{"action": "start"}
		//{"action": "stop"}
		var actions = {
			start: function(command){
				if (started) return;
				
				pup.pipe(source, stringified);
				pup.pipe(stringified, socket);
				started = true;
			},
			stop: end
		};
		
		var jsonStream = new JSONStream();
	
		jsonStream.on('data', function(command){
			var action = command.action;
			if (action && actions[action]) actions[action](command);
		});
	
		socket.pipe(jsonStream);
		
		socket.on('end', end);
	});
	
	server.listen(4001);
}
