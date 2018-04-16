var express = require('express');
var tweet = require('./tweet');
var sentiment = require('./sentiment');
var result = require('./result');
var config = require('../../config');

var api = express.Router();

api.get('/calculateSentiment/user/:screenName', sentiment.calAvgSentUser);
api.get('/calculateSentiment/hero/:screenName', sentiment.calAvgSentHero);
api.get('/following/:screenName', tweet.getFollowing);
api.get('/getTweets/:screenName', tweet.getTweets);
api.get('/saveHeroTweets/:screenName', tweet.saveHeroTweets);
api.get('/result/:screenName', result.result);

module.exports = api;
