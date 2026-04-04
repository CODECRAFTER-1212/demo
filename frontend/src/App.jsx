import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ChatInbox from './pages/ChatInbox';
import Wishlist from './pages/Wishlist';
import ProfileCompletion from './pages/ProfileCompletion';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat/:listingId/:sellerId" element={<Chat />} />
          <Route path="/messages" element={<ChatInbox />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile-completion" element={<ProfileCompletion />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
