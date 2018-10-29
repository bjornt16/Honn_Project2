const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//schema for loan records.
const schema = new Schema({
	tape_id: { 
		type: ObjectId, 
		required: [true, "This field is required."] 
	},
	user_id: { 
		type: ObjectId, 
		required: [true, "This field is required."] 
	},
	loan_date: { 
		type: Date, 
		required: [true, "This field is required."], 
		default: Date.now,
		validate: {
	      	validator:  function(v) {
		      	return Date.now()+1000 > new Date(v).getTime() && 
		      		((this.return_date == null || typeof(this.return_date) == "undefined" ) || 
		      			new Date(this.return_date).getTime() >= new Date(v).getTime());
	      	},
	      	message: props => (Date.parse(props.value) >  Date.now()) ? 
	      					  "loan_date cannot be set in the future." : 
	      					  "loan_date cannot be after return_date."
	    }
	},
	return_date: { 
		type: Date,
		validate: {
	      	validator: function(v) {
		      	return Date.now()+1000 > Date.parse(v) && Date.parse(this.loan_date) <= Date.parse(v);
	      	},
	      	message: props => (Date.parse(props.value) >  Date.now()) ? 
	      					  "return_date cannot be set in the future." : 
	      					  "return_date cannot be before loan_date."
      	}
	},
	loan_duration : {
		type: Number
	}
});

//make sure loan_duration is accurate.
schema.pre('save', function (next) {
	this.loan_duration = undefined;
	
	if(this.return_date != null){
		this.loan_duration = (Date.parse(this.return_date) - Date.parse(this.loan_date) ) / (86400000);
	}
  	next();
});

module.exports = schema;