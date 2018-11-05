var moment = require('moment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = new Schema({
    byClient: String,
    orderID: String,
    createdAt:String,
    body:String,
    isRead:Boolean,
    isAttachement:Boolean
});


var generateMessage = (from, text) => {
  return {
    from,
    text,
  };
};


module.exports = mongoose.model('Message', Message);
