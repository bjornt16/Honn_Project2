const mongoose = require('mongoose');
const user = require('../data/db.js').user;

class UserService{
    constructor() {

    }

    response(statusCode, data)  {
        return {statusCode: statusCode, data: data};
    };

    getAllUsers(callback) {
        user.find({}, (err, users) => {
            if(err){
                return callback(this.response(500, {message: "Internal Server Error!"}));
            }
            else{
                return callback(this.response(200, users));
            }
        });
    };

    getUserById(userId, callback) {
        if(!mongoose.Types.ObjectId.isValid(userId)){
            this.response(404, {message: "User " + userId + " not found."});
            return;
        }

        user.findById(userId, (err, user) => {
            if(err){
                return callback(this.response(500, {message: err.message }));
            }
            else if(user == null){
                return callback(this.response(404, {message: "User " + userId + " not found."}));
            }
            else{
                return callback(this.response(200, user));
            }
        });

        //todo get borrow_history
    };

    createUser(fName, lName, email, phone, address, callback) {
        user.create({
                first_name: fName,
                last_name: lName,
                email: email,
                phone: phone,
                address: address
            }, (err, user) => {
            if(err){
                return callback(this.response(err.name == "ValidationError" ? 422 : 500, { message: err.message } ));
            }
            else{
                return callback(this.response(201, user));
            }
        });
    };

    updateUser(userId, fName, lName, email, phone, address, callback) {
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return callback(this.response(404, {message: "User " + userId + " not found."}));
        }

        let update = {};
        if(fName != null){ update.first_name = fName; }
        if(lName != null){ update.last_name = lName; }
        if(email != null){ update.email = email; }
        if(phone != null){ update.phone = phone; }
        if(address != null){ update.address = address; }

        user.findByIdAndUpdate(userId, update, { new: true, runValidators: true }, (err, user) => {
            if(err){
                return callback(this.response(err.name == "ValidationError" ? 422 : 500, { message: err.message } ));
            }
            else{
                return callback(this.response(200, user));
            }
        });
    };

    deleteUser(userId, callback) {
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return callback(this.response(404, {message: "User " + userId + " not found."}));
        }

        user.findByIdAndDelete(userId, (err, user) => {
            if(err){
                return callback(this.response(500, { message: err.message } ));
            }
            else if(user == null){
                return callback(this.response(404, {message: "User " + userId + " not found."}));
            }
            else{
                return callback(this.response(200, user));
            }
        });

        //todo remove borrow records and reviews for user
    };
    
};

module.exports = new UserService();
