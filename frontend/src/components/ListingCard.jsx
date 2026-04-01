import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative overflow-hidden">
          <img 
            src={listing.image} 
            alt={listing.title} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm">
            {listing.category}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">{listing.title}</h3>
            <span className="text-lg font-bold text-blue-600">${listing.price}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <span className="truncate">{listing.city}, {listing.area}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
