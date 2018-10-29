const tapeService = require("../services/index").get("tape");
const formatDate = require("../utility/dateFormatter");

module.exports = function(app){

	//Get information about all tapes
    app.get('/tapes', function(req, resp){
    	let loanDate = formatDate(req.query.LoanDate);
    	let loanDuration = req.query.LoanDuration;
		tapeService.getAllTapes(loanDate, loanDuration, (response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

    //Add a tape
    app.post('/tapes', function(req, resp){
		tapeService.createTape(req.body.title, req.body.director_first_name, 
			req.body.director_last_name, req.body.type, req.body.release_date, req.body.eidr, 
		(response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

    //Get information about a specific tape (including borrowing history)
    app.get('/tapes/:tapeId', function(req, resp){
    	let loanDate = formatDate(req.query.LoanDate);
    	let loanDuration = req.query.LoanDuration;
		tapeService.getTapeById(loanDate, loanDuration, req.params.tapeId, req.query.Loans, req.query.Reviews, (response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

    //Delete a tape
    app.delete('/tapes/:tapeId', function(req, resp){
		tapeService.deleteTape(req.params.tapeId, (response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

	//Update a tape
    app.put('/tapes/:tapeId', function(req, resp){
		tapeService.updateTape(req.params.tapeId, req.body.title, req.body.director_first_name, 
			req.body.director_last_name, req.body.type, req.body.release_date, req.body.eidr, 
		(response) => {
			return resp.status(response.statusCode).json(response.data);
		});
    });

}