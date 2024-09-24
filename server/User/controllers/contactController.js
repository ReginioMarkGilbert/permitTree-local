const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendContactForm = (req, res) => {
    const { name, email, subject, message } = req.body;

    const mailOptions = {
        from: email,
        to: 'starlord0222@gmail.com',
        subject: `Contact Form Submission: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    // console.log('Mail Options:', mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send email' });
        }
        // console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully' });
    });
};
