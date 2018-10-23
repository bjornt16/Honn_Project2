const EventEmitter = require('events');
const mongoose = require('mongoose');
const review = require('../data/db.js').review;

class ReviewService extends EventEmitter {
    constructor() {
        super();
    }

    callback(eventId, statusCode, json)  {
        this.emit(eventId, {statusCode: statusCode, json: json});
    };


    getAllReviews(eventId) {
        review.find({}, (err, reviews) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    getAllReviewsForTape(eventId, tapeId) {
        review.find({tapeId: tapeId}, (err, reviews) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    getAllReviewsByUser(eventId, userId) {
        review.find({userId: userId}, (err, review) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    getReview(eventId, userId, tapeId) {
        review.find({
            tapeId: tapeId,
            userId: userId
        }, (err, review) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    createReview(eventId, userId, tapeId, title, rating, comment) {
        review.create({
            userId: userId,
            tapeId: tapeId,
            title: title,
            rating: rating,
            comment: comment
        }, (err, review) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    deleteReview(eventId, userId, tapeId) {
        review.findOneAndDelete({
            userId: userId,
            tapeId: tapeId
        }, (err, review) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

    updateReview(eventId, userId, tapeId, title, rating, comment) {
        let update = {};
        if(title != null){ update.title = title; }
        if(rating != null){ update.rating = rating; }
        if(comment != null){ update.comment = comment; }
        update.lastModified = Date.now();

        review.updateOne({
            userId: userId,
            tapeId: tapeId
        },
        update, (err, review) => {
            if(err){
                //handle error
            }
            else{
                // do stuff
            }
        });
    };

};

module.exports = new ReviewService();
