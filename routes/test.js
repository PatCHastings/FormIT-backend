const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.get('/', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    res.json({ message: 'Hello from Express backend!' });
});

module.exports = router;