const router = require('express').Router()
const auth = require('../../services/auth')
const { postPhoto, getPhotos, likePhoto, unlikePhoto } = require('../controllers/photos')

router.get('/', auth.getCurrentUser, getPhotos)

router.post('/', auth.verify, postPhoto)

router.put('/:photoId/like', auth.verify, likePhoto)

router.put('/:photoId/unlike', auth.verify, unlikePhoto)

module.exports = router
