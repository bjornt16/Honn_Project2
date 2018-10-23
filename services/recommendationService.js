const EventEmitter = require('events');
const mongoose = require('mongoose');
const history = require('../data/db.js').borrowHistory;

class RecommendationService extends EventEmitter {

    constructor() {
        super();
    }

    callback(eventId, statusCode, json)  {
        this.emit(eventId, {statusCode: statusCode, json: json});
    };

    getRecommendation(){
        //todo 
    }
};

module.exports = new RecommendationService();
