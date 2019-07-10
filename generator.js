/*jslint node:true*/

/**
 * Generate single file exports from the database (using a static manifest)
 */

const fs = require('fs'),
    walk = require('fs-walk'),
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
        return card.links.map(function(link) {
            return links[link]
        }).reduce(function(a, b) { return a + b });
    } else {
        return card.def || 0;
    }
}

function splitJSON() {
    var full = require('./manifest_0-en-OCGTCG.json');

    full.forEach(function(card) {
        var data = JSON.stringify(card, null, 4),
            id = './json/' + card.id.toString() + '.json';

        fs.writeFileSync(id, data);
    });
}


function mysql_real_escape_string(str) {
    'use strict';
    return str.replace(/[\0\x08\x09\x1a"\\\%]/g, function(char) {
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



function getDB(response, callback) {
    var db = [];
    walk.filesSync('./http/json/', function(basedir, filename, stat, next) {
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