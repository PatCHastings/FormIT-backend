require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import routes
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const wizardRoutes = require('./routes/wizardStep');
const answersRoutes = require('./routes/answers');
const adminRoutes = require('./routes/admin');
const requestsRoutes = require('./routes/requests');
const proposalsRoutes = require('./routes/proposals');

// Setup route usage
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', wizardRoutes);
app.use('/api', answersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', requestsRoutes);
app.use('/api', proposalsRoutes);

// Default
app.get('/', (req, res) => {
    res.send('Backend server is running');
  });


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
