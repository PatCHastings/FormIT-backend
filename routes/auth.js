const express = require('express');
const { Sequelize } = require('sequelize');
const { sendEmail } = require('../services/emailService');
const { Op } = require('sequelize');
const crypto = require('crypto');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Token } = require('../models');
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

  router.post('/register/initiate', async (req, res) => {
    try {
      const { email, fullName } = req.body;
  
      // Validate input
      if (!email || !fullName) {
        return res.status(400).json({ error: 'Email and full name are required.' });
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }
  
      // Generate a token for the create-password link
      const token = crypto.randomBytes(32).toString('hex');
      const createPasswordUrl = `${process.env.FRONTEND_URL}/create-password?token=${token}`;
  
      // Save the token temporarily in the database or cache (e.g., Redis)
      await Token.create({ email, token, expiresAt: new Date(Date.now() + 3600000) }); // 1 hour expiration
  
      // Send the email
      await sendEmail(
        email,
        'Complete Your Registration',
        `Hi ${fullName},\n\nClick the link below to set your password:\n\n${createPasswordUrl}`
      );
  
      res.status(200).json({ message: 'Check your email to set a password.' });
    } catch (error) {
      console.error('Error initiating registration:', error);
      res.status(500).json({ error: 'Failed to initiate registration.' });
    }
  });

  router.post('/register/complete', async (req, res) => {
    try {
      const { token, password } = req.body;
  
      // Validate input
      if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required.' });
      }
  
      // Find the token and validate its expiration
      const tokenRecord = await Token.findOne({ where: { token } });
      if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
        return res.status(400).json({ error: 'Invalid or expired token.' });
      }
  
      // Create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email: tokenRecord.email,
        passwordHash: hashedPassword,
        fullName: tokenRecord.fullName,
        role: 'client',
      });
  
      // Delete the token after use
      await tokenRecord.destroy();
  
      res.status(201).json({ message: 'Account created successfully.' });
    } catch (error) {
      console.error('Error completing registration:', error);
      res.status(500).json({ error: 'Failed to complete registration.' });
    }
  });
  
  module.exports = router;

     
