const fs = require('fs');
const services = require('../services/index');

//make sure services have the references they need.
services.refreshServices();

//provide an easy way to get all the services.
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