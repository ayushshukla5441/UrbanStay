import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    BedDouble,
    Building2,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Image as ImageIcon,
    Mail,
    MapPin,
    Phone,
    Ruler,
    ShieldCheck,
    Star,
    Users,
    Wifi,
    X,
} from "lucide-react";
import { AppContext } from "../context/AppContext";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&fit=crop";

const getImages = (images, fallback = "") => {
    const validImages = Array.isArray(images)
        ? images.filter((image) => typeof image === "string" && image.trim())
        : [];

    return validImages.length ? validImages : fallback ? [fallback] : [];
};

const getAmenityNames = (amenities) => {
    if (Array.isArray(amenities)) {
        return amenities.filter(Boolean);
    }

    if (!amenities || typeof amenities !== "object") {
        return [];
    }

    const labels = {
        ac: "Air conditioning",
        attachedBathroom: "Attached bathroom",
        airportShuttle: "Airport shuttle",
        beachAccess: "Beach access",
        businessCenter: "Business centre",
        freeWifi: "Free Wi-Fi",
        petFriendly: "Pet friendly",
        roomService: "Room service",
        twentyFourHourFrontDesk: "24-hour front desk",
    };

    return Object.entries(amenities)
        .filter(([, included]) => Boolean(included))
        .map(([key]) => labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()));
};

const formatAddress = (address) => {
    if (typeof address === "string") {
        return address;
    }

    if (!address || typeof address !== "object") {
        return "Location not provided";
    }

    return [
        address.street,
        address.landmark,
        address.city,
        address.state,
        address.pincode,
        address.country,
    ]
        .filter(Boolean)
        .join(", ") || "Location not provided";
};

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN").format(Number(price) || 0);

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { axios, user } = useContext(AppContext);
    const userEmail = user?.email || "";
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [roomsError, setRoomsError] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [roomImageIndexes, setRoomImageIndexes] = useState({});
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [bookingForm, setBookingForm] = useState({
        checkInDate: "",
        checkOutDate: "",
        roomsBooked: 1,
        adults: 1,
        children: 0,
        guestName: "",
        guestMobile: "",
        guestEmail: "",
        guestAadhaar: "",
        travelers: [{ name: "", mobile: "", aadhaar: "" }],
    });
    const [availability, setAvailability] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const bookingRequestId = useRef("");
    const hotelImages = getImages(
        hotel?.images,
        hotel?.image || FALLBACK_IMAGE
    );

    useEffect(() => {
        let isCurrent = true;

        const loadHotelDetails = async () => {
            setLoading(true);
            setError("");
            setRoomsError("");
            setHotel(null);
            setRooms([]);
            setSelectedRoomId("");
            setBookingForm({
                checkInDate: "",
                checkOutDate: "",
                roomsBooked: 1,
                adults: 1,
                children: 0,
                guestName: "",
                guestMobile: "",
                guestEmail: userEmail,
                guestAadhaar: "",
                travelers: [{ name: "", mobile: "", aadhaar: "" }],
            });
            bookingRequestId.current = "";
            setAvailability(null);
            setBookingError("");
            setActiveImageIndex(0);
            setRoomImageIndexes({});

            const [hotelResult, roomsResult] = await Promise.allSettled([
                axios.get(`/api/hotel/${id}`),
                axios.get(`/api/room/hotel/${id}`),
            ]);

            if (!isCurrent) {
                return;
            }

            if (
                hotelResult.status !== "fulfilled" ||
                !hotelResult.value.data?.success ||
                !hotelResult.value.data.hotel
            ) {
                setError(
                    hotelResult.status === "rejected"
                        ? hotelResult.reason.response?.data?.message ||
                              "Could not load this property. Please try again."
                        : "Hotel not found."
                );
                setLoading(false);
                return;
            }

            setHotel(hotelResult.value.data.hotel);

            if (roomsResult.status === "fulfilled" && roomsResult.value.data?.success) {
                const loadedRooms = roomsResult.value.data.rooms || [];
                setRooms(loadedRooms);
                setSelectedRoomId(loadedRooms[0]?._id || "");
            } else {
                setRoomsError(
                    roomsResult.status === "rejected"
                        ? roomsResult.reason.response?.data?.message ||
                              "Room details could not be loaded."
                        : "Room details could not be loaded."
                );
            }

            setLoading(false);
        };

        loadHotelDetails();
        window.scrollTo(0, 0);

        return () => {
            isCurrent = false;
        };
    }, [axios, id, userEmail]);

    useEffect(() => {
        if (!galleryOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setGalleryOpen(false);
            } else if (event.key === "ArrowRight") {
                setActiveImageIndex((index) => (index + 1) % hotelImages.length);
            } else if (event.key === "ArrowLeft") {
                setActiveImageIndex((index) => (index - 1 + hotelImages.length) % hotelImages.length);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [galleryOpen, hotelImages.length]);

    const hotelAmenities = getAmenityNames(hotel?.amenities);
    const address = formatAddress(hotel?.address);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    const hotelPrice = Number(hotel?.pricePerNight) || 0;

    const openGallery = (index) => {
        setActiveImageIndex(index);
        setGalleryOpen(true);
    };

    const moveGallery = (direction) => {
        setActiveImageIndex(
            (index) => (index + direction + hotelImages.length) % hotelImages.length
        );
    };

    const todayParts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const todayValues = Object.fromEntries(
        todayParts.map(({ type, value }) => [type, value])
    );
    const indiaToday = `${todayValues.year}-${todayValues.month}-${todayValues.day}`;
    const minCheckOutDate = new Date(
        `${bookingForm.checkInDate || indiaToday}T00:00:00.000Z`
    );
    minCheckOutDate.setUTCDate(minCheckOutDate.getUTCDate() + 1);
    const minCheckOutValue = minCheckOutDate.toISOString().slice(0, 10);
    const selectedRoom = rooms.find((room) => room._id === selectedRoomId);

    const updateBookingForm = (event) => {
        const { name, value } = event.target;
        setBookingForm((current) => {
            const next = { ...current, [name]: value };
            if (name === "adults" || name === "children") {
                const persons = Number(next.adults || 1) + Number(next.children || 0);
                const travelers = Array.from({ length: persons }, (_, index) =>
                    current.travelers[index] || { name: "", mobile: "", aadhaar: "" }
                );
                next.travelers = travelers;
            }
            return next;
        });
        setAvailability(null);
        setBookingError("");
        bookingRequestId.current = "";
    };

    const handleCheckAvailability = async (event) => {
        event.preventDefault();
        const query = new URLSearchParams({
            hotelId: id,
            roomId: selectedRoomId,
            checkInDate: bookingForm.checkInDate,
            checkOutDate: bookingForm.checkOutDate,
            roomsBooked: bookingForm.roomsBooked,
        });

        setAvailabilityLoading(true);
        setAvailability(null);
        setBookingError("");
        try {
            const { data } = await axios.get(`/api/booking/availability?${query}`);
            setAvailability(data);
        } catch (requestError) {
            setBookingError(
                requestError.response?.data?.message ||
                    "Could not check room availability. Please try again."
            );
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const handleCreateBooking = async (event) => {
        event.preventDefault();
        setBookingError("");
        if (!user) {
            navigate("/login");
            return;
        }

        const selectedRoom = rooms.find((room) => room._id === selectedRoomId);
        if (!selectedRoom) {
            setBookingError("Choose a room type before continuing.");
            return;
        }

        setBookingLoading(true);
        if (!bookingRequestId.current) {
            bookingRequestId.current =
                window.crypto?.randomUUID?.() ||
                `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
        try {
            const persons = Number(bookingForm.adults) + Number(bookingForm.children);
            const travelers = Array.from({ length: persons }, (_, index) =>
                bookingForm.travelers[index] || { name: "", mobile: "", aadhaar: "" }
            );
            const { data } = await axios.post(
                "/api/booking/create",
                {
                    hotelId: id,
                    roomId: selectedRoomId,
                    checkInDate: bookingForm.checkInDate,
                    checkOutDate: bookingForm.checkOutDate,
                    roomsBooked: Number(bookingForm.roomsBooked),
                    adults: Number(bookingForm.adults),
                    children: Number(bookingForm.children),
                    paymentMethod: "pay at hotel",
                    guestDetails: {
                        name: bookingForm.guestName,
                        mobile: bookingForm.guestMobile,
                        email: bookingForm.guestEmail,
                        aadhaar: bookingForm.guestAadhaar,
                        travelers,
                    },
                },
                { headers: { "Idempotency-Key": bookingRequestId.current } }
            );
            if (data.success) {
                bookingRequestId.current = "";
                navigate("/hotels", {
                    state: {
                        visitHotelMessage: "Please visit the hotel to complete your booking. Thank you!",
                    },
                });
            } else {
                setBookingError(data.message || "Could not create your booking.");
            }
        } catch (requestError) {
            setBookingError(
                requestError.response?.data?.message ||
                    "Could not create your booking. Please try again."
            );
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
                <p className="text-sm font-medium text-slate-500">Loading hotel details...</p>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
                <p className="text-slate-600">{error || "Hotel not found."}</p>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                    <ArrowLeft size={16} /> Back to hotels
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-16 text-slate-900">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                    <ArrowLeft size={17} /> Back to hotels
                </button>

                <header className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                                {hotel.propertyType || "Hotel"}
                            </span>
                            {hotel.starRating > 0 && (
                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                                    <Star size={15} className="fill-amber-400 text-amber-400" />
                                    {hotel.starRating}-star property
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {hotel.name}
                        </h1>
                        <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                            <MapPin size={17} className="mt-0.5 shrink-0 text-blue-700" />
                            <span>{address}</span>
                        </p>
                    </div>
                    <a
                        href="#rooms"
                        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
                    >
                        View room options
                    </a>
                </header>

                <section aria-label="Hotel photos" className="mb-8">
                    <div className={`grid gap-2 overflow-hidden rounded-2xl ${hotelImages.length > 1 ? "md:grid-cols-4" : "md:grid-cols-1"}`}>
                        <button
                            type="button"
                            onClick={() => openGallery(0)}
                            className={`group relative h-72 overflow-hidden bg-slate-200 text-left sm:h-96 ${hotelImages.length > 1 ? "md:col-span-2 md:h-[500px]" : "md:h-[500px]"}`}
                            aria-label="Open hotel photo gallery"
                        >
                            <img
                                src={hotelImages[0]}
                                alt={`${hotel.name} exterior`}
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = FALLBACK_IMAGE;
                                }}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                            />
                            <span className="absolute bottom-4 left-4 rounded-lg bg-black/65 px-3 py-2 text-xs font-semibold text-white">
                                <ImageIcon size={14} className="mr-1 inline" />
                                View all {hotelImages.length} photos
                            </span>
                        </button>

                        {hotelImages.length > 1 && (
                            <div className="grid grid-cols-2 gap-2 md:col-span-2 md:grid-rows-2">
                                {hotelImages.slice(1, 5).map((image, index) => {
                                    const imageIndex = index + 1;
                                    const extraPhotos = hotelImages.length - 5;

                                    return (
                                        <button
                                            type="button"
                                            key={`${image}-${imageIndex}`}
                                            onClick={() => openGallery(imageIndex)}
                                            className="group relative h-36 overflow-hidden bg-slate-200 text-left sm:h-48 md:h-full"
                                            aria-label={`Open hotel photo ${imageIndex + 1}`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${hotel.name} view ${imageIndex + 1}`}
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = FALLBACK_IMAGE;
                                                }}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                            />
                                            {index === 3 && extraPhotos > 0 && (
                                                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-bold text-white">
                                                    +{extraPhotos} photos
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-8">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Property information</h2>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                        {hotel.description || "No property description has been added yet."}
                                    </p>
                                </div>
                                {hotel.chainName && (
                                    <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                                        {hotel.chainName}
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 hover:bg-blue-50"
                                >
                                    <MapPin size={18} className="mt-0.5 shrink-0 text-blue-700" />
                                    <span className="min-w-0">
                                        <strong className="block text-slate-900">Location</strong>
                                        <span className="mt-1 block">{address}</span>
                                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                                            View on map <ExternalLink size={13} />
                                        </span>
                                    </span>
                                </a>
                                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                                    <span>
                                        <strong className="block text-slate-900">Hosted by {hotel.ownerName || "the property team"}</strong>
                                        {hotel.propertyType || "Hotel"}
                                        {hotel.starRating ? ` · ${hotel.starRating}-star property` : ""}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section id="rooms" className="scroll-mt-6 space-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                                    Stay options
                                </p>
                                <h2 className="mt-1 text-2xl font-bold">Choose your room</h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Compare room photos, facilities, capacity and nightly prices.
                                </p>
                            </div>

                            {roomsError && (
                                <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    {roomsError}
                                </p>
                            )}

                            {rooms.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                    <BedDouble className="mx-auto text-slate-400" size={30} />
                                    <h3 className="mt-3 font-semibold text-slate-800">Room options are not listed yet</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Contact the property for availability and room details.
                                    </p>
                                </div>
                            ) : (
                                rooms.map((room, index) => {
                                    const roomKey = room._id || `${room.roomType}-${index}`;
                                    const roomImages = getImages(room.images);
                                    const selectedImageIndex = roomImageIndexes[roomKey] || 0;
                                    const roomImage = roomImages[selectedImageIndex] || hotelImages[0];
                                    const roomAmenities = getAmenityNames(room.roomAmenities);
                                    const roomPrice = Number(room.pricePerNight) || hotelPrice;
                                    const discountPrice = Number(room.discountPrice);
                                    const priceToShow =
                                        discountPrice > 0 && discountPrice < roomPrice
                                            ? discountPrice
                                            : roomPrice;

                                    return (
                                        <article
                                            key={roomKey}
                                            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
                                        >
                                            <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4 sm:p-4 md:grid-cols-[210px_minmax(0,1fr)_180px]">
                                                <div className="min-w-0">
                                                    <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 sm:h-44 md:h-48">
                                                        <img
                                                            src={roomImage}
                                                            alt={`${room.roomType || "Room"} at ${hotel.name}`}
                                                            onError={(event) => {
                                                                event.currentTarget.onerror = null;
                                                                event.currentTarget.src = FALLBACK_IMAGE;
                                                            }}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        {roomImages.length === 0 && (
                                                            <span className="absolute inset-x-1 bottom-1 rounded bg-black/65 px-1 py-1 text-center text-[10px] leading-tight text-white sm:inset-x-2 sm:bottom-2 sm:text-xs">
                                                                Property photo · no room photo
                                                            </span>
                                                        )}
                                                    </div>
                                                    {roomImages.length > 1 && (
                                                        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                                                            {roomImages.map((image, imageIndex) => (
                                                                <button
                                                                    type="button"
                                                                    key={`${image}-${imageIndex}`}
                                                                    onClick={() =>
                                                                        setRoomImageIndexes((current) => ({
                                                                            ...current,
                                                                            [roomKey]: imageIndex,
                                                                        }))
                                                                    }
                                                                    className={`h-9 w-10 shrink-0 overflow-hidden rounded-md border-2 sm:h-10 sm:w-12 ${
                                                                        selectedImageIndex === imageIndex
                                                                            ? "border-blue-700"
                                                                            : "border-transparent"
                                                                    }`}
                                                                    aria-label={`Show room photo ${imageIndex + 1}`}
                                                                >
                                                                    <img
                                                                        src={image}
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 py-0.5 sm:py-1">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <h3 className="text-base font-bold leading-tight text-slate-900 sm:text-lg">
                                                            {room.roomType || "Room"}
                                                        </h3>
                                                    </div>
                                                    {room.description && (
                                                        <div className="mt-2">
                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                                About this room
                                                            </p>
                                                            <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600 sm:text-sm">
                                                                {room.description.trim()}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-xs">
                                                        <div className="flex min-w-0 items-start gap-2 text-slate-600">
                                                            <BedDouble size={15} className="mt-0.5 shrink-0 text-blue-700" />
                                                            <span className="min-w-0">
                                                                <span className="block text-[10px] text-slate-400">Bed type</span>
                                                                <span className="font-semibold text-slate-800">
                                                                    {room.roomBedType || "Not specified"}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="flex min-w-0 items-start gap-2 text-slate-600">
                                                            <Users size={15} className="mt-0.5 shrink-0 text-blue-700" />
                                                            <span className="min-w-0">
                                                                <span className="block text-[10px] text-slate-400">Guests</span>
                                                                <span className="font-semibold text-slate-800">
                                                                    {room.capacity || 2} max
                                                                    {room.maxAdults
                                                                        ? ` · ${room.maxAdults} adults`
                                                                        : ""}
                                                                    {room.maxChildren
                                                                        ? ` · ${room.maxChildren} children`
                                                                        : ""}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        {room.size && (
                                                            <div className="flex min-w-0 items-start gap-2 text-slate-600">
                                                                <Ruler size={15} className="mt-0.5 shrink-0 text-blue-700" />
                                                                <span className="min-w-0">
                                                                    <span className="block text-[10px] text-slate-400">Room size</span>
                                                                    <span className="font-semibold text-slate-800">{room.size}</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {roomAmenities.length > 0 && (
                                                        <div className="mt-3 border-t border-slate-100 pt-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                                Room facilities
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                                {roomAmenities.map((amenity) => (
                                                                    <span
                                                                        key={amenity}
                                                                        className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-800 sm:text-xs"
                                                                    >
                                                                        <Check size={12} /> {amenity}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-2 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 md:col-span-1 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:bg-slate-50 md:p-4 md:text-right">
                                                    <div>
                                                        {priceToShow < roomPrice && (
                                                            <p className="text-xs text-slate-400 line-through">
                                                                ₹{formatPrice(roomPrice)}
                                                            </p>
                                                        )}
                                                        <p className="text-2xl font-bold text-slate-900">
                                                            ₹{formatPrice(priceToShow)}
                                                        </p>
                                                        <p className="text-xs text-slate-500">per room · per night</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRoomId(room._id);
                                                            setAvailability(null);
                                                            document.getElementById("reservation")?.scrollIntoView({
                                                                behavior: "smooth",
                                                                block: "center",
                                                            });
                                                        }}
                                                        aria-pressed={selectedRoomId === room._id}
                                                        className={`rounded-lg px-3 py-2 text-center text-xs font-bold md:w-full md:py-2.5 md:text-sm ${
                                                            selectedRoomId === room._id
                                                                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                                                : "bg-blue-700 text-white hover:bg-blue-800"
                                                        }`}
                                                    >
                                                        {selectedRoomId === room._id ? "Selected" : "Choose this room"}
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-center gap-2">
                                <Wifi className="text-blue-700" size={20} />
                                <h2 className="text-xl font-bold">Facilities and services</h2>
                            </div>
                            {hotelAmenities.length ? (
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {hotelAmenities.map((amenity) => (
                                        <div key={amenity} className="flex items-center gap-3 text-sm text-slate-700">
                                            <Check size={17} className="shrink-0 text-emerald-700" />
                                            {amenity}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-slate-500">
                                    No property facilities have been added yet.
                                </p>
                            )}
                        </section>

                        {(hotel.policies?.houseRules ||
                            hotel.policies?.cancellationPolicy ||
                            hotel.policies?.taxPercentage) && (
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                                <h2 className="text-xl font-bold">Policies and useful information</h2>
                                <div className="mt-4 divide-y divide-slate-100">
                                    {hotel.policies.houseRules && (
                                        <div className="py-4">
                                            <h3 className="font-semibold">House rules</h3>
                                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {hotel.policies.houseRules}
                                            </p>
                                        </div>
                                    )}
                                    {hotel.policies.cancellationPolicy && (
                                        <div className="py-4">
                                            <h3 className="font-semibold">Cancellation policy</h3>
                                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {hotel.policies.cancellationPolicy}
                                            </p>
                                        </div>
                                    )}
                                    {hotel.policies.taxPercentage && (
                                        <div className="py-4">
                                            <h3 className="font-semibold">Taxes</h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {hotel.policies.taxPercentage}% tax as specified by the property.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="text-xl font-bold">Contact the property</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Get in touch with the property for questions about your stay.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {hotel.contactPhone && (
                                    <a
                                        href={`tel:${hotel.contactPhone}`}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        <Phone size={16} /> {hotel.contactPhone}
                                    </a>
                                )}
                                {hotel.email && (
                                    <a
                                        href={`mailto:${hotel.email}`}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        <Mail size={16} /> Email property
                                    </a>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="h-fit lg:sticky lg:top-6">
                        <div id="reservation" className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Book your stay
                            </div>
                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                ₹{formatPrice(Number(selectedRoom?.discountPrice) > 0
                                    ? selectedRoom.discountPrice
                                    : selectedRoom?.pricePerNight || hotelPrice)}
                                <span className="ml-1 text-sm font-normal text-slate-500">/ room / night</span>
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {selectedRoom?.roomType || "Select a room type below"}
                            </p>
                            <form onSubmit={handleCreateBooking} className="mt-5 space-y-3">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Room type
                                    <select
                                        required
                                        value={selectedRoomId}
                                        onChange={(event) => {
                                            setSelectedRoomId(event.target.value);
                                            setAvailability(null);
                                            bookingRequestId.current = "";
                                        }}
                                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"
                                    >
                                        <option value="" disabled>Select room type</option>
                                        {rooms.map((room) => (
                                            <option key={room._id} value={room._id}>
                                                {room.roomType} · ₹{formatPrice(
                                                    Number(room.discountPrice) > 0
                                                        ? room.discountPrice
                                                        : room.pricePerNight
                                                )}/night
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <label className="block text-xs font-semibold text-slate-700">
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarDays size={13} /> Check-in
                                        </span>
                                        <input
                                            type="date"
                                            name="checkInDate"
                                            required
                                            min={indiaToday}
                                            value={bookingForm.checkInDate}
                                            onChange={updateBookingForm}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-xs font-normal"
                                        />
                                    </label>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarDays size={13} /> Check-out
                                        </span>
                                        <input
                                            type="date"
                                            name="checkOutDate"
                                            required
                                            min={minCheckOutValue}
                                            value={bookingForm.checkOutDate}
                                            onChange={updateBookingForm}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-xs font-normal"
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Rooms
                                        <input
                                            type="number"
                                            name="roomsBooked"
                                            min="1"
                                            max={selectedRoom?.totalRooms || 1}
                                            step="1"
                                            required
                                            value={bookingForm.roomsBooked}
                                            onChange={updateBookingForm}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-normal"
                                        />
                                    </label>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Adults
                                        <input
                                            type="number"
                                            name="adults"
                                            min="1"
                                            max={(selectedRoom?.maxAdults || selectedRoom?.capacity || 1) * Number(bookingForm.roomsBooked || 1)}
                                            step="1"
                                            required
                                            value={bookingForm.adults}
                                            onChange={updateBookingForm}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-normal"
                                        />
                                    </label>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Children
                                        <input
                                            type="number"
                                            name="children"
                                            min="0"
                                            max={(selectedRoom?.maxChildren || 0) * Number(bookingForm.roomsBooked || 1)}
                                            step="1"
                                            required
                                            value={bookingForm.children}
                                            onChange={updateBookingForm}
                                            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-normal"
                                        />
                                    </label>
                                </div>

                                <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                                    <p className="text-xs font-bold text-slate-800">Lead guest details</p>
                                    <input
                                        type="text"
                                        name="guestName"
                                        required
                                        placeholder="Full name"
                                        value={bookingForm.guestName}
                                        onChange={updateBookingForm}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="tel"
                                            name="guestMobile"
                                            required
                                            pattern="[6-9][0-9]{9}"
                                            maxLength="10"
                                            placeholder="Mobile number"
                                            value={bookingForm.guestMobile}
                                            onChange={updateBookingForm}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="email"
                                            name="guestEmail"
                                            required
                                            placeholder="Gmail / email"
                                            value={bookingForm.guestEmail}
                                            onChange={updateBookingForm}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        name="guestAadhaar"
                                        required
                                        inputMode="numeric"
                                        pattern="[0-9]{12}"
                                        maxLength="12"
                                        placeholder="Aadhaar number (12 digits)"
                                        value={bookingForm.guestAadhaar}
                                        onChange={updateBookingForm}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                </div>

                                {bookingForm.travelers.map((traveler, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder={`Guest ${index + 1} name`}
                                            value={traveler.name}
                                            onChange={(event) => {
                                                const name = event.target.value;
                                                setBookingForm((current) => ({
                                                    ...current,
                                                    travelers: current.travelers.map((item, itemIndex) =>
                                                        itemIndex === index ? { ...item, name } : item
                                                    ),
                                                }));
                                            }}
                                            className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
                                        />
                                        <input
                                            type="tel"
                                            required
                                            pattern="[6-9][0-9]{9}"
                                            maxLength="10"
                                            placeholder="Mobile"
                                            value={traveler.mobile}
                                            onChange={(event) => {
                                                const mobile = event.target.value;
                                                setBookingForm((current) => ({
                                                    ...current,
                                                    travelers: current.travelers.map((item, itemIndex) =>
                                                        itemIndex === index ? { ...item, mobile } : item
                                                    ),
                                                }));
                                            }}
                                            className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
                                        />
                                        <input
                                            type="text"
                                            required
                                            inputMode="numeric"
                                            pattern="[0-9]{12}"
                                            maxLength="12"
                                            placeholder="Aadhaar"
                                            value={traveler.aadhaar}
                                            onChange={(event) => {
                                                const aadhaar = event.target.value;
                                                setBookingForm((current) => ({
                                                    ...current,
                                                    travelers: current.travelers.map((item, itemIndex) =>
                                                        itemIndex === index ? { ...item, aadhaar } : item
                                                    ),
                                                }));
                                            }}
                                            className="rounded-lg border border-slate-300 px-2 py-2 text-xs"
                                        />
                                    </div>
                                ))}

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-800">
                                        Pay at hotel
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                                        Online payment is coming soon.
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={!selectedRoomId || !bookingForm.checkInDate || !bookingForm.checkOutDate || availabilityLoading}
                                    onClick={handleCheckAvailability}
                                    className="w-full rounded-lg border border-blue-700 px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {availabilityLoading ? "Checking..." : "Check availability"}
                                </button>

                                {availability && (
                                    <p className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                        availability.available
                                            ? "bg-emerald-50 text-emerald-800"
                                            : "bg-amber-50 text-amber-800"
                                    }`}>
                                        {availability.available
                                            ? `${availability.availableRooms} room(s) available for ${availability.nightCount} night(s).`
                                            : `Only ${availability.availableRooms} room(s) available for those dates.`}
                                    </p>
                                )}
                                {bookingError && (
                                    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                                        {bookingError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={!rooms.length || bookingLoading}
                                    className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {bookingLoading
                                        ? "Booking..."
                                        : user
                                            ? "Book hotel"
                                            : "Log in to book"}
                                </button>
                                <p className="text-center text-[11px] text-slate-500">
                                    Pay at the property. Availability is rechecked when you book.
                                </p>
                            </form>
                            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                                <p className="flex items-center gap-2">
                                    <Building2 size={16} className="text-blue-700" />
                                    {hotel.propertyType || "Hotel"}
                                </p>
                                <p className="flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-700" />
                                    {hotel.address?.city || address}
                                </p>
                                <p className="flex items-center gap-2">
                                    <BedDouble size={16} className="text-blue-700" />
                                    {rooms.length} room {rooms.length === 1 ? "type" : "types"} listed
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {galleryOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setGalleryOpen(false)}
                    role="presentation"
                >
                    <div
                        className="relative w-full max-w-6xl"
                        onClick={(event) => event.stopPropagation()}
                        role="presentation"
                    >
                        <div className="mb-3 flex items-center justify-between text-sm text-white">
                            <span>{activeImageIndex + 1} / {hotelImages.length}</span>
                            <button
                                type="button"
                                onClick={() => setGalleryOpen(false)}
                                className="rounded-full p-2 hover:bg-white/15"
                                aria-label="Close photo gallery"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <div className="relative flex h-[70vh] items-center justify-center">
                            <img
                                src={hotelImages[activeImageIndex]}
                                alt={`${hotel.name} photo ${activeImageIndex + 1}`}
                                className="max-h-full max-w-full rounded-lg object-contain"
                            />
                            {hotelImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => moveGallery(-1)}
                                        className="absolute left-2 rounded-full bg-white/90 p-3 text-slate-900 hover:bg-white sm:left-4"
                                        aria-label="Previous photo"
                                    >
                                        <ChevronLeft size={22} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveGallery(1)}
                                        className="absolute right-2 rounded-full bg-white/90 p-3 text-slate-900 hover:bg-white sm:right-4"
                                        aria-label="Next photo"
                                    >
                                        <ChevronRight size={22} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default HotelDetails;
