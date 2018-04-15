var express = require('express');
var tweet = require('./tweet');
var sentiment = require('./sentiment');
var config = require('../../config');

var api = express.Router();

api.get('/calculateSentiment/user/:screenName', sentiment.calAvgSentUser);
api.get('/calculateSentiment/hero/:screenName', sentiment.calAvgSentHero);
api.get('/following/:screenName', tweet.getFollowing);
api.get('/getTweets/:screenName', tweet.getTweets);
api.get('/saveHeroTweets/:screenName', tweet.saveHeroTweets);

module.exports = api;
