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
      return res.render('index.pug', { title: "InstaBook", posts: data, user: req.user.username });
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

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login.pug', {title: "Login"})
})

/* GET sign up page */
router.get('/signup', function(req, res, next) {
  res.render('signup.pug', {title: "Sign Up"})
})

/* GET failed login page */
router.get('/failed-login', function(req, res, next) {
  res.render('failure.pug', {title: 'Login Attempt Failed'})
})



/* POST send friend request*/


module.exports = router;