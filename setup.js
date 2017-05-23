/*jslint node:true, plusplus:true*/
'use strict';

/**
 * Create a enviromental variable
 * @param   {string}        name enviromental variable being created
 * @param   {string|Number} base its default
 * @returns {object}        prompt object used to ask the user
 */
function makeQuestion(name, base) {
	return {
		name: name,
		description: name + ': ',
		type: (typeof base),
		'default': base, // Default value to use if no value is entered. 
		required: false // If true, value entered must be non-empty. 
	};
}

var fs = require('fs'),
	prompt = require('prompt'),
	enviormentalVariables = [
		makeQuestion('MONGODB_URL ', 'mongodb://localhost:27017/ygo'),
		makeQuestion('MONGODB_USER', 'ygo'),
		makeQuestion('MONGODB_PASSWORD', 'blah')
	];

prompt.get(enviormentalVariables, function (error, result) {
	if (error) {
		console.log('ERROR', error);
		return;
	}
	var output = [];
	Object.keys(result).forEach(function (key) {
		var text = key + "='" + result[key] + "'\r\n";
		output.push(text);
	});

	fs.writeFileSync('./.env', output.join(''));
});
