const EventEmitter = require('events');
const mongoose = require('mongoose');
const tape = require('../data/db.js').tape;
const history = require('../data/db.js').borrowHistory;

class TapeService extends EventEmitter {
    constructor() {
        super();
    }

    callback(eventId, statusCode, json)  {
        this.emit(eventId, {statusCode: statusCode, json: json});
    };

    getAllTapes(eventId) {
        tape.find({}, (err, artists) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };


    getTapeById(eventId, tapeId) {
        user.findById(tapeId, (err, user) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });

        //todo get borrow_history
    };

    createTape(eventId, title, director_first_name, director_last_name, type, release_date, eidr) {
        tape.create({
                title: title,
                director_first_name: director_first_name,
                director_last_name: director_last_name,
                type: type,
                release_date: release_date,
                eidr: eidr
            }, (err, tape) => {
                if(err){
                    //handle error
                }
                else{
                    // do stuff
                }
        });
    };

    updateTape(eventId, tapeId, title, director_first_name, director_last_name, type, release_date, eidr) {
        let update = {};
        if(title != null){ update.title = title; }
        if(director_first_name != null){ update.director_first_name = director_first_name; }
        if(director_last_name != null){ update.director_last_name = director_last_name; }
        if(type != null){ update.type = type; }
        if(release_date != null){ update.release_date = release_date; }
        if(eidr != null){ update.eidr = eidr; }
        tape.findByIdAndUpdate(tapeId, update, (err, tape) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    deleteTape(eventId, tapeId) {
        tape.findByIdAndRemove(tapeId, (err, tape) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });

        //todo remove borrow records and reviews for tape
    };

    getTapesOnLoanToUser(eventId, userId) {
        history.find({userId: userId}, (err, history) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });

        //todo get tape info from history returns
    };

    borrowTape(eventId, userId, tapeId) {
        history.create({
            tapeId: tapeId,
            userId: userId
        }, (err, user) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    returnTape(eventId, userId, tapeId) {
        history.updateOne({
            tapeId: tapeId,
            userId: userId,
            returned: null
        },
        {
            returned: Date.now();
        }, (err, user) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    updateBorrowHistory(eventId, userId, tapeId, newUserId, newTapeId, loaned, returned) {
        let update = {};
        if(newUserId != null){ update.userId = newUserId; }
        if(newTapeId != null){ update.tapeId = newTapeId; }
        if(loaned != null){ update.loaned = loaned; }
        if(returned != null){ update.returned = returned; }
        history.updateOne({
            tapeId: tapeId,
            userId: userId
        },
        update, (err, user) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };
};

module.exports = new TapeService();
