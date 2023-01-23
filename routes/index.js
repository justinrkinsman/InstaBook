var express = require('express');
var router = express.Router();
const { DateTime } = require('luxon')
let fs = require('fs')
let path = require('path')

const User = require("../models/user")
const Post = require('../models/post')
const Comment = require('../models/comment')
const ImageModel = require('../models/image')

// Multer object creation
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({ storage: storage })

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

// GET edit post page
router.get('/api/posts/:id/edit-post', (req, res) => {
    Post.find({_id: req.params.id}).then((found_post) => {res.json(found_post)})
})

// GET edit comment page
router.get('/api/comment/:id/edit-comment', (req, res) => {
    Comment.find({_id: req.params.id}).then((found_comment) => {res.json(found_comment)})
})

// GET delete comment page
router.get('/api/posts/:postId/comment/:id/delete-comment', (req, res) => {
    Comment.find({_id: req.params.id}).then((found_comment) => {res.json(found_comment)})
})

// GET images   THIS WILL BE REMOVED LATER
router.get('/photos', (req, res) => {
    ImageModel.find({}, (err, items) => {
        if (err) {
            console.log(err)
            res.status(500).send('An error occurred', err)
        }else{
            res.render('photos.pug', {title: 'Photos'/*, items: items */})
        }
    })
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

// POST new photo THIS WILL BE MERGED WITH UPLOAD POST LATER
router.post('/photos', upload.single('image'), (req, res, next) => {

    let obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname, "..", 'public', 'uploads', req.file.filename)),
            contentType: 'image/png'
        }
    }
    ImageModel.create(obj, (err, item) => {
        if (err) {
            console.log(err)
        }else{
            //item.save()
            res.redirect('/')
        }
    })
})

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

// PUT Edit Post
router.put('/api/posts/:id/edit-post', (req, res) => {
    Post.findByIdAndUpdate(req.params.id, {_id: req.params.id, body: req.body.body},
        async function (err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update Post :', docs)
            }
        })
    res.redirect('/api/posts')
})

// PUT Edit Comment
router.put('/api/comment/:id/edit-comment', (req, res) => {
    Comment.findByIdAndUpdate(req.params.id, {_id: req.params.id, body: req.body.body},
        async function (err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update Post :', docs)
            }
        })
    res.redirect('api/posts')
})

/// DELETE APIs ///
// DELETE post
router.delete('/api/posts/:id', (req, res) => {
    Comment.deleteMany({ post: req.params.id}, function(err, results) {
        if (err) {
            console.log(err)
        }else{
            console.log('Deleted comments: ', results)
        }
    })
    Post.findByIdAndDelete(req.params.id, (err, docs) => {
        if (err) {
            console.log(err)
        }else{
            console.log('Deleted: ', docs)
        }
    })
    res.json({ deleted: req.params.id })
})

// DELETE comment
router.delete('/api/posts/:postId/comment/:id/delete-comment', (req, res) => {
    Comment.findByIdAndDelete(req.params.id, (err, docs) => {
        if (err) {
            console.log(err)
        }else{
            console.log('Deleted: ', docs)
        }
    })
    Post.findByIdAndUpdate(req.params.postId, {_id: req.params.postId, $pull: {"comments": req.params.id}},
        function (err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update Post :', docs)
            }
        })
        res.json({ delete: req.params.id })
    })
    

module.exports = router