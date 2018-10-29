const service = require('./service');
const mongoose = require('mongoose');
const STATUS_CODE = require('../utility/constants.js').STATUS_CODE;
const loan = require('../data/db.js').loan;
const tape = require('../data/db.js').tape;
const review = require('../data/db.js').review;
let loanService;
let reviewService;

class RecommendationService extends service {

    constructor() {
        super();
    }

    refreshServices(){
        loanService = require("./index").get("loan");
        reviewService = require("./index").get("loan");
    }

    pick(userLoans, reviews, loans, callback){
        //if there are no reviews and loans to go by then we cannot make a recommendation.
        if(!reviews.length && !loans.length){
            return callback(this.customResponse(STATUS_CODE.OK, "success", 
                "No recommendations possible. No tapes have been loaned or reviewed.", []))
        }
        //loop through the user's loans.
        //remove any tapes that the user has already loaned.
        for(let i = 0; i < userLoans.length; i++){
            for(let j = 0; j < reviews.length; j++){
                if(userLoans[i].tape_id == reviews[j]._id){
                    reviews.splice(j, j+1);
                }
            }
            for(let k = 0; k < loans.length; k++){
                if(userLoans[i].tape_id == loans[k]._id){
                    loans.splice(k, k+1);
                }  
            }
        }
        //if there no popular or high rated tapes that the user hasnt seen. then we cannot make a recommendation.
        if(!reviews.length && !loans.length){
            return callback(this.customResponse(STATUS_CODE.OK, "success", 
                "No recommendations possible. User has seen all high rated/popular tapes.", []))
        }

        //generate or find paramters.
        let find = {$or: []};
        if(reviews.length) { find["$or"].push({_id: reviews[0]._id}); }
        if(loans.length) { find["$or"].push({_id: loans[0]._id}); }

        //find a the tape/s in question.   
        tape.find(find, (err, tapes) => {

            let rec = {};
            for(let i = 0; i < tapes.length; i++){
                //format the result to be consistant.
                let tmp = tapes[i].toJSON();
                tmp.id = tmp._id;
                delete tmp._id;
                delete tmp.__v;
                if(reviews.length && String(tmp.id) === String(reviews[0]._id)) {
                    rec.based_on_ratings = tmp;
                }
                if(loans.length && String(tmp.id) === String(loans[0]._id)) {
                    rec.based_on_popularity = tmp;
                }
            }
            return callback(this.customResponse(STATUS_CODE.OK, "success", tapes.length + " " +
                            (tapes.length == 1? "match" : "matches") + " found.", [rec]));
        });
    };

    getRecommendation(userId, callback) {
        //get all of the users loans (if any).
        loanService.getUserLoans(null, null, userId, (response) => {
            if(response.statusCode != STATUS_CODE.OK){
                //if no user was found or error occured.
                return callback(response);
            }

            //create a loan opts aggreate call.
            //returns loans grouped by _id. Most loaned first.
            const loanOpts = (count_field) => { return [
                {
                    $group: {
                        _id: "$"+count_field,
                        count: { $sum: 1 },
                    },     
                },
                { "$sort": { "count": -1 } },
                { "$limit": 25 }
            ]};

            //create a review opts aggreate call.
            //returns reviews grouped by _id. Highest average review first.
            const reviewOpts = (count_field) => { return [
                {
                    $group: {
                        _id: "$"+count_field,
                        avgRating: { $avg: "$rating"}
                    },     
                },
                { "$sort": { "avgRating": -1 } },
                { "$limit": 25 }
            ]};

            //Get loans(popularity) and reviews(ratings).
            loan.aggregate(loanOpts("tape_id", userId), (err, loans) => {
                review.aggregate(reviewOpts("tape_id"), (err,  rev) => {
                    //get the tapes based on popularity and ratings, if possible.
                    this.pick(response.data.data, rev, loans, (pickResponse) => {
                        return callback(pickResponse);
                    });
                });
            });

        });
    }
};

module.exports = new RecommendationService();
