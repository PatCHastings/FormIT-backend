const nodemailer = require('nodemailer');

// Configure the transporter with Gmail's SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Use 465 if you want to use SSL instead of TLS
  secure: false, // Set true if using port 465
  auth: {
    user: process.env.SMTP_EMAIL, // Your Gmail address
    pass: process.env.SMTP_PASSWORD, // App Password from Gmail
  },
  logger: true, // Enable logging
  debug: true,  // Enable debug output
});

// Function to send email
async function sendEmail({ to, subject, text, html }) {
  try {
    console.log('Recipient email:', to);
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      throw new Error('Invalid recipient email');
    }

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendEmail };
