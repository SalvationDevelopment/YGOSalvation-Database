/*jslint node:true*/
'use strict';

process.shell = require('shelljs'); // https://github.com/shelljs/shelljs

var enviroment = require('dotenv').config();

if (enviroment.parsed) {
	Object.keys(enviroment.parsed).forEach(function (env) {
		if (enviroment.parsed[env] !== process.env[env]) {
			console.log('Enviromental Variable "' + env + '" is not in the `.env` file.');
		}
	});
}

const fs = require('fs'),
	express = require('express'),
	path = require('path'),
	helmet = require('helmet'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	app = express(),
	child_process = require('child_process'),
	jsonGenerator = require('./generator.js'),
	server = require('http').createServer(app),
	Primus = require('primus'),
	primus = new Primus(server, {
		transformer: 'websockets',
		parser: 'JSON'
	});

process.env.LOCALHOST_PORT = process.env.API_LOCALHOST_PORT || 8082;



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
console.log('Application can be found at http://127.0.0.1:' + process.env.LOCALHOST_PORT);

primus.on('connection', function (spark) {
	spark.write({
		message: 'hello'
	});
});

app.get('/update', function (request, response, next) {
	jsonGenerator.getDB(function (error, newJSON) {
		const mainifest = JSON.stringify(newJSON);
		fs.writeFile('./http/manifest.json', mainifest, function () {
			response.setHeader('Content-Type', 'application/json');
			response.send(mainifest);
			next();
		});
	});
});

app.get('/git', function gitRoute(req, res, next) {
	res.send('Attempting to Update Server...<br />');
	child_process.spawn('git', ['pull'], {}, function () {
		res.send('Updated Server, generating files...');
		next();
	});
});