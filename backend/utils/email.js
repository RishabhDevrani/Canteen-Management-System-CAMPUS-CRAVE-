import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendOTP = async (email, otp, purpose = 'Verification Code') => {
  const mailOptions = {
    from: `"CampusCrave" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your CampusCrave ${purpose} 🔐`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px 20px; border-radius: 12px;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0; font-size: 28px; font-weight: 800;">CampusCrave</h1>
          </div>
          
          <h2 style="color: #111827; font-size: 20px; margin-bottom: 20px; text-align: center;">${purpose}</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: center;">
            Please use the following 6-digit security code for your request. This code is valid for <strong>5 minutes</strong>.
          </p>
          
          <div style="background-color: #fff7ed; border: 2px dashed #fdba74; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ea580c; font-size: 42px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 0; text-align: center;">
            If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} CampusCrave Canteen Management System.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    // Preview URL will only be available if using Ethereal email
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
