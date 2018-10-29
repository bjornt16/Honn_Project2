const Schema = require('mongoose').Schema;

//schema for users.
module.exports = new Schema({
	first_name: {
		type: String,
		required: [true, "This field is required."]},
	last_name: {
		type: String,
		required: [true, "This field is required."]},
	email: {
		type: String,
		required: [true, "This field is required."],
		validate: {
	      validator: function(v) {
	      	//check if the email address is a valid email.
	        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
	      },
	      message: props => "Invalid email address."
	    }},
	phone: {
		type: String,
		required: [true, "This field is required."],
		validate: {
	      validator: function(v) {
	      	//check to see if the phone is formatted correctly.
	        return /^\d{3}-\d{4}$/.test(v);
	      },
	      message: props => "please use this format for phone '123-4567'."
	    }},
	address: {type: String,
		required: [true, "This field is required."]},
	joined: {
		type: Date,
		required: [true, "This field is required."],
		default: Date.now()
	}
});
