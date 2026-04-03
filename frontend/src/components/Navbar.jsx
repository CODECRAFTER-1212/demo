import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, PlusCircle, LogIn, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  // Get auth state from local storage
  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;
  const isAuthenticated = !!user;

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">StudentMart</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/create-listing" 
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <PlusCircle className="mr-2 -ml-1 h-4 w-4" />
                  Sell Item
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                >
                  <User className="h-6 w-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
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
