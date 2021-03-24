const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CountingMongo = new Schema({
  "enabled": {
    type: Boolean,
    required: true
  },
  "guildid": {
    type: String,
    required: true
  },

});
module.exports = Item = mongoose.model('countingenabledschema', CountingMongo);