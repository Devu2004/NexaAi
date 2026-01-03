const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const mailService = require('../services/mail.service');

// --- 1. REGISTER USER ---
async function registeruser(req, res) {
  try {
    const {
      fullName: { firstName, lastName },
      email,
      password,
    } = req.body;

    const isUserAlreadyExist = await userModel.findOne({ email });

    if (isUserAlreadyExist) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    
    const user = await userModel.create({
      fullName: { firstName, lastName },
      email,
      password: hashPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie("token", token);

    res.json({
      message: "User created successfully!",
      token, 
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName.firstName, 
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Error during registration" });
  }
}

// --- 2. LOGIN USER  ---
async function loginuser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Enter valid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie("token", token);

    res.status(200).json({
      message: `User logged in successfully`,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName.firstName, 
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// --- 3. FORGOT PASSWORD ---
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save(); 

    await mailService.sendOTPMail(email, otp);

    res.status(200).json({ message: 'OTP Sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
}

// --- 4. RESET PASSWORD ---
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const isOtpMatch = user.otp === Number(otp);
    const isExpired = user.otpExpires < Date.now();

    if (!isOtpMatch) {
      return res.status(400).json({ message: "OTP does not match" });
    }

    if (isExpired) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Reset Pass Error:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  registeruser,
  loginuser,
  forgotPassword,
  resetPassword
};