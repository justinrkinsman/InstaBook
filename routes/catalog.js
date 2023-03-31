var express = require('express');
var router = express.Router();
const fetch = (...args) =>
  import('node-fetch').then(({default: fetch}) => fetch(...args))
const { DateTime } = require('luxon')
const Post = require('../models/post')
const User = require('../models/user')

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

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login')
  }
  return res.redirect('/homepage')
})

router.get('/homepage', function(req, res, next) {
  if (!req.user) {
    res.redirect('/login')
  }
  const requestUrl = `http://localhost:3000/api/homepage?userId=${req.user._id}`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    if (!req.user) {
      return res.render('index.pug', { title: "InstaBook", posts: data[0], notifications: data[1], user: null })
    }else{
      let str = JSON.stringify(data[1]);
      return res.render('index.pug', { title: "InstaBook", posts: data[0], notifications: str, user: req.user });
    }
  })
  //res.render('index.pug', {title: "InstaBook", user: req.user.first_name})
});

/* GET new post page */
router.get('/new-post', function(req, res, next) {
  res.render('new-post.pug', {title: "New Post"})
})

/* POST new post */
router.post('/new-post', upload.single('image'), (req, res, next) => {
  //if (req.body.image.length === 0) {
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
  /*}else{
    const requestUrl =`http://localhost:3000/api/new-photo`
    fetch(requestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'content': req.body.post_body,
        "author": req.user,
        "image": req.body.image,
        "file": req.file.filename
      })
    })
    .then(response => response.json())
    .then(data => {
      return res.redirect('/')
    })
  }*/
})

/*router.post('/new-post', (req, res, next) => {
  if (req.body.image.length === 0) {
    res.redirect('/')
  }else{
    res.redirect('/login')
  }
})*/

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
    body: JSON.stringify({"current_user": req.user._id})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Sucess', data)
  })
  .catch((error) => {
    console.log('Error', error)
  })
  res.redirect('back')
})

/* POST unlike post */
router.post('/posts/:id/unlike-post', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/unlike-post`
  fetch(requestUrl, {
    method: 'PUT',
    // Try adding this later mode: 'cors'
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"current_user": req.user._id})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Sucess', data)
  })
  .catch((error) => {
    console.log('Error', error)
  })
  res.redirect('back')
})

/* POST favorite post */
router.post('/posts/:id/fav-post/:userId', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/fav-post/${req.params.userId}`
  fetch(requestUrl, {
    method: 'PUT',
    // Try adding this later mode: 'cors'
    headers: { 'Content-Type': 'application/json' },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Sucess', data)
    res.redirect('back')
  })
  .catch((error) => {
    console.log('Error', error)
  })
})

/* POST un-fav post */
router.post('/posts/:id/unfav-post/:userId', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/unfav-post/${req.params.userId}`
  fetch(requestUrl, {
    method: 'PUT',
    // Try adding this later mode: 'cors'
    headers: { 'Content-Type': 'application/json' },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Sucess', data)
    res.redirect('back')
  })
  .catch((error) => {
    console.log('Error', error)
  })
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
/*router.get('/posts/:id/new-comment', (req, res, next) => {
  res.render('new-comment.pug', {title: 'New Comment'})
})*/

router.get('/posts/:id/comments', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/comments`
    fetch(requestUrl)
    .then(response => response.json())
    .then(async data => {
      return res.render('comments.pug', {title: "New Comment", comments: data[1], posts: data[0], current_user: req.user})
    })
})

/* GET all comments for post */
/*router.get('/posts/:id/comments', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/comments`
    fetch(requestUrl)
    .then(response => response.json())
    .then(async data => {
        return res.render('comments.pug', {title: "Comments", comments: data, current_user: req.user})
    })
})*/

/* POST comment page */
router.post('/posts/:id/comments', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/comments`
  fetch(requestUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({"body": req.body.comment, "user": req.user.username})
  })
  .then(response => response.json())
  .then(data => {
    return res.redirect('back')
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

/* GET search results */
router.get('/search/:query', (req, res) => {
  const requestUrl = `http://localhost:3000/api/search/${req.params.query}`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    return res.render('search-results.pug', { title: "Search Results", users: data, current_user: req.user});
  })
});

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
    res.redirect('/users')
  })
  .catch((error) => {
    console.log('Error', error)
  })
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
    res.redirect('/users')
  })
  .catch((error) => {
    console.log('Error', error)
  })
})

/* POST remove friend */
router.post(`/users/:id/remove-friend`, function(req, res, next) {
  const requestUrl = `http://localhost:3000/api/users/${req.params.id}/remove-friend`
  fetch(requestUrl, {
    method: 'DELETE',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({'user_id': req.user._id})
  })
  .then(response => response.json())
  .then(data => {
    console.log("Sucess", data)
    res.redirect('/users')
  })
  .catch((error) => {
    console.log("Error", error)
  })
})

/* GET edit post page */
router.get('/posts/:id/edit-post', (req, res) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/edit-post`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    res.render('edit-post.pug', {title: 'Edit Post', post: data})
  })
})

/* POST edit post page */
router.post('/posts/:id/edit-post', (req, res) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.id}/edit-post`
  fetch(requestUrl, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({body: req.body.body})
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

/* GET edit comment page */
router.get('/posts/:postId/comment/:id/edit-comment', (req, res) => {
  const requestUrl = `http://localhost:3000/api/comment/${req.params.id}/edit-comment`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    res.render('edit-comment.pug', {title: 'Edit Comment', comment: data})
  })
})

/* POST edit comment page */
router.post(`/posts/:postId/comment/:id/edit-comment`, (req, res) => {
  const requestUrl = `http://localhost:3000/api/comment/${req.params.id}/edit-comment`
  fetch(requestUrl, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({body: req.body.body})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Sucess', data)
  })
  .catch((error) => {
    console.log('Error', error)
  })
  res.redirect(`/posts/${req.params.postId}/comments`)
})

/* GET delete comment page */
router.get('/posts/:postId/comment/:id/delete-comment', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.postId}/comment/${req.params.id}/delete-comment`
  fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    res.render('delete-comment.pug', {title: "Delete Comment", comments: data})
  })
})

/* POST delete comment page */
router.post('/posts/:postId/comment/:id/delete-comment', (req, res, next) => {
  const requestUrl = `http://localhost:3000/api/posts/${req.params.postId}/comment/${req.params.id}/delete-comment`
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
  res.redirect(`/posts/${req.params.postId}/comments`)
})

/*router.post('/photos', upload.single('image'), (req, res, next) => {

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
})*/

router.get('/users/:userId/friends', (req, res) => {
  const requestUrl = `http://localhost:3000/api/users/${req.params.userId}/friends`
  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      res.render('friend_list.pug', {title: `${req.params.userId} Friends`, friends: data, current_user: req.user})
    })
})

router.get('/notifications/:id', (req, res) => {
  const requestUrl = `http://localhost:3000/api/notifications/${req.params.id}`
  fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
      let str = JSON.stringify(data);
      res.render('notifications.pug', {title: `Your Notifications`, notifications: str, user: req.user})
    })
})

module.exports = router;