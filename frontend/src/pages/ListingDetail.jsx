import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Tag, ShieldCheck, Phone, MessageCircle, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function ListingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const navigate = useNavigate();

  const handleContact = () => {
    const sellerId = listing?.seller?._id || listing?.seller;
    if (!sellerId) return;
    navigate(`/chat/${listing._id || id}/${sellerId}`, {
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
        const { data } = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing. It may not exist or has been removed.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id, location.state]);

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

              <p className="text-4xl font-black text-blue-600 mb-6">₹{listing.price}</p>

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
              <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="h-14 w-14 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl mr-4 shadow-sm">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 flex items-center">
                      {sellerName}
                      <ShieldCheck className="ml-1.5 h-5 w-5 text-green-500" />
                    </h4>
                    <p className="text-sm text-gray-500 font-medium">Joined {joinedAt}</p>
                    {seller.email && (
                      <p className="text-sm text-gray-500 mt-0.5">{seller.email}</p>
                    )}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
