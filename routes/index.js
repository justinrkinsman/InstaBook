var express = require('express');
var router = express.Router();
const { DateTime } = require('luxon')

const User = require("../models/user")
const Post = require('../models/post')
const Comment = require('../models/comment')

/// GET APIs ///
// GET posts for home page
router.get('/api/homepage', (req, res) => {
    Post.find({})
    .populate('author')
    .sort({db_timestamp: -1})
    .then((post_count) => {res.json(post_count)})
})

// GET delete page
router.get('/api/posts/:id/delete-post', (req, res) => {
    Post.find({_id: req.params.id}).then((found_post) => res.json(found_post))
})

// GET comments list for post
router.get('/api/posts/:id/comments', (req, res) => {
    Comment.find({post: req.params.id})
    .sort({db_timestamp: -1})
    .populate('user')
    .populate('post')
    .then((found_comments) => {res.json(found_comments)})
})

// GET list of users
router.get('/api/users', (req, res) => {
    User.find({})
    .populate('friends_list.current_friends')
    .sort({last_name: 1})
    .then((user_count) => {res.json(user_count)})
})

// GET page for individual user
router.get('/api/user/:id', async (req, res) => {
    const data = {}
    await User.find({_id: req.params.id}).then((found_user) => {data[0] = found_user})
    await Post.find({author: req.params.id}).then((found_posts) => {data[1] = found_posts})
    res.json(data)
})

/// POST APIs ///
// POST new post
router.post('/api/new-post', (req, res) => {
    const date = new Date()
    const newTimestamp = DateTime.fromJSDate(date).toFormat("MMMM d yyyy h:mm a")
    postDetail = {
        body: req.body.content,
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
    res.redirect('/api/homepage')
})

// POST new comment
router.post('/api/posts/:id/comments', async (req, res) => {
    const date = new Date()
    newTimestamp = DateTime.fromJSDate(date).toFormat('MMMM d yyyy h:mm a')

    const userId = await User.findOne({username: req.body.user})

    commentDetail = {
        body: req.body.body,
        timestamp: newTimestamp,
        db_timestamp: date,
        user: userId,
        post: req.params.id
    }

    let comment = new Comment(commentDetail)

    comment.save(function (err) {
        if (err) {
            console.log(err)
            return
        }
    })

    Post.findByIdAndUpdate(req.params.id, {_id: req.params.id, $push: {comments: comment}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update Post :', docs)
            }
        })
    res.redirect(`/api/homepage`)
})

// POST send friend request
router.post('/api/users/:id', (req, res) => { 
    User.findByIdAndUpdate(req.params.id, {_id: req.params.id, $push: {"friends_list.received_requests": req.body.user_id}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    User.findByIdAndUpdate(req.body.user_id, {_id: req.body.user_id, $push: {"friends_list.sent_requests": req.params.id}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    return res.redirect(`/api/users`)
})

// POST like post
router.post('/api/post')

/// PUT APIs ///
// PUT like post
router.put('/api/posts/:id/like-post', (req, res) => {
    Post.findByIdAndUpdate(req.params.id, {_id: req.params.id, $inc: {"likes": 1}},
    function(err, docs) {
        if (err) {
            console.log(err)
        }else{
            console.log('Update User :', docs)
        }
    })
    return res.redirect('/api/homepage')
})

// PUT accept friend request
router.put(`/api/users/:id`, (req, res) => {
    User.findByIdAndUpdate(req.params.id, {_id: req.params.id, $push: {"friends_list.current_friends": req.body.user_id}, $pull: {"friends_list.sent_requests": req.body.user_id}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    User.findByIdAndUpdate(req.body.user_id, {_id: req.body.user_id, $push: {"friends_list.current_friends": req.params.id}, $pull: {"friends_list.received_requests": req.params.id}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    return res.redirect(`/api/users`)
})

/// DELETE APIs ///
// DELETE post
router.delete('/api/posts/:id', (req, res) => {
    /*Comment.deleteMany({ post: id ---THIS NEEDS TO BE CHANGED}, function(err, results) {
        if (err) {
            console.log(err)
        }else{
            console.log('Deleted comments: ', results)
        }*/
    Post.findByIdAndDelete(req.params.id, (err, docs) => {
        if (err) {
            console.log(err)
        }else{
            console.log('Deleted: ', docs)
        }
    })
    res.json({ deleted: req.params.id })
})

module.exports = router