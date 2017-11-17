/*jslint node:true*/

/**
 * Generate single file exports from the database (using a static manifest)
 */

const fs = require('fs'),
	walk = require('fs-walk'),
	SQL = require('sql.js');

function splitJSON() {
	var full = require('./manifest_0-en-OCGTCG.json');

	full.forEach(function (card) {
		var data = JSON.stringify(card, null, 4),
			id = './json/' + card.id.toString() + '.json';

		fs.writeFileSync(id, data);
	});
}


function maketextsSQL(card) {
	'use strict';
	var id = card.id,
		name = card.name,
		description = card.desc,
		str1 = card.str1.replace(/"/g, '""'),
		str2 = card.str2.replace(/"/g, '""'),
		str3 = card.str3.replace(/"/g, '""'),
		str4 = card.str4.replace(/"/g, '""'),
		str5 = card.str5.replace(/"/g, '""'),
		str6 = card.str6.replace(/"/g, '""'),
		str7 = card.str7.replace(/"/g, '""'),
		str8 = card.str8.replace(/"/g, '""'),
		str9 = card.str9.replace(/"/g, '""'),
		str10 = card.str10.replace(/"/g, '""'),
		str11 = card.str11.replace(/"/g, '""'),
		str12 = card.str12.replace(/"/g, '""'),
		str13 = card.str13.replace(/"/g, '""'),
		str14 = card.str14.replace(/"/g, '""'),
		datas = [id, name, '"' + mysql_real_escape_string(description) + '"', str1, str2, str3, str4, str5, str5, str6, str7, str8, str9, str10, str11, str11, str12, str13, str14].join(',');

	return 'INSERT OR REPLACE INTO "texts" VALUES (' + datas + ');';
}

function generateCDB(options) {
	var db = [],
		injections = [],
		cdb = new SQL.Database();
	walk.filesSync('./http/json/', function (basedir, filename, stat, next) {
		var data = fs.readFileSync(basedir + filename);

		try {
			db.push(JSON.parse(data));

		} catch (error) {
			response.write('Can not Parsed! ' + basedir + filename);
			console.log('ERROR!', basedir + filename)
		}
	});

	
	var dataStrings = db.map(function (card) {
		var id = card.id,
			ot = card.ot || 0,
			alias = card.alias || 0,
			setcode = card.setcode || -,
			type = card.type || 0,
			atk = card.atk || 0,
			def = card.def || 0,
			level = card.level || 0,
			race = card.race || 0,
			attribute = card.attribute || 0,
			category = card.category || 0,
			datasSQL = [id, ot, alias, setcode, type, atk, def, level, race, attribute, category].join(','),
			datas = 'INSERT OR REPLACE INTO "datas" VALUES (' + datas + ');\r\n'

		return datas;
	});

	var textStrings = db.map( maketextsSQL);

	cdb.run('CREATE TABLE "datas" (id, ot, alias, setcode, type, atk, def, level, race, attribute, category);');
	cdb.run('CREATE TABLE "texts" (id, name, description, str1, str2, str3, str4, str5, str5, str6, str7, str8, str9, str10, str11, str11, str12, str13, str14);');
	dataStrings.forEach(cdb.run);
	textStrings.forEach(cdb.run);

	var data = db.export();
	var buffer = new Buffer(data);
	fs.writeFileSync("cards.cdb", buffer);
	


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
	splitJSON: splitJSON
};