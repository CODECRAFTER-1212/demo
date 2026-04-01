import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams();

  // Dummy data representing the single listing
  const listing = {
    id,
    title: 'MacBook Air M1 - Silver',
    price: 850,
    category: 'Electronics',
    city: 'Pune',
    area: 'Kothrud',
    description: 'Selling my MacBook Air M1, base model with 8GB RAM and 256GB SSD storage. It is in excellent condition with no scratches. Comes with the original box and charger. Selling because I upgraded to M3.',
    createdAt: '2 days ago',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200'
    ],
    seller: {
      name: 'Rohan Sharma',
      joinedAt: 'August 2023',
      isVerified: true
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image Section */}
        <div className="bg-gray-100 flex items-center justify-center p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200">
          <img 
            src={listing.images[0]} 
            alt={listing.title} 
            className="max-h-[500px] object-contain w-full rounded-xl shadow-md"
          />
        </div>

        {/* Details Section */}
        <div className="p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{listing.title}</h1>
            </div>
            
            <p className="text-4xl font-black text-blue-600 mb-6">${listing.price}</p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                <Tag className="mr-1.5 h-4 w-4" />
                {listing.category}
              </span>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <MapPin className="mr-1.5 h-4 w-4 text-gray-500" />
                {listing.city}, {listing.area}
              </span>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <Calendar className="mr-1.5 h-4 w-4 text-gray-500" />
                Posted {listing.createdAt}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-3 block">Description</h3>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
              {listing.description}
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-5 text-center sm:text-left">About the Seller</h3>
            <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="h-14 w-14 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl mr-4 shadow-sm">
                  {listing.seller.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 flex items-center">
                    {listing.seller.name}
                    {listing.seller.isVerified && (
                      <ShieldCheck className="ml-1.5 h-5 w-5 text-green-500" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">Joined {listing.seller.joinedAt}</p>
                </div>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
