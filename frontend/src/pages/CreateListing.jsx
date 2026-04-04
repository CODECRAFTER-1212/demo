import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, ArrowLeft, IndianRupee, Tag, MapPin, Type, FileText, Globe, Info } from 'lucide-react';
import axios from 'axios';
import BACKEND from '../config';

export default function CreateListing() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    city: '',
    area: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  // Check profile completion on mount
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
        if (!token) {
          navigate('/login');
          return;
        }
        const { data } = await axios.get(`${BACKEND}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.percentage < 70) {
          navigate('/profile-completion');
        }
      } catch (err) {
        navigate('/login');
      }
    };
    checkProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('city', formData.city);
      data.append('area', formData.area);

      // Append all selected files under the key 'images', which is what multer expects
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          data.append('images', selectedFiles[i]);
        }
      }

      // Get token from local storage
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';

      await axios.post(`${BACKEND}/api/listings`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setFormData({ title: '', description: '', price: '', category: '', city: '', area: '' });
      setSelectedFiles([]);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Error occurred while creating listing.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 mb-20 px-4 sm:px-6 lg:px-8">
      {/* Top Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-6 transition-all group"
      >
        <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <span>Go Back</span>
      </button>

      <div className="bg-white shadow-2xl shadow-blue-500/5 border border-gray-100 rounded-[32px] overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-3">
              <span className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Tag className="h-7 w-7" />
              </span>
              Sell Something Great
            </h1>
            <p className="mt-4 text-blue-100 font-medium max-w-lg">
              Fill out the details below so buyers can find exactly what they're looking for.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {isSuccess && (
            <div className="mb-10 rounded-2xl bg-emerald-50 p-5 border border-emerald-100 flex items-center shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-emerald-500 p-2 rounded-full mr-4">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Success!</h4>
                <p className="text-emerald-700 text-xs">Your listing has been submitted for review!</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-10 rounded-2xl bg-rose-50 p-5 border border-rose-100 flex items-center shadow-sm">
              <div className="bg-rose-500 p-2 rounded-full mr-4">
                <Info className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold text-rose-900">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-8">
            <div className="sm:col-span-2 group">
              <label htmlFor="title" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                <Type className="h-4 w-4" />
                Listing Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="block w-full rounded-2xl border-gray-200 px-5 py-4 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm border transition-all placeholder-gray-400 font-medium"
                placeholder="e.g., Apple MacBook Pro M2"
              />
            </div>

            <div className="sm:col-span-1 group">
              <label htmlFor="price" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                <IndianRupee className="h-4 w-4" />
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm font-bold">₹</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full rounded-2xl pl-10 pr-5 border-gray-200 py-4 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm border transition-all placeholder-gray-400 font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="sm:col-span-1 group">
              <label htmlFor="category" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                <Globe className="h-4 w-4" />
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="block w-full rounded-2xl border-gray-200 px-5 py-4 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm border transition-all font-medium"
              >
                <option value="">Select a category</option>
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Stationery">Stationery</option>
                <option value="Appliances">Appliances</option>
              </select>
            </div>

            <div className="sm:col-span-1 group">
              <label htmlFor="city" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                <MapPin className="h-4 w-4" />
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="block w-full rounded-2xl border-gray-200 px-5 py-4 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm border transition-all placeholder-gray-400 font-medium"
                placeholder="e.g., Mumbai"
              />
            </div>

            <div className="sm:col-span-1 group">
              <label htmlFor="area" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                <MapPin className="h-4 w-4" />
                Area / Campus
              </label>
              <input
                type="text"
                name="area"
                id="area"
                required
                value={formData.area}
                onChange={handleChange}
                className="block w-full rounded-2xl border-gray-200 px-5 py-4 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm border transition-all placeholder-gray-400 font-medium"
                placeholder="e.g., IIT Campus"
              />
            </div>

            <div className="sm:col-span-2 group">
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                <FileText className="h-4 w-4" />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-2xl border-gray-200 px-5 py-4 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm border transition-all placeholder-gray-400 font-medium resize-none"
                placeholder="Tell us more about the item's condition, age, usage frequency..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <UploadCloud className="h-4 w-4" />
                Images
              </label>
              <div className="mt-1 flex justify-center px-10 pt-10 pb-12 border-2 border-dashed border-blue-100 rounded-[28px] hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                <div className="space-y-4 text-center">
                  <div className="bg-blue-100 p-4 rounded-3xl w-fit mx-auto group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                    <UploadCloud className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex text-base text-gray-700 justify-center font-bold">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md text-blue-600 hover:text-indigo-600 focus-within:outline-none transition-colors">
                        <span>Click to upload</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {selectedFiles.length > 0 ? (
                        <span className="text-indigo-600 font-black tracking-wide bg-indigo-50 px-3 py-1 rounded-full uppercase text-[10px]">
                          {selectedFiles.length} files selected
                        </span>
                      ) : 'High quality images get more buyers'}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                    PNG, JPG, WEBP • Max 10MB each
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 flex items-center justify-between gap-4 border-t border-gray-100">
            <Link
              to="/"
              className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
            >
              Cancel & Exit
            </Link>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`min-w-[180px] flex justify-center py-4 px-8 border border-transparent shadow-xl shadow-blue-500/20 text-sm font-black rounded-2xl text-white ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'} focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all active:scale-95`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : 'Post Listing Now'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
