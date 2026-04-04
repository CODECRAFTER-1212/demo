import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Tag, ShieldCheck, Phone, MessageCircle, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { Star, Trash2, Edit } from 'lucide-react';
import BACKEND from '../config';

export default function ListingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('userInfo') || 'null');

  const handleContact = () => {
    // Dummy listings have no real seller — can't chat
    if (listing?.isDummy) {
      alert('Chat is not available for demo listings.');
      return;
    }
    // Extract sellerId as a plain string (seller may be populated object or bare ObjectId)
    const sellerId =
      (typeof listing?.seller === 'object' && listing?.seller !== null
        ? listing.seller._id
        : listing?.seller
      )?.toString();

    const listingId = listing?._id?.toString() || id;

    if (!sellerId || !listingId) return;

    // Prevent chatting with yourself
    if (currentUser && currentUser._id === sellerId) {
      alert('This is your own listing.');
      return;
    }

    navigate(`/chat/${listingId}/${sellerId}`, {
      state: {
        listing,
        sellerName: listing?.seller?.name || 'Seller',
      },
    });
  };

  useEffect(() => {
    // If dummy listing data was passed via router state, use it directly
    if (location.state?.dummyListing) {
      const dl = location.state.dummyListing;
      const imageUrl = location.state.imageUrl || dl.image;
      // Normalise dummy listing to match real listing shape
      setListing({
        ...dl,
        images: [imageUrl],
        description: 'This is a demo listing for display purposes. Real listings will show actual seller descriptions here.',
        seller: {
          name: 'Demo Seller',
          email: 'demo@studentmart.in',
        },
        createdAt: new Date().toISOString(),
      });
      setIsLoading(false);
      return;
    }

    // Otherwise fetch from API
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await axios.get(`${BACKEND}/api/listings/${id}`);
        setListing(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing. It may not exist or has been removed.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id, location.state]);

  // Fetch Reviews
  useEffect(() => {
    if (!listing || listing.isDummy) return;
    const sellerId = (typeof listing.seller === 'object' ? listing.seller._id : listing.seller)?.toString();
    if (!sellerId) return;

    const fetchRev = async () => {
      try {
        setIsLoadingReviews(true);
        const { data } = await axios.get(`${BACKEND}/api/reviews/${sellerId}`);
        setReviews(data);
        if (currentUser) {
          const myRev = data.find(r => r.reviewer._id === currentUser._id);
          if (myRev) setUserReview(myRev);
        }
      } catch (err) {
        console.error('Failed to load reviews');
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchRev();
  }, [listing]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    const sellerId = (typeof listing.seller === 'object' ? listing.seller._id : listing.seller)?.toString();
    
    try {
      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      if (userReview) {
        // Update review
        const { data } = await axios.put(`${BACKEND}/api/reviews/${userReview._id}`, {
          rating: reviewRating,
          comment: reviewComment
        }, { headers });
        setReviews(reviews.map(r => r._id === data._id ? { ...data, reviewer: currentUser } : r));
        setUserReview(data);
      } else {
        // Create review
        const { data } = await axios.post(`${BACKEND}/api/reviews/${sellerId}`, {
          rating: reviewRating,
          comment: reviewComment
        }, { headers });
        // Refresh exactly to grab populated reviewer
        const fetchAll = await axios.get(`${BACKEND}/api/reviews/${sellerId}`);
        setReviews(fetchAll.data);
        setUserReview(fetchAll.data.find(r => r.reviewer._id === currentUser._id));
        // Soft update local seller score for immediate UI feedback
        setListing({
          ...listing,
          seller: {
            ...listing.seller,
            totalRating: (listing.seller.totalRating || 0) + reviewRating,
            totalReviews: (listing.seller.totalReviews || 0) + 1
          }
        });
      }
      setShowReviewForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`${BACKEND}/api/reviews/${userReview._id}`, {
        headers: { Authorization: `Bearer ${currentUser?.token}` }
      });
      setReviews(reviews.filter(r => r._id !== userReview._id));
      setListing({
        ...listing,
        seller: {
          ...listing.seller,
          totalRating: Math.max((listing.seller.totalRating || 0) - userReview.rating, 0),
          totalReviews: Math.max((listing.seller.totalReviews || 0) - 1, 0)
        }
      });
      setUserReview(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32 text-blue-600">
        <Loader className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-14 w-14 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Listing Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'This listing does not exist.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>
      </div>
    );
  }

  const seller = listing.seller || {};
  const sellerName = seller.name || 'Unknown Seller';
  const joinedAt = seller.createdAt
    ? new Date(seller.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Unknown';
  const postedAt = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Unknown date';

  const idStr = String(listing._id || listing.id || '');
  const seedStr = idStr + String(listing.title || '');
  const discountPercent = 15 + ((seedStr.charCodeAt(0) || 0) % 30) + (seedStr.length % 15);
  const actualPrice = Number(listing.price || 0);
  const originalPrice = Math.round(actualPrice * (1 + (discountPercent / 100)));

  return (
    <div className="mt-6 mb-12">
      {/* Back Link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Section */}
          <div className="bg-gray-100 flex flex-col items-center justify-center p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-200">
            <img
              src={listing.images?.[activeImage] || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={listing.title}
              className="max-h-[420px] object-contain w-full rounded-xl shadow-md"
            />
            {/* Thumbnail strip if multiple images */}
            {listing.images?.length > 1 && (
              <div className="flex gap-2 mt-4">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">{listing.title}</h1>
              </div>

              <div className="flex items-end gap-3 mb-6 pt-1">
                <p className="text-5xl font-black text-gray-900 leading-none tracking-tight">₹{actualPrice.toLocaleString('en-IN')}</p>
                <div className="flex flex-col pb-1 ml-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-semibold text-gray-400 line-through decoration-gray-300 leading-none">₹{originalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xl uppercase font-black text-emerald-600 tracking-wide leading-none">{discountPercent}% Off</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  <Tag className="mr-1.5 h-4 w-4" />
                  {listing.category}
                </span>
                {(listing.city || listing.area) && (
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                    {[listing.city, listing.area].filter(Boolean).join(', ')}
                  </span>
                )}
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  <Calendar className="mr-1.5 h-4 w-4 text-gray-500" />
                  Posted {postedAt}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100 whitespace-pre-line">
                {listing.description || 'No description provided.'}
              </p>
            </div>

            {/* Seller Section */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-5 text-center sm:text-left">About the Seller</h3>
              <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="h-14 w-14 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl mr-4 shadow-sm">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 flex items-center">
                      {sellerName}
                      <ShieldCheck className="ml-1.5 h-5 w-5 text-green-500" />
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {seller.totalReviews > 0 ? (
                        <div className="flex items-center bg-white px-2 py-0.5 rounded shadow-sm">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-sm font-bold text-gray-800">
                            {(seller.totalRating / seller.totalReviews).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">({seller.totalReviews} reviews)</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded shadow-sm">No reviews yet</span>
                      )}
                      <p className="text-sm text-gray-500 font-medium">Joined {joinedAt}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleContact}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat with Seller
                  </button>
                </div>
              </div>

              {/* Reviews List & Form Context */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Seller Reviews</h3>
                  {currentUser && currentUser._id !== (seller._id || seller) && (
                    <button 
                      onClick={() => {
                        if(userReview) {
                          setReviewRating(userReview.rating);
                          setReviewComment(userReview.comment);
                        }
                        setShowReviewForm(!showReviewForm);
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                    >
                      {showReviewForm ? 'Cancel' : userReview ? 'Edit Your Review' : '+ Write a Review'}
                    </button>
                  )}
                </div>

                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`h-6 w-6 cursor-pointer ${star <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                    <textarea 
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      required
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm mb-3 border p-2"
                      rows={3}
                      placeholder="How was your experience?"
                    />
                    <div className="flex justify-between items-center">
                      {userReview && (
                        <button type="button" onClick={handleDeleteReview} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition border border-transparent hover:border-red-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button disabled={submittingReview} type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 ml-auto flex items-center justify-center">
                        {submittingReview ? <Loader className="h-4 w-4 animate-spin" /> : 'Submit'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {isLoadingReviews ? (
                    <div className="flex justify-center p-4"><Loader className="h-5 w-5 animate-spin text-blue-500" /></div>
                  ) : reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center text-gray-600 font-bold text-xs uppercase overflow-hidden">
                              {rev.reviewer?.profilePicture ? <img src={rev.reviewer.profilePicture} className="h-full w-full object-cover" /> : rev.reviewer?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-none">{rev.reviewer?.name || 'User'}</p>
                              <div className="flex mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">No reviews yet for this seller.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
