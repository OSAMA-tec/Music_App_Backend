const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const recoverPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(500).send('Email not passed');
        }
        let user = await User.findOne({ 'local.email': email });
        if (!user) {
            return res.status(400).send('User not Found');
        }
        if (!user.local.verified) {
            // Delete unverified user
            await User.deleteOne({ _id: user.id });
            return res.status(400).json({
                message: 'User not found',
            });
        }
        const salt = await bcrypt.genSalt(10);    
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpHash = await bcrypt.hash(otp.toString(), salt);
        user.local.otp=otpHash;
        await user.save();
         // Send OTP by email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ "email": email }];
    sendSmtpEmail.sender = { "email": process.env.EMAIL_USERNAME, "name": "MUSIC APP" };
    sendSmtpEmail.subject = 'Verify your email';
    sendSmtpEmail.htmlContent = `
    <div style="
        background-color: #f8f9fa; 
        padding: 20px; 
        font-family: Arial, sans-serif; 
        text-align: center;">
        <div style="
            background-color: #ffffff; 
            margin: auto; 
            max-width: 600px; 
            padding: 40px; 
            border-radius: 4px; 
            box-shadow: 0px 0px 10px rgba(0,0,0,0.05);">
            <img src="https://yourwebsite.com/images/logo.png" alt="Your Company Logo" style="max-width: 200px; margin-bottom: 40px;">
            <h2 style="color: #333333; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #777777; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                Thank you for registering! Please enter the following One Time Password (OTP) to verify your email address:
            </p>
            <div style="
                background-color: #007bff; 
                color: #ffffff; 
                font-size: 24px; 
                padding: 20px; 
                border-radius: 4px;">
                ${otp}
            </div>
            <p style="color: #777777; font-size: 16px; line-height: 1.5; margin-top: 30px;">
                If you did not request this code, you can safely ignore this email.
            </p>
        </div>
        <p style="color: #777777; font-size: 14px; line-height: 1.5; margin-top: 20px;">
            © 2023 Your Company Name. All rights reserved.
        </p>
    </div>
`;
    new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(sendSmtpEmail)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error);
      })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
module.exports={recoverPassword};
