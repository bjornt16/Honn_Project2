const express = require("express");
const mongoose = require('mongoose');
const fs = require("fs");
const https = require("https");
const bodyParser = require("body-parser");
const port = 3000;
const app = express();

//tell express to use the body parser.
app.use(bodyParser.json()); 

require("./routes")(app);

//start the https server on port 3000
//using our self signed certificate. (for dev)
const server = https.createServer({
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert")
}, app)
.listen(port);

//add reference to the running server, so we can close it.
app.server = server;

module.exports = app;

//if app is shut down, close connections.
process.once("SIGINT", function () {
  server.close(() =>{
  	console.log("server closed");
  	mongoose.connection.close(() => {
  		console.log("db closed");
		process.exit(0);
  	});
  });
});