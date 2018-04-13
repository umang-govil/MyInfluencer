var express = require('express');
var sentiment = require('sentiment');
var Tweet = require('../models/tweetSchema');
var api = express.Router();
var config = require('../../config');

api.calAvgSent = function(req, res, next) {
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
		console.log(sum,count);
		let score = sum/count;
		return res.status(200).json({
			score: score
		});
	});
};

module.exports = api;
