/*jslint node:true*/

/**
 * Generate single file exports from the database (using a static manifest)
 */

const fs = require('fs'),
	walk = require('fs-walk'),
	sqlite3 = require('sqlite3').verbose(),
	links = {
		5: 0x001,
		6: 0x002,
		7: 0x004,
		4: 0x008,
		5: 0x020,
		0: 0x040,
		1: 0x080,
		2: 0x100,
	}

function mapDef(card) {
	if (typeof card.def === 'string' && card.links) {
		return card.links.map(function (link) {
			return links[link]
		}).reduce(function (a, b) { return a + b });
	} else {
		return card.def || 0;
	}
}

function splitJSON() {
	var full = require('./manifest_0-en-OCGTCG.json');

	full.forEach(function (card) {
		var data = JSON.stringify(card, null, 4),
			id = './json/' + card.id.toString() + '.json';

		fs.writeFileSync(id, data);
	});
}


function mysql_real_escape_string(str) {
	'use strict';
	return str.replace(/[\0\x08\x09\x1a"\\\%]/g, function (char) {
		switch (char) {
			case "\0":
				return "\\0";
			case "\x08":
				return "\\b";
			case "\x09":
				return "\\t";
			case "\x1a":
				return "\\z";
			case "\n":
				return "\\n";
			case "\r":
				return "\\r";
			case "\"":
				return '""';
			case "\\":
			case "%":
				return "\\" + char; // prepends a backslash to backslash, percent,
			// and double/single quotes
		}
	});
}

function quote(str) {
	return "''";
	return '"' + str + '"';
}
function maketextsSQL(card) {
	'use strict';
	var id = card.id,
		name = quote(card.name),
		description = quote((card.str14 || "")),
		str1 = quote((card.str11 || "").replace(/"/g, '""')),
		str2 = quote((card.str12 || "").replace(/"/g, '""')),
		str3 = quote((card.str13 || "").replace(/"/g, '""')),
		str4 = quote((card.str4 || "").replace(/"/g, '""')),
		str5 = quote((card.str5 || "").replace(/"/g, '""')),
		str6 = quote((card.str6 || "").replace(/"/g, '""')),
		str7 = quote((card.str7 || "").replace(/"/g, '""')),
		str8 = quote((card.str8 || "").replace(/"/g, '""')),
		str9 = quote((card.str9 || "").replace(/"/g, '""')),
		str10 = quote((card.str10 || "").replace(/"/g, '""')),
		str11 = quote((card.str11 || "").replace(/"/g, '""')),
		str12 = quote((card.str12 || "").replace(/"/g, '""')),
		str13 = quote((card.str13 || "").replace(/"/g, '""')),
		str14 = quote((card.str14 || "").replace(/"/g, '""')),
		texts = [id, name, description, str1, str2, str3, str4, str5, str6, str7, str8, str9, str10, str11, str12, str13, str14].join(' , ');

	return 'INSERT INTO texts VALUES (' + texts + ');';
}

function generateCDB(options, response, callback) {
	var db = [],
		injections = [];

	fs.unlinkSync('cards.cdb');
	var cdb = new sqlite3.Database('cards.cdb');

	response.write('Collecting Cards from file...<br />');
	walk.filesSync('./http/json/', function (basedir, filename, stat, next) {
		var data = fs.readFileSync(basedir + filename);

		try {
			db.push(JSON.parse(data));

		} catch (error) {
			response.write('Can not Parsed! ' + basedir + filename);
			console.log('ERROR!', basedir + filename)
		}
	});

	response.write('Generting data for ' + db.length + ' cards...<br />');
	var dataStrings = db.map(function (card) {
		var id = card.id,
			ot = card.ot || 0,
			alias = card.alias || 0,
			setcode = card.setcode || 0,
			type = card.type || 0,
			atk = card.atk || 0,
			def = mapDef(card.def),
			level = card.level || 0,
			race = card.race || 0,
			attribute = card.attribute || 0,
			category = card.category || 0,
			datasSQL = [id, ot, alias, setcode, type, atk, def, level, race, attribute, category].join(' , '),
			datas = 'INSERT INTO datas VALUES (' + datasSQL + ');'

		return datas;
	});


	response.write('Generting text for ' + db.length + ' cards...<br />');
	var textStrings = db.map(maketextsSQL);

	function runQuery(query) {

		var stmt = cdb.prepare(query)
		stmt.run(function () {
			response.write(query + ' <br />');
		});
		stmt.finalize();
	}
	cdb.serialize(function () {
		response.write('Creating in memory database...<br />');
		cdb.run('CREATE TABLE datas (id, ot, alias, setcode, type, atk, def, level, race, attribute, category);', function () {
			cdb.parallelize(function () {
				response.write('Writing data...<br />');
				dataStrings.forEach(runQuery);
			});
		});
		cdb.run('CREATE TABLE texts (id, name, description, str1, str2, str3, str4, str5, str6, str7, str8, str9, str10, str11, str12, str13, str14);', function () {
			cdb.parallelize(function () {
				response.write('Writing text...<br />');
				textStrings.forEach(runQuery);
			});
		});

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
					console.log('ERROR!', basedir + filename)
				}
			});
			callback(null, db);
		}

module.exports = {
			getDB: getDB,
			splitJSON: splitJSON,
			generateCDB: generateCDB
		};