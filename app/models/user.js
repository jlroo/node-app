// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var rand = require("generate-key");

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        apikey       : { type: String, trim: true },
        username     : { type: String, trim: true, lowercase: true },
        password     : { type: String, trim: true },
        email        : { type: String, trim: true, lowercase: true },
        location     : { type: String, trim: true, lowercase: true },
        color        : { type: String },
        brand        : { type: String, trim: true, lowercase: true },
        artist       : { type: String, trim: true, lowercase: true },
        media        : { type: String },
        items        : { type: Array, default: []},
        created      : { type: Date, default: Date.now }
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};
// generate a random apikey token
userSchema.methods.generateKey = function (){
  return rand.generateKey();
};

// create the model for users and expose it
module.exports = mongoose.model('User', userSchema);
