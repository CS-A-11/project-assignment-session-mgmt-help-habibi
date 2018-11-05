var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order = new Schema({
    title: String,
    deadline: String,
    subject:String,
    coupon:String,
    details:String,
    username:String,
    status:String,
    budget:String,
    files:[String]
    
});


module.exports = mongoose.model('Order', Order);