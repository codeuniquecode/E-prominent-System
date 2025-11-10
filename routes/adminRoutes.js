const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { protect, isAdmin } = require('../middleware/auth');

// All admin routes are protected and require admin role
router.use(protect, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getAdminDashboard);

// Vacancy Management
router.get('/vacancy/new', adminController.getPostVacancyPage);
router.post('/vacancy/new', adminController.postVacancy);

// Notice Management
router.get('/notice/new', adminController.getPostNoticePage);
router.post('/notice/new', adminController.postNotice);

// Application Management
router.get('/applications', adminController.getAllApplications);
router.post('/application/approve/:id', adminController.approveApplication);
router.post('/application/reject/:id', adminController.rejectApplication);

module.exports = router;