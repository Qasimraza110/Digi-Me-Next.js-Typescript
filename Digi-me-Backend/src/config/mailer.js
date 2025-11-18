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
async function sendEmailNotification(oldEmail, newEmail) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME, // your email
      pass: process.env.EMAIL_PASSWORD, // your app password
    },
  });

  // 🔹 Notify old email
  await transporter.sendMail({
    from: `"DigiMe Support" <${process.env.EMAIL_USERNAME}>`,
    to: oldEmail,
    subject: "Your DigiMe email has been changed",
    html: `<p>Your account email has been changed to <b>${newEmail}</b>.</p>
           `,
  });

  // 🔹 Notify new email
 await transporter.sendMail({
  from: `"DigiMe Support" <${process.env.EMAIL_USERNAME}>`,
  to: newEmail,
  subject: "Verify your new email address",
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4a90e2;">DigiMe Email Updated Successfully</h2>
      <p>Hello!</p>
      <p>Your email address has been successfully updated on <strong>DigiMe</strong>.</p>

      <p>You can now log in with your new email by clicking the button below:</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/login" 
           style="background-color: #4a90e2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Login to DigiMe
        </a>
      </p>

      <p>If you didn’t request this change, please contact our support team immediately.</p>

      <hr style="margin-top: 30px;" />
      <p style="font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} DigiMe. All rights reserved.
      </p>
    </div>
  `,
});

}

async function sendpasswordNotification(email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME, // your email
      pass: process.env.EMAIL_PASSWORD, // your app password
    },
  });

  // 🔹 Notify old email
  await transporter.sendMail({
    from: `"DigiMe Support" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: "Your DigiMe password has been changed",
    html: `<p>Your account password has been changed.</p>
          <p>You can now log in with your new password by clicking the button below:</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/login" 
           style="background-color: #4a90e2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Login to DigiMe
        </a>
      </p>
      
      <hr style="margin-top: 30px;" />
      <p style="font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} DigiMe. All rights reserved.
      </p>
      `,
  });

  // 🔹 Notify new email
  // await transporter.sendMail({
  //   from: `"DigiMe Support" <${process.env.EMAIL_USERNAME}>`,
  //   to: newEmail,
  //   subject: "Verify your new email address",
  //   html: `<p>Hello! You've successfully changed your email on DigiMe.</p>
  //          <p>Please verify your new email to continue using your account securely.</p>`,
  // });
}

module.exports = { getTransporter , sendEmailNotification, sendpasswordNotification };
