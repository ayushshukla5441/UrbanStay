import { createContext, useState, useEffect } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("urbanstay_user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [owner, setOwner] = useState(() => {
        try {
            const savedOwner = localStorage.getItem("urbanstay_owner");
            return savedOwner ? JSON.parse(savedOwner) : null;
        } catch {
            return null;
        }
    });
    const [authChecked, setAuthChecked] = useState(false);

    const loginUser = (userData) => {
        setUser(userData);
        localStorage.setItem("urbanstay_user", JSON.stringify(userData));
        if (userData?.role === "owner") {
            setOwner(userData);
            localStorage.setItem("urbanstay_owner", JSON.stringify(userData));
        } else {
            setOwner(null);
            localStorage.removeItem("urbanstay_owner");
        }
    };

    const checkUserLoggedInOrNot = async () => {
        try {
            const { data } = await axios.get("/api/user/is-auth");
            if (data.success && data.user) {
                setUser(data.user);
                localStorage.setItem("urbanstay_user", JSON.stringify(data.user));
                if (data.user?.role === "owner") {
                    setOwner(data.user);
                    localStorage.setItem("urbanstay_owner", JSON.stringify(data.user));
                } else {
                    setOwner(null);
                    localStorage.removeItem("urbanstay_owner");
                }
            } else {
                setUser(null);
                setOwner(null);
                localStorage.removeItem("urbanstay_user");
                localStorage.removeItem("urbanstay_owner");
            }
        } catch (error) {
            console.log("Auth Check Error:", error);
            setUser(null);
            setOwner(null);
            localStorage.removeItem("urbanstay_user");
            localStorage.removeItem("urbanstay_owner");
        } finally {
            setAuthChecked(true);
        }
    };

    const [hotelData, setHotelData] = useState([]);

    const fetchHotels = async () => {
        try {
            const { data } = await axios.get("/api/hotel/all");
            if (data.success && data.hotels) {
                const formattedHotels = data.hotels.map(hotel => {
                    const DEFAULT_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&fit=crop';
                    
                    let addressStr = hotel.address;
                    if (typeof hotel.address === 'object' && hotel.address !== null) {
                        addressStr = `${hotel.address.street || ''}, ${hotel.address.city || ''}, ${hotel.address.state || ''} - ${hotel.address.pincode || ''}`;
                    }

                    return {
                        _id: hotel._id,
                        id: hotel._id,
                        name: hotel.name,
                        ownerName: hotel.ownerName || 'N/A',
                        contactNumber: hotel.contactPhone || hotel.contactNumber || 'N/A',
                        email: hotel.email || '',
                        address: addressStr || 'N/A',
                        city: typeof hotel.address === 'object' ? hotel.address?.city : (hotel.city || ''),
                        price: Number(hotel.pricePerNight || hotel.price) || 0,
                        pricePerNight: Number(hotel.pricePerNight || hotel.price) || 0,
                        rating: parseFloat(hotel.rating) || 4.5,
                        amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
                        // Agar backend se rooms array aaye toh theek, nahi toh default room types generate kar dega
                        rooms: hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms : [
                            { type: "Standard Room", price: hotel.pricePerNight || 2000, capacity: "2 Adults", size: "180 sq.ft", bed: "Queen Bed" },
                            { type: "Deluxe Room", price: (hotel.pricePerNight || 2000) + 1000, capacity: "2 Adults + 1 Child", size: "250 sq.ft", bed: "King Bed" },
                            { type: "Super Deluxe Suite", price: (hotel.pricePerNight || 2000) + 2500, capacity: "3 Adults", size: "350 sq.ft", bed: "King Bed + Balcony" }
                        ],
                        image: hotel.image || hotel.images?.[0] || DEFAULT_IMG,
                        images: hotel.images?.length ? hotel.images : [DEFAULT_IMG],
                        description: hotel.description || '',
                        bookingCount: Number(hotel.bookingCount) || 0
                    };
                });

                setHotelData(formattedHotels);
            }
        } catch (error) {
            console.error("Error fetching hotels from backend:", error);
            setHotelData([]);
        }
    };

    useEffect(() => {
        checkUserLoggedInOrNot();
        fetchHotels();
    }, []);

    const logoutUser = async () => {
        try {
            await axios.get("/api/user/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setOwner(null);
            localStorage.removeItem("urbanstay_user");
            localStorage.removeItem("urbanstay_owner");
        }
    };

    const addHotel = (hotelObj) => {
        const DEFAULT_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&fit=crop';

        const formattedHotel = {
            _id: hotelObj._id || `hotel_${Date.now()}`,
            id: hotelObj.id || hotelObj._id || `hotel_${Date.now()}`,
            name: (hotelObj.name || '').trim(),
            ownerName: hotelObj.ownerName || user?.name || 'N/A',
            contactNumber: hotelObj.contactNumber || hotelObj.contactPhone || 'N/A',
            email: hotelObj.email || user?.email || '',
            address: typeof hotelObj.address === 'object'
                ? `${hotelObj.address.street || ''}, ${hotelObj.address.city || ''}, ${hotelObj.address.state || ''}`
                : (hotelObj.address || `${hotelObj.city || ''}, ${hotelObj.state || ''}`),
            city: hotelObj.city || (typeof hotelObj.address === 'object' ? hotelObj.address?.city : ''),
            price: Number(hotelObj.pricePerNight || hotelObj.price) || 0,
            pricePerNight: Number(hotelObj.pricePerNight || hotelObj.price) || 0,
            rating: parseFloat(hotelObj.rating) || 4.5,
            amenities: Array.isArray(hotelObj.amenities) ? hotelObj.amenities : [],
            rooms: hotelObj.rooms || [
                { type: "Standard Room", price: hotelObj.pricePerNight || 2000, capacity: "2 Adults", size: "180 sq.ft" }
            ],
            image: hotelObj.image || hotelObj.images?.[0] || DEFAULT_IMG,
            images: hotelObj.images?.length ? hotelObj.images : [DEFAULT_IMG],
            description: hotelObj.description || ''
        };

        setHotelData((prevHotels) => [formattedHotel, ...(prevHotels || [])]);
        return true;
    };

    const deleteHotel = async (id) => {
        try {
            const { data } = await axios.delete(`/api/hotel/delete/${id}`);
            if (data.success) {
                setHotelData((prevHotels) =>
                    (prevHotels || []).filter((hotel) => (hotel._id || hotel.id) !== id)
                );
            }
        } catch (error) {
            console.error("Error deleting hotel:", error);
            setHotelData((prevHotels) =>
                (prevHotels || []).filter((hotel) => (hotel._id || hotel.id) !== id)
            );
        }
    };

    const value = {
        user,
        setUser,
        loginUser,
        logoutUser,
        owner,
        setOwner,
        hotelData,
        setHotelData,
        addHotel,
        deleteHotel,
        fetchHotels,
        axios,
        checkUserLoggedInOrNot,
        authChecked
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;