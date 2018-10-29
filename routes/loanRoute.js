const loanService = require("../services/index").get("loan");
const formatDate = require("../utility/dateFormatter");

module.exports = function(app){

    //get all loan records
    app.get('/loans', function(req, resp){
    	let loanDate = formatDate(req.query.LoanDate);
    	let loanDuration = req.query.LoanDuration;
        loanService.getAllLoans(loanDate, loanDuration, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //get loan record by id
    app.get('/loans/:loanId', function(req, resp){
    	let loanDate = formatDate(req.query.LoanDate);
    	let loanDuration = req.query.LoanDuration;
        loanService.getLoanById(loanDate, loanDuration, req.params.loanId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //loan a tape
    app.post('/users/:userId/tapes/:tapeId', function(req, resp){
        loanService.borrowTape(req.params.userId, req.params.tapeId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //return a tape
    app.delete('/users/:userId/tapes/:tapeId', function(req, resp){
        loanService.returnTape(req.params.userId, req.params.tapeId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //update a specific loan record
    app.put('/loans/:loanId', function(req, resp){
        loanService.updateLoanById(req.params.loanId, req.body.user_id, req.body.tape_id, 
        	req.body.loan_date, req.body.return_date, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //update a users most recent tape loan record
    app.put('/users/:userId/tapes/:tapeId', function(req, resp){
        loanService.updateLoan({
        	user_id: req.params.userId, 
        	tape_id: req.params.tapeId
        }, req.body.user_id, req.body.tape_id, 
        	req.body.loan_date, req.body.return_date, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

	//Get user loan history
    app.get('/users/:userId/loans', function(req, resp){
    	let loanDate = formatDate(req.query.LoanDate);
    	let loanDuration = req.query.LoanDuration;
        loanService.getUserLoans(loanDate, loanDuration, req.params.userId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Get tape loan history
    app.get('/tapes/:tapeId/loans', function(req, resp){
    	let loanDate = formatDate(req.query.LoanDate);
    	let loanDuration = req.query.LoanDuration;
        loanService.getTapeLoans(loanDate, loanDuration, req.params.tapeId, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Get a user loan history for a tape
    app.get('/users/:userId/tapes/:tapeId/loans', function(req, resp){
    	let loanDate = formatDate(req.query.LoanDate);
    	let loanDuration = req.query.LoanDuration;
        loanService.getUserTapeLoans(loanDate, loanDuration, req.params.userId, req.params.tapeId, true, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

    //Get a user loan history for a tape
    app.get('/tapes/:tapeId/users/:userId/loans', function(req, resp){
    	let loanDate = formatDate(req.query.LoanDate);
    	let loanDuration = req.query.LoanDuration;
        loanService.getUserTapeLoans(loanDate, loanDuration, req.params.userId, req.params.tapeId, true, (response) => {
        	return resp.status(response.statusCode).json(response.data);
        });
    });

}