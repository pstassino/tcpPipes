var net = require('net');
var fs = require('fs');
var JSONStream = require('json-stream');
var es = require('event-stream');

var	filePath = __dirname + '/logs.json';
var file = fs.createWriteStream(filePath, {flags: 'a'});

var source = es.mapSync(function(data){
	return data;
});

var stringified = es.mapSync(function(data) {
	return JSON.stringify(data) + '\n';
});

source
	.pipe(stringified)
	.pipe(file);

var server = net.createServer();

server.on('connection', function(socket) {
	var jsonStream = new JSONStream();
	
	socket
		.pipe(jsonStream)
		.pipe(source, {end: false});
});

server.listen(4000);

module.expoerts = source;