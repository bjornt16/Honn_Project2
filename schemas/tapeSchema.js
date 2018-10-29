const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//schema for tapes
module.exports = new Schema({
	title: { 
		type: String,
		required: [true, "This field is required."] 
	},
	director_first_name: { 
		type: String, 
		required: [true, "This field is required."]  
	},
	director_last_name: { 
		type: String, 
		required: [true, "This field is required."]  
	},
	type: { 
		type : String, 
		required : [true, "This field is required."],
		enum: { values: ['Betamax', 'VHS', 'DVD', 'Blu-Ray'], 
				message: "This field only accepts the following values: 'Betamax', 'VHS', 'DVD', 'Blu-Ray'."}
	},
	release_date: { 
		type: Date, 
		required: [true, "This field is required."]
	},
	eidr: { 
		type: String,
		required: [true, "This field is required."]
	}
});
