# 🎓 StudentMart

A modern, dynamic, and exclusive marketplace built specifically for university students to easily buy and sell course materials, electronics, furniture, and dorm essentials within their campus communities.

## ✨ Features

- **Exclusive Campus Access:** Utilizes OCR scanning using `tesseract.js` to securely verify student authenticity through College ID card matching.
- **Real-Time Communication:** Integrated peer-to-peer live chat system powered by `Socket.io` allows spontaneous negotiation and discussions without page reloads (Polling fallback included).
- **Advanced Filtering & Sorting:** Quickly find what you need with precise filters including intuitive category dropdowns, customized location/campus selectors, and instant pricing range application.
- **Secure Image Uploading:** Handles listing imagery and user avatars using robust **ImageKit** integration securely managed via multipart forms.
- **Smart Authorization Flow:** Fully decoupled authentication using JSON Web Tokens (JWT) working alongside global error interceptors for seamless `401 Unauthorized` handling and session safety. 

## 🚀 Tech Stack

### Frontend
- **React.js (Vite)** & **Tailwind CSS** for a fast and beautiful UI
- **Lucide-React** for dynamic, lightweight iconography
- **Axios** for interceptors and API interfacing
- **React Router** for declarative SPA navigation
- **Socket.io-client** & **Tesseract.js**

### Backend
- **Node.js** & **Express** framework
- **MongoDB Atlas** (Database) with **Mongoose** (ODM)
- **Socket.io** integration for realtime bi-directional event dispatching
- **JSON Web Tokens (JWT)** for route security
- **Multer** for image buffering
- **Nodemailer** for secure Email/OTP generation

## ⚙️ Environment Variables

Before starting out, you must set these environment variables up in the `backend/.env` file. You can refer to `.env.example` as a template!

```ini
PORT=5000
MONGO_URI=your_cluster_connection_uri_here
JWT_SECRET=your_secret_hash_key_here

# ImageKit configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Nodemailer setup
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_gmail_password
```

## 🛠️ Installation & Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/pratikdeshmukh1210/tic-codecrafter.git
   cd tic-codecrafter
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Setup:**
   Open a new terminal session.
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. The web service will boot into your browser on `http://localhost:5173/`!

## 🔐 Contact & Access Controls
*All demo accounts previously utilizing the internal database have been structurally migrated to Atlas. Testing will require signing up with a new, fresh account.*

*Created and maintained by Pratik Deshmukh & Codecrafter Team.*