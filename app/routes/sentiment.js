var express = require('express');
var sentiment = require('sentiment');
var Tweet = require('../models/tweetSchema');
var api = express.Router();

api.calAvgSentUser = function(req, res, next) {
	var screenName = req.params.screenName;
	Tweet.findOne({screen_name: screenName}, function(err, tweet) {
		if(err){
			return res.status(500).json({
				error: error
			});
		}
		if(!tweet){
			return res.status(401).json({
				error: 'No Tweets found'
			});
		}
		let count = 0;
		let sum = 0;
		//console.log(tweet);
		tweet.tweet.forEach(function(twt){
			//console.log(sentiment(twt.text));
			sum += sentiment(twt.text).score;
			count++;
		});

		let scoreFirst = sentiment(tweet.tweet[0].text).score;

		console.log(sum,count);
		let score = sum/count;
		return res.status(200).json({
			'Average Score': score,
			'Latest Tweet Score': scoreFirst
		});
	});
};

api.calAvgSentHero = function(req, res, next) {
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
