const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected:', conn.connection.host);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
