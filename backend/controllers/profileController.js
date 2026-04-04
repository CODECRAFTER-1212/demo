const User = require('../models/User');
const nodemailer = require('nodemailer');
const imagekit = require('../config/imagekit');
const Tesseract = require('tesseract.js');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'dummy@gmail.com',
    pass: process.env.SMTP_PASS || 'dummypass',
  },
});

exports.getProfileData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+aadhaarCard');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const {
      name, email, rollnumber, phone, city, campus,
      profilePicture, collegeId, isEmailVerified
    } = user;

    // Return a boolean instead of the raw Aadhaar URL for security
    const hasAadhaar = !!user.aadhaarCard;

    // Calculate percentage
    let percentage = 0;
    // basic details = 20%
    if (name && email && rollnumber && phone) percentage += 20;
    if (profilePicture) percentage += 10;
    if (isEmailVerified) percentage += 20;
    if (collegeId) percentage += 20;
    if (hasAadhaar) percentage += 30;

    res.json({
      name, email, rollnumber, phone, city, campus,
      profilePicture, collegeId, hasAadhaar, isEmailVerified, percentage
    });
  } catch (err) {
    next(err);
  }
};

exports.sendOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins expiry
      attempts: 0
    };
    await user.save();

    console.log(`[DEBUG] Generated OTP for ${user.email}: ${otpCode}`);

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: user.email,
          subject: 'StudentMart - Email Verification OTP',
          text: `Your OTP for email verification is ${otpCode}. It will expire in 5 minutes. Do not share this with anyone.`,
        });
      } else {
        console.log('SMTP Config missing, skipping actual email send. Check server console for OTP.');
      }
    } catch (emailErr) {
      console.log('Failed to send email:', emailErr.message);
    }

    res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id).select('+otp.code +otp.expiresAt +otp.attempts');

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }

    if (user.otp.attempts >= 3) {
      user.otp = undefined; // clear
      await user.save();
      return res.status(400).json({ message: 'Max attempts reached. Please request a new OTP.' });
    }

    if (new Date() > user.otp.expiresAt) {
      user.otp = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();
      return res.status(400).json({ message: `Invalid OTP. Attempts left: ${3 - user.otp.attempts}` });
    }

    // Match!
    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    next(err);
  }
};

exports.updateProfileFiles = async (req, res, next) => {
  try {
    let updateData = {};
    const files = req.files || {};

    const uploadToImageKit = async (fileBuffer, fileName) => {
      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: '/studentmart_profiles'
      });
      return result.url;
    };

    if (files.profilePicture && files.profilePicture.length > 0) {
      updateData.profilePicture = await uploadToImageKit(files.profilePicture[0].buffer, files.profilePicture[0].originalname);
    }
    if (files.collegeId && files.collegeId.length > 0) {
      updateData.collegeId = await uploadToImageKit(files.collegeId[0].buffer, files.collegeId[0].originalname);
    }
    if (files.aadhaarCard && files.aadhaarCard.length > 0) {
      try {
        console.log(' Verifying Aadhaar Card via OCR...');
        const { data: { text } } = await Tesseract.recognize(files.aadhaarCard[0].buffer, 'eng');
        const lowerText = text.toLowerCase();

        // Check for common Aadhaar card keywords or 12-digit numbers
        const isAadhaar =
          lowerText.includes('government of india') ||
          lowerText.includes('india') ||
          lowerText.includes('dob') ||
          /\d{4}\s?\d{4}\s?\d{4}/.test(text);

        if (!isAadhaar) {
          return res.status(400).json({ message: 'Invalid Aadhaar Card detected. Please upload a clear original photo.' });
        }
      } catch (ocrErr) {
        console.error('OCR Error:', ocrErr);
        return res.status(400).json({ message: 'Aadhaar verification failed. Ensure the image is clear and readable.' });
      }

      updateData.aadhaarCard = await uploadToImageKit(files.aadhaarCard[0].buffer, files.aadhaarCard[0].originalname);
    }

    const { name, phone, city, campus } = req.body;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (city) updateData.city = city;
    if (campus) updateData.campus = campus;

    // Make sure we only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};
