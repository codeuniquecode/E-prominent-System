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


// ... (keep all existing routes)

// Vacancy Management
router.get('/vacancy/new', adminController.getPostVacancyPage);
router.post('/vacancy/new', adminController.postVacancy);
// --- ADD THESE NEW VACANCY ROUTES ---
router.get('/manage/vacancies', adminController.getManageVacanciesPage); // List all
router.get('/vacancy/edit/:id', adminController.getEditVacancyPage); // Show edit form
router.post('/vacancy/edit/:id', adminController.updateVacancy);     // Handle edit form
router.post('/vacancy/delete/:id', adminController.deleteVacancy); // Handle delete


// Notice Management
router.get('/notice/new', adminController.getPostNoticePage);
router.post('/notice/new', adminController.postNotice);
// --- ADD THESE NEW NOTICE ROUTES ---
router.get('/manage/notices', adminController.getManageNoticesPage); // List all
router.get('/notice/edit/:id', adminController.getEditNoticePage); // Show edit form
router.post('/notice/edit/:id', adminController.updateNotice);     // Handle edit form
router.post('/notice/delete/:id', adminController.deleteNotice); // Handle delete
module.exports = router;