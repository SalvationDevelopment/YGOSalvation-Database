/*jslint node:true*/
'use strict';

process.shell = require('shelljs'); // https://github.com/shelljs/shelljs
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


var enviroment = require('dotenv').config();

if (enviroment.parsed) {
    Object.keys(enviroment.parsed).forEach(function(env) {
        if (enviroment.parsed[env] !== process.env[env]) {
            console.log('Enviromental Variable "' + env + '" is not in the `.env` file.');
        }
    });
}

const fs = require('fs'),
    http = require('https'),
    express = require('express'),
    path = require('path'),
    helmet = require('helmet'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    app = express(),
    child_process = require('child_process'),
    jsonGenerator = require('./generator.js'),
    serveIndex = require('serve-index'),
    server = require('http').createServer(app),
    Primus = require('primus'),
    primus = new Primus(server, {
        transformer: 'websockets',
        parser: 'JSON'
    });

let mutex = false;

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
app.use('/', serveIndex((path.join(__dirname, '/http'))));




// Start Express
server.listen(process.env.LOCALHOST_PORT);
console.log('Application can be found at http://127.0.0.1:' + process.env.LOCALHOST_PORT);

// Setup websocket connection for doing stuff.
primus.on('connection', function(spark) {
    spark.write({
        message: 'hello'
    });
});

function unsetMutex() {
    mutex = false;
}
/**
 * Regenerate database manifest
 * @param {Object} request - Express request object
 * @param {Object} response 
 * @param {function} next 
 */
function regenerate(request, response, next) {

    if (mutex) {
        response.write('An update is in progress currently, wait 15 seconds.\r\n');
        response.end();
        next();
        return;
    }

    mutex = true;
    setTimeout(unsetMutex, 15000);
    jsonGenerator.getDB(response, function(error, newJSON) {
        const mainifest = JSON.stringify(newJSON);
        response.write('Saving!\r\n');
        fs.writeFile('./http/manifest.json', mainifest, function() {
            response.write('Saved, Notifying...\r\n');
            var call = http.get({
                host: 'ygosalvation.com',
                path: '/git'
            }, function(appresponse) {
                response.write('Notified!\r\n');
                response.end();
                next();
            });
            call.on('data', function(data) {
                response.write(data);
            });
            call.on('error', function(errorMessage) {
                response.write('Unable to notify main server\r\n');
                response.write(JSON.stringify(errorMessage));
                response.end();
                next();
            });
            call.end();
        });
    });
}

function gitRoute(request, response, next) {
    response.setHeader('Content-Type', 'application/json');
    response.write('Attempting to Update Server...\r\n');
    var gitShell = child_process.exec('git pull', {}, function(error, stdout, stderr) {
        if (error) {
            response.write(JSON.stringify(error) + '\r\n\r\n');
        }
        response.write(JSON.stringify(stdout) + '\r\n\r\n');
        regenerate(request, response, next);
    });
}

function cdbRoute(request, response, next) {
    response.setHeader('Content-Type', 'text/html');
    response.write('Attempting to Update card database sqlite file...\r\n');
    var gitShell = child_process.exec('git pull', {}, function(error, stdout, stderr) {
        if (error) {
            response.write(JSON.stringify(error) + '\r\n\r\n');
        }
        response.write(JSON.stringify(stdout) + '\r\n\r\n');
        jsonGenerator.generateCDB({}, response, function(){
            
        });
    });
}

// Setup routes
app.get('/update', regenerate);
app.get('/git', gitRoute);
app.get('/cdb', cdbRoute);
app.post('/git', gitRoute);