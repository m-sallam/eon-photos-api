const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const bodyParser = require('body-parser')

const usersRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
const photosRoutes = require('./routes/photos')

const api = express()

api.use(cors())
api.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }))
api.use(bodyParser.json())
api.use(bodyParser.urlencoded({ extended: true }))

api.use('/users', usersRoutes)
api.use('/auth', authRoutes)
api.use('/photos', photosRoutes)

module.exports = api
