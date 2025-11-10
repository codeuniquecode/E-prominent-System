const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multerConfig');

// Auth Routes
router.get('/register', userController.getRegisterPage);
router.post('/register', userController.registerUser);
router.get('/login', userController.getLoginPage);
router.post('/login', userController.loginUser);
router.get('/logout', userController.logoutUser);

// User Dashboard & Vacancies
router.get('/', protect, userController.getDashboard);
router.get('/vacancy/:id', protect, userController.getVacancyDetails);
router.get('/notices', protect, userController.getAllNotices);

// Application
// We use 'upload.single('resume')' to handle the file upload
router.post('/apply/:id', protect, upload.single('resume'), userController.applyForVacancy);

module.exports = router;