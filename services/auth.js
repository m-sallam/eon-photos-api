const crypto = require('crypto')
const util = require('util')
const jwt = require('jsonwebtoken')
const User = require('../api/models/user')

// generating a salt with a length of 32 bytes to be used in the paswword hashing
const generateSalt = async () => {
  const randomBytes = util.promisify(crypto.randomBytes)
  const salt = await randomBytes(32)
  return salt.toString('hex')
}

// hashing the given password with Password-Based Key Derivation Function 2
const hash = async (password, salt) => {
  const getHash = util.promisify(crypto.pbkdf2)
  const hash = await getHash(password, salt, 2000000, 32, 'sha512')
  return hash.toString('hex')
}

// registering a new user by getting the password and then hashing it and updating the
// user data with the generated hash and salt
const register = async (user, password) => {
  const salt = await generateSalt()
  const hashedPassword = await hash(password, salt)
  user.hashedPassword = hashedPassword
  user.salt = salt
  await user.save()
  return true
}

// getting the user from the database with the corresponding username then hashing the
// entered password with the user's sall, and then comparing the 2 hashes. if it is
// successful, a json web token is created and returned along with the user
const authenticate = async (username, password) => {
  let user = await User.findOne({ username: username })
  if (user) {
    const hashedEntry = await hash(password, user.salt)
    let matched = hashedEntry === user.hashedPassword
    if (matched) {
      const token = jwt.sign({ user }, process.env.APP_SECRET, { expiresIn: '7d' })
      return { token, user }
    }
  }
  let err = new Error('Invalid Username/Password')
  err.name = 'AUTHERROR'
  throw err
}

// a verifying method to protect the private routes, by checking the request token,
// and updating the current user if it is succsseeded
const verify = async (req, res, next) => {
  try {
    const token = req.headers['authorization']
    const payload = jwt.verify(token, process.env.APP_SECRET)
    res.locals.user = payload.user
    return next()
  } catch (err) {
    console.log(err)
    res.status(403).end()
  }
}

// for when you need to get the current logged in user if there is, in a route that
// can be viewed by both logged in users and guests
const getCurrentUser = (req, res, next) => {
  const token = req.headers['authorization']
  try {
    const payload = jwt.verify(token, process.env.APP_SECRET)
    res.locals.user = payload.user
    return next()
  } catch (err) {
    return next()
  }
}

// refreshing the request token with a new token with a new expiration date
const refreshToken = async oldToken => {
  let payload = jwt.verify(oldToken, process.env.APP_SECRET)
  delete payload.iat
  delete payload.exp
  delete payload.nbf
  delete payload.jti
  const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '7d' })
  return { token }
}

module.exports = { register, authenticate, verify, getCurrentUser, refreshToken }
