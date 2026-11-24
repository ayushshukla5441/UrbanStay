import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { cities } from '../../assets/assets';
import { 
  Building2, 
  MapPin, 
  Star, 
  Plus, 
  Eye, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon,
  X,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_HOTEL_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

const formatHotelAddress = (address) => {
  if (typeof address === "string") {
    return address.trim() || "Address Not Provided";
  }
  if (!address || typeof address !== "object") {
    return "Address Not Provided";
  }

  return [
    address.street,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ") || "Address Not Provided";
};

const getAmenityLabels = (amenities) => {
  if (Array.isArray(amenities)) {
    return amenities.filter((amenity) => typeof amenity === "string" && amenity.trim());
  }
  if (!amenities || typeof amenities !== "object") {
    return [];
  }

  return Object.entries(amenities)
    .filter(([, included]) => Boolean(included))
    .map(([key]) =>
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letter) => letter.toUpperCase())
    );
};

const AllHotel = () => {
  const { axios, deleteHotel } = useContext(AppContext);
  const [ownerHotels, setOwnerHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const fetchOwnerHotels = useCallback(async () => {
    try {
      setHotelsLoading(true);
      const { data } = await axios.get("/api/hotel/owner-hotels");
      if (data.success) {
        setOwnerHotels(data.hotels || []);
      }
    } catch (error) {
      console.error("Error fetching owner hotels:", error);
      setOwnerHotels([]);
    } finally {
      setHotelsLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    fetchOwnerHotels();
  }, [fetchOwnerHotels]);

  const handleImageError = (e, fallbackSrc = DEFAULT_HOTEL_IMAGE) => {
    e.target.onerror = null;
    e.target.src = fallbackSrc;
  };

  const filteredHotels = ownerHotels.filter((hotel) => {
    const hotelName = hotel?.name || '';
    const ownerName = hotel?.ownerName || '';
    const address = formatHotelAddress(hotel?.address);

    const matchesName = hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = selectedCity === '' || 
                        address.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesName && matchesCity;
  });

  const handleDeleteHotel = (e, hotelId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      if (typeof deleteHotel === 'function') {
        deleteHotel(hotelId);
      }
      setOwnerHotels((current) =>
        current.filter((hotel) => (hotel._id || hotel.id) !== hotelId)
      );
      if (selectedHotel && (selectedHotel._id === hotelId || selectedHotel.id === hotelId)) {
        setSelectedHotel(null);
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-violet-600 w-7 h-7" /> My Registered Hotels
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your hotel listings, view details, search and filter your properties.
          </p>
        </div>

        <Link
          to="/owner/register-hotel"
          className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:bg-violet-700 transition duration-200 text-sm"
        >
          <Plus size={18} /> Add New Hotel
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by hotel name or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none text-gray-700 cursor-pointer"
            >
              <option value="">All Locations</option>
              {(cities || []).map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCity) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-violet-600 font-medium hover:underline self-start sm:self-center cursor-pointer"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <TableIcon size={15} /> Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={15} /> Cards
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {hotelsLoading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-sm text-gray-500">
          Loading your hotels...
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Hotels Found</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">Try resetting your search query or location filter.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-medium bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Hotel Info</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Owner & Contact</th>
                  <th className="p-4">Price / Night</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredHotels.map((hotel) => (
                  <tr key={hotel._id || hotel.id} className="hover:bg-violet-50/50 transition group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={hotel.image || DEFAULT_HOTEL_IMAGE} 
                          alt={hotel.name || 'Hotel'} 
                          onError={(e) => handleImageError(e)}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0 bg-gray-100" 
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm group-hover:text-violet-600 transition">
                            {hotel.name}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {getAmenityLabels(hotel.amenities).slice(0, 2).map((a, i) => (
                              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                        <span className="text-gray-600 line-clamp-2">{formatHotelAddress(hotel.address)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-gray-900">{hotel.ownerName || 'N/A'}</p>
                        <p className="text-gray-400 text-[11px]">{hotel.contactNumber || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-violet-600 text-sm">
                        ₹{hotel.pricePerNight || hotel.price || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg w-fit font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{hotel.rating || '4.5'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedHotel(hotel);
                            setSelectedImage(hotel.image || DEFAULT_HOTEL_IMAGE);
                          }}
                          className="inline-flex items-center gap-1 bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                        >
                          <Eye size={14} /> Details
                        </button>
                        {deleteHotel && (
                          <button
                            onClick={(e) => handleDeleteHotel(e, hotel._id || hotel.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Hotel"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel._id || hotel.id}
              onClick={() => {
                setSelectedHotel(hotel);
                setSelectedImage(hotel.image || DEFAULT_HOTEL_IMAGE);
              }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={hotel.image || DEFAULT_HOTEL_IMAGE}
                    alt={hotel.name || 'Hotel'}
                    onError={(e) => handleImageError(e)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{hotel.rating || '4.5'}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-violet-600/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold">
                    ₹{hotel.pricePerNight || hotel.price || 0} / night
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-600 transition">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-start gap-1.5 mt-2 line-clamp-2">
                    <MapPin className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <span>{formatHotelAddress(hotel.address)}</span>
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-violet-600 font-semibold group-hover:bg-violet-50 transition">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> View Details</span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Details */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="relative h-64 w-full bg-gray-100">
              <img
                src={selectedImage || selectedHotel.image || DEFAULT_HOTEL_IMAGE}
                alt={selectedHotel.name || 'Hotel'}
                onError={(e) => handleImageError(e)}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedHotel(null)}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-700 hover:bg-white transition shadow-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedHotel.name}</h2>
              <p className="text-xs text-gray-600">{selectedHotel.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllHotel;