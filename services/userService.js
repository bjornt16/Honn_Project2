const service = require('./service.js')
const mongoose = require('mongoose');
const STATUS_CODE = require('../utility/constants.js').STATUS_CODE;
const user = require('../data/db.js').user;
let loanService;
let reviewService;

class UserService extends service{

    constructor() {
        super();
    }

    refreshServices(){
        loanService = require('./index.js').get("loan");
        reviewService = require('./index.js').get("review");
    }

    getAllUsers(loanDate, loanDuration, callback) {
        if(loanDate || loanDuration){
            //get all loans within the loanDate/loanDuration parameters.
            loanService.getAllLoans(loanDate, loanDuration, (response) => {
                if(!response.data.data.length){
                    //if no loans were found return.
                    return callback(response);
                }
                //generate an "or" array, to find only the users with loans within the parameters.
                let find = {$or: []};
                for(let i = 0; i < response.data.data.length; i++){
                    find["$or"].push({_id: response.data.data[i].user_id})
                }
                user.find(find, (err, users) => {
                    return callback(this.process(err, null, null, users));
                });
            });  
        }
        else{
            //if no loan parameters, get all all users.
            user.find({}, (err, users) => {
                return callback(this.process(err, null, null, users));
            });
        }
    };

    getUserById(loanDate, loanDuration, userId, getLoans, getReviews, callback) {
        //get the user.
        user.findById(userId, (err, user) => {
            let response = this.process(err, "User", userId, user);
            if(response.statusCode != STATUS_CODE.OK || (!getLoans && !getReviews)){
                //if response is not OK - or
                //if status is OK but there is no need to get the loans / reviews.
                return callback(response);
            }
            if(getLoans){
                //get the users loans, filtered by loandate/loanduration if any.
                loanService.getUserLoans(loanDate, loanDuration, userId, (loanResponse) => {
                    //add the loan array to the user data.
                    response.data.data[0].loan = loanResponse.data.data;
                    if(getReviews){
                        //get the users reviews if any.
                        reviewService.getUserReviews(userId, (reviewResponse) =>{
                            //add the review array to the user data.
                            response.data.data[0].review = reviewResponse.data.data;
                            return callback(response);
                        });
                    }
                    else{
                        return callback(response);
                    }
                });
            }
            else if(getReviews){
                //get the users reviews if any.
                reviewService.getUserReviews(userId, (reviewResponse) => {
                    //add the review array to the user data.
                    response.data.data[0].review = reviewResponse.data.data;
                    return callback(response);
                });
            }
        });

    };

    createUser(fName, lName, email, phone, address, callback) {
        //create a user on the db. the schema and this.process will take care of validation.
        user.create({
                first_name: fName,
                last_name: lName,
                email: email,
                phone: phone,
                address: address
            }, (err, user) => {
                return callback(this.process(err, null, null, user, false, STATUS_CODE.CREATED ));
        });
    };

    updateUser(userId, fName, lName, email, phone, address, callback) {
        let update = {};
        if(!fName && !lName && !email && !phone && !address){
            //if no update parameters.
            return callback(this.customResponse(STATUS_CODE.BAD_REQUEST, "fail", "Unable to update.", 
                            {Loan: "No valid update paramaters."}));
        }
        //only update the non null params.
        if(fName != null){ update.first_name = fName; }
        if(lName != null){ update.last_name = lName; }
        if(email != null){ update.email = email; }
        if(phone != null){ update.phone = phone; }
        if(address != null){ update.address = address; }

        //update a user on the db. the schema and this.process will take care of validation.
        user.findByIdAndUpdate(userId, update, { new: true, runValidators: true }, (err, user) => {
            return callback(this.process(err, "user", userId, user));
        });
    };

    deleteUser(userId, callback) {
        //get the user
        this.getUserById(null, null, userId, false, false, (response) => {
            //if no user found, return.
            if(response.statusCode != STATUS_CODE.OK){
                return callback(response);
            }
            //delete the users reviews.
            reviewService.deleteUserReviews(userId, (reviewResponse) =>{
                if(response.statusCode == STATUS_CODE.OK){
                    //if user had any reviews, add it to the user data.
                    response.data.data[0].review = reviewResponse.data.data;
                }
                //delete the users loans.
                loanService.deleteUserLoans(userId, (loanService) =>{
                    if(response.statusCode == STATUS_CODE.OK){
                        //if user had any loans, add it to the user data.
                        response.data.data[0].loan = reviewResponse.data.data;
                    }
                    //finally, delete the user, no need to wait for the result, we have it all already.
                    user.deleteOne({_id: userId}).exec();
                    return callback(response);
                });
            });
        });
    };

};

module.exports = new UserService();
