module.exports = function(app){

	//Get reviews by a given user
    app.get('/users/:userId/reviews', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Get user reviews for a given tape
    app.get('/users/:userId/reviews/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Add a user review for a tape
    app.post('/users/:userId/reviews/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Remove review
    app.delete('/users/:userId/reviews/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Update tape review
    app.put('/users/:userId/reviews/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Get reviews for all tapes
    app.get('/tapes/reviews', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Get all reviews for a given tape
    app.get('/tapes/:tapeId/reviews', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Get a user’s review for a tape
    app.get('/tapes/:tapeId/reviews/:userId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Update a user’s review
    app.put('/tapes/:tapeId/reviews/:userId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Remove a user’s review
    app.delete('/tapes/:tapeId/reviews/:userId', function(req, res){
        return res.send("Not yet implemented!");
    });

}