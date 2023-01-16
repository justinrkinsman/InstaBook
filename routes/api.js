const express = require('express');
const router = express.Router();
const { DateTime } = require('luxon')

const User = require("../models/user")
const Post = require('../models/post')

/// GET APIs ///
// GET posts for home page
router.get('/api/homepage', (req, res) => {
    Post.find({})./*sort({db_timestamp: -1})*/then((post_count) => {res.json(post_count)})
})

module.exports = router