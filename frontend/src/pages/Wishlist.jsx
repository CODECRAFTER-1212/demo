import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft, ShoppingBag, MapPin, Tag } from 'lucide-react';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  const userInfoRaw = localStorage.getItem('userInfo');
  const user = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const userId = user?._id || 'guest';
  const wishlistKey = `wishlist_${userId}`;

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      setWishlist(stored);
    } catch {
      setWishlist([]);
    }
  }, [wishlistKey]);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(item => (item._id || item.id) !== id);
    setWishlist(updated);
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
  };

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your favorites?')) {
      setWishlist([]);
      localStorage.setItem(wishlistKey, '[]');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 mb-16 px-4 sm:px-6 lg:px-8">

      {/* Top Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-4 transition-colors"
      >
        <div className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <span>Go Back</span>
      </button>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-[32px] p-8 sm:p-10 shadow-lg overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        {/* Decorative large faint heart in background */}
        <Heart className="absolute -right-10 -bottom-20 h-96 w-96 text-white opacity-10 fill-white rotate-12 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Favorites
            </h1>
          </div>
          <p className="text-blue-100 font-medium text-lg">
            You Have <span className="text-white font-bold underline decoration-2 underline-offset-4 mx-1">{wishlist.length}</span> Items You Love
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-4 w-full md:w-auto">
          <Link
            to="/"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Keep Browsing
          </Link>
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-transparent border border-white/40 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 hover:border-white transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="mt-10">
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart className="h-12 w-12 text-blue-500 opacity-50" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">It's pretty quiet here...</h3>
            <p className="text-gray-500 mt-2">Go ahead and save items you plan to buy later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist.map((item) => {
              const id = item._id || item.id;
              const imgUrl = item.images?.[0] || item.image;

              const seedStr = String(id) + String(item.title);
              const discountPercent = 15 + (seedStr.charCodeAt(0) % 30) + (seedStr.length % 15);
              const actualPrice = Number(item.price);
              const originalPrice = Math.round(actualPrice * (1 + (discountPercent / 100)));

              return (
                <div key={id} className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">

                  {/* Image Area */}
                  <div className="relative h-56 w-full bg-gray-100 overflow-hidden p-3">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Label Overlay */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black text-gray-800 tracking-wider uppercase flex items-center gap-1.5 shadow-sm border border-gray-100">
                      <Tag className="h-3 w-3" />
                      {item.category || 'Item'}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-extrabold text-gray-900 text-[17px] leading-tight line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex flex-col items-end shrink-0 text-right pt-0.5">
                        <span className="font-black text-gray-900 text-2xl leading-none tracking-tight">
                          ₹{actualPrice.toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[13px] font-semibold text-gray-400 line-through decoration-gray-300">₹{originalPrice.toLocaleString('en-IN')}</span>
                          <span className="text-xs uppercase font-black text-emerald-600 tracking-wide">{discountPercent}% Off</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm font-medium text-gray-400 mb-6 mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                      <span className="truncate">{item.city || 'Location'}, {item.area || 'N/A'}</span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex items-center gap-3">
                      <Link
                        to={`/listing/${id}`}
                        state={item.isDummy ? { dummyListing: item, imageUrl: imgUrl } : undefined}
                        className="flex-1 bg-[#1A1F2C] hover:bg-black text-white font-bold py-3.5 rounded-xl text-center text-sm transition-colors shadow-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-3.5 rounded-xl transition-colors shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
