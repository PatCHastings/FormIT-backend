const express = require('express');
const { Sequelize, Op } = require('sequelize');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Services
const { sendEmail } = require('../services/emailService');

// Models
const { User, Token, Request } = require('../models');

const router = express.Router();

// -------------------------------------
// Register a new user
// -------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    // Check if user already exists
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
      role: 'client',
    });

    // Send a welcome email
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

// -------------------------------------
// Login a user
// -------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // 1 hour expiration
    );

    // Respond with token & requestId
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

// -------------------------------------
// Initiate registration (invite flow)
// -------------------------------------
router.post("/register/initiate", async (req, res) => {
    try {
      const { email, fullName } = req.body;
  
      // Validate input
      if (!email || !fullName) {
        return res.status(400).json({ error: "Email and full name are required." });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists." });
      }
  
      // Generate a token for the create-password link
      const token = crypto.randomBytes(32).toString("hex");
      const createPasswordUrl = `${process.env.FRONTEND_URL}/create-password?token=${token}`;
  
      // Save the token and fullName in the tokens table
      await Token.create({
        email,
        fullName, // Save the fullName temporarily
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1-hour expiration
      });
      console.log("🟢 Email about to be sent to:", email, "with token:", token);
  
      // Send an email with the token link
      await sendEmail(
        email,
        "FormIT: Complete Your Registration",
        `Hi ${fullName},\n\nWelcome to FormIT! To complete your registration, set your password using this link:\n${createPasswordUrl}\n\nBest regards,\nFormIT Team`
      );
  
      res.status(200).json({ message: "Check your email to set a password." });
    } catch (error) {
      console.error("Error initiating registration:", error);
      res.status(500).json({ error: "Failed to initiate registration." });
    }
  });

// -------------------------------------
// Complete registration (set password)
// -------------------------------------
router.post("/register/complete", async (req, res) => {
    try {
      const { token, password } = req.body;
  
      // Validate input
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required." });
      }
  
      // Find the token record
      const tokenRecord = await Token.findOne({ where: { token } });
      if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
        return res.status(400).json({ error: "Invalid or expired token." });
      }
  
      // Create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email: tokenRecord.email,
        passwordHash: hashedPassword,
        fullName: tokenRecord.fullName, // Use the fullName from the tokens table
        role: "client",
      });
  
      // Delete the token after use
      await tokenRecord.destroy();
  
      res.status(201).json({ message: "Account created successfully." });
    } catch (error) {
      console.error("Error completing registration:", error);
      res.status(500).json({ error: "Failed to complete registration." });
    }
  });

  // forgot password
router.post('/password-reset-request', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Generate a token for the reset-password link
    const token = crypto.randomBytes(32).toString('hex');
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Save the token in the tokens table
    await Token.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 3600000), // 1-hour expiration
    });

    // Send an email with the token link
    console.log('Sending email to:', email);
    await sendEmail({
      to: email,
      subject: 'FormIT: Reset Your Password',
      text: `Hi ${user.fullName},\n\nTo reset your password, click this link:\n${resetPasswordUrl}\n\nBest regards,\nFormIT Team`,
    });

    res.status(200).json({ message: 'Check your email to reset your password.' });
  } catch (error) {
    console.error('Error initiating password reset:', error);
    res.status(500).json({ error: 'Failed to initiate password reset.' });
  }
});

// reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  // Validate input
  if (!token) {
    return res.status(400).json({ error: "Reset token is required." });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  try {
    // Find the token in the database
    const resetToken = await Token.findOne({
      where: {
        token,
        expiresAt: { [Op.gt]: new Date() }, // Token must not be expired
      },
    });

    if (!resetToken) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    // Find the user associated with the token
    const user = await User.findOne({
      where: { email: resetToken.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await user.update({
      passwordHash: hashedPassword, // Assuming the field is "passwordHash"
    });

    // Delete the token to prevent reuse
    await resetToken.destroy();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "An error occurred while resetting your password." });
  }
});
  
module.exports = router;
