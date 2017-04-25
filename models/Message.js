var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  fromId: String,
  toId: String,
  msg: String,
  fbId: String,
  createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);