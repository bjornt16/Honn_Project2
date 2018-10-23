module.exports = function(app){

	//Get information about all tapes
    app.get('/tapes', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Add a tape
    app.post('/tapes', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Get information about a specific tape (including borrowing history)
    app.get('/tapes/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Delete a tape
    app.delete('/tapes/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

	//Update a tape
    app.put('/tapes/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Get information about the tapes a given user has on loan
    app.get('/users/:userId/tapes/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Register a tape on loan
    app.post('/users/:userId/tapes/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Return a tape
    app.delete('/users/:userId/tapes/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

    //Update borrowing information
    app.put('/users/:userId/tapes/:tapeId', function(req, res){
        return res.send("Not yet implemented!");
    });

}