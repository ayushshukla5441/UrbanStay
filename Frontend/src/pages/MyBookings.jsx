import React, { useState, useEffect, useContext, useCallback } from "react"
import { AppContext } from "../context/AppContext"
import {
  MapPin,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
} from "lucide-react"

const MyBookings = () => {
  const [userBookings, setUserBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const { axios } = useContext(AppContext)

  // Fetch logged-in user's bookings from backend
  const fetchMyBookings = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError("")
      const { data } = await axios.get("/api/booking/my-bookings")

      if (data.success) {
        setUserBookings(data.bookings)
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error)
      setLoadError(
        error.response?.data?.message || "Could not load bookings. Please log in and try again."
      )
    } finally {
      setLoading(false)
    }
  }, [axios])

  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  // Handle Cancel Booking by User
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return

    try {
      const { data } = await axios.patch(`/api/booking/${bookingId}/cancel`)

      if (data.success) {
        setUserBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
        )
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking")
    }
  }

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "cancelled":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return CheckCircle
      case "pending":
        return Clock
      case "cancelled":
        return XCircle
      default:
        return Clock
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return isNaN(date)
      ? "N/A"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Here are your hotel bookings. You can view details and manage your reservations.
          </p>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500">
              Loading your bookings...
            </div>
          ) : loadError ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-red-600">
              {loadError}
            </div>
          ) : userBookings && userBookings.length > 0 ? (
            userBookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status)
              const statusTextColor = getStatusTextColor(booking.status)

              const hotelImg =
                booking.room?.images?.[0] ||
                booking.hotel?.image ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&fit=crop"
              const hotelAddress =
                typeof booking.hotel?.address === "string"
                  ? booking.hotel.address
                  : [
                      booking.hotel?.address?.street,
                      booking.hotel?.address?.city,
                      booking.hotel?.address?.state,
                    ]
                      .filter(Boolean)
                      .join(", ")

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                    <img
                      src={hotelImg}
                      alt={booking.hotel?.name || "Hotel Image"}
                      className="w-full md:w-48 h-36 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src =
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&fit=crop"
                      }}
                    />

                    <div className="space-y-2 w-full">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {booking.hotel?.name || "Hotel Name"}
                          {booking.room?.roomType && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                              ({booking.room.roomType})
                            </span>
                          )}
                        </h3>
                        <span className={`flex items-center gap-1 font-medium capitalize ${statusTextColor}`}>
                          <StatusIcon className="w-4 h-4" />
                          {booking.status}
                        </span>
                      </div>

                      {hotelAddress && (
                        <p className="flex items-center text-gray-500 text-sm gap-1">
                          <MapPin className="w-4 h-4" /> {hotelAddress}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-2">
                        {/* Check-in & Check-out Date */}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                        </span>

                        {/* Guests */}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          {booking.persons || booking.guests || 1} Guests
                          {booking.roomsBooked > 1 && ` · ${booking.roomsBooked} Rooms`}
                        </span>

                        {/* Price */}
                        <span className="flex items-center gap-1 font-bold text-gray-900">
                          ₹{booking.totalPrice || booking.amount || 0}
                        </span>

                        {/* Payment Method & Paid Status */}
                        {booking.paymentMethod && (
                          <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                            {booking.paymentMethod}
                            <span
                              className={`ml-1 text-[10px] px-1.5 py-0.5 rounded ${
                                booking.isPaid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {booking.isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </span>
                        )}
                      </div>
                      {booking.guestDetails && (
                        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">
                            Lead guest: {booking.guestDetails.name}
                          </span>
                          <span className="ml-3">{booking.guestDetails.mobile}</span>
                          <span className="ml-3">{booking.guestDetails.email}</span>
                          {booking.guestDetails.travelers?.length > 0 && (
                            <div className="mt-1">
                              Travelers: {booking.guestDetails.travelers.map((guest) => guest.name).join(", ")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 w-full md:w-auto justify-end">
                    <button className="flex items-center justify-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    {booking.status?.toLowerCase() !== "cancelled" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex items-center justify-center gap-1 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500">
              No bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyBookings