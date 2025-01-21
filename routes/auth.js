const express = require('express');
const { Sequelize } = require('sequelize');
const { sendEmail } = require('../services/emailService');
const { Op } = require('sequelize');
const crypto = require('crypto');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Register a new user
router.post('/register', async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
  
      // Validate input
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required.' });
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create the user with default role 'client'
      const user = await User.create({
        email,
        passwordHash: hashedPassword,
        fullName,
        role: 'client', // Default role
      });
  
      // Send a welcome email to the new user
      await sendEmail({
        to: email,
        subject: 'Welcome to the FormIT platform!',
        text: `Hi ${fullName}, welcome to the FormIT platform!`,
      });
  
      // Respond with success
      res.status(201).json({
        message: 'User registered successfully.',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user.' });
    }
  });

  // Login a user
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
  
      // Check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
  
      // Respond with token and user details
      res.status(200).json({
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Failed to login.' });
    }
  });
  
  module.exports = router;

     
