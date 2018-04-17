var express = require('express');
var sentiment = require('sentiment');
var Tweet = require('../models/tweetSchema');
var api = express.Router();
var tweet = require('./tweet');
var result = require('./result');
var stringSimilarity = require('string-similarity');

let averageSentimentUser = 0;		//done
let averageSentimentHero = {};		//done
let lastTweet = '';					//done
let bestMatch = {};					//done
let tweetSentimentUser = 0;			//done
let tweetSentimentHero = {};		//done
let influence = {};

function tweetMatch(tweet){
	return new Promise(function(resolve, reject) {
		let rating = stringSimilarity.compareTwoStrings(tweet, lastTweet);
		let userWords = [];
		lastTweet.split('.').forEach(function(sentence){
			userWords.concat(sentence.split(' '));
		});
		let heroWords = [];
		tweet.split('.').forEach(function(sentence){
			heroWords.concat(sentence.split(' '));
		});
		userWords.forEach(function(uword){
			heroWords.forEach(function(hword){
				if(uword[0] == '#' && uword.indexOf(hword) != -1){
					rating = 1;
				}
			});
		});
		resolve(rating);
	});
}

function userAnalysis(screenName){
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
			lastTweet = tweet.tweet[0].text;
			tweetSentimentUser = sentiment(tweet.tweet[0].text).score;
			averageSentimentUser = sum/count;
			resolve(1);
		});
	});
}

function heroAnalysis(screenName){
	return new Promise(function(resolve, reject) {
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
				let max;
				tweet.followingDetails.forEach(function(followUser) {
					//console.log(followUser.screen_name);
					max = -999;
					followUser.tweets.forEach(function(herotweet) {
						var sent = sentiment(herotweet);
						sentScore += sent.score;
						count++;
						tweetMatch(herotweet).then(function(value){
							if(max < value){
								max = value;
								bestMatch[followUser.screen_name] = {'tweet': herotweet, 'confidence': value};
								tweetSentimentHero[followUser.screen_name] = sent.score;
							}	
						});
					});
					if (count > 0) {
						//console.log(sentScore / count);
						averageSentimentHero[followUser.screen_name] = sentScore/count;
					}
				});
				console.log('calculated Average Sentiment');
			}
			resolve(1);
		});
	});
}

api.result = function(req, res, next) {
	userAnalysis(req.params.screenName).then(() => {
		heroAnalysis(req.params.screenName).then(() => {
			for(var i in tweetSentimentHero){
				let rawData = (tweetSentimentUser - averageSentimentUser)/(tweetSentimentHero[i] - averageSentimentHero[i]);
				influence[i] = {
					'raw': rawData,
					'normalized': rawData*(bestMatch[i])['confidence']
				}
			}
			res.status(200).send({
				'Average User Sentiment': averageSentimentUser,
				'Average Hero Sentiment':averageSentimentHero,
				'User\'s Last Tweet':lastTweet,
				'User\'s Hero\'s Most Related Tweet':bestMatch,
				'User Tweet Sentiment':tweetSentimentUser,
				'Hero Tweet Sentiment':tweetSentimentHero,
				'Influence': influence
			});
		});
	});
};

module.exports = api;
