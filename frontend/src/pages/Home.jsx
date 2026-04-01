import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ListingCard from '../components/ListingCard';

// Dummy data
const dummyListings = [
  {
    id: 1,
    title: 'Calculus Textbook 9th Edition',
    price: 45,
    category: 'Books',
    city: 'Mumbai',
    area: 'Andheri West',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    title: 'Scientific Calculator fx-991EX',
    price: 15,
    category: 'Electronics',
    city: 'Mumbai',
    area: 'Bandra',
    image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    title: 'Drafting Table',
    price: 80,
    category: 'Furniture',
    city: 'Pune',
    area: 'Shivaji Nagar',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    title: 'MacBook Air M1',
    price: 850,
    category: 'Electronics',
    city: 'Pune',
    area: 'Kothrud',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 5,
    title: 'Engineering Drawing Kit',
    price: 25,
    category: 'Stationery',
    city: 'Mumbai',
    area: 'Dadar',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 6,
    title: 'Mini Fridge for Dorm',
    price: 120,
    category: 'Appliances',
    city: 'Delhi',
    area: 'North Campus',
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=800'
  }
];

const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Stationery', 'Appliances'];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter logic
  const filteredListings = dummyListings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || listing.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Hero / Search Section */}
      <div className="bg-blue-600 rounded-2xl p-8 sm:p-12 text-center text-white shadow-lg">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">
          Buy & Sell on Campus
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
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeCategory === cat 
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
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              {filteredListings.length} results
            </span>
          </div>

          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
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
