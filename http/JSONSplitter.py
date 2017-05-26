#JSONSplitter.py
#By: HelixReactor
#Last Modified: 26/05/2017, 17:21 (GMT -4)

with open("manifest_0-en-OCGTCG.json", encoding="utf-8", mode="r") as manifest:
	#Read and seperate entries
	all_json = manifest.read();
	all_json = all_json.split("},{");
	
	#Fix first entry
	first_json = all_json[0];
	first_json_fixed = "";
	for i in range(1, len(first_json)):
		first_json_fixed += first_json[i];
	all_json[0] = first_json_fixed + '}';
	
	#Fix last entry
	last_json = all_json[len(all_json) - 1];
	last_json_fixed = "";
	for i in range(0, len(last_json) - 1):
		last_json_fixed += last_json[i];
	all_json[len(all_json) - 1]  = '{' + last_json_fixed;
	
	#Fix middle entries
	for i in range(1, len(all_json) - 1):
		all_json[i] = '{' + all_json[i] + '}';
	
	#Write entries
	for i in all_json:
		#Get card's id
		id = i.split(',')[0];
		id = id.split(':')[1];
		id = "./json/" + id + ".json";
		
		with open(id, encoding="utf-8", mode="w") as card:
			card.write(i);