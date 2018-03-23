var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TweetSchema = new Schema({
	tweet: [{
		text: {
			type: String,
			required: true
		}
	}],
	following: [{
		screen_name: {
			type: String,
			required: true
		}
	}]
}, {
	timestamps: true
});

module.exports = mongoose.model('Tweet', TweetSchema);
