var express = require('express');
var sentiment = require('sentiment');
var Tweet = require('../models/tweetSchema');
var api = express.Router();
var tweet = require('./tweet');
var result = require('./result');

let averageSentimentUser = 0;
let averageSentimentHero = 0;
let lastTweet = '';
let bestMatch = '';
let tweetSentimentUser = 0;
let tweetSentimentHero = 0;

function avgSentimentUser(screenName, callback){
	return new Promise(function(resolve, reject) {
		Tweet.findOne({screen_name: screenName}, function(err, tweet) {
			if(err){
				console.log(err);
			}
			if(!tweet){
				console.log('No Tweets found');
			}
			let count = 0;
			let sum = 0;
			tweet.tweet.forEach(function(twt){
				sum += sentiment(twt.text).score;
				count++;
			});
			tweetSentimentUser = sentiment(tweet.tweet[0].text).score;
			averageSentimentUser = sum/count;
			// console.log('Average Score: '+ averageSentimentUser,', Latest Tweet Score: '+ tweetSentimentUser);
			callback(screenName);
			resolve(1);
		});
	});
}

function avgSentimentHero(screenName){
	var sentScore = 0;
	var count = 0;
	Tweet.findOne({
		screen_name: screenName
	}, function(err, tweet) {
		if(err){
			console.log(err);
		}
		if(!tweet){
			console.log('No Tweets found');
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
			console.log('calculated Average Sentiment');
		}
	});
}

api.result = function(req, res, next) {
	var initPromise = avgSentimentUser(req.params.screenName, avgSentimentHero);
	initPromise.then(() => {
		res.status(200).send({
			message: 'calculated Average Sentiment'
		});
	});
};

module.exports = api;
