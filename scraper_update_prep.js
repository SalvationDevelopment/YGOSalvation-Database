const fs = require('fs'),
    db = require('./http/manifest.json'),
    list = db.map(function(card) {
        return card.id;
    });

fs.writeFile('./scraper/updater_input.json', JSON.stringify(list, null, 4), function(error, callback) {
    console.log('done');
});