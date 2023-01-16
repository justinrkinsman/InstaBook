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
    /*const requestUrl = `http://localhost:3000/api/homepage`
    fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
        if (!req.user) {
            return res.render('index.pug', { title: "InstaBook", posts: data, user: null })
        }else{
            return res.render('index.pug', { title: "InstaBook", posts: data, user: req.user.first_name})
        }
      })*/
      //return res.redirect('/login')
    res.render('index.pug', {title: "InstaBook", user: req.user.first_name})
  });
  
  /* GET login page. */
  router.get('/login', function(req, res, next) {
    res.render('login.pug', {title: "Login"})
  })

module.exports = router