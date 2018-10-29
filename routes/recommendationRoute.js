const recommendationService = require("../services/index").get("recommendation");

module.exports = function(app){

	//Get recommendations for the user.
	//returns up to 2 choices, 1 based on user reviews, and 1 by loan figures. (popularity)
    app.get('/users/:userId/recommendation/', function(req, res){
    	recommendationService.getRecommendation(req.params.userId, (response) => {
    		return res.status(response.statusCode).json(response.data);
    	});
    });

}