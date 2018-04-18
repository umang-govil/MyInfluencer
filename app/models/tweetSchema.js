var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TweetSchema = new Schema({
	screen_name: {
		type: String
	},
	image_url: {
		type: String
	},
	tweet: [{
		text: {
			type: String
		},
		created_at: {
			type: Date
		}
	}],
	following: [{
		type: String
	}],
	followingDetails: [{
		screen_name: {
			type: String
		},
		tweets: [{
			type: String
		}]
	}]
}, {
	timestamps: true
});

module.exports = mongoose.model('Tweet', TweetSchema);
