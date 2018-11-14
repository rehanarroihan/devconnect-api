var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const profileModel = require('../models/Profile');
const userModel = require('../models/Users');
const validateProfileInput = require('../validation/profile');
const validateExperienceInput = require('../validation/experience');
const validateEducationInput = require('../validation/education');

/*
    @route     GET profile/
    @desc      Get user detail
    @access    Private
*/
router.get('/', passport.authenticate('jwt', {session:false}) , (req, res) => {
  const errors = {};
  profileModel.findOne({user:req.user.id})
    .populate('user', ['name','avatar'])
    .then(profile => {
      if(!profile){
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      return res.json(profile);
    }).catch(profileError => {
      return res.status(404).json(profileError);
    });
});

/*
    @route     GET profile/handle/:handle
    @desc      Get profile by handle
    @access    Public
*/

router.get('/handle/:handle', (req,res) => {
  const errors = {};
  profileModel.findOne({handle:req.params.handle}).populate('user', ['name', 'avatar']).then(profileResult => {
    if(!profileResult){
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
    }
    return res.json(profileResult);
  }).catch(profileError => {
    errors.noprofile = 'There is no profile for this user';
    console.log(profileError);
    return res.status(404).json(errors);
  });
});

/*
    @route     GET profile/user/:user_id
    @desc      Get profile by ID
    @access    Public
*/

router.get('/user/:user_id', (req,res) => {
  const errors = {};
  profileModel.findOne({user:req.params.user_id}).populate('user', ['name', 'avatar']).then(profileResult => {
    if(!profileResult){
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
    }
    return res.json(profileResult);
  }).catch(profileError => {
    errors.noprofile = 'There is no profile for this user';
    console.log(profileError);
    return res.status(404).json(res.sentry);
  });
});

/*
    @route     GET profile/all
    @desc      Get all profiles
    @access    Public
*/

router.get('/all', (req,res) => {
  const errors = {};
  profileModel.find().populate('user', ['name', 'avatar']).then(profileList => {
    if(!profileList){
      errors.noprofile = 'There is no profile lalala';
      return res.status(404).json(errors);
    }
    return res.json(profileList);
  }).catch(profileError => {
    console.log(profileError);
    errors.noprofile = 'There is no profile lalala';
    return res.status(404).json(errors);
  });
});

/*
    @route     POST profile/
    @desc      Create or edit user profile
    @access    Private
*/
router.post('/', passport.authenticate('jwt', {session:false}) , (req, res, next) => {
  const {errors, isValid} = validateProfileInput(req.body);
  if(!isValid) {
    return res.status(400).json(errors);
  }
  //Get field
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  //Split skill into array
  if(typeof req.body.skills !== 'undefined'){
    profileFields.skills = req.body.skills.split(',');
  }
  //social
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

  //checking handle avaibility
  profileModel.findOne({handle:profileFields.handle}).then(handle => {
    if(handle){
      errors.handle = 'That handle already exists';
      return res.status(400).json(errors);
    }
  });

  profileModel.findOne({user:req.user.id}).then(profile => {
    if(profile){
      //if profile already exist, then update
      console.log('profile found, updating...');
      profileModel.findOneAndUpdate({user:req.user.id},{$set:profileFields},{new:true}).then(profile => res.json(profile));
    }else{
      //if profile not exits, then create one
      new profileModel(profileFields).save().then(saveResult => {
        return res.json(saveResult);
      });
    }
  });
});

/*
    @route     POST profile/experience
    @desc      Add experience to profile
    @access    Private
*/
router.post('/experience', passport.authenticate('jwt', {session:false}), (req,res) => {
  const {errors, isValid} = validateExperienceInput(req.body);
  if(!isValid){
    return res.status(400).json(errors);
  }
  
  profileModel.findOne({user:req.user.id}).then(profileResult => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,
    };
    profileResult.experience.unshift(newExp);
    profileResult.save().then(saveResult => {
      return res.json(saveResult);
    }).catch(saveError => {
      console.log(saveError);
      return res.status(400).json({error: 'something went wrong'});
    });
  });
});

/*
    @route     POST profile/education
    @desc      Add education to profile
    @access    Private
*/
router.post('/education', passport.authenticate('jwt', {session:false}), (req,res) => {
  const {errors, isValid} = validateEducationInput(req.body);
  if(!isValid){
    return res.status(400).json(errors);
  }
  
  profileModel.findOne({user:req.user.id}).then(profileResult => {
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,
    };
    profileResult.education.unshift(newEdu);
    profileResult.save().then(saveResult => {
      return res.json(saveResult);
    }).catch(saveError => {
      console.log(saveError);
      return res.status(400).json({error: 'something went wrong'});
    });
  });
});

/*
    @route     DELETE profile/experience/:exp_id
    @desc      Delete single experience
    @access    Private
*/
router.delete('/experience/:exp_id', passport.authenticate('jwt', {session:false}), (req,res) => {
  profileModel.findOne({user:req.user.id}).then(profileResult => {
    //map untuk loop, lalu ambil index dengan id dari param
    const removeIndex = profileResult.experience.map(item => item.id).indexOf(req.params.exp_id);
    profileResult.experience.splice(removeIndex, 1);
    profileResult.save().then(profileResult => {
      return res.json(profileResult);
    });
  }).catch(profileError => {
      console.log(profileError);
      return res.status(400).json({error: 'something went wrong'});
  });
});

/*
    @route     DELETE profile/education/:edu_id
    @desc      Delete single education
    @access    Private
*/
router.delete('/education/:edu_id', passport.authenticate('jwt', {session:false}), (req,res) => {
  profileModel.findOne({user:req.user.id}).then(profileResult => {
    //map untuk loop, lalu ambil index dengan id dari param
    const removeIndex = profileResult.education.map(item => item.id).indexOf(req.params.edu_id);
    profileResult.education.splice(removeIndex, 1);
    profileResult.save().then(profileResult => {
      return res.json(profileResult);
    });
  }).catch(profileError => {
      console.log(profileError);
      return res.status(400).json({error: 'something went wrong'});
  });
});

/*
    @route     DELETE profile/
    @desc      Delete user and profile
    @access    Private
*/
router.delete('/', passport.authenticate('jwt', {session:false}), (req,res) => {
  profileModel.findOneAndRemove({user:req.user.id}).then(profileResult => {
    userModel.findOneAndDelete({_id:req.user.id}).then(userResult => {
      res.json({success:true});
    });
  });
});

module.exports = router;