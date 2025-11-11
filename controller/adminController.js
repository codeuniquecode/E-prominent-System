const User = require('../model/userSchema');
const Vacancy = require('../model/vacancySchema');
const Notice = require('../model/noticeSchema');
const Application = require('../model/applicationSchema');
const nodemailer = require('nodemailer');

// --- Helper: Nodemailer Transport ---
// We create one reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });
};

// --- Helper: Send Email Function ---
const sendApplicationStatusEmail = async (userEmail, userName, vacancyTitle, status) => {
    try {
        const transporter = createTransporter();
        
        const subject = `Application Status Update: ${status}`;
        const message = `
            Dear ${userName},

            Your application for the position of "${vacancyTitle}" has been ${status}.

            Thank you for your interest.

            Regards,
            E-Procurement System Team
        `;

        await transporter.sendMail({
            from: `E-Procurement System <${process.env.MAIL_FROM}>`,
            to: userEmail,
            subject: subject,
            text: message
        });

        console.log(`Status email (${status}) sent to ${userEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


// @desc    Show admin dashboard
// @route   GET /admin/dashboard
exports.getAdminDashboard = async (req, res) => {
    try {
        // Get stats for the dashboard
        const userCount = await User.countDocuments({ role: 'user' });
        const vacancyCount = await Vacancy.countDocuments();
        const noticeCount = await Notice.countDocuments();
        const pendingApps = await Application.countDocuments({ status: 'Pending' });

        res.render('admin', {
            user: req.user,
            stats: {
                users: userCount,
                vacancies: vacancyCount,
                notices: noticeCount,
                pending: pendingApps
            }
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Show page to post new vacancy
// @route   GET /admin/vacancy/new
exports.getPostVacancyPage = (req, res) => {
    res.render('postVacancy', { user: req.user, error: null });
};

// @desc    Post a new vacancy
// @route   POST /admin/vacancy/new
exports.postVacancy = async (req, res) => {
    try {
        const { title, description, department, deadline } = req.body;
        
        await Vacancy.create({
            title,
            description,
            department,
            deadline,
            postedBy: req.user._id // Admin user's ID
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('postVacancy', { user: req.user, error: error.message });
    }
};

// @desc    Show page to post new notice
// @route   GET /admin/notice/new
exports.getPostNoticePage = (req, res) => {
    res.render('postNotice', { user: req.user, error: null });
};

// @desc    Post a new notice
// @route   POST /admin/notice/new
exports.postNotice = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        await Notice.create({
            title,
            content,
            postedBy: req.user._id // Admin user's ID
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('postNotice', { user: req.user, error: error.message });
    }
};

// @desc    Show all applications
// @route   GET /admin/applications
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('applicant', 'name email') // Get applicant's name and email
            .populate('vacancy', 'title')      // Get vacancy title
            .sort({ createdAt: -1 });

        res.render('applications', { user: req.user, applications });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Approve an application
// @route   POST /admin/application/approve/:id
exports.approveApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('applicant', 'name email')
            .populate('vacancy', 'title');

        if (!application) {
            return res.status(404).send("Application not found");
        }

        application.status = 'Approved';
        await application.save();

        // Send notification email
        await sendApplicationStatusEmail(
            application.applicant.email,
            application.applicant.name,
            application.vacancy.title,
            'Approved'
        );

        res.redirect('/admin/applications');
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Reject an application
// @route   POST /admin/application/reject/:id
exports.rejectApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('applicant', 'name email')
            .populate('vacancy', 'title');

        if (!application) {
            return res.status(404).send("Application not found");
        }

        application.status = 'Rejected';
        await application.save();

        // Send notification email
        await sendApplicationStatusEmail(
            application.applicant.email,
            application.applicant.name,
            application.vacancy.title,
            'Rejected'
        );

        res.redirect('/admin/applications');
    } catch (error) {
        res.status(500).send("Server Error");
    }
};
// ... (keep all existing functions, including sendApplicationStatusEmail, etc.)

// --- VACANCY MANAGEMENT ---

// @desc    Show page to manage all vacancies
// @route   GET /admin/manage/vacancies
exports.getManageVacanciesPage = async (req, res) => {
    try {
        const vacancies = await Vacancy.find().sort({ createdAt: -1 });
        res.render('viewVacancies', { user: req.user, vacancies });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Show page to edit a vacancy
// @route   GET /admin/vacancy/edit/:id
exports.getEditVacancyPage = async (req, res) => {
    try {
        const vacancy = await Vacancy.findById(req.params.id);
        if (!vacancy) {
            return res.render('404', { user: req.user });
        }
        res.render('editVacancy', { user: req.user, vacancy, error: null });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Update a vacancy
// @route   POST /admin/vacancy/edit/:id
exports.updateVacancy = async (req, res) => {
    try {
        const { title, description, department, deadline } = req.body;
        await Vacancy.findByIdAndUpdate(req.params.id, {
            title,
            description,
            department,
            deadline
        });
        res.redirect('/admin/manage/vacancies');
    } catch (error) {
        // If error, re-render the edit page with the error
        const vacancy = await Vacancy.findById(req.params.id);
        res.render('editVacancy', { user: req.user, vacancy, error: error.message });
    }
};

// @desc    Delete a vacancy
// @route   POST /admin/vacancy/delete/:id
exports.deleteVacancy = async (req, res) => {
    try {
        const vacancyId = req.params.id;
        
        // 1. Delete the vacancy
        await Vacancy.findByIdAndDelete(vacancyId);
        
        // 2. IMPORTANT: Delete all applications associated with this vacancy
        await Application.deleteMany({ vacancy: vacancyId });

        res.redirect('/admin/manage/vacancies');
    } catch (error) {
        res.status(500).send("Server Error");
    }
};


// --- NOTICE MANAGEMENT ---

// @desc    Show page to manage all notices
// @route   GET /admin/manage/notices
exports.getManageNoticesPage = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.render('viewNotices', { user: req.user, notices });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Show page to edit a notice
// @route   GET /admin/notice/edit/:id
exports.getEditNoticePage = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.render('404', { user: req.user });
        }
        res.render('editNotice', { user: req.user, notice, error: null });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Update a notice
// @route   POST /admin/notice/edit/:id
exports.updateNotice = async (req, res) => {
    try {
        const { title, content } = req.body;
        await Notice.findByIdAndUpdate(req.params.id, {
            title,
            content
        });
        res.redirect('/admin/manage/notices');
    } catch (error) {
        const notice = await Notice.findById(req.params.id);
        res.render('editNotice', { user: req.user, notice, error: error.message });
    }
};

// @desc    Delete a notice
// @route   POST /admin/notice/delete/:id
exports.deleteNotice = async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.redirect('/admin/manage/notices');
    } catch (error) {
        res.status(500).send("Server Error");
    }
};