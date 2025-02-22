const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'),
});

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000', // Local Development
  'https://formit-software.com', // Production Frontend
  'https://api.formit-software.com' // API Domain (important for subdomain requests)
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*'); // Allow listed origins or wildcard for undefined cases
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // If preflight request, respond immediately
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
  }
  
  next();
});

app.use(express.json());

// Import routes
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const wizardRoutes = require('./routes/wizardStep');
const answersRoutes = require('./routes/answers');
const adminRoutes = require('./routes/admin');
const requestsRoutes = require('./routes/requests');
const proposalsRoutes = require('./routes/proposals');
const comparisonRoutes = require('./routes/comparisons');

// Setup route usage
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', wizardRoutes);
app.use('/api', answersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', requestsRoutes);
app.use('/api', proposalsRoutes);
app.use('/api/comparison', comparisonRoutes);

// Default
app.get('/', (req, res) => {
    res.send('Backend server is running');
  });


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
