const service = require('./service.js')
const mongoose = require('mongoose');
const STATUS_CODE = require('../utility/constants.js').STATUS_CODE;
const review = require('../data/db.js').review;
let userService;
let tapeService;

class ReviewService extends service {
    constructor() {
        super();
    }

    refreshServices(){
        userService = require('./index').get("user");
        tapeService = require('./index').get("tape");
    }

    getAllReviews(callback) {
        //get all reviews.
        review.find({}, (err, reviews) => {
            return callback(this.process(err, null, null, reviews));
        });
    };

    getTapeReviews(tapeId, callback) {
        //get the tape.
        tapeService.getTapeById(null, null, tapeId, false, false, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
                //if the tape doesn't exist.
                return callback(response);
            }
            //get the reviews, if any.
            review.find({tape_id: tapeId}, (err, reviews) => {
                return callback(this.process(err, null, null, reviews));
            });
        });
    };

    getUserReviews(userId, callback) {
        //get the user.
        userService.getUserById(null, null, userId, false, false, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
                //if the user doesn't exist.
                return callback(response);
            }
            //get the reviews, if any.
            review.find({user_id: userId}, (err, reviews) => {
                return callback(this.process(err, null, null, reviews));
            });
        });
    };

    getReview(userId, tapeId, callback) {
        //check if the user and tape exist.
        tapeService.userAndTapeExist(userId,tapeId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
                //if user or tape doesn't exist.
                return callback(response);
            }
            //get the review if it exist.
            //else throw bad request error.
            review.findOne({
                tape_id: tapeId,
                user_id: userId
            }, (err, review) => {
                return callback(this.process(err, "review", null, review, false, STATUS_CODE.OK, 
                    "Tape id:'"+tapeId+"' has no review by User id:'"+userId+"'.", STATUS_CODE.BAD_REQUEST));
            });
        });
    };

    createReview(userId, tapeId, title, rating, comment, callback) {
        //check if the review exists.
        this.getReview(userId, tapeId, (response) => {
            if(response.statusCode != STATUS_CODE.OK && response.statusCode != STATUS_CODE.BAD_REQUEST){
                //if user or tape doesn't exist.
                return callback(response);
            }
            if(response.statusCode == STATUS_CODE.OK && response.data.data.length){
                //if review already exist. throw conflict error.
                //tell the user that he can modify existing review with PUT.
                return callback(this.process(null, "review", null, null, false, STATUS_CODE.OK,
                    "User id:'"+userId+"' has already left a review on Tape id'"+tapeId+"'.To modify use Put.", STATUS_CODE.CONFLICT));
            }
            //no review found, so we create it.
            review.create({
                user_id: userId,
                tape_id: tapeId,
                title: title,
                rating: rating,
                comment: comment
            }, (err, review) => {
                return callback(this.process(err, null, null, review, false, STATUS_CODE.CREATED));
            });
        });
    };

    deleteUserReviews(userId, callback) {
        //get the users reviews.
        this.getUserReviews(userId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
                //if user not found.
                return callback(response);
            }
            if(response.data.length){
                //if user had reviews, we delete them.
                //we don't need to wait for the return as we already have the data we need.
                review.deleteMany({user_id: userId}).exec();
            }
            //return the reviews.
            return callback(response)
        });
    };

    deleteTapeReviews(tapeId, callback) {
        //get the tape's reviews.
        this.getTapeReviews(tapeId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
                //if tape not found.
                return callback(response);
            }
            if(response.data.length){
                //if tape had reviews, we delete them.
                //we don't need to wait for the return as we already have the data we need.
                review.deleteMany({tape_id: tapeId}).exec();
            }
            //return the reviews.
            return callback(response)
        });
    };

    deleteReview(userId, tapeId, callback) {
        //check if the review exist.
        this.getReview(userId, tapeId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
                //if user/tape or review doesn't exist.
                return callback(response);
            }
            //else delete the review.
            review.deleteOne({
                user_id: userId,
                tape_id: tapeId
            }, (err, review) => {
                return callback(response);
            });
        });
    };

    updateReview(userId, tapeId, title, rating, comment, callback) {
        let update = {};
        if(!title && !rating && !comment){
            //if no update parameters.
            return callback(this.customResponse(STATUS_CODE.BAD_REQUEST, "fail", "Unable to update.", 
                            {Loan: "No valid update paramaters."}));
        }
        //only update the non null params.
        if(title){ update.title = title; }
        if(rating){ update.rating = rating; }
        if(comment){ update.comment = comment; }
        update.lastModified = Date.now();

        //get the review
        this.getReview(userId, tapeId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
                //if the user,tape or review doesn't exist.
                return callback(response);
            }

            //else update it.
            review.findOneAndUpdate({
                user_id: userId,
                tape_id: tapeId
            }, update, { new: true, runValidators: true }, (err, review) => {
                return callback(this.process(err, null, null, review));
            });
        });
    };

};

module.exports = new ReviewService();
