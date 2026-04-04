import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { ArrowLeft, Send, MessageCircle, ShieldCheck, Loader, Lock } from 'lucide-react';

const BACKEND = 'http://localhost:5000';
const POLL_INTERVAL = 3000; // Poll every 3 seconds as fallback

export default function Chat() {
  const { listingId, sellerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { listing, sellerName } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messageIdsRef = useRef(new Set()); // for deduplication

  // Get logged-in user info from localStorage (saved as 'userInfo' by Login page)
  const userInfoRaw = localStorage.getItem('userInfo');
  const currentUser = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const token = currentUser?.token || null;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token || !currentUser) {
      navigate('/login', { state: { from: `/chat/${listingId}/${sellerId}` } });
    }
  }, []);

  // Merge new messages without duplicates
  const mergeMessages = useCallback((newMsgs) => {
    setMessages(prev => {
      const merged = [...prev];
      for (const msg of newMsgs) {
        const id = msg._id?.toString();
        if (id && !messageIdsRef.current.has(id)) {
          messageIdsRef.current.add(id);
          merged.push(msg);
        }
      }
      return merged;
    });
  }, []);

  // Fetch messages from server
  const fetchMessages = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${BACKEND}/api/chat/${listingId}/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgs = data.messages || [];
      if (!silent) {
        // First load: set all messages
        messageIdsRef.current = new Set(msgs.map(m => m._id?.toString()).filter(Boolean));
        setMessages(msgs);
        setIsLoading(false);
      } else {
        // Polling: only add new ones
        mergeMessages(msgs);
      }
    } catch (err) {
      if (!silent) {
        setError('Could not load chat history.');
        setIsLoading(false);
      }
    }
  }, [listingId, sellerId, token, mergeMessages]);

  // Load message history on mount
  useEffect(() => {
    fetchMessages(false);
  }, [fetchMessages]);

  // Polling fallback — fetch new messages every 3 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchMessages(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMessages, token]);

  // Setup Socket.io
  useEffect(() => {
    if (!token) return;

    const socket = io(BACKEND, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', { listingId, sellerId });
    });

    socket.on('receive_message', (msg) => {
      // Only add messages from the OTHER person via socket
      // Sender's own message is added optimistically in sendMessage()
      const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
      if (senderId !== currentUser._id?.toString()) {
        mergeMessages([msg]);
      }
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      console.warn('Socket connect_error:', err.message);
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, listingId, sellerId]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    const trimmedText = text.trim();
    setText('');

    // ✅ Optimistic update — show message immediately for sender
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      text: trimmedText,
      sender: { _id: currentUser._id, name: currentUser.name },
      createdAt: new Date().toISOString(),
    };
    messageIdsRef.current.add(tempId);
    setMessages(prev => [...prev, optimisticMsg]);

    // Send via Socket.IO if connected, else just rely on polling
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {
        listingId,
        sellerId,
        receiverId: sellerId,
        text: trimmedText,
      });
    } else {
      // Fallback: send via HTTP API if socket not connected
      axios.post(`${BACKEND}/api/chat/${listingId}/${sellerId}`,
        { text: trimmedText },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(console.error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (!token || !currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto mt-4 mb-12">
      {/* Header */}
      <div className="bg-white rounded-t-2xl border border-gray-200 px-5 py-4 flex items-center gap-4 shadow-sm">
        <Link to={-1} className="text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
          {(sellerName || 'S').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-gray-900 truncate">{sellerName || 'Seller'}</h2>
            <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
          </div>
          {listing?.title && (
            <p className="text-xs text-gray-500 truncate">Re: {listing.title}</p>
          )}
        </div>

        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            connected
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-gray-100 text-gray-400 border border-gray-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {connected ? 'Online' : 'Connecting...'}
        </span>
      </div>

      {/* Listing Preview */}
      {listing && (
        <div className="bg-blue-50 border-x border-blue-100 px-5 py-3 flex items-center gap-3">
          {(listing.images?.[0] || listing.image) && (
            <img
              src={listing.images?.[0] || listing.image}
              alt={listing.title}
              className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-blue-100"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{listing.title}</p>
            <p className="text-sm text-blue-600 font-bold">₹{listing.price}</p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="bg-gray-50 border-x border-gray-200 h-[420px] overflow-y-auto px-5 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-blue-500">
            <Loader className="animate-spin h-7 w-7" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-400 text-sm">{error}</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <MessageCircle className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isMe && (
                    <span className="text-xs text-gray-400 ml-1">{msg.sender?.name || sellerName}</span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200 px-4 py-3 flex items-end gap-3 shadow-sm">
        <div className="flex-1 relative">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            className="w-full resize-none px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition max-h-32"
            style={{ overflowY: 'auto' }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="flex-shrink-0 h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* End-to-end note */}
      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
        <Lock className="h-3 w-3" />
        Messages are only visible to you and the seller
      </div>
    </div>
  );
}
