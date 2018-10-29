const fs = require('fs');

const schema = {};
//get service files in this directory
let files = fs.readdirSync(__dirname);

//loop through the service files, and require them.
for(let i = 0; i < files.length; i++){
	if (files[i] !== "index.js"){
		schema[files[i].substr(0, files[i].indexOf("Schema"))] = require('./' + files[i]);
	}
}


module.exports = schema;