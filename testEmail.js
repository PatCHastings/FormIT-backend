const {sendEmail} = require("./services/emailService");

(async () => {
  try {
    await sendEmail({
      to: "phastings82@gmail.com", 
      subject: "Test Email",
      text: "This is a test email.",
    });
    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Error sending test email:", error);
  }
})();
