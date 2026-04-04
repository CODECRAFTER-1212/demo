const express = require('express');
const router = express.Router();
const {
  getProfileData,
  sendOTP,
  verifyOTP,
  updateProfileFiles,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All profile routes are protected
router.use(protect);

router.get('/', getProfileData);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Route for updating text and uploading files
router.put(
  '/',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'collegeId', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
  ]),
  updateProfileFiles
);

module.exports = router;
