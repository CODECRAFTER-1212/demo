import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createWorker } from 'tesseract.js';
import { CheckCircle2, ShieldCheck, Mail, Upload, Camera, FileText, Loader, Pencil, X, Check, ScanLine, AlertCircle } from 'lucide-react';
import BACKEND from '../config';

export default function ProfileCompletion() {
  const navigate = useNavigate();
  const userInfoStr = localStorage.getItem('userInfo');
  const userStr = userInfoStr ? JSON.parse(userInfoStr) : null;
  const token = userStr?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [percentage, setPercentage] = useState(0);

  // Popup Banner State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [campus, setCampus] = useState('');

  // Basic Info Edit Mode
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingBasic, setIsSavingBasic] = useState(false);

  // File States
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);

  const [collegeIdFile, setCollegeIdFile] = useState(null);
  const [collegeIdPreview, setCollegeIdPreview] = useState(null);

  // College ID OCR State
  const [collegeIdScanStatus, setCollegeIdScanStatus] = useState('idle'); // idle | scanning | verified | mismatch
  const [collegeIdScanMsg, setCollegeIdScanMsg] = useState('');

  // OTP State
  const [otpStep, setOtpStep] = useState(0); // 0: not started, 1: sent, 2: verified
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${BACKEND}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(data);
      setPercentage(data.percentage);
      setName(data.name || '');
      setPhone(data.phone || '');
      setCity(data.city || '');
      setCampus(data.campus || '');
      if (data.isEmailVerified) setOtpStep(2);
      if (data.profilePicture) setProfilePicPreview(data.profilePicture);
      if (data.collegeId) setCollegeIdPreview(data.collegeId);
      if (data.hasAadhaar) setAadhaarPreview('AADHAAR_SECURE'); // Just a placeholder

      // Update local storage so Navbar and other components know about changes (like profilePicture)
      const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('profileUpdated'));

    } catch (error) {
      console.error(error);
      // If token is invalid/expired (401), clear session and redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('userInfo');
        navigate('/login');
        return;
      }
      alert('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      await axios.post(`${BACKEND}/api/profile/send-otp`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOtpStep(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    try {
      await axios.post(`${BACKEND}/api/profile/verify-otp`, { otp }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOtpStep(2);
      fetchProfile(); // Refresh percentage
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCollegeIdChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set preview
    const previewUrl = URL.createObjectURL(file);
    setCollegeIdPreview(previewUrl);
    setCollegeIdFile(null); // reset until verified
    setCollegeIdScanStatus('scanning');
    setCollegeIdScanMsg('Scanning your College ID...');

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const scannedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

      // Get name and rollnumber to match
      const profileName = (profile?.name || name || '').toLowerCase().trim();
      const profileRoll = (profile?.rollnumber || '').toLowerCase().trim();

      // Check: at least first word of name must appear, and roll number must appear
      const firstNameWord = profileName.split(' ')[0];
      const nameFound = firstNameWord.length > 2 && scannedText.includes(firstNameWord);
      const rollFound = profileRoll.length > 0 && scannedText.replace(/\s/g, '').includes(profileRoll.replace(/\s/g, ''));

      if (nameFound && rollFound) {
        setCollegeIdFile(file);
        setCollegeIdScanStatus('verified');
        setCollegeIdScanMsg(`✅ Verified! Name & Roll Number matched.`);
      } else {
        setCollegeIdPreview(null);
        setCollegeIdFile(null);
        let missing = [];
        if (!nameFound) missing.push('Name');
        if (!rollFound) missing.push('Roll Number');
        setCollegeIdScanStatus('mismatch');
        setCollegeIdScanMsg(`❌ ${missing.join(' & ')} not found on this ID. Please upload your own College ID.`);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setCollegeIdScanStatus('mismatch');
      setCollegeIdScanMsg('⚠️ Could not scan image. Please upload a clear photo of your College ID.');
      setCollegeIdPreview(null);
    }
  };

  const handleFileChange = (e, setter, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (city !== profile.city) formData.append('city', city);
      if (campus !== profile.campus) formData.append('campus', campus);

      if (profilePicFile) formData.append('profilePicture', profilePicFile);
      if (aadhaarFile) formData.append('aadhaarCard', aadhaarFile);
      if (collegeIdFile) formData.append('collegeId', collegeIdFile);

      await axios.put(`${BACKEND}/api/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchProfile();
      showToast('Profile updated successfully!', 'success');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      showToast(errorMessage, 'error');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditBasic = () => {
    setEditName(name);
    setEditPhone(phone);
    setIsEditingBasic(true);
  };

  const handleCancelBasic = () => {
    setIsEditingBasic(false);
  };

  const handleSaveBasic = async () => {
    setIsSavingBasic(true);
    try {
      const formData = new FormData();
      if (editName !== profile.name) formData.append('name', editName);
      if (editPhone !== profile.phone) formData.append('phone', editPhone);

      await axios.put(`${BACKEND}/api/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchProfile();
      setIsEditingBasic(false);
      showToast('Basic info updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update. Please try again.', 'error');
    } finally {
      setIsSavingBasic(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader className="animate-spin h-10 w-10 text-blue-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 relative">

      {/* Toast Notification Popup */}
      {toast.show && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl font-semibold text-white animate-bounce transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? '🚨' : '✅'}
            {toast.message}
          </div>
        </div>
      )}

      {/* Header & Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-500 mt-2">You must complete at least 70% of your profile to start selling items.</p>
        </div>
        <div className="flex flex-col items-center sm:items-end min-w-[200px]">
          <span className="text-4xl font-extrabold text-blue-600">{percentage}%</span>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              className={`h-3 rounded-full transition-all duration-1000 bg-blue-600`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          {percentage >= 70 ? (
            <div className="mt-4 w-full flex flex-col items-center sm:items-end">
              <span className="text-blue-600 font-bold text-sm flex items-center gap-1 mb-2">
                <ShieldCheck className="h-4 w-4" /> Profile Verified
              </span>
              <button
                onClick={() => navigate('/create-listing')}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5"
              >
                + Sell Item Now
              </button>
            </div>
          ) : (
            <span className="text-gray-500 font-medium text-sm mt-3">Complete profile to sell</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Basic Details */}
        <div className="md:col-span-2 space-y-8">
          <form className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6" onSubmit={handleSaveProfile}>
            {/* Basic Information Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold">Basic Information (20%)</h2>
              {!isEditingBasic ? (
                <button
                  type="button"
                  onClick={handleEditBasic}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelBasic}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBasic}
                    disabled={isSavingBasic}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors"
                  >
                    {isSavingBasic ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    {isSavingBasic ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                {isEditingBasic ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-blue-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border-2 ring-2 ring-blue-100"
                    placeholder="Enter your full name"
                    autoFocus
                  />
                ) : (
                  <div className="mt-1 block w-full rounded-md bg-gray-50 p-2 border border-gray-200 text-gray-800 font-medium">{name || <span className="text-gray-400 font-normal">Not set</span>}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                {isEditingBasic ? (
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-blue-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border-2 ring-2 ring-blue-100"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="mt-1 block w-full rounded-md bg-gray-50 p-2 border border-gray-200 text-gray-800 font-medium">{phone || <span className="text-gray-400 font-normal">Not set</span>}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" value={profile.email} disabled className="mt-1 block w-full rounded-md border-gray-200 shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                <input type="text" value={profile.rollnumber} disabled className="mt-1 block w-full rounded-md border-gray-200 shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed p-2 border" />
              </div>
            </div>

            <h2 className="text-xl font-bold border-b pb-4 mt-8">Upload Documents</h2>

            {/* Uploads Grid */}
            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Profile Picture (10%)</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {profilePicPreview ? <img src={profilePicPreview} className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-gray-400" />}
                  </div>
                  <input type="file" onChange={(e) => handleFileChange(e, setProfilePicFile, setProfilePicPreview)} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>

              {/* College ID */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">College ID Card (20%)</label>

                {/* Scan Status Banner */}
                {collegeIdScanStatus === 'scanning' && (
                  <div className="mb-2 flex items-center gap-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium">
                    <Loader className="animate-spin h-4 w-4" />
                    <ScanLine className="h-4 w-4" />
                    Scanning ID card... Please wait
                  </div>
                )}
                {collegeIdScanStatus === 'verified' && (
                  <div className="mb-2 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    {collegeIdScanMsg}
                  </div>
                )}
                {collegeIdScanStatus === 'mismatch' && (
                  <div className="mb-2 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4" />
                    {collegeIdScanMsg}
                  </div>
                )}

                <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden transition-colors ${
                  collegeIdScanStatus === 'verified' ? 'border-green-400 bg-green-50' :
                  collegeIdScanStatus === 'mismatch' ? 'border-red-300 bg-red-50' :
                  collegeIdScanStatus === 'scanning' ? 'border-blue-300 bg-blue-50' :
                  'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}>
                  {collegeIdScanStatus === 'scanning' ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <ScanLine className="h-8 w-8 text-blue-400 animate-pulse" />
                      <span className="text-sm text-blue-600 font-medium">Reading ID card with OCR...</span>
                    </div>
                  ) : collegeIdPreview && collegeIdScanStatus === 'verified' ? (
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-16 h-12 bg-gray-200 rounded shrink-0 overflow-hidden text-xs flex items-center justify-center">
                        <img src={collegeIdPreview} className="object-cover h-full w-full" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> College ID Verified
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">Click to replace</p>
                      </div>
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCollegeIdChange} />
                    </div>
                  ) : (
                    <>
                      <FileText className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Click to upload College ID</span>
                      <span className="text-xs text-gray-400 mt-1">Will scan & verify your name + roll number</span>
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCollegeIdChange} />
                    </>
                  )}
                </div>
              </div>

              {/* Aadhaar */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">Aadhaar Card <span className="text-xs font-normal text-gray-500">(Front Side Only, 30%)</span> <ShieldCheck className="text-green-500 h-4 w-4" /></label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                  {aadhaarPreview ? (
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-16 h-12 bg-green-100 text-green-600 rounded shrink-0 overflow-hidden text-xs flex items-center justify-center font-bold">SECURE</div>
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Aadhaar Uploaded Securely</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, setAadhaarFile, setAadhaarPreview)} />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Click to upload Aadhaar (Front Side)</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, setAadhaarFile, setAadhaarPreview)} />
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Your Aadhaar card is stored securely and never displayed publicly.</p>
              </div>

            </div>

            <div className="pt-4 border-t">
              <button disabled={isSaving} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition flex justify-center items-center">
                {isSaving ? <Loader className="animate-spin h-5 w-5" /> : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar / Email Verification */}
        <div className="space-y-6">
          <div className={`bg-white rounded-2xl shadow-sm border p-6 min-h-[250px] flex flex-col justify-center transition-all ${otpStep === 2 ? 'border-green-200 bg-green-50/50' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-4 border-b pb-4">
              <div className={`p-2 rounded-lg ${otpStep === 2 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Email Status (20%)</h2>
            </div>

            {otpStep === 2 ? (
              <div className="text-center space-y-2">
                <ShieldCheck className="h-12 w-12 text-green-500 mx-auto" />
                <h3 className="font-bold text-green-700 text-lg">Verified!</h3>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
            ) : otpStep === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to <b>{profile.email}</b></p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="******"
                  className="w-full text-center text-2xl tracking-widest font-bold py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button onClick={handleVerifyOtp} disabled={otpLoading || otp.length < 6} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center">
                  {otpLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Verify Code'}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 mt-2">
                <p className="text-sm text-gray-600">You must verify your email address before selling.</p>
                <button onClick={handleSendOtp} disabled={otpLoading} className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 flex justify-center">
                  {otpLoading ? <Loader className="animate-spin h-5 w-5" /> : 'Send OTP Code'}
                </button>
              </div>
            )}
          </div>

          {percentage >= 70 && (
            <button onClick={() => navigate('/create-listing')} className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-lg transition-transform transform hover:-translate-y-1">
              Start Selling Now!
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
