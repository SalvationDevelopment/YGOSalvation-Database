/*jslint node:true*/

/**
 * Generate single file exports from the database (using a static manifest)
 */

const fs = require('fs'),
	walk = require('fs-walk');

function splitJSON() {
	var full = require('./manifest_0-en-OCGTCG.json');

	full.forEach(function (card) {
		var data = JSON.stringify(card, null, 4),
			id = './json/' + card.id.toString() + '.json';

		fs.writeFileSync(id, data);
	});
}


function getDB(response, callback) {
	var db = [];
	walk.filesSync('./http/json/', function (basedir, filename, stat, next) {
		var data = fs.readFileSync(basedir + filename);

		try {
			db.push(JSON.parse(data));
		} catch (error) {
			response.write('Can not Parsed! ' + basedir + filename);
		}
	});
	callback(null, db);
}

module.exports = {
	getDB: getDB,
	splitJSON: splitJSON
};