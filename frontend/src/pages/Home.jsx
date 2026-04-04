import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Loader, PackageOpen, ChevronDown, ChevronUp, MapPin, Building2 } from 'lucide-react';
import axios from 'axios';
import ListingCard from '../components/ListingCard';
import BACKEND from '../config';

// Demo/Dummy listings shown as filler when DB is empty or always shown after real ones
const dummyListings = [
  { id: 1, isDummy: true, title: 'Calculus Textbook 9th Edition', price: 45, category: 'Books', city: 'Mumbai', area: 'Andheri West', image: "/pic/pic1/cal.jpg" },
  { id: 2, isDummy: true, title: 'Scientific Calculator fx-991EX', price: 15, category: 'Electronics', city: 'Mumbai', area: 'Bandra', image: "/pic/pic1/sc.jpg" },
  { id: 3, isDummy: true, title: 'Drafting Table with Angle', price: 80, category: 'Furniture', city: 'Pune', area: 'Shivaji Nagar', image: "/pic/pic1/dt.jpg" },
  { id: 4, isDummy: true, title: 'MacBook Air M1 2020', price: 850, category: 'Electronics', city: 'Pune', area: 'Kothrud', image: "/pic/pic1/mam1.webp" },
  { id: 5, isDummy: true, title: 'Engineering Drawing Kit', price: 25, category: 'Stationery', city: 'Mumbai', area: 'Dadar', image: "/pic/pic1/dk.jpg" },
  { id: 6, isDummy: true, title: 'Mini Fridge for Dorm Room', price: 120, category: 'Appliances', city: 'Delhi', area: 'North Campus', image: "/pic/pic1/mf.jpg" },
  { id: 7, isDummy: true, title: "Anatomy Atlas Gray's 42nd Ed", price: 65, category: 'Books', city: 'Delhi', area: 'South Extension', image: "/pic/pic1/aa.jpg" },
  { id: 8, isDummy: true, title: 'Geometry Box Set Premium', price: 12, category: 'Stationery', city: 'Bangalore', area: 'Jayanagar', image: "/pic/pic1/gb.jpg" },
  { id: 9, isDummy: true, title: 'Stethoscope Littmann Classic', price: 35, category: 'Medical', city: 'Chennai', area: 'Adyar', image: '/pic/pic1/9.jpg' },
  { id: 10, isDummy: true, title: 'Physics Textbook HC Verma', price: 28, category: 'Books', city: 'Kolkata', area: 'Salt Lake', image: '/pic/pic1/10.jpg' },
  { id: 11, isDummy: true, title: 'Planimeter Digital Model', price: 95, category: 'Surveying', city: 'Pune', area: 'Hinjewadi', image: '/pic/pic1/11.jpg' },
  { id: 12, isDummy: true, title: 'BP Apparatus Digital', price: 22, category: 'Medical', city: 'Mumbai', area: 'Borivali', image: '/pic/pic1/12.jpg' },
  { id: 13, isDummy: true, title: 'AutoCAD Student License', price: 180, category: 'Software', city: 'Delhi', area: 'Rohini', image: '/pic/pic1/13.webp' },
  { id: 14, isDummy: true, title: 'Organic Chemistry Morrison', price: 52, category: 'Books', city: 'Hyderabad', area: 'Kukatpally', image: '/pic/pic1/14.jpg' },
  { id: 15, isDummy: true, title: 'Theodolite Survey Instrument', price: 450, category: 'Surveying', city: 'Bhopal', area: 'MP Nagar', image: '/pic/pic1/15.jpg' },
  { id: 16, isDummy: true, title: 'Study Desk Lamp LED', price: 18, category: 'Electronics', city: 'Bangalore', area: 'Whitefield', image: '/pic/pic1/16.webp' },
  { id: 17, isDummy: true, title: 'MCQ Book AIEEE/JEE', price: 22, category: 'Books', city: 'Jaipur', area: 'Malviya Nagar', image: '/pic/pic1/17.webp' },
  { id: 18, isDummy: true, title: 'Surgical Kit Student Grade', price: 40, category: 'Medical', city: 'Chennai', area: 'T Nagar', image: '/pic/pic1/18.jpg' },
  { id: 19, isDummy: true, title: 'Graphing Calculator TI-84', price: 110, category: 'Electronics', city: 'Mumbai', area: 'Thane', image: '/pic/pic1/19.jpg' },
  { id: 20, isDummy: true, title: 'Pathology Robbins 10th Ed', price: 75, category: 'Books', city: 'Delhi', area: 'Lajpat Nagar', image: '/pic/pic1/20.jpg' },
  { id: 21, isDummy: true, title: 'Total Station Mini', price: 320, category: 'Surveying', city: 'Nagpur', area: 'Sitabuldi', image: '/pic/pic1/21.avif' },
  { id: 22, isDummy: true, title: 'Whiteboard 4x3 Feet', price: 35, category: 'Furniture', city: 'Indore', area: 'Vijay Nagar', image: '/pic/pic1/22.webp' },
  { id: 23, isDummy: true, title: 'NEET Guide MTG 2026', price: 38, category: 'Books', city: 'Lucknow', area: 'Gomti Nagar', image: '/pic/pic1/23.jpg' },
  { id: 24, isDummy: true, title: 'Glucometer Accu-Chek', price: 28, category: 'Medical', city: 'Pune', area: 'Camp', image: '/pic/pic1/24.webp' },
  { id: 25, isDummy: true, title: 'Strength of Materials Book', price: 32, category: 'Books', city: 'Ahmedabad', area: 'Navrangpura', image: '/pic/pic1/25.webp' },
  { id: 26, isDummy: true, title: 'Laboratory Coat White', price: 18, category: 'Apparel', city: 'Coimbatore', area: 'RS Puram', image: '/pic/pic1/26.jpg' },
  { id: 27, isDummy: true, title: 'Digital Vernier Caliper', price: 42, category: 'Tools', city: 'Bhopal', area: 'Arera Colony', image: '/pic/pic1/27.jpg' },
  { id: 28, isDummy: true, title: 'Microscope Student Grade', price: 85, category: 'Medical', city: 'Kanpur', area: 'Govind Nagar', image: '/pic/pic1/28.jpg' },
  { id: 29, isDummy: true, title: 'Engineering Mathematics B.S.', price: 48, category: 'Books', city: 'Chandigarh', area: 'Sector 17', image: '/pic/pic1/29.jpg' },
  { id: 30, isDummy: true, title: 'Otoscope Diagnostic Set', price: 55, category: 'Medical', city: 'Surat', area: 'Adajan', image: '/pic/pic1/30.jpg' },
];

// Categories array
const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Stationery', 'Appliances', 'Medical', 'Surveying', 'Software', 'Apparel', 'Tools'];

const placeholderTexts = [
  "Search 'MacBook Air M1'...",
  "Search 'HC Verma Physics'...",
  "Search 'Scientific Calculator'...",
  "Search 'Drafting Table'...",
  "Search 'Lab Coat'..."
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCity, setActiveCity] = useState('All');
  const [activeCampus, setActiveCampus] = useState('All');
  const [realListings, setRealListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchListings = async () => {
    try {
      const { data } = await axios.get(`${BACKEND}/api/listings`);
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

    // Rotate placeholder text every 2 seconds
    const placeholderInterval = setInterval(() => {
      setPlaceholderIdx((prevIndex) => (prevIndex + 1) % placeholderTexts.length);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(placeholderInterval);
    };
  }, []);

  // Combine: real listings first, then dummy ones
  const allListings = [...realListings, ...dummyListings];

  // Helper to normalize strings for display (Title Case)
  const formatName = (str) => {
    if (!str) return '';
    return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const uniqueCities = ['All', ...new Set(allListings.map(item => formatName(item.city)).filter(Boolean))];
  const availableCampuses = activeCity === 'All' 
    ? allListings.map(item => formatName(item.area)) 
    : allListings.filter(item => formatName(item.city) === activeCity).map(item => formatName(item.area));
  const uniqueCampuses = ['All', ...new Set(availableCampuses.filter(Boolean))];

  // User Location (Fixed)
  const userCity = "Bhopal";
  const userArea = "MP Nagar";

  // Filter and rank logic
  const filteredListings = allListings
    .filter((listing) => {
      const matchesCategory = activeCategory === 'All' || listing.category === activeCategory;
      const matchesCity = activeCity === 'All' || formatName(listing.city) === activeCity;
      const matchesCampus = activeCampus === 'All' || formatName(listing.area) === activeCampus;
      
      const price = Number(listing.price) || 0;
      const matchesMinPrice = minPrice === '' || price >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice);
      
      const isFilterMatch = matchesCategory && matchesCity && matchesCampus && matchesMinPrice && matchesMaxPrice;

      if (!searchTerm) return isFilterMatch;

      const searchLower = searchTerm.toLowerCase().trim();
      const titleMatch = String(listing.title || "").toLowerCase().includes(searchLower) || false;
      const cityMatch = String(listing.city || "").toLowerCase().includes(searchLower) || false;
      const areaMatch = String(listing.area || "").toLowerCase().includes(searchLower) || false;
      const matchesSearch = titleMatch || cityMatch || areaMatch;
      
      return matchesSearch && isFilterMatch;
    })
    .map((listing) => {
      let score = 0;
      const listingCity = listing.city?.toLowerCase() || "";
      const listingArea = listing.area?.toLowerCase() || "";
      const searchLower = searchTerm.toLowerCase();

      // Higher score if the listing area matches the user area
      if (listingArea === userArea.toLowerCase()) score += 100;
      
      // Medium score if the listing city matches the user city
      if (listingCity === userCity.toLowerCase()) score += 50;

      // Additional score if the search term matches
      if (searchTerm) {
        const titleMatch = listing.title?.toLowerCase().includes(searchLower) || false;
        const cityMatch = listingCity.includes(searchLower) || false;
        const areaMatch = listingArea.includes(searchLower) || false;
        if (titleMatch || cityMatch || areaMatch) {
          score += 10;
        }
      }

      return { ...listing, rankingScore: score };
    })
    .sort((a, b) => b.rankingScore - a.rankingScore);

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

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-2 sm:gap-3">
          {/* Location Dropdowns */}
          <div className="flex flex-row gap-2 sm:gap-3 w-full md:w-auto shrink-0">
            <div className="relative flex-1 md:w-36 lg:w-48 text-left">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-9 sm:pl-10 pr-8 py-2.5 sm:py-3 border border-transparent rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white bg-white shadow-sm appearance-none cursor-pointer text-sm sm:text-base"
                value={activeCity}
                onChange={(e) => {
                  setActiveCity(e.target.value);
                  setActiveCampus('All'); // Reset campus when city changes
                }}
              >
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city === 'All' ? 'All Cities' : city}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="relative flex-1 md:w-36 lg:w-48 text-left">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-9 sm:pl-10 pr-8 py-2.5 sm:py-3 border border-transparent rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white bg-white shadow-sm appearance-none cursor-pointer text-sm sm:text-base"
                value={activeCampus}
                onChange={(e) => setActiveCampus(e.target.value)}
              >
                {uniqueCampuses.map(campus => (
                  <option key={campus} value={campus}>{campus === 'All' ? 'All Campuses' : campus}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Search Input & Button */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-transparent rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm sm:text-base bg-white shadow-sm transition-all duration-500"
              placeholder={placeholderTexts[placeholderIdx]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex shrink-0 w-full md:w-auto items-center justify-center px-6 py-2.5 sm:py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Filters & Grid Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 space-y-4 md:space-y-6">
          <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between font-bold text-gray-900 md:pointer-events-none focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg">Categories {activeCategory !== 'All' && <span className="md:hidden text-blue-600 text-xs ml-2 bg-blue-50 px-2 py-1 rounded-full">{activeCategory}</span>}</h2>
              </div>
              <div className="md:hidden text-gray-400">
                {isCategoryOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>
            <ul className={`mt-4 space-y-1.5 ${isCategoryOpen ? 'block' : 'hidden'} md:block transition-all`}>
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

          <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              className="w-full flex items-center justify-between font-bold text-gray-900 md:pointer-events-none focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg">Price Range</h2>
              </div>
              <div className="md:hidden text-gray-400">
                {isPriceOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>
            <div className={`mt-4 space-y-4 ${isPriceOpen ? 'block' : 'hidden'} md:block transition-all`}>
              <div className="flex gap-2 items-center">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
                <span className="text-gray-500">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
              </div>
              <button 
                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
              >
                Clear Price Filter
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
                onClick={() => { 
                  setSearchTerm(''); 
                  setActiveCategory('All'); 
                  setActiveCity('All'); 
                  setActiveCampus('All');
                  setMinPrice('');
                  setMaxPrice('');
                }}
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
