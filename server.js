const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'),
});

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Add CloudFront to allowed origins
const allowedOrigins = [
  'http://localhost:3000', // Local Development
  'https://formit-software.com', // Production Frontend
  'https://api.formit-software.com', // API Domain
  'https://d1zlrhr9gw6gx9.cloudfront.net' // ✅ Add CloudFront frontend domain
];

// ✅ Use CORS middleware properly
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
}));

// ✅ Fix OPTIONS Preflight Requests
app.options('*', cors());

// ✅ Use Express JSON parser
app.use(express.json());

// ✅ Import routes
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const wizardRoutes = require('./routes/wizardStep');
const answersRoutes = require('./routes/answers');
const adminRoutes = require('./routes/admin');
const requestsRoutes = require('./routes/requests');
const proposalsRoutes = require('./routes/proposals');
const comparisonRoutes = require('./routes/comparisons');

// ✅ Setup route usage
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', wizardRoutes);
app.use('/api', answersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', requestsRoutes);
app.use('/api', proposalsRoutes);
app.use('/api/comparison', comparisonRoutes);

// ✅ Default Route
app.get('/', (req, res) => {
    res.send('Backend server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
