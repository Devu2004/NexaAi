const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});


const sendOTPMail = async (email, otp) => {
    const mailOptions = {
        from: `"Nova Core Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'NODE_RECOVERY: Identity Verification Code',
        html: `
            <div style="font-family: 'JetBrains Mono', monospace, sans-serif; background-color: #050505; color: #ffffff; padding: 40px; border: 1px solid #1a1a1a; border-radius: 12px; max-width: 500px; margin: auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #10a37f; letter-spacing: 5px; font-size: 24px;">NOVA_CORE</h1>
                    <p style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 2px;">Neural Stream Recovery Protocol</p>
                </div>
                
                <div style="background-color: #0a0a0a; border: 1px solid #10a37f; border-radius: 8px; padding: 20px; text-align: center;">
                    <p style="font-size: 12px; color: #888; margin-bottom: 15px; text-transform: uppercase;">Your Security Access Code:</p>
                    <h2 style="font-size: 32px; letter-spacing: 10px; color: #ffffff; margin: 0;">${otp}</h2>
                </div>

                <div style="margin-top: 30px; border-top: 1px solid #1a1a1a; padding-top: 20px;">
                    <p style="font-size: 12px; color: #666; line-height: 1.6;">
                        This code is valid for <span style="color: #10a37f;">5 minutes</span>. 
                        If you did not initiate this recovery, your node may be under threat. 
                        Please ignore this message or contact admin.
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #333;">
                    <p>© 2024 NOVA_CORE SYSTEMS. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Neural Stream Success: Message sent to " + email);
        return info;
    } catch (error) {
        console.error("Neural Stream Error (Mail Service):", error);
        throw new Error("Failed to transmit recovery code.");
    }
};

module.exports = {
    sendOTPMail
};