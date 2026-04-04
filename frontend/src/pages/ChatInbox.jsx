import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, ArrowLeft, Loader, PackageOpen, ChevronRight } from 'lucide-react';

import BACKEND from '../config';

export default function ChatInbox() {
  const navigate = useNavigate();
  const userInfoRaw = localStorage.getItem('userInfo');
  const currentUser = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const token = currentUser?.token;

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${BACKEND}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(data.conversations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [token]);

  if (!currentUser) return null;

  const openChat = (conv) => {
    const myId = currentUser._id;
    // The other person is whoever isn't me
    const other = conv.sender?._id === myId ? conv.receiver : conv.sender;
    const sellerId = other?._id;
    const listingId = conv.listing?._id;
    if (!sellerId || !listingId) return;
    navigate(`/chat/${listingId}/${sellerId}`, {
      state: {
        listing: conv.listing,
        sellerName: other?.name || 'User',
      },
    });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 mb-12 px-4 sm:px-6 lg:px-8">
      {/* Top Back Button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors mb-6"
      >
        <div className="bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <span>Back to Home</span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500">Your conversations with sellers & buyers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-blue-500">
            <Loader className="animate-spin h-7 w-7" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <MessageCircle className="h-14 w-14 text-gray-200" />
            <p className="text-gray-500 font-semibold text-lg">No conversations yet</p>
            <p className="text-sm text-gray-400">Click "Chat with Seller" on any listing to start</p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((conv) => {
              const myId = currentUser._id;
              const isMe = conv.sender?._id === myId;
              const other = isMe ? conv.receiver : conv.sender;
              const listing = conv.listing;
              const imgUrl = listing?.images?.[0] || listing?.image;

              return (
                <li key={conv._id}>
                  <button
                    onClick={() => openChat(conv)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Listing thumbnail */}
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      {imgUrl ? (
                        <img src={imgUrl} alt={listing?.title} className="h-full w-full object-cover" />
                      ) : (
                        <PackageOpen className="h-6 w-6 text-gray-400 m-3" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-900 truncate">{other?.name || 'User'}</span>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTime(conv.createdAt)}</span>
                      </div>
                      {listing?.title && (
                        <p className="text-xs text-blue-600 font-medium truncate">Re: {listing.title}</p>
                      )}
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {isMe ? 'You: ' : ''}{conv.text}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
