const seedingService = require("../services/index").get("seeding");

module.exports = function(app, eventHandler){

	//seed the database with users. (careful not to seed twice)
    app.post('/users/seed', function(req, resp){
		seedingService.seedUsers((response) => {
			resp.status(201).send();
		});
    });

    //seed the database with tapes. (careful not to seed twice)
    app.post('/tapes/seed', function(req, resp){
		seedingService.seedTapes((response) => {
			resp.status(201).send();
		});
    });

}