var express = require('express');
var router = express.Router();

/*
    @route     GET posts/test
    @desc      Test post route
    @access    Public
*/
router.get('/test', (req, res, next) => {
  res.json({msg:'okee'});
});

module.exports = router;
