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

<<<<<<< b5a71cbbef4dd33c7dea6888878678f34fe7f04d
app.use(express.static(path.join(__dirname, 'public')));
=======
// app.use(express.static(path.join(__dirname, 'public')))

>>>>>>> added avg sentiment of hero tweets api
var api = require('./app/routes/api');
app.use('/api', api);

app.listen(config.port, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Listening on port: " + config.port);
	}
});
