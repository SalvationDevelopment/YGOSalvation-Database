//JSONSplitter.py
//By: HelixReactor
//Last Modified: 26/05/2017, 19:24 (GMT -4)

var full = require("./manifest_0-en-OCGTCG.json");

for (var i = 0; i < full.length; i++){
    var card = JSON.stringify(full[i]),
        id = "./json/" + (full[i].id).toString() + ".json";
    
    fs.writeFileSync(id, card);
}