var express = require('express');
var router = express.Router();
const { DateTime } = require('luxon')
let fs = require('fs')
let path = require('path')

const User = require("../models/user")
const Post = require('../models/post')
const Comment = require('../models/comment')
const ImageModel = require('../models/image')
const Notification = require('../models/notifications')

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
router.get('/api/homepage', async (req, res) => {
    const userId = req.query.userId;
    const data = {}
    await Post.find({})
    .populate('author')
    .sort({db_timestamp: -1})
    .then((post_count) => {{data[0] = post_count}})
    await Notification.find({this_user: userId})
    .sort({db_timestamp: -1})
    .then((note_count) => {{data[1] = note_count}})
    res.json(data)
})

// GET delete page
router.get('/api/posts/:id/delete-post', (req, res) => {
    Post.find({_id: req.params.id}).then((found_post) => res.json(found_post))
})

// GET comments list for post
/*router.get('/api/posts/:id/comments', (req, res) => {
    Comment.find({post: req.params.id})
    .sort({db_timestamp: -1})
    .populate('user')
    .populate('post')
    .then((found_comments) => {res.json(found_comments)})
})*/

router.get('/api/posts/:id/comments', async (req, res) => {
    const data = {}
    await Post.find({_id: req.params.id}).populate('author').then((post_count) => {data[0] = post_count})
    await Comment.find({post: req.params.id}).sort({db_timestamp: -1}).populate('user').then((comment_count) => {data[1] = comment_count})
    res.json(data)
})

// GET list of users
router.get('/api/users', async (req, res) => {
    const data = {}
    await User.find({})
    .populate('friends_list.current_friends')
    .sort({last_name: 1})
    .then((user_count) => {res.json(user_count)})
})

// GET page for individual user
router.get('/api/user/:id', async (req, res) => {
    const data = {}
    await User.find({_id: req.params.id}).then((found_user) => {data[0] = found_user})
    await Post.find({author: req.params.id}).sort({db_timestamp: -1}).then((found_posts) => {data[1] = found_posts})
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
/*router.get('/photos', (req, res) => {
    ImageModel.find({}, (err, items) => {
        if (err) {
            console.log(err)
            res.status(500).send('An error occurred', err)
        }else{
            res.render('photos.ejs', { items: items })
        }
    })
})*/

// GET friends list page
router.get('/api/users/:userId/friends', (req, res) => {
    User.find({_id: req.params.userId})
    .populate('friends_list.current_friends')
    .sort({'title': 1})
    .then((found_users) => {res.json(found_users)})
})

// GET search results
router.get('/api/search/:query', (req, res) => {
    const query = req.params.query;
    User.find({$or: [{first_name: {$regex: query, $options: "i"}}, {last_name: {$regex: query, $options: "i"}}, {username: {$regex: query, $options: "i"}}]})
      .then(users => {
        res.json(users);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("An error occurred while searching for users.");
      });
  });

// GET notifications page
router.get('/api/notifications/:id', (req, res) => {
    User.find({_id: req.params.id})
    .select("-username -password -friends_list -first_name -last_name -favorites -_id")
    .populate("notifications.likes.user")
    .populate("notifications.likes.post")
    .populate("notifications.accepted_friend_requests")
    .populate("notifications.received_friend_requests")
    .populate("notifications.comments.user")
    .populate("notifications.comments.post")
    .sort({db_timestamp: -1})
    .then((note_count) => res.json(note_count))
    .catch(error => {
        console.log(error);
        res.status(500).send("An error occurred while searching for notifications")
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
    try{
        const date = new Date()
        newTimeStamp = DateTime.fromJSDate(date).toFormat('MMMM d yyyy h:mm a')

        const userId = await User.findOne({username: req.body.user})

        commentDetail = {
            body: req.body.body,
            timestamp: newTimeStamp,
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

        const post = await Post.findByIdAndUpdate(
            req.params.id, 
            {
                $push: {comments: comment}
            },
            { new: true }
        )
        .populate("author")
        .exec();

        noteDetails = {
            this_user: post.author._id,
            user: userId,
            post: post._id,
            comments: true,
            timestamp: newTimeStamp,
            db_timestamp: date,
        }

        let note = new Notification(noteDetails)
        
        note.save(function (err) {
            if (err) {
                console.log(err)
                return;
            }
        })

        await User.findByIdAndUpdate(
            post.author._id,
            { $push: {"notifications": note} },
            { new: true }
        );

        res.json({ message: "Notification sent", user: req.body.user})
    }catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
})

// POST send friend request
router.post('/api/users/:id', async (req, res) => { 
    try {
        const date = new Date()
        newTimeStamp = DateTime.fromJSDate(date).toFormat('MMMM d yyyy h:mm a')

        noteDetails = {
            this_user: req.params.id,
            user: req.body.user_id,
            received_friend_requests: true,
            timestamp: newTimeStamp,
            db_timestamp: date,
        }

        let note = new Notification(noteDetails)
        
        note.save(function (err) {
            if (err) {
                console.log(err)
                return;
            }
        })

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                $push: {"friends_list.received_requests": req.body.user_id, "notifications": note},
                $pull: {"friends_list.sent_requests": req.body.user_id}
            },
            {new: true}
        )
        .exec();

        await User.findByIdAndUpdate(
            req.body.user_id,
            {
                $push: {"friends_list.sent_requests": req.params.id},
                $pull: {"friends_list.received_requests": req.params.id}
            },
            {new: true}
        );
        res.json({ message: "Notification sent", user})
    }catch (error){
        console.log(error);
        return res.status(500).send("Server error");
    }
})

// POST remove friend
router.delete('/api/users/:id/', (req, res) => { 
    User.findByIdAndUpdate(req.params.id, {_id: req.params.id, $pull: {"friends_list.current_friends": req.body.user_id}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    User.findByIdAndUpdate(req.body.user_id, {_id: req.body.user_id, $pull: {"friends_list.current_friends": req.params.id}},
        function(err, docs) {
            if (err) {
                console.log(err)
            }else{
                console.log('Update User :', docs)
            }
        })
    return res.redirect(`/api/users`)
})

// POST new photo THIS WILL BE MERGED WITH UPLOAD POST LATER


/// PUT APIs ///
// PUT like post
router.put('/api/posts/:id/like-post', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id, 
            {
                $inc: { "likes": 1 }, 
                $push: { "liked_users": req.body.current_user }
            },
            { new: true }
        )
        .populate("author")
        .exec();

        const date = new Date();
        newTimeStamp = DateTime.fromJSDate(date).toFormat('MMMM d yyyy h:mm a')

        noteDetails = {
            this_user: post.author._id,
            user: req.body.current_user,
            post: post._id,
            likes: true,
            timestamp: newTimeStamp,
            db_timestamp: date,
        }

        let note = new Notification(noteDetails)
        
        note.save(function (err) {
            if (err) {
                console.log(err)
                return;
            }
        })

        await User.findByIdAndUpdate(
            post.author._id,
            { $push: { "notifications": note } },
            { new: true }
        );

        res.json({ message: 'Notification sent', User })
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server error");
    }
});

// PUT unlike post
router.put('/api/posts/:id/unlike-post', (req, res) => {
    Post.findByIdAndUpdate(req.params.id, {_id: req.params.id, $inc: {"likes": -1}, $pull: {'liked_users': req.body.current_user}},
    function(err, docs) {
        if (err) {
            console.log(err)
        }else{
            console.log('Update User :', docs)
        }
    })
    return res.redirect('/api/homepage')
})

// PUT favorite post
/*router.put('/api/posts/:id/fav-post/:userId', (req, res) => {
    User.findByIdAndUpdate(req.params.userId, {_id: req.params.userId, $push: {'favorites': req.params.id}},
    function(err, docs) {
        if (err) {
            console.log(err)
        }else{
            console.log('Update User :', docs)
            return res.redirect('/api/homepage')
        }
    })
})*/

router.put('/api/posts/:id/fav-post/:userId', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { $push: { favorites: req.params.id } }, { new: true })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json({ message: 'Post added to favorites', user })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// PUT un-favorite post
/*router.put('/api/posts/:id/unfav-post/:userId', (req, res) => {
    User.findByIdAndUpdate(req.params.userId, {_id: req.params.userId, $pull: {'favorites': req.params.id}},
    function(err, docs) {
        if (err) {
            console.log(err)
        }else{
            console.log('Update User :', docs)
            return res.redirect('/api/homepage')
        }
    })
})*/
router.put('/api/posts/:id/unfav-post/:userId', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { $pull: {favorites: req.params.id} }, { new: true })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json({ message: 'Post removed from favorites', user})
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error'})
    }
})

// PUT accept friend request
router.put(`/api/users/:id`, async (req, res) => {
    try {
        const date = new Date()
        newTimeStamp = DateTime.fromJSDate(date).toFormat('MMMM d yyyy h:mm a')

        noteDetails = {
            this_user: req.params.id,
            user: req.body.user_id,
            accepted_friend_requests: true,
            timestamp: newTimeStamp,
            db_timestamp: date,
        }

        let note = new Notification(noteDetails)
        
        note.save(function (err) {
            if (err) {
                console.log(err)
                return;
            }
        })
        
        const user = User.findByIdAndUpdate(
            req.params.id, 
            {
                $push: {"friends_list.current_friends": req.body.user_id, "notifications": note}, 
                $pull: {"friends_list.sent_requests": req.body.user_id}
            },
            { new: true}
        )
        .exec();
            
        await User.findByIdAndUpdate(
            req.body.user_id, 
            {
                $push: {"friends_list.current_friends": req.params.id}, 
                $pull: {"friends_list.received_requests": req.params.id}
            },
            { new: true }
        );
        res.json({ message: "Notification sent", user})
    }catch(error){
        console.log(error);
        return res.status(500).send("Server error");
    }
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