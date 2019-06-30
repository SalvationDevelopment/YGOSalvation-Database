const ATTRIBUTES = require('./utility/attributes.json'),
    CARD_TYPES = require('./utility/card_types.json'),
    LINK_ARROWS = require('./utility/link_arrows.json'),
    RACES = require('./utility/race.json'),
    // SETCODES = require('./utility/setcode.json'),
    json_path = '..\\http\\json\\';

var request = require('request'),
    fs = require('fs'),
    // jsonfile = require('jsonfile'),
    url;

// Create JSON file for each card
function createCards (card_data) {
  card_data.forEach(function(card) {
    var card_json = {},
        filename;
    card_json.id = card.id;
    card_json.name = card.name;
    card_json.type = CARD_TYPES[card.type];
    card_json.desc = card.desc;
    card_json.atk = parseInt(card.atk) || 0;
    card_json.def = parseInt(card.def) || 0;
    if (card.level) {
      card_json.level = parseInt(card.level);
    } else if (card.linkval) {
      card_json.level = parseInt(card.linkval);
      card_json.links = [];
      card.linkmarkers.forEach(function(arrow) {
        if (LINK_ARROWS[arrow]) {
            card_json.links.push(LINK_ARROWS[arrow]);
        }
      });
    } else {
      card_json.level = 0;
    }
    if (['Spell Card', 'Trap Card'].includes(card.type)) {
      card_json.type += (RACES[card.race] || 0);
      card_json.race = 0;
    } else {
      card_json.race = RACES[card.race];
    }
    card_json.attribute = ATTRIBUTES[card.attribute] || 0;
    card_json.setcode = card.archetype || 0; // TODO: Need int representation, YGOProDeck API doesn't list multiple archetypes
    card_json.card_sets = card.card_sets; // May want to consider using their structure for packs
    filename = json_path + String(card_json.id) + '.json';
    console.log(`Writing ${card_json.name} to ${filename}`);
    fs.writeFileSync(filename, JSON.stringify(card_json, null, 4));
  });
  console.log('Finished!');
}

// GET API request from YGOPRODeck
url = 'https://db.ygoprodeck.com/api/v5/cardinfo.php?fname=Firewall';
// url = 'https://db.ygoprodeck.com/api/v5/cardinfo.php';
request({url: url, json: true}, function(err, res, json) {
  if (err) {
    console.log('Failure!');
    throw err;
  }
  var card_data = json;
  console.log('Retrieved data from API request');
  createCards(card_data);
});
