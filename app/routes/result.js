var express = require('express');
var sentiment = require('sentiment');
var Tweet = require('../models/tweetSchema');
var api = express.Router();
var tweet = require('./tweet');
var result = require('./result');
var stringSimilarity = require('string-similarity');

let averageSentimentUser = 0; //done
let averageSentimentHeroOverall = 0; //done
let averageSentimentHero = {}; //done
let lastTweet = ''; //done
let bestMatch = {}; //done
let tweetSentimentUser = 0; //done
let tweetSentimentHero = {}; //done
let influence = {};

function tweetMatch(tweet) {
	// return new Promise(function(resolve, reject) {
	tweet = (tweet.replace(/https:\/\/t.co\//g, '')).toLowerCase().replace(/a |about |above |after |again |against |all |am |an |and |any |are |aren't |as |at |be |because |been |before |being |below |between |both |but |by |can't |cannot |could |couldn't |did |didn't |do |does |doesn't |doing |don't |down |during |each |few |for |from |further |had |hadn't |has |hasn't |have |haven't |having |he |he'd |he'll |he's |her |here |here's |hers |herself |him |himself |his |how |how's |i |i'd |i'll |i'm |i've |if |in |into |is |isn't |it |it's |its |itself |let's |me |more |most |mustn't |my |myself |no |nor |not |of |off |on |once |only |or |other |ought |our |ours 	ourselves |out |over |own |same |shan't |she |she'd |she'll |she's |should |shouldn't |so |some |such |than |that |that's |the |their |theirs |them |themselves |then |there |there's |these |they |they'd |they'll |they're |they've |this |those |through |to |too |under |until |up |very |was |wasn't |we |we'd |we'll |we're |we've |were |weren't |what |what's |when |when's |where |where's |which |while |who |who's |whom |why |why's |with |won't |would |wouldn't |you |you'd |you'll |you're |you've |your |yours |yourself |yourselves /g, '');
	lastTweetModified = lastTweet.replace(/https:\/\/t.co\//g, '').toLowerCase().replace(/a |about |above |after |again |against |all |am |an |and |any |are |aren't |as |at |be |because |been |before |being |below |between |both |but |by |can't |cannot |could |couldn't |did |didn't |do |does |doesn't |doing |don't |down |during |each |few |for |from |further |had |hadn't |has |hasn't |have |haven't |having |he |he'd |he'll |he's |her |here |here's |hers |herself |him |himself |his |how |how's |i |i'd |i'll |i'm |i've |if |in |into |is |isn't |it |it's |its |itself |let's |me |more |most |mustn't |my |myself |no |nor |not |of |off |on |once |only |or |other |ought |our |ours 	ourselves |out |over |own |same |shan't |she |she'd |she'll |she's |should |shouldn't |so |some |such |than |that |that's |the |their |theirs |them |themselves |then |there |there's |these |they |they'd |they'll |they're |they've |this |those |through |to |too |under |until |up |very |was |wasn't |we |we'd |we'll |we're |we've |were |weren't |what |what's |when |when's |where |where's |which |while |who |who's |whom |why |why's |with |won't |would |wouldn't |you |you'd |you'll |you're |you've |your |yours |yourself |yourselves /g, '');
	let rating = stringSimilarity.compareTwoStrings(tweet, lastTweetModified);
	let userWords = [];
	lastTweetModified.split('.').forEach(function(sentence) {
		userWords.concat(sentence.split(' '));
	});
	let heroWords = [];
	tweet.split('.').forEach(function(sentence) {
		heroWords.concat(sentence.split(' '));
	});
	userWords.forEach(function(uword) {
		heroWords.forEach(function(hword) {
			if (uword[0] == '#' && uword.indexOf(hword) != -1) {
				rating = 1;
			}
		});
	});
	console.log('rating:' + rating);
	// resolve(rating);
	// });
	return rating;
}

function userAnalysis(screenName) {
	return new Promise(function(resolve, reject) {
		Tweet.findOne({
			screen_name: screenName
		}, function(err, tweet) {
			if (err) {
				console.log(err);
			}
			if (!tweet) {
				console.log('No Tweets found');
			}
			let count = 0;
			let sum = 0;
			tweet.tweet.forEach(function(twt) {
				sum += sentiment(twt.text).score;
				count++;
			});
			lastTweet = tweet.tweet[0].text;
			tweetSentimentUser = sentiment(tweet.tweet[0].text).score;
			averageSentimentUser = sum / count;
			resolve(1);
		});
	});
}

function heroAnalysis(screenName) {
	return new Promise(function(resolve, reject) {
		var sentScore = 0;
		var count = 0;
		Tweet.findOne({
			screen_name: screenName
		}, function(err, tweet) {
			if (err) {
				console.log(err);
			}
			if (!tweet) {
				console.log('No Tweets found');
			} else {
				let max;
				tweet.followingDetails.forEach(function(followUser) {
					//console.log(followUser.screen_name);
					max = -999;
					console.log(followUser.screen_name + ':' + max);
					followUser.tweets.forEach(function(herotweet) {
						var sent = sentiment(herotweet);
						sentScore += sent.score;
						count++;
						//console.log(max);
						//tweetMatch(herotweet).then(function(value) {
						let value = tweetMatch(herotweet);
						if (max < value) {
							max = value;
							console.log(followUser.screen_name + ':' + max);
							bestMatch[followUser.screen_name] = {
								'tweet': herotweet,
								'confidence': value
							};
							tweetSentimentHero[followUser.screen_name] = sent.score;
						}
						//});
					});
					if (count > 0) {
						//console.log(sentScore / count);
						averageSentimentHero[followUser.screen_name] = sentScore / count;

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
			for (var i in tweetSentimentHero) {
				let rawData = (tweetSentimentUser - averageSentimentUser) / (tweetSentimentHero[i] - averageSentimentHero[i]);
				influence[i] = {
					'raw': rawData,
					'normalized': rawData * (bestMatch[i])['confidence']
				}
			}
			res.status(200).send({
				'Average User Sentiment': averageSentimentUser,
				'Average Hero Sentiment': averageSentimentHero,
				'User\'s Last Tweet': lastTweet,
				'User\'s Hero\'s Most Related Tweet': bestMatch,
				'User Tweet Sentiment': tweetSentimentUser,
				'Hero Tweet Sentiment': tweetSentimentHero,
				'Influence': influence
			});
		});
	});
};

module.exports = api;
