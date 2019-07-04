const mongoose = require('mongoose')

const photoSchema = new mongoose.Schema({
  name: String,
  link: String,
  thumbnail: String,
  fullThumbnail: String,
  category: String,
  likes: Number,
  date: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Photo', photoSchema)
