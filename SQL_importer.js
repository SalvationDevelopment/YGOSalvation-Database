'use strict';
const time = 0,
    zlib = require('zlib'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    domain = require('domain'),
    colors = require('colors'),
    SQL = require('sql.js'),
    jsonfile = require('jsonfile');




function gitError(error) {
    console.log('Issue with git', error);
}


function getotString(ot) {
    switch (ot) {
        case 1:
            return 'OCG';
        case 2:
            return 'TCG';
        case 3:
            return 'OCG/TCG';
        case 4:
            return 'Anime';
        case 5:
            return 'OCG Prerelease';
        case 6:
            return 'TCG Prerelease';
        default:
            return '';
    }
}

function getdates(file, callback) {
    var filebuffer = fs.readFileSync(file),
        db = new SQL.Database(filebuffer),
        string = 'SELECT * FROM pack;',
        texts = db.prepare(string),
        asObject = {
            texts: texts.getAsObject({
                'id': 1
            })
        },
        output = [],
        row;

    // Bind new values
    texts.bind({
        name: 1,
        id: 2
    });
    while (texts.step()) { //
        row = texts.getAsObject();
        output.push(row);
    }
    db.close();
    return output;
}

function getcards(file, callback) {
    fs.readFile(file, function(error, filebuffer) {
        if (error) {
            console.log(error);
        }
        var db = new SQL.Database(filebuffer),
            string = 'SELECT * FROM datas, texts WHERE datas.id = texts.id;',
            texts = db.prepare(string),
            asObject = {
                texts: texts.getAsObject({
                    'id': 1
                })
            },
            output = [],
            row,
            i,
            packs = {};


        function getCardObject(id, db) {

            var result = {};
            db.some(function(card, index) {
                if (id === card.id) {
                    result = card;
                    result.date = new Date(result.date).getTime();
                    return true;
                } else {
                    return false;
                }
            });

            return result;
        }


        texts.bind({
            id: 2
        });
        while (texts.step()) { //
            row = texts.getAsObject();

            row.cardpool = getotString(row.ot);
            //row.ocg = getCardObject(row.id, ocg_packs);
            //row.tcg = getCardObject(row.id, tcg_packs);
            output.push(row);
        }
        db.close();
        callback(null, output);
        return output;
    });



    // Bind new values

}



function inversionID(db) {
    var hastable = {};
    db.forEach(function(card) {
        hastable[card.id] = card;
    });

    return hastable;
}



function cardIs(cat, obj) {
    if (cat === 'monster' && (obj.race !== 0 || obj.level !== 0 || obj.attribute !== 0)) {
        return true;
    }
    if (cat === 'spell') {
        return (obj.type & 2) === 2;
    }
    if (cat === 'trap') {
        return (obj.type & 4) === 4;
    }
    if (cat === 'fusion') {
        return (obj.type & 64) === 64;
    }
    if (cat === 'synchro') {
        return (obj.type & 8192) === 8192;
    }
    if (cat === 'xyz') {
        return (obj.type & 8388608) === 8388608;
    }
}

function parseLevelScales(card) {
    var output = '',
        leftScale,
        rightScale,
        pendulumLevel,
        level = card.level,
        ranklevel = (cardIs('xyz', card)) ? '☆' : '★';
    if (level > 0 && level <= 12) {
        output += '<span class="levels">' + ranklevel + level;

    } else {
        level = String(level); // format: [0-9A-F]0[0-9A-F][0-9A-F]{4}
        leftScale = parseInt(level.charAt(0), 16); // first digit: left scale in hex (0-16)
        rightScale = parseInt(level.charAt(2), 16); // third digit: right scale in hex (0-16)
        pendulumLevel = parseInt(level.charAt(6), 16); // seventh digit: level of the monster in hex (technically, all 4 digits are levels, but here we only need the last char)
        output += '<span class="levels">' + ranklevel + pendulumLevel + '</span> <span class="scales"><< ' + leftScale + ' | ' + rightScale + ' >>';
    }
    return output + '</span>';
}

function splitJSON(inject) {


    inject.forEach(function(card) {
        var data = JSON.stringify(card, null, 4),
            id = './http/json/' + card.id.toString() + '.json';
        try {
            const old = fs.readFileSync('./http/json/' + data.id + '.json');

            try {

                fs.writeFileSync(id, Object.assign(card, data, JSON.parse(old)));
            } catch (e) {
                console.log('unable to write', id);
                fs.writeFileSync(id, data);
            }
        } catch (e0) {
            fs.writeFileSync(id, data);
        }


    });
}

async function generate(filename) {
    const cardData = new Promise(function(resolve, reject) {
        getcards('cards.cdb', function(error, result) {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        });
    });

    cardData.then(function(data) {
        splitJSON(data);

    }).catch(console.log);
}


//generate('cards.cdb');