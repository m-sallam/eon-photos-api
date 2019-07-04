const express = require('express')
const mongoose = require('mongoose')
const dotEnv = require('dotenv')
const cloudinary = require('cloudinary')

dotEnv.config()

const api = require('./api')

const app = express()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use('/api/v1', api)

var start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI,
      { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
    console.log('connected to database')
    await app.listen(process.env.PORT || 3000)
    console.log(`listening on port ${process.env.PORT || 3000} ...`)
  } catch (err) {
    console.log(err)
  }
}

start()
