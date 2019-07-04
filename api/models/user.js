const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  hashedPassword: String,
  salt: String,
  email: { type: String, required: true, unique: true },
  registerDate: { type: Date, default: new Date() },
  uploads: { type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo'
    }
  ],
  default: [] },
  likes: { type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo'
    }
  ],
  default: [] }
})

userSchema.methods.upload = async function (photo) {
  this.uploads.push(photo)
  return this.save()
}

userSchema.methods.like = async function (photo) {
  let alreadyLiked = this.likes.find(likedPhoto => likedPhoto._id.equals(photo._id))
  if (alreadyLiked) throw new Error('photo was already liked')
  this.likes.push(photo)
  return this.save()
}

userSchema.methods.unlike = async function (photo) {
  let liked = this.likes.find(likedPhoto => likedPhoto._id.equals(photo._id))
  if (!liked) throw new Error('photo is not liked')
  this.likes.splice(this.likes.indexOf(photo), 1)
  return this.save()
}

module.exports = mongoose.model('User', userSchema)
