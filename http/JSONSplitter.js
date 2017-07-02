/*jslint node:true*/

/**
 * Generate single file exports from the database (using a static manifest)
 */

const fs = require('fs'),
	walk = require('fs-walk');

function splitJSON() {
	var full = require('./manifest_0-en-OCGTCG.json');

	full.forEach(function (card) {
		var data = JSON.stringify(card),
			id = './json/' + card.id.toString() + '.json';

		fs.writeFileSync(id, data);
	});
}


function getDB(callback) {
	var db = [];
	walk.files('/etc', function (basedir, filename, stat, next) {
		fs.readFile(filename, function (data) {
			try {
				db.push(json.parse(data));
				next();
			} catch () {
				next();
			}
		})
	}, function (err) {
		if (err) {
			callback(error, db);
		} else {
			callback(null, db)
		}
	});

}


module.exports = {
	getDB: getDB,
	splitJSON: splitJSON
};