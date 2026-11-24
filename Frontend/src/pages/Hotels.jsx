import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from "../context/AppContext";
import { Star, MapPin } from 'lucide-react';

const DEFAULT_HOTEL_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&fit=crop';

const Hotels = () => {
  const { hotelData } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const visitHotelMessage = location.state?.visitHotelMessage;

  const displayHotels = hotelData || [];

  const handleImageError = (e, fallbackSrc = DEFAULT_HOTEL_IMAGE) => {
    e.target.onerror = null;
    e.target.src = fallbackSrc;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {visitHotelMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
          <p className="font-bold text-emerald-800">{visitHotelMessage}</p>
        </div>
      )}
      {/* Page Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Explore Hotels & Suites</h2>
        <p className="text-gray-500 text-sm mt-1">Select a hotel to view rooms, facilities, and premium amenities</p>
      </div>

      {/* Hotels Grid */}
      {displayHotels.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-base">No hotels found. Please add a hotel from the owner dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayHotels.map((hotel) => {
            const coverImage = hotel.image || hotel.images?.[0] || DEFAULT_HOTEL_IMAGE;
            const hotelId = hotel._id || hotel.id;

            return (
              <div
                key={hotelId}
                onClick={() => navigate(`/hotel/${hotelId}`)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Image & Rating Badge */}
                  <div className="relative overflow-hidden bg-gray-100 h-52">
                    <img
                      src={coverImage}
                      alt={hotel.name}
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-gray-800 shadow flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{hotel.rating || 4.5}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1.5 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{hotel.address || 'Address Not Provided'}</span>
                    </p>

                    {/* Amenities Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {(hotel.amenities || []).slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                      {(hotel.amenities || []).length > 3 && (
                        <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          +{(hotel.amenities || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & Action Footer */}
                <div className="p-5 pt-0 flex justify-between items-end border-t border-gray-50 mt-4">
                  <div className="pt-3">
                    <span className="text-xs text-gray-400">Starting from</span>
                    <p className="text-xl font-extrabold text-gray-900">
                      ₹{hotel.pricePerNight || hotel.price || 0} <span className="text-xs font-normal text-gray-500">/ night</span>
                    </p>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md group-hover:opacity-90 transition cursor-pointer">
                    View Rooms & Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Hotels;