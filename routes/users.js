var express = require('express');
var router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = require('../config/keys');
const passport = require('passport');

const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

//Load user model
const userModel = require('../models/Users');

/*
    @route     GET users/register
    @desc      Register route
    @access    Public
*/
router.post('/register', (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);
  if(!isValid){
    return res.status(200).json(errors);
  }

  userModel.findOne({email:req.body.email}).then(user => {
      if(user) {
        errors.email = 'Email already registered';
        return res.status(400).json(errors.email);
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200',
          r: 'pg',
          d: 'mm'
        });
        const newUser = new userModel({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });
        bcrypt.genSalt(10, (saltError, saltResult) => {
          if(saltError) throw saltError;
          bcrypt.hash(newUser.password, saltResult, (hashError, hashResult) => {
            if(hashError) throw hashError;
            newUser.password = hashResult;
            newUser.save()
              .then(saveResult => res.json(saveResult))
              .catch(saveError => {throw saveError});
          });
        });
      }
    }).catch(findOneError => {throw findOneError});
});

/*
    @route     GET users / login
    @desc      Login user / returning JWT token
    @access    Public
*/
router.post('/login', (req, res) => {
  const {errors, isValid} = validateLoginInput(req.body);
  if(!isValid){
    return res.status(200).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  //find user by email
  userModel.findOne({email})
    .then(user => {
      if(!user){
        errors.email = 'User not found';
        return res.status(404).json(errors);
      }
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(isMatch){
            const payload = {id:user.id, name:user.name, avatar:user.avatar};
            jwt.sign(payload, key.secretOrKey, {expiresIn: 3600}, (signError, signResult) => {
              res.json({success: true, token: `Bearer ${signResult}`});
            });
          }else{
            errors.password = 'Password incorrect';
            return res.status(400).json(errors);
          }
        });
    });
});

/*
    @route     GET users/current
    @desc      Return current user
    @access    Private
*/
router.get('/current', passport.authenticate('jwt', {session:false}), (req, res) =>{
  res.json({id: req.user.id, name: req.user.name, email: req.user.email, avatar: req.user.avatar});
});

module.exports = router;