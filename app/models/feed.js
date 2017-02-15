// load the things we need
var mongoose = require('mongoose');

// define the schema for thing model
var feedSchema = new mongoose.Schema({
    userID      : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    state       : { type: String, default: '0' },
    name        : { type: String, trim:true, lowercase:true},
    url         : { type: String, trim:true ,lowercase:true},
    brand       : { type: String, trim:true, lowercase:true},
    category    : { type: String, trim:true },
    createdDate : { type: Date, default: Date.now },
    usage       : { type: Array, default: []}
});

var usageSchema = new mongoose.Schema({
    feedID        : { type: mongoose.Schema.Types.ObjectId, ref: 'Feed'},
    name          : { type: String, trim:true },
    time          : { type: String },
    reaction      : { type: String },
    activity      : { type: String },
    createdDate   : { type: Date, default: Date.now },
    modifiedDate  : { type: Date, default: Date.now }
});

// create the model for feed,usage and expose it to the app
module.exports = mongoose.model('Feed', feedSchema);
module.exports = mongoose.model('Usage', usageSchema);
