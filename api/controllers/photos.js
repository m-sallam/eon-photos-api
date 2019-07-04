const Photo = require('../models/photo')
const User = require('../models/user')
const cloudinary = require('cloudinary')

module.exports.postPhoto = async (req, res) => {
  try {
    const user = await User.findOne({ username: res.locals.user.username })
    if (!user) return res.status(403).end()
    const photo = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath)
    const thumbnail = await cloudinary.url(photo.public_id, { height: 340, width: 340, crop: 'thumb', gravity: 'auto:80' })
    const fullThumbnail = await cloudinary.url(photo.public_id, { width: 520, quality: 'auto:good' })
    let newPhoto = new Photo({
      name: req.body.name,
      link: photo.secure_url,
      thumbnail: thumbnail,
      fullThumbnail: fullThumbnail,
      likes: 0,
      date: new Date(),
      user: user._id
    })
    await newPhoto.save()
    await user.upload(newPhoto)
    res.status(200).send(newPhoto)
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'WHAAAAT?' })
  }
}

module.exports.getPhotos = async (req, res) => {
  try {
    const foundPhotos = req.query.query
      ? await Photo.find({ name: { $regex: req.query.query } }).populate('user')
      : await Photo.find({}, null, { sort: { date: 'asc' }, limit: 9 }).populate('user')
    const user = res.locals.user
      ? await User.findOne({ username: res.locals.user.username }).populate('likes')
      : null
    const photos = foundPhotos.map(photo => {
      return {
        id: photo._id,
        name: photo.name,
        link: photo.link,
        thumbnail: photo.thumbnail,
        fullThumbnail: photo.fullThumbnail,
        likes: photo.likes,
        date: photo.date,
        user: photo.user.username,
        liked: !!(user && user.likes.find(p => p._id.equals(photo._id)))
      }
    })
    res.status(200).send(photos)
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'WHAAAAT?' })
  }
}

module.exports.likePhoto = async (req, res) => {
  try {
    const user = await User.findOne({ username: res.locals.user.username })
    if (!user) return res.status(403).end()
    let photo = await Photo.findOneAndUpdate({ _id: req.params.photoId }, { $inc: { 'likes': 1 } })
    if (!photo) return res.status(400).send({ message: 'Photo not found' })
    await user.like(photo)
    res.status(200).end()
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'ehm, what happened!' })
  }
}

module.exports.unlikePhoto = async (req, res) => {
  try {
    const user = await User.findOne({ username: res.locals.user.username })
    if (!user) return res.status(403).end()
    let photo = await Photo.findOneAndUpdate({ _id: req.params.photoId }, { $inc: { 'likes': -1 } })
    if (!photo) return res.status(400).send({ message: 'Photo not found' })
    await user.unlike(photo)
    res.status(200).end()
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'ehm, what happened!' })
  }
}
