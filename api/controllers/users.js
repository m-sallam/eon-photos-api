const User = require('../models/user')
const auth = require('../../services/auth')

module.exports.getUser = async (req, res) => {
  try {
    let foundUser = await User.findOne({ username: req.params.username }).populate('uploads').populate('likes')
    if (!foundUser) return res.status(400).send({ message: 'User can not be found' })
    const currentUser = res.locals.user
      ? await User.findOne({ username: res.locals.user.username }).populate('likes')
      : null
    const uploads = foundUser.uploads.map(photo => {
      return {
        id: photo._id,
        name: photo.name,
        link: photo.link,
        thumbnail: photo.thumbnail,
        fullThumbnail: photo.fullThumbnail,
        likes: photo.likes,
        date: photo.date,
        user: photo.user.username,
        liked: !!(currentUser && currentUser.likes.find(p => p._id.equals(photo._id)))
      }
    })

    const likes = foundUser.likes.map(photo => {
      return {
        id: photo._id,
        name: photo.name,
        link: photo.link,
        thumbnail: photo.thumbnail,
        fullThumbnail: photo.fullThumbnail,
        likes: photo.likes,
        date: photo.date,
        user: photo.user.username,
        liked: !!(currentUser && currentUser.likes.find(p => p._id.equals(photo._id)))
      }
    })
    let { username, email } = foundUser
    res.status(200).send({ username, email, uploads, likes })
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: 'hmmm, what happened?' })
  }
}

module.exports.postUser = async (req, res) => {
  try {
    let newUser = new User({
      username: req.body.username,
      email: req.body.email
    })
    await auth.register(newUser, req.body.password)
    let { token } = await auth.authenticate(req.body.username, req.body.password)
    const user = {
      username: newUser.username,
      email: newUser.email,
      uploads: newUser.uploads,
      likes: newUser.likes
    }
    res.status(200).send({ token, user })
  } catch (err) {
    console.log(err)
    // mongoose error code
    if (err.code === 11000) {
      // getting the existing field from the error message
      let type = err.errmsg.split(':')[2].split('_')[0].trim()
      console.log(type)
      if (type === 'username') {
        res.status(400).send({ message: 'Username already exists' })
      } else {
        res.status(400).send({ message: 'Email already exists' })
      }
    } else if (err.name === 'ValidationError') {
      res.status(400).send({ message: `${Object.keys(err.errors)[0]} is required` })
    } else {
      res.status(500).send({ message: 'Oh no, you did not!' })
    }
  }
}
