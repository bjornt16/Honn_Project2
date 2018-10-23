const Schema = require('mongoose').Schema;

module.exports = new Schema({
	first_name: {
		type: String,
		required: [true, "is required."]},
	last_name: {
		type: String,
		required: [true, "is required."]},
	email: {
		type: String,
		required: [true, "is required."],
		validate: {
	      validator: function(v) {
	        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
	      },
	      message: props => "Invalid email address."
	    }},
	phone: {
		type: String,
		required: [true, "is required."],
		validate: {
	      validator: function(v) {
	        return /^\d{3}-\d{4}$/.test(v);
	      },
	      message: props => "please use this format for phone '123-4567'."
	    }},
	address: {type: String,
		required: [true, "is required."]},
	joined: {
		type: Date,
		required: [true, "is required."],
		default: Date.now()
	}
});
