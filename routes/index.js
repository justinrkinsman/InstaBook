var express = require('express');
var router = express.Router();
const { DateTime } = require('luxon')

const User = require("../models/user")
const Post = require('../models/post')

/// GET APIs ///
// GET posts for home page
router.get('/api/homepage', (req, res) => {
    Post.find({})./*sort({db_timestamp: -1})*/then((post_count) => {res.json(post_count)})
})

/// POST APIs ///
// POST new post
router.post('/api/posts', (req, res) => {
    const date = new Date()
    const newTimestamp = DateTime.fromJSDate(date).toFormat("MMMM d yyyy h:mm a")
    postDetail = {
        body: req.body.body,
        author: req.body.author,
        comments: [],
        likes: 0,
        timestamp: newTimestamp,
        db_timestamp: date
    }

    let post = new Post(postDetail)

    post.save(function (err) {
        return
    })
    res.redirect('/')
})

// POST send friend request
router.post('/api/user/:id', (req, res) => {
    User.updateOne( { "_id" : req.params.id }, { $push: { "friends_list.sent_requests": 'Hello'}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    return res.send(`It works brah`)
})

module.exports = router