var express = require('express');

var tweet = require('./tweet');
var config = require('../../config');

var api = express.Router();

api.get('/', tweet.getTweets);
api.get('/following', tweet.getFollowing);

module.exports = api;
