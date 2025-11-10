// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./model/index'); // DB connection

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// --- Middleware ---
// 1. Body Parsers
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// 2. Cookie Parser
app.use(cookieParser());

// 3. Set View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// 4. Serve Static Files
// 'public' for CSS, client-side JS, images
app.use(express.static(path.join(__dirname, 'public')));
// 'storage' for user-uploaded files (resumes)
app.use('/storage', express.static(path.join(__dirname, 'storage')));


// --- Routes ---
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

// 404 Handler (optional, but good practice)
app.use((req, res) => {
    res.status(404).render('404');
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});