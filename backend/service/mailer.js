const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendCollaboratorInvite = async (recipientEmail, fileName, fileUrl, role) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `You've been invited to collaborate on ${fileName}`,
    html: `
      <h2>Collaboration Invitation</h2>
      <p>You have been invited to collaborate on the file "${fileName}" as a ${role}.</p>
      <p>Click the link below to access the file:</p>
      <a href="${fileUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4d84ff; color: white; text-decoration: none; border-radius: 5px;">
        Open File
      </a>
      <p>If you can't click the button, copy and paste this URL in your browser:</p>
      <p>${fileUrl}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendCollaboratorInvite };