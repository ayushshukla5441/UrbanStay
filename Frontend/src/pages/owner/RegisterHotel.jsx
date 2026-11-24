import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const RegisterHotel = ({ onHotelAdded, onCancel }) => {
  const navigate = useNavigate();
  const { axios } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: '',
    propertyType: 'Hotel',
    starRating: 3,
    chainName: '',
    ownerName: '',
    contactPhone: '',
    alternatePhone: '',
    email: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    latitude: '',
    longitude: '',
    basePricePerNight: '',
    description: '',
    houseRules: 'Check-in: 12:00 PM - 10:00 PM, Check-out: 10:00 AM. Pets are not allowed. Smoking permitted in designated areas only.',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in. Non-refundable after that.',
    taxPercentage: '12'
  });

  const [rooms, setRooms] = useState([
    {
      roomType: '',
      roomBedType: 'Queen Size Bed',
      pricePerNight: '',
      discountPrice: '',
      capacity: '2',
      maxAdults: '2',
      maxChildren: '1',
      totalRooms: '1',
      size: '',
      roomAmenities: {
        ac: true,
        tv: true,
        wifi: true,
        attachedBathroom: true,
        balcony: false,
        roomService: true,
        miniBar: false,
        safeBox: false,
      },
      description: '',
      images: ['']
    }
  ]);

  const [amenities, setAmenities] = useState({
    wifi: false,
    pool: false,
    beachAccess: false,
    fireplace: false,
    businessCenter: false,
    historicTours: false,
    concierge: false,
    parking: false,
    restaurant: false,
    spa: false,
    gym: false,
    roomService: false,
    airportShuttle: false,
    petFriendly: false,
    twentyFourHourFrontDesk: true,
    laundry: false,
    bar: false,
    lift: false,
  });

  const [images, setImages] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);

  const propertyTypes = ['Hotel', 'Resort', 'Villa', 'Apartment', 'Guest House', 'Homestay', 'Hostel'];
  const bedTypes = ['Single Bed', 'Double Bed', 'Queen Size Bed', 'King Size Bed', 'Twin Beds', 'Bunk Bed'];

  const availableAmenities = [
    { key: 'wifi', label: 'Free WiFi' },
    { key: 'pool', label: 'Swimming Pool' },
    { key: 'spa', label: 'Spa & Wellness' },
    { key: 'gym', label: 'Fitness Center' },
    { key: 'parking', label: 'Free Parking' },
    { key: 'restaurant', label: 'Restaurant & Dining' },
    { key: 'bar', label: 'Bar / Lounge' },
    { key: 'roomService', label: 'Room Service' },
    { key: 'twentyFourHourFrontDesk', label: '24-Hour Front Desk' },
    { key: 'airportShuttle', label: 'Airport Shuttle' },
    { key: 'beachAccess', label: 'Beach Access' },
    { key: 'petFriendly', label: 'Pet Friendly' },
    { key: 'laundry', label: 'Laundry Service' },
    { key: 'lift', label: 'Elevator / Lift' },
    { key: 'businessCenter', label: 'Business Center' },
    { key: 'concierge', label: 'Concierge' },
    { key: 'fireplace', label: 'Fireplace' },
    { key: 'historicTours', label: 'Historic Tours' },
  ];

  const availableRoomAmenities = [
    { key: 'ac', label: 'Air Conditioning' },
    { key: 'tv', label: 'Flat-Screen TV' },
    { key: 'wifi', label: 'Room WiFi' },
    { key: 'attachedBathroom', label: 'Attached Bathroom' },
    { key: 'balcony', label: 'Private Balcony' },
    { key: 'roomService', label: 'Room Service' },
    { key: 'miniBar', label: 'Mini Bar' },
    { key: 'safeBox', label: 'Electronic Safe' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (key) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      {
        roomType: '',
        roomBedType: 'Queen Size Bed',
        pricePerNight: '',
        discountPrice: '',
        capacity: '2',
        maxAdults: '2',
        maxChildren: '1',
        totalRooms: '1',
        size: '',
        roomAmenities: { ac: true, tv: true, wifi: true, attachedBathroom: true, balcony: false, roomService: true, miniBar: false, safeBox: false },
        description: '',
        images: ['']
      }
    ]);
  };

  const handleRoomChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRooms = [...rooms];
    updatedRooms[index][name] = value;
    setRooms(updatedRooms);
  };

  const handleRoomImageChange = (roomIndex, imgIndex, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex].images[imgIndex] = value;
    setRooms(updatedRooms);
  };

  const addRoomImageField = (roomIndex) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex].images.push('');
    setRooms(updatedRooms);
  };

  const removeRoomImageField = (roomIndex, imgIndex) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex].images = updatedRooms[roomIndex].images.filter((_, i) => i !== imgIndex);
    setRooms(updatedRooms);
  };

  const handleRoomAmenityToggle = (roomIndex, amenityKey) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex].roomAmenities[amenityKey] = !updatedRooms[roomIndex].roomAmenities[amenityKey];
    setRooms(updatedRooms);
  };

  const handleRemoveRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...images];
    updatedImages[index] = value;
    setImages(updatedImages);
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validImages = images.filter((img) => img && img.trim() !== '');

      const hotelPayload = {
        name: formData.name,
        propertyType: formData.propertyType,
        starRating: Number(formData.starRating) || 3,
        chainName: formData.chainName,
        pricePerNight: Number(formData.basePricePerNight) || 0,
        ownerName: formData.ownerName,
        contactPhone: formData.contactPhone,
        alternatePhone: formData.alternatePhone,
        email: formData.email,
        address: {
          street: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
          coordinates: {
            lat: Number(formData.latitude) || 0,
            lng: Number(formData.longitude) || 0,
          }
        },
        amenities: amenities,
        images: validImages,
        description: formData.description,
        policies: {
          houseRules: formData.houseRules,
          cancellationPolicy: formData.cancellationPolicy,
          taxPercentage: Number(formData.taxPercentage) || 12
        }
      };

      // Added withCredentials: true to send authentication cookies properly
      const hotelRes = await axios.post('/api/hotel/add', hotelPayload, { withCredentials: true });

      if (hotelRes.data.success) {
        const createdHotelId = hotelRes.data.hotel._id;

        if (rooms && rooms.length > 0) {
          for (const room of rooms) {
            const roomPayload = {
              roomType: room.roomType,
              roomBedType: room.roomBedType,
              pricePerNight: Number(room.pricePerNight) || 0,
              discountPrice: Number(room.discountPrice) || 0,
              capacity: Number(room.capacity) || 2,
              maxAdults: Number(room.maxAdults) || 2,
              maxChildren: Number(room.maxChildren) || 1,
              totalRooms: Number(room.totalRooms) || 1,
              size: room.size,
              roomAmenities: room.roomAmenities,
              description: room.description,
              images: (room.images || []).filter((img) => img && img.trim() !== ''),
            };

            await axios.post(`/api/room/add/${createdHotelId}`, roomPayload, { withCredentials: true });
          }
        }

        toast.success(hotelRes.data.message || 'Property and Rooms registered successfully!');
        if (onHotelAdded) onHotelAdded(hotelRes.data.hotel);
        navigate('/owner/all-hotels');
      } else {
        toast.error(hotelRes.data.message || 'Failed to register property');
      }
    } catch (error) {
      console.error('Error registering property:', error);
      toast.error(error.response?.data?.message || 'Something went wrong while registering the property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100 my-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">List Your Property (Booking.com Style)</h2>
          <p className="text-sm text-gray-500">Comprehensive property setup with rooms, pricing, policies, and amenities.</p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/owner/all-hotels')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            View All Properties
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Property Basics */}
        <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>🏨</span> 1. Property Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Grand Palace & Resort"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Star Rating *</label>
            <div className="flex items-center gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFormData((prev) => ({ ...prev, starRating: star }))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                    Number(formData.starRating) === star
                      ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs ring-2 ring-amber-400/20'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-amber-500">{'★'.repeat(star)}</span>
                  <span>{star} Star</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Chain Name (Optional)</label>
              <input
                type="text"
                name="chainName"
                placeholder="e.g. Taj Group, Marriott, Independent"
                value={formData.chainName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Base Price / Night (₹) *</label>
              <input
                type="number"
                name="basePricePerNight"
                required
                placeholder="e.g. 2999"
                value={formData.basePricePerNight}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Owner & Contact */}
        <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>👤</span> 2. Owner & Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner / Manager Name *</label>
              <input
                type="text"
                name="ownerName"
                required
                placeholder="e.g. Ayush Shukla"
                value={formData.ownerName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                name="contactPhone"
                required
                placeholder="+91 9876543210"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
              <input
                type="tel"
                name="alternatePhone"
                placeholder="+91 8724157890"
                value={formData.alternatePhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. hotel@grandpalace.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full md:w-1/2 px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>
        </div>

        {/* 3. Location & Address */}
        <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>📍</span> 3. Location & Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input
                type="text"
                name="street"
                required
                placeholder="123 Royal Street, Near City Center"
                value={formData.street}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Landmark</label>
              <input
                type="text"
                name="landmark"
                placeholder="e.g. Opposite Central Railway Station"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="Gorakhpur"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                name="state"
                required
                placeholder="Uttar Pradesh"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                placeholder="273001"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (Optional for Map)</label>
              <input
                type="number"
                step="any"
                name="latitude"
                placeholder="e.g. 26.7606"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (Optional for Map)</label>
              <input
                type="number"
                step="any"
                name="longitude"
                placeholder="e.g. 83.3732"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Property Amenities */}
        <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>✨</span> 4. Property Facilities & Amenities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableAmenities.map((item) => {
              const isChecked = amenities[item.key];
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handleAmenityToggle(item.key)}
                  className={`px-3 py-2.5 text-sm rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? 'border-violet-600 bg-violet-50 text-violet-700 font-medium shadow-xs'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {isChecked && <span className="text-violet-600 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Rooms & Suites Setup */}
        <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🛏️</span> 5. Rooms & Pricing Inventory
            </h3>
            <button
              type="button"
              onClick={handleAddRoom}
              className="text-xs bg-violet-600 text-white hover:bg-violet-700 font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm"
            >
              + Add Room Category
            </button>
          </div>

          {rooms.map((room, index) => (
            <div key={index} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs relative space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">Room Category #{index + 1}</span>
                {rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRoom(index)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                  >
                    Remove Room
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Room Type *</label>
                  <input
                    type="text"
                    name="roomType"
                    required
                    value={room.roomType}
                    onChange={(e) => handleRoomChange(index, e)}
                    placeholder="e.g. Deluxe King Room"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Bed Type *</label>
                  <select
                    name="roomBedType"
                    value={room.roomBedType}
                    onChange={(e) => handleRoomChange(index, e)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                  >
                    {bedTypes.map((bed) => (
                      <option key={bed} value={bed}>{bed}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Price / Night (₹) *</label>
                  <input
                    type="number"
                    name="pricePerNight"
                    required
                    value={room.pricePerNight}
                    onChange={(e) => handleRoomChange(index, e)}
                    placeholder="e.g. 3499"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={room.discountPrice}
                    onChange={(e) => handleRoomChange(index, e)}
                    placeholder="e.g. 2999"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    value={room.capacity}
                    onChange={(e) => handleRoomChange(index, e)}
                    placeholder="e.g. 3"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Max Adults</label>
                  <input
                    type="number"
                    name="maxAdults"
                    value={room.maxAdults}
                    onChange={(e) => handleRoomChange(index, e)}
                    placeholder="2"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Max Children</label>
                  <input
                    type="number"
                    name="maxChildren"
                    value={room.maxChildren}
                    onChange={(e) => handleRoomChange(index, e)}
                    placeholder="1"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Total Rooms Count *</label>
                  <input
                    type="number"
                    name="totalRooms"
                    required
                    value={room.totalRooms}
                    onChange={(e) => handleRoomChange(index, e)}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Room Size</label>
                <input
                  type="text"
                  name="size"
                  value={room.size}
                  onChange={(e) => handleRoomChange(index, e)}
                  placeholder="e.g. 350 sq.ft / 32 m²"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                />
              </div>

              {/* Room Specific Multiple Image URLs */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase">Room Photo Gallery URLs</label>
                  <button
                    type="button"
                    onClick={() => addRoomImageField(index)}
                    className="text-xs text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
                  >
                    + Add Room Image URL
                  </button>
                </div>
                {room.images.map((imgUrl, imgIdx) => (
                  <div key={imgIdx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Paste Room Photo URL #${imgIdx + 1}`}
                      value={imgUrl}
                      onChange={(e) => handleRoomImageChange(index, imgIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-xl outline-none text-xs bg-white"
                    />
                    {room.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoomImageField(index, imgIdx)}
                        className="px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg transition text-xs font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Room Specific Amenities */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1.5">Room Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableRoomAmenities.map((ra) => {
                    const isRoomAmenityChecked = room.roomAmenities[ra.key];
                    return (
                      <button
                        type="button"
                        key={ra.key}
                        onClick={() => handleRoomAmenityToggle(index, ra.key)}
                        className={`px-2.5 py-1.5 text-xs rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                          isRoomAmenityChecked
                            ? 'border-violet-600 bg-violet-50 text-violet-700 font-medium'
                            : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span>{ra.label}</span>
                        {isRoomAmenityChecked && <span className="text-violet-600 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">Room Description</label>
                <input
                  type="text"
                  name="description"
                  value={room.description}
                  onChange={(e) => handleRoomChange(index, e)}
                  placeholder="e.g. King size bed, private balcony, city view, air-conditioned"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 6. Property Photos */}
        <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🖼️</span> 6. Property Photo Gallery URLs
            </h3>
            <button
              type="button"
              onClick={addImageField}
              className="text-sm text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
            >
              + Add Another Image URL
            </button>
          </div>

          <div className="space-y-3">
            {images.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Paste Photo URL #${index + 1} (Exterior, Lobby, Pool, etc.)`}
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-xl outline-none text-xs bg-white"
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition text-xs font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 7. Policies & Description */}
        <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>📜</span> 7. Hotel Policies & Overview
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Property / Description *</label>
            <textarea
              name="description"
              rows="3"
              required
              placeholder="Detailed overview of the hotel, surrounding attractions, unique selling points, etc."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl outline-none text-xs bg-white"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">House Rules & Timings</label>
              <textarea
                name="houseRules"
                rows="2"
                value={formData.houseRules}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl outline-none text-xs bg-white"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
              <textarea
                name="cancellationPolicy"
                rows="2"
                value={formData.cancellationPolicy}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl outline-none text-xs bg-white"
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Applicable GST / Tax Percentage (%)</label>
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              placeholder="12"
              className="w-full md:w-1/3 px-4 py-2 border rounded-xl outline-none text-sm bg-white"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel || (() => navigate('/owner/all-hotels'))}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md transition disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Publishing Property...' : 'Save & Publish Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterHotel;