import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, PlusCircle, LogIn, LogOut, MessageCircle, Bookmark, Heart } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auth state from localStorage (saved as 'userInfo' by Login page)
  const getUserInfo = () => {
    const userInfoStr = localStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  };
  const [user, setUser] = useState(getUserInfo());
  const isAuthenticated = !!user;

  useEffect(() => {
    // Listen for custom profile update events
    const handleProfileUpdate = () => setUser(getUserInfo());
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Need user ID for localStorage keys
  const userId = user?._id || 'guest';
  const shoppingKey = `shoppingList_${userId}`;
  const wishlistKey = `wishlist_${userId}`;

  // Shopping list count from localStorage
  const savedCount = (() => {
    try { return JSON.parse(localStorage.getItem(shoppingKey) || '[]').length; }
    catch { return 0; }
  })();

  // Wishlist count from localStorage
  const wishCount = (() => {
    try { return JSON.parse(localStorage.getItem(wishlistKey) || '[]').length; }
    catch { return 0; }
  })();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">StudentMart</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Sell Item */}
                {/* Sell Item */}
                <button
                  onClick={async () => {
                    try {
                      const { data } = await require('axios').default.get('http://localhost:5000/api/profile', {
                        headers: { Authorization: `Bearer ${user.token}` }
                      });
                      if (data.percentage >= 70) {
                        navigate('/create-listing');
                      } else {
                        navigate('/profile-completion');
                      }
                    } catch (err) {
                      navigate('/profile-completion');
                    }
                  }}
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  <PlusCircle className="mr-2 -ml-1 h-4 w-4" />
                  Sell Item
                </button>

                {/* Chat / Messages Icon */}
                <Link
                  to="/messages"
                  title="Messages"
                  className={`hidden sm:inline-flex relative items-center justify-center p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                    isActive('/messages')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
                </Link>

                {/* Shopping List Icon */}
                <Link
                  to="/dashboard"
                  title="Shopping List"
                  className={`hidden sm:inline-flex relative items-center justify-center p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                    isActive('/dashboard')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Bookmark className="h-6 w-6" />
                  {savedCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                      {savedCount > 99 ? '99+' : savedCount}
                    </span>
                  )}
                </Link>

                {/* ❤️ Wishlist Icon */}
                <Link
                  to="/wishlist"
                  title="Wishlist"
                  className={`hidden sm:inline-flex relative items-center justify-center p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-400 ${
                    isActive('/wishlist')
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className="h-6 w-6" />
                  {wishCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                      {wishCount > 99 ? '99+' : wishCount}
                    </span>
                  )}
                </Link>

                {/* Dashboard / Profile Dropdown wrapper */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`inline-flex items-center gap-2 px-1.5 sm:px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                      isDropdownOpen ? 'bg-blue-50' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm overflow-hidden">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold truncate max-w-[100px] text-gray-700">
                      {user?.name || 'Profile'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50">
                      
                      {/* Mobile Icons (Hidden on Desktop) */}
                      <div className="sm:hidden border-b border-gray-100 mb-2 pb-2">
                        <Link to="/messages" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                          <div className="relative">
                            <MessageCircle className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
                          </div>
                          Messages
                        </Link>
                        <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-3">
                            <Bookmark className="h-5 w-5" />
                            Shopping List
                          </div>
                          {savedCount > 0 && <span className="bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full text-xs">{savedCount}</span>}
                        </Link>
                        <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <div className="flex items-center gap-3">
                            <Heart className="h-5 w-5" />
                            Wishlist
                          </div>
                          {wishCount > 0 && <span className="bg-red-100 text-red-500 font-bold px-2 py-0.5 rounded-full text-xs">{wishCount}</span>}
                        </Link>
                      </div>

                      {/* Universal Links */}
                      <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <User className="h-5 w-5" />
                        My Dashboard
                      </Link>
                      <button onClick={() => { setIsDropdownOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogIn className="mr-2 -ml-1 h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
