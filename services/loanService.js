const service = require('./service.js')
const mongoose = require('mongoose');
const STATUS_CODE = require('../utility/constants.js').STATUS_CODE;
const loan = require('../data/db.js').loan;
let userService;
let tapeService;

class LoanService extends service{
    constructor() {
        super();
    }

    refreshServices(){
        userService = require('./index').get("user");
        tapeService = require('./index').get("tape");
    }

    getAllLoans(loanDate, loanDuration, callback){
    	//modify find params with loanDate/loanDuration if set.
    	let find = (loanDate || loanDuration) ? this.getDateQuery(loanDate, loanDuration) : {};

    	//get all loans.
    	loan.find(find, null, {sort: {loan_date: -1}}, (err, loan) => {
    		return callback(this.process(err, null, null, loan, (loanDate || loanDuration)));
    	});
    };

    getLoanById(loanDate, loanDuration, loanId, callback){
    	//modify find params with loanDate/loanDuration if set.
		let find = (loanDate || loanDuration) ? this.getDateQuery(loanDate, loanDuration) : {};
		find._id = loanId;

		//get loan
    	loan.findOne(find, (err, loan) => {
    		return callback(this.process(err, "loan", loanId, loan, (loanDate || loanDuration)));
    	});
    };

    getLoan(loanDate, loanDuration, userId, tapeId, callback){
    	//modify find params with loanDate/loanDuration if set.
		let find = (loanDate || loanDuration) ? this.getDateQuery(loanDate, loanDuration) : {};
		find.user_id = loanId;
		find.tape_id = tapeId;

		//check if user and tape exist.
    	tapeService.userAndTapeExist(userId, tapeId, (response) => {
    		if(response.statusCode != STATUS_CODE.OK){
    			//if user and/or tape doesnt exist.
    			return callback(response);
    		}
    		//get the most recent loan for this tape by this user. (if any)
    		loan.findOne(find, (err, loan) => {
    			return callback(this.process(error, "loan", null, loan, (loanDate || loanDuration), STATUS_CODE.OK,
    				"User id:'"+userId+"' has not borrowed Tape id:'"+tapeId+"'."));
    		});
    	});
    };

    getTapeLoans(loanDate, loanDuration, tapeId, callback){
    	//modify find params with loanDate/loanDuration if set.
		let find = (loanDate || loanDuration) ? this.getDateQuery(loanDate, loanDuration) : {};
		find.tape_id = tapeId;

		//get the tape
        tapeService.getTapeById(null, null, tapeId, false, false, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
            	//if the tape doesnt exist.
                return callback(response);
            }
            //get loans for the tape.
            loan.find(find, (err, loan) => {
                return callback(this.process(err, null, null, loan, (loanDate || loanDuration)));
            });
        });
    };

    getUserLoans(loanDate, loanDuration, userId, callback){
    	//modify find params with loanDate/loanDuration if set.
		let find = (loanDate || loanDuration) ? this.getDateQuery(loanDate, loanDuration) : {};
		find.user_id = userId;

		//get the user.
        userService.getUserById(null, null, userId, false, false, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
            	//if the user doesn't exist.
                return callback(response);
            }
            //get the loans for the user.
            loan.find(find, null, {sort: {loan_date: -1}}, (err, loan) => {
                return callback(this.process(err, null, null, loan, (loanDate || loanDuration)));
            });
        });
    };

    getUserTapeLoans(loanDate, loanDuration, userId, tapeId, includeReturned, callback){
    	//modify find params with loanDate/loanDuration if set.
		let find = (loanDate || loanDuration) ? this.getDateQuery(loanDate, loanDuration) : {};
		find.user_id = userId;
		find.tape_id = tapeId;

		//check if the user and tape exist.
        tapeService.userAndTapeExist(userId, tapeId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
            	//if the user and/or tape dont exist.
                return callback(response);
            }
            //if inclueReturned is false, only get loans that havent been returned.
            if(!includeReturned) { find.return_date = null }
            loan.find(find, null, {sort: {loan_date: -1}}, (err, loans) => {
            	return callback(this.process(err, null, null, loans, (loanDate || loanDuration)));
            });
        });    	
    }

    borrowTape(userId, tapeId, callback) {
    	//get this users loans that havent been returned.
        this.getUserTapeLoans(null, null, userId, tapeId, false, (response) => {
        	if(response.statusCode != STATUS_CODE.OK){
        		//if user and/or tape dont exist.
        		return callback(response);
        	}
        	else if(response.data.data.length){
        		//if the user already has this tape on loan, throw conflict.
        		return callback(this.process(null, "loan", null, null, false, STATUS_CODE.OK, 
                        "User id:'"+userId+"' already has Tape id:'"+tapeId+"' on loan.", STATUS_CODE.CONFLICT));
        	}
        	//if user doesnt have this tape on loan, create loan.
            loan.create({
                tape_id: tapeId,
                user_id: userId
            }, (err, loan) => {
                return callback(this.process(err, null, null, loan, false, STATUS_CODE.CREATED));
            });
        });
    };

    updateLoan(findParam, newUserId, newTapeId, loanDate, returnDate, callback) {
    	//inner function to increase code reuse.
    	const findAndUpdate = () => {
    		//find the loan ( either by loan_id or user and tape id.)
	  		loan.findOne(findParam, (err, loan) => {
	        	if(loan){
	        		//if loan found.
    		        if(!newUserId && !newTapeId && !loanDate && returnDate === undefined){
    		        	//if no update parameters.
        				return callback(this.customResponse(STATUS_CODE.BAD_REQUEST, "fail", "Unable to update.", {Loan: "No valid update paramaters."}));
        			}
        			//only update the non null params.
			        if(newUserId){ loan.tape_id = newUserId; }
			        if(newTapeId){ loan.user_id = newTapeId; }
			        if(loanDate){ loan.loan_date = loanDate; }
			        //if not set returnDate === undefined. we exploit this to allow a return cancel.
			        if(returnDate === null || returnDate != null){ loan.return_date = returnDate;}
			        //update.
			        loan.save((err, saveResponse) =>{
			        	return callback(this.process(err, null, null, loan));
			        });
	        	}
	        	else {
	        		//if no loan found.
	        		let sc = (findParam.user_id != null && findParam.tape_id != null) ? STATUS_CODE.BAD_REQUEST : STATUS_CODE.NOT_FOUND;
	        		let message = (findParam.user_id != null && findParam.tape_id != null) ?
	        			"User id:'"+findParam.user_id+"' does not have tape id:'"+findParam.tape_id+"' on loan." :
	        			"Loan id:'"+findParam.loan_id+"' does not exist.";
	        		return callback(this.customResponse(sc, "fail", "Resource not found", {"Loan": message}));
	        	}

	   	 	});
    	};

    	if(findParam.user_id != null && findParam.tape_id != null){
    		//if find params are user_id and tape_id, first check if they exist.
	        tapeService.userAndTapeExist(findParam.user_id, findParam.tape_id, (response) => {
            	if(response.statusCode != STATUS_CODE.OK){
            		//if user and/or tape doesnt exist.
                	return callback(response);
            	}
      			findAndUpdate();
        	});
    	}
    	else{
    		//if find params are user_id
    		findAndUpdate();
    	}

    };

    returnTape(userId, tapeId, callback) { 
    	//update the loan, with return_date = now. this.updateLoan will deal with validation. 
        this.updateLoan({
        	user_id : userId,
        	tape_id : tapeId,
         	return_date: null
        }, null, null, null, Date.now(), (response) => {
        	return callback(response);
        });
    };

    updateLoanById(loanId, newUserId, newTapeId, loanDate, returnDate, callback) {
    	//update the loan. this.updateLoan will deal with validation. 
        this.updateLoan({_id: loanId}, newUserId, newTapeId, loanDate, returnDate, (response) =>{
        	return callback(response);
        });
    };

    deleteUserLoans(userId, callback){
    	//get the users loans.
    	this.getUserLoans(null, null, userId, (response) =>{
    		if(response.statusCode != STATUS_CODE.OK){
    			//if the user doesn't exist.
    			return callback(response);
    		}
    		if(response.data.length){
    			//if the user has loans, delete them.
    			//no need to wait for the results, we already have the data we need.
    			loan.deleteMany({user_id: userId}).exec();
    		}
    		return callback(response);
    	});
    };

    deleteTapeLoans(tapeId, callback){
    	//get the tape's loans.
    	this.getTapeLoans(null, null, tapeId, (response) =>{
    		if(response.statusCode != STATUS_CODE.OK){
    			//if the tape doesn't exist.
    			return callback(response);
    		}
    		if(response.data.length){
    			//if the tape has loans, delete them.
    			//no need to wait for the results, we already have the data we need.
    			loan.deleteMany({tape_id: tapeId}).exec();
    		}
    		return callback(response);
    	});
    };

    deleteLoan(userId, tapeId, callback) {
    	//get the loan.
        this.getLoan(null, null, userId, tapeId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
            	//if the user, tape or loan doesnt exist.
                return callback(response);
            }
            //if it exists, delete it.
            //no need to wait for the results, we already have the data we need.
			loan.deleteOne({user_id: userId, tape_id: tapeId}).exec();
            return callback(response);
        });
    };

    deleteLoanById(loanId, callback) {
    	//get the loan.
        this.getLoanById(null, null, loanId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
            	//if the loan doesn't exist.
                return callback(response);
            }
            //if it exists, delete it.
            //no need to wait for the results, we already have the data we need.
            loan.deleteOne({_id: loanId}).exec();
            return callback(response);
        });
    };
}

module.exports = new LoanService();