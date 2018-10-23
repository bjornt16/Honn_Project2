const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
const port = 8080;
const app = express();

class EventHandler{
	constructor() {
        this.lastId = 0;
    }

    getNew(){
    	this.lastId = this.lastId < Number.MAX_SAFE_INTEGER ? this.lastId + 1 : 0;
		return this.lastId;
    }

    signEvent(emitter, resp){
    	const event = this.getNew();
    	emitter.once(event, response => {
			return resp.status(response.statusCode).json(response.data);
		});
		return event;
    }
};

const eventHandler = new EventHandler();

app.use(bodyParser.json()); 

app.get('/', function (req, res) {
  res.send('hello world')
});

require('./routes')(app, eventHandler);

const server = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(3000);

app.server = server;

module.exports = app;