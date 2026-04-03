import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, BookmarkPlus, BookmarkCheck, Heart } from 'lucide-react';

// localStorage helpers
const getList = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};
const setList = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const listingId = listing._id || listing.id;
  const imageUrl = (listing.images && listing.images.length > 0) ? listing.images[0] : listing.image;

  const userInfoRaw = localStorage.getItem('userInfo');
  const user = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const userId = user?._id || 'guest';
  const shoppingKey = `shoppingList_${userId}`;
  const wishlistKey = `wishlist_${userId}`;

  // Deterministic discount based on title & ID
  const seedStr = String(listingId) + String(listing.title);
  const discountPercent = 15 + (seedStr.charCodeAt(0) % 30) + (seedStr.length % 15);
  const actualPrice = Number(listing.price);
  const originalPrice = Math.round(actualPrice * (1 + (discountPercent / 100)));

  const [saved, setSaved] = useState(() =>
    getList(shoppingKey).some(i => (i._id || i.id) === listingId)
  );
  const [liked, setLiked] = useState(() =>
    getList(wishlistKey).some(i => (i._id || i.id) === listingId)
  );

  const toggleSave = (e) => {
    e.preventDefault(); e.stopPropagation();
    const current = getList(shoppingKey);
    const updated = saved
      ? current.filter(i => (i._id || i.id) !== listingId)
      : [...current, { ...listing, images: [imageUrl] }];
    setList(shoppingKey, updated);
    setSaved(!saved);
  };

  const toggleLike = (e) => {
    e.preventDefault(); e.stopPropagation();
    const current = getList(wishlistKey);
    if (!liked) {
      const updated = [...current, { ...listing, images: [imageUrl] }];
      setList(wishlistKey, updated);
      setLiked(true);
      navigate('/wishlist');
    } else {
      const updated = current.filter(i => (i._id || i.id) !== listingId);
      setList(wishlistKey, updated);
      setLiked(false);
    }
  };

  return (
    <Link
      to={`/listing/${listingId}`}
      state={listing.isDummy ? { dummyListing: listing, imageUrl } : undefined}
      className="group block"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">

        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Category badge */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm">
            {listing.category}
          </div>

          {/* Demo badge */}
          {listing.isDummy && (
            <div className="absolute top-2 left-20 bg-amber-400/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-amber-900 shadow-sm">
              Demo
            </div>
          )}

          {/* ❤️ Wishlist heart icon — top right on image */}
          <button
            onClick={toggleLike}
            className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all duration-200 ${
              liked
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
            }`}
            title={liked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 pr-1 leading-tight tracking-tight">{listing.title}</h3>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-xl font-black text-gray-900 leading-none tracking-tight">₹{actualPrice.toLocaleString('en-IN')}</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-semibold text-gray-400 line-through decoration-gray-300">₹{originalPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs uppercase font-black text-emerald-600 tracking-wide">{discountPercent}% Off</span>
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <span className="truncate">{listing.city}, {listing.area}</span>
          </div>

          {/* 🔖 Save to List — small, blue */}
          <button
            onClick={toggleSave}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              saved
                ? 'bg-blue-600 text-white hover:bg-red-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saved
              ? <><BookmarkCheck className="h-3.5 w-3.5" /> Saved</>
              : <><BookmarkPlus className="h-3.5 w-3.5" /> Save to List</>
            }
          </button>
        </div>
      </div>
    </Link>
  );
}
