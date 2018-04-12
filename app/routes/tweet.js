var express = require('express');
var Twitter = require('twitter');
var sentiment = require('sentiment');

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
	var screenName = req.params.screenName;

	client.get('statuses/user_timeline', {
		screen_name: screenName,
		count: 25,
		exclude_replies: true
	}, function(error, tweets, response) {
		if (!error) {
			tweets.forEach(function(tweet) {
				tweetArray.push({
					text: tweet.text
				});
			});

			var allTweets = new Tweet({
				tweet: tweetArray,
				screen_name: screenName
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

	var screenName = req.params.screenName;

	client.get('friends/list', {
		screen_name: screenName,
		count: 10
	}, function(err, data, response) {
		if (!err) {

			Tweet.findOne({
				screen_name: screenName
			}, function(err, tweet) {
				data.users.forEach(function(user) {
					tweet.following.push(user.screen_name);
				});

				tweet.save(function(err) {
					if (err) throw err;
				});
			});

			res.status(200).json({
				message: "saved the hero names in the following array in the db"
			});
		} else {
			res.status(500).json({
				error: error
			});
		}
	});
};

api.saveHeroTweets = function(req, res, next) {

	var screenName = req.params.screenName;
	var heroTweets = [];

	Tweet.findOne({
		screen_name: screenName
	}, function(err, tweet) {
		if (err) throw err;
		else if (!tweet) {
			res.status(500).send({
				err: err
			});
		} else {
			tweet.following.forEach(function(follow) {
				client.get('statuses/user_timeline', {
					screen_name: follow,
					exclude_replies: true
				}, function(error, tweets, response) {
					if (!error) {
						var date = new Date();
						tweets.forEach(function(tweet) {
							var createdDate = new Date(tweet.created_at);
							if ((createdDate.getHours() - date.getHours()) == 1) {
								heroTweets.push(tweet.text);
							}
						});
						Tweet.findOne({
							screen_name: screenName
						}, function(err, tweet) {
							if (err) throw err;
							else if (!tweet) {
								res.status(500).send({
									err: err
								});
							} else {
								tweet.followingDetails.push({
									screen_name: follow,
									tweets: heroTweets
								});
								tweet.save(function(err) {
									if (err) throw err;
								});
							}
						});
					} else {
						res.status(500).json({
							error: error
						});
					}
				});
			});
			res.status(200).send({
				message: 'saved hero tweets in db'
			});
		}
	});
};

api.calAvgSent = function(req, res, next) {

};
module.exports = api;
