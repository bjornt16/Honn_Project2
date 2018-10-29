const reviewService = require("../services/index").get("review");

module.exports = function(app){

	//Get reviews by a given user
    app.get('/users/:userId/reviews', function(req, resp){
        reviewService.getUserReviews(req.params.userId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Get user reviews for a given tape
    app.get('/users/:userId/reviews/:tapeId', function(req, resp){
        reviewService.getReview(req.params.userId, req.params.tapeId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Add a user review for a tape
    app.post('/users/:userId/reviews/:tapeId', function(req, resp){
        reviewService.createReview(req.params.userId, req.params.tapeId, req.body.title,
        	req.body.rating, req.body.comment,
        (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Add a user review for a tape
    app.post('/tapes/:tapeId/reviews/:userId', function(req, resp){
        reviewService.createReview(req.params.userId, req.params.tapeId, req.body.title,
        	req.body.rating, req.body.comment,
        (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Remove review
    app.delete('/users/:userId/reviews/:tapeId', function(req, resp){
        reviewService.deleteReview(req.params.userId, req.params.tapeId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Update tape review
    app.put('/users/:userId/reviews/:tapeId', function(req, resp){
        reviewService.updateReview(req.params.userId, req.params.tapeId, req.body.title,
        	req.body.rating, req.body.comment,
        (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Get reviews for all tapes
    app.get('/tapes/reviews', function(req, resp){
        reviewService.getAllReviews((response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Get all reviews for a given tape
    app.get('/tapes/:tapeId/reviews', function(req, resp){
        reviewService.getTapeReviews(req.params.tapeId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Get a user’s review for a tape
    app.get('/tapes/:tapeId/reviews/:userId', function(req, resp){
        reviewService.getReview(req.params.userId, req.params.tapeId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Update a user’s review
    app.put('/tapes/:tapeId/reviews/:userId', function(req, resp){
        reviewService.updateReview(req.params.userId, req.params.tapeId, req.body.title,
        	req.body.rating, req.body.comment,
        (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Remove a user’s review
    app.delete('/tapes/:tapeId/reviews/:userId', function(req, resp){
        reviewService.deleteReview(req.params.userId, req.params.tapeId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

}