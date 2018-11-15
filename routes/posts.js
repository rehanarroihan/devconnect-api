var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const postModel = require('../models/Posts');
const profileModel = require('../models/Profile');

const validatePostInput = require('../validation/post');

/*
    @route   GET posts/
    @desc    Get posts
    @access  Public 
*/
router.get('/', (req, res) => {
  postModel.find().sort({ date: -1 }).then(posts => {
    return res.json(posts)
  }).catch(err => {
    res.status(404).json({ nopostsfound: 'No posts found' })
  });
});

/*
    @route   GET posts/:id
    @desc    Get posts by id
    @access  Public 
*/
router.get('/:id', (req, res) => {
  postModel.findById(req.params.id).then(post => {
    return res.json(post);
  }).catch(err => {
    res.status(404).json({ nopostsfound: 'No posts found' })
  });
});

/*
    @route     POST posts/
    @desc      Create post
    @access    private
*/
router.post('/', passport.authenticate('jwt', {session:false}), (req, res) => {
  const {errors, isValid} = validatePostInput(req.body);
  if(!isValid) {
    return res.status(400).json(errors);
  }

  const newPost = new postModel({
    text: req.body.text,
    name: req.user.name,
    avatar: req.user.avatar,
    user: req.user.id
  });
  newPost.save().then(saveResult => {
    return res.json(saveResult);
  });
});

/*
    @route   DELETE posts/:id
    @desc    Delete post by id
    @access  Private 
*/
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    profileModel.findOne({ user: req.user.id }).then(profile => {
      postModel.findById(req.params.id).then(post => {
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ notauthorized: 'User not authorized' });
          }
          post.remove().then(() => res.json({ success: true }));
        }).catch(err => {
          return res.status(404).json({ postnotfound: 'No post found' });
        });
    });
  }
);

/*
    @route   POST posts/like/:id
    @desc    Like post by id
    @access  Private
*/
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    profileModel.findOne({user: req.user.id}).then(profile => {
      postModel.findById(req.params.id).then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({alreadyliked: 'User already liked this post'});
          }
          post.likes.unshift({user: req.user.id});
          post.save().then(post => {
            return res.json(post);
          });
      }).catch(err => {
        return res.status(404).json({ postnotfound: 'No post found' });
      });
    });
  }
);

module.exports = router;
