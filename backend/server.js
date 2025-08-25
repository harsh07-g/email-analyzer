

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const analysisRoutes = require('./routes/analysis');
const { startEmailListener } = require('./emailListener'); // Import karein

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analysis', analysisRoutes);

// Database Connection
mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Database connect hone ke baad hi email listener start karnaaa hhhhhhhhhh
      startEmailListener(); 
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });