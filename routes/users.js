const userService = require("../services/userService");

module.exports = function(app, eventHandler){

	//Get information about all users
    app.get('/users', function(req, resp){
		userService.getAllUsers((response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

    //Add a user
    app.post('/users', function(req, resp){
		userService.createUser(req.body.first_name, req.body.last_name, req.body.email, req.body.phone, req.body.address,
		(response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

    //Get information about a given user (e.g. borrowing history)
    app.get('/users/:userId', function(req, resp){
		userService.getUserById(req.params.userId, (response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

    //Remove a user
    app.delete('/users/:userId', function(req, resp){
		userService.deleteUser(req.params.userId, (response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

	//Update a user
    app.put('/users/:userId', function(req, resp){
		userService.updateUser(req.params.userId,
			req.body.first_name, req.body.last_name, req.body.email, req.body.phone, req.body.address, 
		(response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

}