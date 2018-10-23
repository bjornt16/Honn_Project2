const mongoose = require('mongoose');
const bhSchema = require('../schemas/borrow_history');
const reviewSchema = require('../schemas/review');
const tapeSchema = require('../schemas/tape');
const userSchema = require('../schemas/user');

//establish db connection.
mongoose.connect('mongodb://admin:honnpro2@ds139193.mlab.com:39193/honn_project2', { useNewUrlParser: true});
const connection = mongoose.connection;

module.exports = {
    borrowHistory: connection.model('Borrow_History', bhSchema),
    review: connection.model('Review', reviewSchema),
    tape: connection.model('Tape', tapeSchema),
    user: connection.model('User', userSchema)
};

mongoose.connection.on('error',function (err) {  
  //console.log('db error: ' + err);
}); 

mongoose.connection.on('disconnected', function () {  
  //console.log('db disconnected'); 
});

//if app is shut down, close connection.
process.on('SIGINT', function () {
  mongoose.connection.close(function () { 
    process.exit(0); 
  }); 
});