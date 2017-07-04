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


function getDB(callback) {
	var db = [];
	walk.files('./http/json/', function (basedir, filename, stat, next) {
		fs.readFile(basedir + filename, function (error, data) {
			try {
				if (error) {
					console.log('File Read Error', error)
					throw error;
				}
				db.push(JSON.parse(data));
				next();
			} catch (eee) {
				console.log('failed', data.length, basedir + filename, eee);
				next();
			}
		});
	}, function (err) {
		if (err) {
			callback(err, db);
		} else {
			callback(null, db);
		}
	});

}


module.exports = {
	getDB: getDB,
	splitJSON: splitJSON
};