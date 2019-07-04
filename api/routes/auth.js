const router = require('express').Router()
const { login, refreshToken } = require('../controllers/auth')

router.post('/login', login)

router.post('/refresh', refreshToken)

module.exports = router
