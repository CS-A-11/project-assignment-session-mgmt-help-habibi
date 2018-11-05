var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Proof = new Schema({
    title: String,
     subject:String,
     details:String,
     files:[String]
    
});


module.exports = mongoose.model('Proof', Proof);