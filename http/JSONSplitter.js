//JSONSplitter.py
//By: HelixReactor
//Last Modified: 26/05/2017, 22:16 (GMT -4)

function split_json() {
    var full = require("./manifest_0-en-OCGTCG.json");

    full.forEach(function(card){
        var data = JSON.stringify(card),
        id = "./json/" + (card.id).toString() + ".json";
    
        fs.writeFileSync(id, data);
    });
}

module.exports = split_json();