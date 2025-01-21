const express = require('express');
const router = express.Router();

// Sample route to get user data
router.get('/user/:id', (req, res) => {
  // Fetch user data logic here
  res.json({ id: req.params.id, shares: 100, value: 1000 });
});

module.exports = router;