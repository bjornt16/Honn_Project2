const service = require('./service.js')
const mongoose = require('mongoose');
const STATUS_CODE = require('../utility/constants.js').STATUS_CODE;
const tape = require('../data/db.js').tape;
let loanService;
let userService;
let reviewService;

class TapeService extends service{
    constructor() {
        super();
    }

    refreshServices(){
        loanService = require('./index').get("loan");
        userService = require('./index').get("user");
        reviewService = require('./index').get("review");
    }

    //helper function to check if both the user and tape exist.
    //if not return the errors.
    userAndTapeExist(userId, tapeId, callback){
        //get the user.
        userService.getUserById(null, null, userId, false, false,  (userResponse) => {
            //get the tape.
            this.getTapeById(null, null, tapeId, false, false,  (tapeResponse) => {
                if(tapeResponse.statusCode != STATUS_CODE.OK){
                    //if tape doesn't exist.
                    if(userResponse.statusCode != STATUS_CODE.OK){
                        //if user also doesn't exist, add the error to the response.
                        tapeResponse.data.data.push(userResponse.data.data[0]);
                    }
                    return callback(tapeResponse);
                }
                else if(userResponse.statusCode != STATUS_CODE.OK){
                    //if tape exist but user doesn't return the users response.
                    return callback(userResponse);
                }
                else{
                    //if both exist, return status ok and result true.
                    return callback(this.response(STATUS_CODE.OK, [true]))
                }
            });
        });
    };

    getAllTapes(loanDate, loanDuration, callback) {
        if(loanDate || loanDuration){
            //get all loans within the loanDate/loanDuration parameters.
            loanService.getAllLoans(loanDate, loanDuration, (response) => {
                if(!response.data.data.length){
                    //if no loans were found return.
                    return callback(response);
                }
                //generate an "or" array, to find only the tapes with loans within the parameters.
                let find = {$or: []};
                for(let i = 0; i < response.data.data.length; i++){
                    find["$or"].push({_id: response.data.data[i].tape_id})
                }
                tape.find(find, null, {sort: {title: 1}}, (err, tapes) => {
                    return callback(this.process(err, null, null, tapes));
                });
            });  
        }
        else{
            //if no loan parameters, get all all tapes.
            tape.find({}, null, {sort: {title: 1}}, (err, tapes) => {
                return callback(this.process(err, null, null, tapes));
            });
        }

    };


    getTapeById(loanDate, loanDuration, tapeId, getLoans, getReviews, callback) {
        //get the tape.
        tape.findById(tapeId, (err, tape) => {
            let response = this.process(err, "tape", tapeId, tape);
            if(response.statusCode != STATUS_CODE.OK || (!getLoans && !getReviews)){
                //if response is not OK - or
                //if status is OK but there is no need to get the loans / reviews.
                return callback(response);
            }
            if(getLoans){
                //get the tape's loans, filtered by loandate/loanduration if any.
                loanService.getTapeLoans(loanDate, loanDuration, tapeId, (loanResponse) => {
                    //add the loan array to the tape data.
                    response.data.data[0].loan = loanResponse.data.data;
                    if(getReviews){
                        //get the tape's reviews if any.
                        reviewService.getTapeReviews(tapeId, (reviewResponse) =>{
                            //add the review array to the tape data.
                            response.data.data[0].review = reviewResponse.data.data;
                            return callback(response);
                        });
                    }else{
                        return callback(response);
                    }
                });
            }
            else if(getReviews){
                //get the tape's reviews if any.
                reviewService.getTapeReviews(tapeId, (reviewResponse) =>{
                    //add the review array to the tape data.
                    response.data.data[0].review = reviewResponse.data.data;
                    return callback(response);
                });
            }
        });
    };

    createTape(title, director_first_name, director_last_name, type, release_date, eidr, callback) {
        //create a tape on the db. the schema and this.process will take care of validation.
        tape.create({
                title: title != null ? title.charAt(0).toUpperCase().concat(title.slice(1)) : null,
                director_first_name: director_first_name,
                director_last_name: director_last_name,
                type: type,
                release_date: release_date,
                eidr: eidr
            }, (err, tape) => {
            return callback(this.process(err, null, null, tape, false, STATUS_CODE.CREATED ));
        });
    };

    updateTape(tapeId, title, director_first_name, director_last_name, type, release_date, eidr, callback) {
        let update = {};
        if(!title && !director_first_name && !director_last_name && !type && !release_date && !eidr){
            //if no update parameters.
            return callback(this.customResponse(STATUS_CODE.BAD_REQUEST, "fail", "Unable to update.", 
                            {Loan: "No valid update paramaters."}));
        }
        //only update the non null params.
        if(title){ update.title = title.charAt(0).toUpperCase().concat(title.slice(1)); }
        if(director_first_name){ update.director_first_name = director_first_name; }
        if(director_last_name){ update.director_last_name = director_last_name; }
        if(type){ update.type = type; }
        if(release_date){ update.release_date = release_date; }
        if(eidr){ update.eidr = eidr; }

        //update a tape on the db. the schema and this.process will take care of validation.
        tape.findByIdAndUpdate(tapeId, update, { new: true, runValidators: true }, (err, tape) => {
            return callback(this.process(err, "tape", tapeId, tape));
        });
    };

    deleteTape(tapeId, callback) {
        //get the tape
        this.getTapeById(null, null, tapeId, false, false, (response) => {
            //if no tape found, return.
            if(response.statusCode != STATUS_CODE.OK){
                return callback(response);
            }
            //delete the tape's reviews.
            reviewService.deleteTapeReviews(tapeId, (reviewResponse) =>{
                if(response.statusCode == STATUS_CODE.OK){
                    //if user had any reviews, add it to the tape data.
                    response.data.data[0].review = reviewResponse.data.data;
                }
                //delete the tape loans.
                loanService.deleteTapeLoans(tapeId, (loanService) =>{
                    if(response.statusCode == STATUS_CODE.OK){
                        //if tape had any loans, add it to the tape data.
                        response.data.data[0].loan = reviewResponse.data.data;
                    }
                    //finally, delete the tape, no need to wait for the result, we have it all already.
                    tape.deleteOne({_id: tapeId}).exec();
                    return callback(response);
                });
            });
        });

    };

};

module.exports = new TapeService();
