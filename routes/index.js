const fs = require('fs');

module.exports = function(app, eventHandler){
	//get route files in this directory
	let files = fs.readdirSync(__dirname);

	//loop through the route files, and require them.
	for(let i = 0; i < files.length; i++){
		if (files[i] !== "index.js"){
	        require('./' + files[i])(app, eventHandler);
		}
	}
}