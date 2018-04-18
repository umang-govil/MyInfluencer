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
		count: 50,
		exclude_replies: true
	}, function(error, tweets, response) {
		var image_url = tweets[0].user.profile_image_url;
		if (!error) {
			tweets.forEach(function(tweet) {
				tweetArray.push({
					text: tweet.text,
					created_at: tweet.created_at
				});
			});

			var allTweets = new Tweet({
				tweet: tweetArray,
				screen_name: screenName,
				image_url: image_url
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
					tweetArray = [];
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
		count: 50
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

function saveFollow(tweet, createdDate, screenName) {
	var heroTweets = [];
	return new Promise(function(resolve, reject) {
		tweet.following.forEach(function(follow) {
			client.get('statuses/user_timeline', {
				screen_name: follow,
				exclude_replies: true
			}, function(error, tweets, response) {
				if (!error) {
					var date = new Date(createdDate);
					tweets.forEach(function(tweet) {
						var thisCreatedDate = new Date(tweet.created_at);

						var dateDiff = thisCreatedDate.getHours() - date.getHours();

						if (0 < dateDiff <= 5 && thisCreatedDate.getDate() == date.getDate()) {

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
							if (heroTweets.length === 0) {} else {
								tweet.followingDetails.push({
									screen_name: follow,
									tweets: heroTweets
								});
								tweet.save(function(err) {
									if (err) throw err;
								});
								heroTweets = [];
							}
						}
					});
				} else {
					console.log(error);
				}
			});
		});
		resolve(1);
	});
}


api.saveHeroTweets = function(req, res, next) {

	var screenName = req.params.screenName;

	Tweet.findOne({
		screen_name: screenName
	}, function(err, tweet) {
		if (err) throw err;
		else if (!tweet) {
			res.status(500).send({
				err: err
			});
		} else {

			var createdDate = tweet.tweet[0].created_at;
			saveFollow(tweet, createdDate, screenName).then(function() {
				res.status(200).send({
					message: 'saved hero tweets in db'
				});
			});
		}
	});
};

api.calAvgSent = function(req, res, next) {
	var screenName = req.params.screenName;
	var sentScore = 0;
	var count = 0;

	Tweet.findOne({
		screen_name: screenName
	}, function(err, tweet) {
		if (err) throw err;
		else if (!tweet) {
			res.status(500).send({
				err: err
			});
		} else {
			tweet.followingDetails.forEach(function(followUser) {
				console.log(followUser.screen_name);
				followUser.tweets.forEach(function(herotweet) {
					var sent = sentiment(herotweet);
					sentScore += sent.score;
					count++;
				});
				if (count > 0) {
					console.log(sentScore / count);
				} else {
					console.log(count);
				}
			});
			res.status(200).send({
				message: 'calculated Average Sentiment'
			});
		}
	});
};

module.exports = api;
