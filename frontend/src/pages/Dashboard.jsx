import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Trash2, ExternalLink, PlusCircle, ShieldCheck,
  ShoppingCart, Package, BookmarkX, Loader, Mail, Phone, Hash, ArrowLeft, MapPin, Building
} from 'lucide-react';

import BACKEND from '../config';

export default function Dashboard() {
  const navigate = useNavigate();

  // Auth
  const userInfoRaw = localStorage.getItem('userInfo');
  const user = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const token = user?.token;
  const userId = user?._id || 'guest';
  const shoppingKey = `shoppingList_${userId}`;

  // Shopping list from localStorage
  const [shoppingList, setShoppingList] = useState(() => {
    try { return JSON.parse(localStorage.getItem(shoppingKey) || '[]'); }
    catch { return []; }
  });

  // My listings from API
  const [myListings, setMyListings] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchMyListings();
  }, [token]);

  const fetchMyListings = async () => {
    try {
      const { data } = await axios.get(`${BACKEND}/api/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter only listings that belong to the current user
      const all = data.listings || [];
      const mine = all.filter(l => {
        const sellerId = typeof l.seller === 'object' ? l.seller?._id : l.seller;
        return sellerId?.toString() === user?._id?.toString();
      });
      setMyListings(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const removeFromShoppingList = (id) => {
    const updated = shoppingList.filter(item => (item._id || item.id) !== id);
    setShoppingList(updated);
    localStorage.setItem(shoppingKey, JSON.stringify(updated));
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete(`${BACKEND}/api/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyListings(prev => prev.filter(l => l._id !== listingId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const getStatusBadge = (status = 'pending') => {
    const styles = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.pending}`}>
        {label}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-6 mb-12 px-4 sm:px-6 lg:px-8">

      {/* Top Back Button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors -mb-4"
      >
        <div className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <span>Back to Home</span>
      </Link>

      {/* ── Profile Card ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md flex-shrink-0">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
              <span className="inline-flex items-center gap-1 text-green-600 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" /> Verified Student
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-3 text-sm text-gray-500 flex-wrap justify-center sm:justify-start">
              {user.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-gray-400" /> {user.email}
                </span>
              )}
              {user.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-gray-400" /> {user.phone}
                </span>
              )}
              {user.rollnumber && (
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="h-4 w-4 text-gray-400" /> {user.rollnumber}
                </span>
              )}
              {user.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" /> {user.city}
                </span>
              )}
              {user.campus && (
                <span className="inline-flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-gray-400" /> {user.campus}
                </span>
              )}
            </div>
          </div>

          {/* Sell Button */}
          <Link
            to="/create-listing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Sell an Item
          </Link>
        </div>
      </div>

      {/* ── Items You Are Selling ─────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Items You Are Selling</h2>
          </div>
          <span className="text-sm text-gray-400 font-medium">{myListings.length} listing{myListings.length !== 1 ? 's' : ''}</span>
        </div>

        {isLoadingListings ? (
          <div className="flex justify-center py-12 text-blue-500">
            <Loader className="animate-spin h-7 w-7" />
          </div>
        ) : myListings.length === 0 ? (
          <div className="text-center py-14">
            <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No active listings</h3>
            <p className="text-sm text-gray-400 mt-1">Start selling by posting your first item.</p>
            <Link to="/create-listing" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <PlusCircle className="h-4 w-4" /> Create Listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {myListings.map((listing) => {
                  const imgUrl = listing.images?.[0] || listing.image;
                  const date = new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  return (
                    <tr key={listing._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <img className="h-12 w-12 rounded-lg object-cover border border-gray-100" src={imgUrl} alt="" />
                          <div>
                            <div className="text-sm font-bold text-gray-900">{listing.title}</div>
                            <div className="text-sm text-blue-600 font-semibold">₹{listing.price}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(listing.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/listing/${listing._id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button onClick={() => deleteListing(listing._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Your Shopping List ────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Your Shopping List</h2>
          </div>
          <span className="text-sm text-gray-400 font-medium">{shoppingList.length} item{shoppingList.length !== 1 ? 's' : ''}</span>
        </div>

        {shoppingList.length === 0 ? (
          <div className="text-center py-14">
            <ShoppingCart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">Nothing saved yet</h3>
            <p className="text-sm text-gray-400 mt-1">Click "Save to List" on any listing to add it here.</p>
            <Link to="/" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Browse Listings
            </Link>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 pb-4">
              {shoppingList.map((item) => {
                const id = item._id || item.id;
                const imgUrl = item.images?.[0] || item.image;

                const seedStr = String(id) + String(item.title);
                const discountPercent = 15 + (seedStr.charCodeAt(0) % 30) + (seedStr.length % 15);
                const actualPrice = Number(item.price);
                const originalPrice = Math.round(actualPrice * (1 + (discountPercent / 100)));

                return (
                  <div key={id} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow group">
                    <div className="relative">
                      <img src={imgUrl} alt={item.title} className="w-full h-36 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                      <button
                        onClick={() => removeFromShoppingList(id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-400 hover:text-red-600 hover:bg-white shadow-sm transition-colors"
                        title="Remove"
                      >
                        <BookmarkX className="h-4 w-4" />
                      </button>
                      
                      <div className="absolute top-2 left-2 bg-white/95 text-emerald-600 px-2 py-1 rounded text-xs uppercase font-black shadow-md border border-emerald-100 tracking-wide">
                        {discountPercent}% Off
                      </div>

                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md flex flex-col items-start leading-none gap-1">
                        <span className="text-[11px] font-semibold text-gray-400 line-through decoration-gray-300">₹{originalPrice.toLocaleString('en-IN')}</span>
                        <span className="text-base font-black text-gray-900 tracking-tight">₹{actualPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                      {item.category && <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>}
                      {item._id && (
                        <Link
                          to={`/listing/${item._id}`}
                          className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> View Listing
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Total Summary Bar ── */}
            <div className="mx-6 mb-6 rounded-2xl overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Order Summary</p>
                    <p className="text-white text-sm font-semibold mt-0.5">
                      {shoppingList.length} item{shoppingList.length !== 1 ? 's' : ''} in your list
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center hidden sm:block">
                    <p className="text-blue-200 text-xs">Avg. Price</p>
                    <p className="text-white font-bold text-sm mt-0.5">
                      ₹{Math.round(shoppingList.reduce((s, i) => s + Number(i.price || 0), 0) / shoppingList.length).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-blue-200 text-xs">Total Amount</p>
                    <p className="text-white font-extrabold text-2xl mt-0.5">
                      ₹{shoppingList.reduce((sum, item) => sum + Number(item.price || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Clear entire shopping list?')) {
                        setShoppingList([]);
                        localStorage.setItem(shoppingKey, '[]');
                      }
                    }}
                    className="text-xs text-blue-200 hover:text-white border border-white/30 hover:border-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
