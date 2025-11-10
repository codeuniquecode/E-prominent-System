const User = require('../model/userSchema');
const Vacancy = require('../model/vacancySchema');
const Notice = require('../model/noticeSchema');
const Application = require('../model/applicationSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    // Set JWT as an HTTP-Only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

// @desc    Show registration page
// @route   GET /register
exports.getRegisterPage = (req, res) => {
    res.render('register', { error: null, user: req.user });
};

// @desc    Register a new user
// @route   POST /register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.render('register', { error: 'User already exists', user: undefined });
        }

        // Create new user (password is hashed by pre-save hook in schema)
        const user = await User.create({ name, email, password });

        if (user) {
            generateToken(res, user._id);
            res.redirect('/');
        } else {
            res.render('register', { error: 'Invalid user data', user: undefined });
        }
    } catch (error) {
        res.render('register', { error: error.message, user: undefined });
    }
};

// @desc    Show login page
// @route   GET /login
exports.getLoginPage = (req, res) => {
    // If user is already logged in, redirect them
    if (req.user) {
        return res.redirect('/');
    }
    res.render('login', { error: null, user: undefined });
};

// @desc    Auth user & get token
// @route   POST /login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            generateToken(res, user._id);
            
            // Redirect based on role
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/');
            }
        } else {
            res.render('login', { error: 'Invalid email or password', user: undefined });
        }
    } catch (error) {
        res.render('login', { error: error.message, user: undefined });
    }
};

// @desc    Logout user
// @route   GET /logout
exports.logoutUser = (req, res) => {
    // Clear the cookie
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.redirect('/login');
};

// @desc    Show user dashboard (list of vacancies)
// @route   GET /
exports.getDashboard = async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ deadline: { $gte: new Date() } })
            .populate('postedBy', 'name')
            .sort({ createdAt: -1 });
            
        res.render('index', { user: req.user, vacancies });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Show single vacancy details
// @route   GET /vacancy/:id
exports.getVacancyDetails = async (req, res) => {
    try {
        const vacancy = await Vacancy.findById(req.params.id);
        if (!vacancy) {
            return res.render('404', { user: req.user });
        }

        // Check if user has already applied for this vacancy
        const application = await Application.findOne({
            applicant: req.user._id,
            vacancy: req.params.id
        });
        
        const hasApplied = !!application;
        const appStatus = application ? application.status : null;

        res.render('vacancy', { user: req.user, vacancy, hasApplied, appStatus, error: null });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// @desc    Apply for a vacancy
// @route   POST /apply/:id
exports.applyForVacancy = async (req, res) => {
    const vacancyId = req.params.id;
    try {
        const vacancy = await Vacancy.findById(vacancyId);
        if (!vacancy) {
            return res.render('404', { user: req.user });
        }
        
        // 1. Check if user already applied
        const existingApplication = await Application.findOne({
            applicant: req.user._id,
            vacancy: vacancyId
        });

        if (existingApplication) {
            const hasApplied = true;
            return res.render('vacancy', { 
                user: req.user, 
                vacancy, 
                hasApplied,
                appStatus: existingApplication.status,
                error: 'You have already applied for this vacancy.' 
            });
        }

        // 2. Check if a file (resume) was uploaded
        if (!req.file) {
            const hasApplied = false;
            return res.render('vacancy', { 
                user: req.user, 
                vacancy, 
                hasApplied,
                appStatus: null,
                error: 'Resume is required. Please upload a PDF file.' 
            });
        }

        // 3. Create new application
        const newApplication = new Application({
            applicant: req.user._id,
            vacancy: vacancyId,
            resume: req.file.filename // Path where multer saved the file
        });

        await newApplication.save();

        res.redirect(`/vacancy/${vacancyId}`);

    } catch (error) {
        // Handle multer errors (e.g., file type)
        if (error.code === 'LIMIT_FILE_SIZE' || error.message.includes('Only .pdf')) {
            const vacancy = await Vacancy.findById(vacancyId);
            return res.render('vacancy', {
                user: req.user,
                vacancy,
                hasApplied: false,
                appStatus: null,
                error: 'File error: ' + error.message
            });
        }
        console.error(error);
        res.status(500).send("Server Error");
    }
};

// @desc    Show all notices
// @route   GET /notices
exports.getAllNotices = async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate('postedBy', 'name')
            .sort({ createdAt: -1 });
            
        res.render('notices', { user: req.user, notices });
    } catch (error) {
        res.status(500).send("Server Error");
    }
};