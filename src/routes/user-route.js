const express = require('express');
const userController = require('../controllers/user-controller');
const imageController = require('../controllers/image-controller');
const router = express.Router();
const statsd = require('../utils/statsd');


// routes that anage user
router.post('/user', userController.createUser,statsd.countCreateUser);
router.get('/user/self',userController.getUserInfo,statsd.countGetUser);
router.put('/user/self',userController.updateUserInfo,statsd.countUpdateUser);
router.get('/verifyUserEmail', userController.verifyUser,statsd.countVerifyUser);

// routes create user profile image
router.post('/user/self/pic',imageController.createImage,statsd.countCreateImage);
router.get('/user/self/pic',imageController.getImage,statsd.countGetImage);
router.delete('/user/self/pic',imageController.deleteImage,statsd.countDeleteImage);
module.exports = router;