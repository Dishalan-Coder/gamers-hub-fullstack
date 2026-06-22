const { success, fail } = require('../utils/response');
const { validateContact } = require('../utils/validators');
const { sendMail } = require('../utils/mailer');

const sendContactMessage = async (req, res) => {
  try {
    const errors = validateContact(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 'Validation failed', 400, errors);

    const { name, email, message } = req.body;
    await sendMail({
      to: process.env.ADMIN_MAIL || process.env.MAIL_USER || email,
      subject: `Gamers Hub contact message from ${name}`,
      html: `<h3>New contact message</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`,
    });

    return success(res, 'Contact message sent successfully');
  } catch (error) {
    console.error(error);
    return fail(res, 'Contact form received, but email service is not configured correctly', 500);
  }
};

module.exports = { sendContactMessage };
