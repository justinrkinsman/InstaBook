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
    .then((found_comments) => {res.json(found_comments)})
})

// GET list of users
router.get('/api/users', (req, res) => {
    User.find({})
    .populate('friends_list.current_friends')
    .sort({last_name: 1})
    .then((user_count) => {res.json(user_count)})
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
router.post('/api/user/:id', (req, res) => { //replace req.params.id with req.user.id. Replace manually filled in id with req.params.id
    User.findByIdAndUpdate(req.params.id, {_id: req.params.id, $push: {"friends_list.received_requests": '63c15a55d75b655101d0a253'}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    User.findByIdAndUpdate('63c15a55d75b655101d0a253', {_id: '63c15a55d75b655101d0a253', $push: {"friends_list.sent_requests": req.params.id}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    return res.send(`It works brah`)
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
router.put(`/api/user/:id`, (req, res) => { //req.params.id will be the received user's id. Req.user will be the logged in user
    //req.params.id
    User.findByIdAndUpdate('63c15ab11a05260474bc9967', {_id: '63c15ab11a05260474bc9967', $push: {"friends_list.current_friends": '63c15a981a05260474bc9959'}, $pull: {"friends_list.sent_requests": '63c15a981a05260474bc9959'}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    ///req.user
    User.findByIdAndUpdate('63c15a981a05260474bc9959', {_id: '63c15a981a05260474bc9959', $push: {"friends_list.current_friends": '63c15ab11a05260474bc9967'}, $pull: {"friends_list.received_requests": '63c15ab11a05260474bc9967'}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    return res.send(`It works brah`)
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