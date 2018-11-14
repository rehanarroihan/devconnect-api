const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const userModel = mongoose.model('users');
const key = require('./keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key.secretOrKey;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            userModel.findById(jwt_payload.id).then(user => {
                if(user){
                    return done(null, user);
                }else{
                    return done(null, false);
                }
            }).catch(jwtError => console.log(jwtError));
        })
    );
};