const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

module.exports = new Schema({
	tapeId: { type: ObjectId, required: true },
	userId: { type: ObjectId, required: true },
	loaned: { type: Date, required: true, default: Date.now()},
	returned: { type: Date }
});
