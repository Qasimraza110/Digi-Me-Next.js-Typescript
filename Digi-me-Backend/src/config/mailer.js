const nodemailer = require('nodemailer');

async function getTransporter() {
  try {
    if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify transporter works
      await transporter.verify();
      console.log('✅ Gmail transporter connected successfully.');
      return transporter;
    }

    // Fallback (Ethereal test account)
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    console.log('⚠️ Using Ethereal test email:', testAccount.user);
    return transporter;

  } catch (err) {
    console.error('❌ Email transporter error:', err);
    throw err;
  }
}

module.exports = { getTransporter };
