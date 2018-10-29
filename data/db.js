const mongoose = require('mongoose');
const schema = require('../schemas/index');

//tell mongoose to not use the deprecated useFindAndModify.
mongoose.set('useFindAndModify', false);

//establish db connection.
mongoose.connect('mongodb://admin:honnpro2@ds139193.mlab.com:39193/honn_project2', { useNewUrlParser: true});
const connection = mongoose.connection;

let models = {};
const keys = Object.keys(schema);
for(let i = 0; i < keys.length; i++){
  models[keys[i]] = connection.model(keys[i], schema[keys[i]], keys[i]);
}

module.exports = models;

//some logs to monitor the db status.
mongoose.connection.on('error',function (err) {  
  console.log('db error: ' + err);
}); 
mongoose.connection.on('disconnected', function () {  
  console.log('db disconnected'); 
});