var express = require('express');
var Twitter = require('twitter');
var Tweet = require('../models/tweetSchema');

var api = express.Router();

var config = require('../../config');

var client = new Twitter({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token_key: config.access_token_key,
	access_token_secret: config.access_token_secret
});

api.getTweets = function(req, res, next) {

	var tweetArray = [];

	client.get('statuses/user_timeline', {
		screen_name: 'Freakographer',
		count: 25
	}, function(error, tweets, response) {
		if (!error) {
			tweets.forEach(function(tweet) {
				tweetArray.push({
					text: tweet.text
				});
			});

			var allTweets = new Tweet({
				tweet: tweetArray
			});

			allTweets.save(function(err, data) {
				if (err) {
					res.status(500).json({
						err: err
					});
					return;
				} else {
					res.status(200).json({
						message: "Tweets saved successfully !"
					});
				}
			});

		} else {
			res.status(500).json({
				error: error
			});
		}
	});


};

api.getFollowing = function(req, res, next) {
	client.get('friends/list', {
		screen_name: 'Freakographer',
		count: 10
	}, function(err, data, response) {
		if (!err) {
			data.users.forEach(function(user) {
				following.push(user.screen_name);
			});
			res.status(200).json({
				tweet: tweetArray,
				data: following
			});
		} else {
			res.status(500).json({
				error: error
			});
		}
	});
};

module.exports = api;
