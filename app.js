/*jslint node:true*/
'use strict';

var express = require('express'),
	path = require('path'),
	helmet = require('helmet'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	app = express(),
	server = require('http').createServer(app),
	Primus = require('primus'),
	primus = new Primus(server, {
		transformer: 'websockets',
		parser: 'JSON'
	});





// Connect the middleware to express.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());
primus.save(__dirname + '/http/js/vendor/primus.js');
console.log(path.join(__dirname, '/http'));
// Connect Express Routes
app.use(express['static'](path.join(__dirname, '/http')));




// Start Express
server.listen(process.env.LOCALHOST_PORT);
console.message.info('Application can be found at http://127.0.0.1:' + process.env.LOCALHOST_PORT);

primus.on('connection', function (spark) {
	spark.write({
		message: 'hello'
	});
});
