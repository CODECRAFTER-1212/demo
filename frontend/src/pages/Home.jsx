import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Loader, PackageOpen } from 'lucide-react';
import axios from 'axios';
import ListingCard from '../components/ListingCard';

// Demo/Dummy listings shown as filler when DB is empty or always shown after real ones
const dummyListings = [
  { id: 1, isDummy: true, title: 'Calculus Textbook 9th Edition', price: 45, category: 'Books', city: 'Mumbai', area: 'Andheri West', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800' },
  { id: 2, isDummy: true, title: 'Scientific Calculator fx-991EX', price: 15, category: 'Electronics', city: 'Mumbai', area: 'Bandra', image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&q=80&w=800' },
  { id: 3, isDummy: true, title: 'Drafting Table with Angle', price: 80, category: 'Furniture', city: 'Pune', area: 'Shivaji Nagar', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800' },
  { id: 4, isDummy: true, title: 'MacBook Air M1 2020', price: 850, category: 'Electronics', city: 'Pune', area: 'Kothrud', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800' },
  { id: 5, isDummy: true, title: 'Engineering Drawing Kit', price: 25, category: 'Stationery', city: 'Mumbai', area: 'Dadar', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800' },
  { id: 6, isDummy: true, title: 'Mini Fridge for Dorm Room', price: 120, category: 'Appliances', city: 'Delhi', area: 'North Campus', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=800' },
  { id: 7, isDummy: true, title: "Anatomy Atlas Gray's 42nd Ed", price: 65, category: 'Books', city: 'Delhi', area: 'South Extension', image: 'https://images.unsplash.com/photo-1581637685570-2f9a07b5d5d9?auto=format&fit=crop&q=80&w=800' },
  { id: 8, isDummy: true, title: 'Geometry Box Set Premium', price: 12, category: 'Stationery', city: 'Bangalore', area: 'Jayanagar', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800' },
  { id: 9, isDummy: true, title: 'Stethoscope Littmann Classic', price: 35, category: 'Medical', city: 'Chennai', area: 'Adyar', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800' },
  { id: 10, isDummy: true, title: 'Physics Textbook HC Verma', price: 28, category: 'Books', city: 'Kolkata', area: 'Salt Lake', image: 'https://images.unsplash.com/photo-1526042211458-1a5ddbc18d62?auto=format&fit=crop&q=80&w=800' },
  { id: 11, isDummy: true, title: 'Planimeter Digital Model', price: 95, category: 'Surveying', city: 'Pune', area: 'Hinjewadi', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800' },
  { id: 12, isDummy: true, title: 'BP Apparatus Digital', price: 22, category: 'Medical', city: 'Mumbai', area: 'Borivali', image: 'https://images.unsplash.com/photo-1582774009625-cea822a594eb?auto=format&fit=crop&q=80&w=800' },
  { id: 13, isDummy: true, title: 'AutoCAD Student License', price: 180, category: 'Software', city: 'Delhi', area: 'Rohini', image: 'https://images.unsplash.com/photo-1517433456452-d31df22ac7a5?auto=format&fit=crop&q=80&w=800' },
  { id: 14, isDummy: true, title: 'Organic Chemistry Morrison', price: 52, category: 'Books', city: 'Hyderabad', area: 'Kukatpally', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800' },
  { id: 15, isDummy: true, title: 'Theodolite Survey Instrument', price: 450, category: 'Surveying', city: 'Bhopal', area: 'MP Nagar', image: 'https://images.unsplash.com/photo-1558618047-3c8c76fddfb8?auto=format&fit=crop&q=80&w=800' },
  { id: 16, isDummy: true, title: 'Study Desk Lamp LED', price: 18, category: 'Electronics', city: 'Bangalore', area: 'Whitefield', image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80&w=800' },
  { id: 17, isDummy: true, title: 'MCQ Book AIEEE/JEE', price: 22, category: 'Books', city: 'Jaipur', area: 'Malviya Nagar', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800' },
  { id: 18, isDummy: true, title: 'Surgical Kit Student Grade', price: 40, category: 'Medical', city: 'Chennai', area: 'T Nagar', image: 'https://images.unsplash.com/photo-1582731489-c549de2f90c8?auto=format&fit=crop&q=80&w=800' },
  { id: 19, isDummy: true, title: 'Graphing Calculator TI-84', price: 110, category: 'Electronics', city: 'Mumbai', area: 'Thane', image: 'https://images.unsplash.com/photo-1610945262585-0f49f54e7aa8?auto=format&fit=crop&q=80&w=800' },
  { id: 20, isDummy: true, title: 'Pathology Robbins 10th Ed', price: 75, category: 'Books', city: 'Delhi', area: 'Lajpat Nagar', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
  { id: 21, isDummy: true, title: 'Total Station Mini', price: 320, category: 'Surveying', city: 'Nagpur', area: 'Sitabuldi', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=800' },
  { id: 22, isDummy: true, title: 'Whiteboard 4x3 Feet', price: 35, category: 'Furniture', city: 'Indore', area: 'Vijay Nagar', image: 'https://images.unsplash.com/photo-1588064627675-25d5168b12f5?auto=format&fit=crop&q=80&w=800' },
  { id: 23, isDummy: true, title: 'NEET Guide MTG 2026', price: 38, category: 'Books', city: 'Lucknow', area: 'Gomti Nagar', image: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?auto=format&fit=crop&q=80&w=800' },
  { id: 24, isDummy: true, title: 'Glucometer Accu-Chek', price: 28, category: 'Medical', city: 'Pune', area: 'Camp', image: 'https://images.unsplash.com/photo-1603353853248-ce1c3e95922e?auto=format&fit=crop&q=80&w=800' },
  { id: 25, isDummy: true, title: 'Strength of Materials Book', price: 32, category: 'Books', city: 'Ahmedabad', area: 'Navrangpura', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800' },
  { id: 26, isDummy: true, title: 'Laboratory Coat White', price: 18, category: 'Apparel', city: 'Coimbatore', area: 'RS Puram', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800' },
  { id: 27, isDummy: true, title: 'Digital Vernier Caliper', price: 42, category: 'Tools', city: 'Bhopal', area: 'Arera Colony', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800' },
  { id: 28, isDummy: true, title: 'Microscope Student Grade', price: 85, category: 'Medical', city: 'Kanpur', area: 'Govind Nagar', image: 'https://images.unsplash.com/photo-1547658719-da2b848c1a4f?auto=format&fit=crop&q=80&w=800' },
  { id: 29, isDummy: true, title: 'Engineering Mathematics B.S.', price: 48, category: 'Books', city: 'Chandigarh', area: 'Sector 17', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800' },
  { id: 30, isDummy: true, title: 'Otoscope Diagnostic Set', price: 55, category: 'Medical', city: 'Surat', area: 'Adajan', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800' },
];

const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Stationery', 'Appliances', 'Medical', 'Surveying', 'Software', 'Apparel', 'Tools'];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [realListings, setRealListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/listings');
      setRealListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings', error);
      setRealListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();

    // Auto-poll every 15 seconds for new listings
    const interval = setInterval(() => {
      fetchListings();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Combine: real listings first, then dummy ones
  const allListings = [...realListings, ...dummyListings];

  // Filter logic
  const filteredListings = allListings.filter((listing) => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || listing.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Hero / Search Section */}
      <div className="bg-blue-600 rounded-2xl p-8 sm:p-12 text-center text-white shadow-lg">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
          Buy &amp; Sell on Campus
        </h1>
        <p className="text-blue-100 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
          The ultimate marketplace for students. Find cheap textbooks, electronics, and dorm essentials.
        </p>

        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm bg-white shadow-sm transition-shadow"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Filters & Grid Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
              <Filter className="h-5 w-5" />
              <h2>Categories</h2>
            </div>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeCategory === cat
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
              <SlidersHorizontal className="h-5 w-5" />
              <h2>Price Range</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                <span className="text-gray-500">-</span>
                <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {activeCategory === 'All' ? 'Recent Listings' : `${activeCategory} Listings`}
            </h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
                Live
              </span>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {filteredListings.length} results
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20 text-blue-600">
              <Loader className="animate-spin h-8 w-8" />
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing._id || listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <PackageOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
