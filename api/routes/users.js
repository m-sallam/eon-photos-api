const router = require('express').Router()
const auth = require('../../services/auth')
const { getUser, postUser } = require('../controllers/users')

router.post('/', postUser)

router.get('/:username', auth.getCurrentUser, getUser)

module.exports = router
