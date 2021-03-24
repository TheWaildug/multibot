const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PrefixSchema = new Schema({
  "prefix": {
    type: String,
    required: true
  },
  "guildid": {
    type: String,
    required: true
  },

});
module.exports = Item = mongoose.model('prefixschema', PrefixSchema);