const STATUS_CODE = require('../utility/constants.js').STATUS_CODE;

//A base class for all services with some useful functions.
class Service{
	constructor(){

	}

	//simple function to return statusCode and Data in an object.
	response(statusCode, data)  {
        return {statusCode: statusCode, data: data};
    };

    //default refreshServices function does nothing.
    //inherited classes override this.
    refreshServices(){

    };

    //This function constructs a find query based on the LoanDate and LoanDuration.
    getDateQuery(loanDate, loanDuration){
		let find = {};
		//if LoanDate is not set, consider today the LoanDate.
		var date = loanDate ? new Date(loanDate) : new Date();
		//date is then modified by loanDuration to check if the user had a loan out at loanDate - loanDuration days.
		date.setDate(date.getDate() - (loanDuration ? loanDuration : 0));
		find["$and"] = [];
		if(loanDuration){
			//If record has loan_duration, use that. 
			//else treat the record as it has loan_duration of (from this.loan_date til LoanDate).
			find["$and"].push({$or: [{return_date: null}, {loan_duration: { $gte: loanDuration }}]});
		}
		//Loan_date should be less than date.
		find["$and"].push({loan_date: { $lte: date }});
		//check if return date is null, then true.
		//else check if loan_duration exist, if it does use that. else check if return_date is less than date.
		find["$and"].push({$or: [
									{return_date: null}, 
						  			{$or: [
						  					{return_date: { $gte: date}},
						  					{loan_duration: {$ne: null}}
						  				  ]
						  			}
						  		]
						  });
		return find;
    };

    //Incase process is overkill, this can format a custom response.
    customResponse(statusCode, status, message, payload){
		let data = { 
			status: status,
			message: message,
			data: Array.isArray(payload) ? payload : [payload]
		};
		return this.response(statusCode, data);
    }

    //Super function that formats the response nicely.
    //It has multiple overrides for niche cases.
    process(error, fieldName, fieldVal, found, dateError = false, successCode = STATUS_CODE.OK, errorMsgOverride = null,
     errorStatusOverride = null) {
		let data = { 
			status: "",
			message: "",
			data: []
		};
    	if(!error && found){
    		//If there are no errors, and we got some results.
    		data.status = "success";
    		data.message = (Array.isArray(found) ? found.length + " matches" : "1 match" ) + " found.",
    		//to keep things consistant, data always returns an array of results, even when result can only be 1.
    		data.data = Array.isArray(found) ? found.slice(0) : (found ? [found] : []);

    		//loop through the return data and remove or modify them.
    		//this is so we return stuff in a non mongoDb way.
    		//such as returning an id instead of _id. 
    		for(let i = 0; i < data.data.length; i++){
    			//copy the returns from the mongoDB object. (so that they can be modified.)
    			data.data[i] = Object.assign({}, data.data[i]._doc);
    			//remove __v, no need to return that. (it's mongoDb specific and can confuse the user)
    			if(data.data[i].__v != null){ delete data.data[i].__v; }
    			//rename _id to id.
    			if(data.data[i]._id){ 
    				data.data[i].id = data.data[i]._id;
    				delete data.data[i]._id; 
    			}
    		}
    		return this.response(successCode, data);
    	}
		else{
			if(error && error.name == "ValidationError"){
				//If we have an error, and the error is a validation error.
				data.status = "fail";
				data.message = "Validation Error.";
				//get the error keys and format them with their message.
				//i.e. make mongoDB's error messages smaller and more user friendly.
				const keys = Object.keys(error.errors);
				for(let i = 0; i < keys.length; i++){
					let tmp = {};
					tmp[keys[i]] = error.errors[keys[i]].message;
					data.data.push(tmp);
				}
				return this.response(STATUS_CODE.UNPROCESSABLE, data);
			}
			else if((error && error.name == "CastError") || (!error && found == null)){
				//If we have an error and it's a cast error,
				//or if have no error, but we found no results. 
				//(this is may be because loanDuration/loanDate filtered them out.)
				
				//remove the errors. (if any.)
				delete data.errors;
				data.status = "fail";
				data.message = "Resource Not Found.";
				//capitalize the fieldName.
				fieldName = fieldName.charAt(0).toUpperCase().concat(fieldName.slice(1).toLowerCase());
				let tmp = {};
				//format the error to match the rest of the system.
				tmp[fieldName] = errorMsgOverride ? errorMsgOverride : 
								 fieldName + " with id:'" + fieldVal + "' not found." + 
								 (dateError ? " Caution: date variables can filter out results." : "");
				data.data.push(tmp);
				return this.response(errorStatusOverride ? errorStatusOverride : STATUS_CODE.NOT_FOUND, data);
			}
			else{
				//if nothing covers that. Then something went wrong.
				//possible code error, or database error.
				//we give the user a generic "something went wrong" error.
				data.status = "error";
				data.message = "Database Error.";
				data.data.push({database: "Internal Error"});
				return this.response(STATUS_CODE.ISE, data);
			}
		}
	}
}

module.exports = Service;