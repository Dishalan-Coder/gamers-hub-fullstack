const nodemailer = require('nodemailer');

const hasMailConfig = () => Boolean(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS);

const sendMail = async ({ to, subject, html }) => {
  if (!hasMailConfig()) {
    console.log('Mail skipped. Configure MAIL_HOST, MAIL_USER, and MAIL_PASS to enable Nodemailer.');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: Number(process.env.MAIL_PORT || 587) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = { sendMail };
