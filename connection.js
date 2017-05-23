/*jslint node:true, plusplus:true*/
'use strict';

var url = require('url'),
	MONGO_DB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/ygo',
	mongo = require('mongodb'),
	MongoClient = mongo.MongoClient;

/*
 * Establish a Database connection and set the resulting connection to the global state.
 * @param {function} callback upon connection completion
 */
function establishDatabaseConnection(finishingCallback) {
	var database,
		gfs;


	function connected(callback) {
		var status = Boolean(database);
		if (!status) {
			if (typeof callback === 'function') {
				callback(new Error('Not connected to database'));
			}
			return false;
		}
		return true;

	}

	function externalConnectionCheck(callback) {
		var status = Boolean(database);
		if (!status) {
			callback(new Error('Not connected to database'));
			return false;
		}
		callback(null);
	}

	/**
	 * Attempt a database connection.
	 * @param {function} callback upon finishing connection attempt.
	 */
	function attemptConnection(callback) {
		MongoClient.connect(MONGO_DB_URL, function (error, db) {
			database = db;
			if (error) {
				callback(error, database);
				return;
			}

			db.on('close', function () {
				database = null;
			});






			callback(error, db);
			return;
			// state that the database is connected.

		});
	}

	/**
	 * Checking for connection function.
	 */
	function maintainConnection() {
		if (!connected()) {
			attemptConnection(function (error, status) {
				if (error) {
					console.message.error(error.message);
					return;
				}
				console.message.debug('Re-established connection to ' + MONGO_DB_URL);
			});
		}
	}



	// Initate and maintain the connection
	setInterval(maintainConnection, 10000);
	attemptConnection(finishingCallback);

	return {
		attemptConnection: attemptConnection,
		isConnected: externalConnectionCheck
	};
}

module.exports = establishDatabaseConnection;
