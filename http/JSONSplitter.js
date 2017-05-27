//JSONSplitter.py
//By: HelixReactor
//Last Modified: 26/05/2017, 21:49 (GMT -4)

var full = require("./manifest_0-en-OCGTCG.json");

full.forEach(function(card){
    var data = JSON.stringify(card),
        id = "./json/" + (card.id).toString() + ".json";
    
    fs.writeFileSync(id, data);
});