const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkUserExists, validateSignupFields, validateLoginFields, validateUpdateFields } = require('../middlewares/userValidationMiddleware');

router.post('/signup', validateSignupFields, checkUserExists, authController.signup);
router.post('/login', validateLoginFields, authController.login);
router.put('/update', validateUpdateFields, authController.update);


module.exports = router;