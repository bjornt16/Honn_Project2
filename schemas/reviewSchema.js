const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

module.exports = new Schema({
	tape_id: { 
		type: ObjectId, 
		required: [true, "This field is required."] 
	},
	user_id: { 
		type: ObjectId, 
		required: [true, "This field is required."] 
	},
	title: { 
		type: String, 
		required: [true, "This field is required."] 
	},
	rating: { 
		type: Number, 
		min: [0, "Value must be between 0 and 10."], 
		max: [10, "Value must be between 0 and 10."], 
		required: [true, "This field is required."] 
	},
	comment: { 
		type: String, 
		required: [true, "This field is required."] 
	},
	created_date: { 
		type: Date, 
		required: [true, "This field is required."], 
		default: Date.now()
	},
	last_modified_date: { 
		type: Date,
		default: Date.now()
	}
});
