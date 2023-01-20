var express = require('express');
var router = express.Router();
const fetch = (...args) =>
  import('node-fetch').then(({default: fetch}) => fetch(...args))
const { DateTime } = require('luxon')
const Post = require('../models/post')
const User = require('../models/user')

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.redirect('/homepage')
})

router.get('/homepage', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login')
  }
  const requestUrl = `http://localhost:3000/api/homepage`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    if (!req.user) {
      return res.render('index.pug', { title: "InstaBook", posts: data, user: null })
    }else{
      return res.render('index.pug', { title: "InstaBook", posts: data, user: req.user });
    }
  })
  //res.render('index.pug', {title: "InstaBook", user: req.user.first_name})
});

/* GET new post page */
router.get('/new-post', function(req, res, next) {
  res.render('new-post.pug', {title: "New Post"})
})

/* POST new post */
router.post('/new-post', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/new-post`
  fetch(requestUrl, {
    method: 'POST',
    // Try adding this later mode: 'cors'
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "content": req.body.post_body,
      "author": req.user
    })
  })
  .then(response => response.json())
  .then(data => {
    return res.redirect('/')
  })
})

/* GET like post*/
/*router.get('/posts/:id/like-post', (req, res, next) => {
  res.redirect('/')
})*/

/* POST like post */
router.post('/posts/:id/like-post', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/like-post`
  fetch(requestUrl, {
    method: 'PUT',
    // Try adding this later mode: 'cors'
    headers: { 'Content-Type': 'application/json' },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Sucess', data)
  })
  .catch((error) => {
    console.log('Error', error)
  })
  res.redirect('/')
})

/* GET delete post page */
router.get('/posts/:id/delete-post', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/delete-post`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    res.render('delete-post.pug', {title: "Delete Post", post: data})
  })
})

/* POST delete post page */
router.post('/posts/:id/delete-post', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}`
  fetch(requestUrl, {
    method: 'DELETE',
    //Try adding this later - mode: 'cors'
    headers: { 'Content-Type': 'application/json' },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success', data)
  })
  .catch((error) => {
    console.log('Error', error)
  })
  res.redirect('/')
})

/* GET new comment page */
router.get('/posts/:id/new-comment', (req, res, next) => {
  res.render('new-comment.pug', {title: 'New Comment'})
})

/* GET all comments for post */
router.get('/posts/:id/comments', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/comments`
    fetch(requestUrl)
    .then(response => response.json())
    .then(async data => {
        return res.render('comments.pug', {title: "Comments", comments: data, current_user: req.user})
    })
})

/* POST comment page */
router.post('/posts/:id/new-comment', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/comments`
  fetch(requestUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({"body": req.body.comment, "user": req.user.username})
  })
  .then(response => response.json())
  .then(data => {
    return res.redirect('/')
  })
})

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login.pug', {title: "Login"})
})

/* GET sign up page */
router.get('/signup', function(req, res, next) {
  res.render('signup.pug', {title: "Sign Up"})
})

/* GET user index page */
router.get('/users', function(req, res, next) {
  const requestUrl = `http://localhost:3000/api/users`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    return res.render('user-index.pug', { title: "Users Index", users: data, current_user: req.user });
  })
})

/* GET individual user page */
router.get('/user/:id', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/user/${req.params.id}`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    return res.render('user.pug', { user: data[0], posts: data[1], current_user: req.user })
  })
})

/* GET failed login page */
router.get('/failed-login', function(req, res, next) {
  res.render('failure.pug', {title: 'Login Attempt Failed'})
})

/* POST send friend request*/
router.post('/users/:id', function(req, res, next) {
  const requestUrl = `http://localhost:3000/api/users/${req.params.id}`
  fetch(requestUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({"user_id": req.user._id})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Sucess', data)
  })
  .catch((error) => {
    console.log('Error', error)
  })
  res.redirect('/users')
})

/* POST accept friend request */
router.post('/users/:id/accept-friend', function(req, res, next) {
  const requestUrl = `http://localhost:3000/api/users/${req.params.id}`
  fetch(requestUrl, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({'user_id': req.user._id})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success', data)
  })
  .catch((error) => {
    console.log('Error', error)
  })
  res.redirect('/users')
})

/* GET edit post page */
router.get('/posts/:id/edit-post', (req, res) => {
  res.render('edit-post.pug', {title: 'Edit Post'})
})

module.exports = router;