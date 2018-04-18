var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');
const path = require('path');
var app = express();

var options = {
	server: {
		socketOptions: {
			keepAlive: 300000,
			connectTimeoutMS: 30000
		}
	}
};

mongoose.connect(config.database, options, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Connected to the database");
	}
});

module.exports = app;
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(function(req, res, next) {
	req.headers['if-none-match'] = 'no-match-for-this';
	next();    
});

app.use(express.static(path.join(__dirname, 'public'),{
	maxAge: 0
}));

var api = require('./app/routes/api');
app.use('/api', api);

app.listen(config.port, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Listening on port: " + config.port);
	}
});
