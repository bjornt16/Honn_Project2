const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

module.exports = new Schema({
	tapeId: { type: ObjectId, required: true },
	userId: { type: ObjectId, required: true },
	title: { type: String, required: true },
	rating: { type: Number, min: 0, max: 10, required: true },
	comment: { type: String, required: true },
	created: { type: Date, required: true, default: Date.now() },
	lastModified: { type: Date }
});
