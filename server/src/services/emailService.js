const nodemailer = require('nodemailer');

class EmailService {
   constructor() {
      this.transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
         },
         tls: {
            rejectUnauthorized: false
         }
      });
   }

   async sendNotificationEmail(to, subject, text) {
      try {
         if (!to || !subject || !text) {
            throw new Error('Missing required email parameters');
         }

         console.log('Sending email notification:', { to, subject });

         const mailOptions = {
            from: `PermiTree <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: `
               <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #166534;">${subject}</h2>
                  <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                     ${text.replace(/\n/g, '<br>')}
                  </div>
                  <p style="color: #666; font-size: 14px;">
                     This is an automated message from PermiTree. Please do not reply to this email.
                  </p>
               </div>
            `
         };

         const info = await this.transporter.sendMail(mailOptions);
         console.log('Email sent successfully:', info.messageId);
         return true;
      } catch (error) {
         console.error('Error sending email notification:', error);
         return false;
      }
   }

   async verifyConnection() {
      try {
         await this.transporter.verify();
         console.log('Email service connection verified');
         return true;
      } catch (error) {
         console.error('Email service connection failed:', error);
         return false;
      }
   }
}

const emailService = new EmailService();
emailService.verifyConnection();

module.exports = emailService;
