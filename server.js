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

// Setup route usage
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', wizardRoutes);
app.use('/api', answersRoutes);

// Default
app.get('/', (req, res) => {
    res.send('Backend server is running');
  });


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
