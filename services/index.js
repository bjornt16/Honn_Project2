const fs = require('fs');

//convenience class.
class ServiceHandler{
	constructor(){
		this.services = {};
		//get service files in this directory
		let files = fs.readdirSync(__dirname);

		//loop through the service files, and require them.
		for(let i = 0; i < files.length; i++){
			if (files[i] !== "index.js" && files[i] !== "service.js"){
				this.services[files[i].substr(0, files[i].indexOf("Service"))] = require('./' + files[i]);
			}
		}
	};

	//get function to pass on the services.
	get(get){
		return this.services[get];
	};

	//The main reason for this being a class.
	//A convenient way to make sure all the services have the references they need.
	refreshServices(){
		const keys = Object.keys(this.services);
		for(let i = 0; i < keys.length; i++){
			this.services[keys[i]].refreshServices();
		}
	};
}

module.exports = new ServiceHandler();