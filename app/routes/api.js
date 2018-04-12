var express = require('express');

var tweet = require('./tweet');
var config = require('../../config');

var api = express.Router();

api.get('/getTweets/:screenName', tweet.getTweets);
api.get('/following/:screenName', tweet.getFollowing);
api.get('/saveHeroTweets/:screenName', tweet.saveHeroTweets);

module.exports = api;
