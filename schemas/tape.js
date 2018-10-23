const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

module.exports = new Schema({
	title: { type: String, required: true },
	director_first_name: { type: String, required: true  },
	director_last_name: { type: String, required: true  },
	type: { type : String , enum: ['Betamax', 'VHS', 'DVD', 'Blu-Ray']},
	release_date: { type: Date, required: true},
	eidr: { type: String, required: true }
});
