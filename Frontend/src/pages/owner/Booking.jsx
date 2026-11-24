import React, { useState, useEffect, useContext, useCallback } from "react"
import { Search, Calendar, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { AppContext } from "../../context/AppContext"

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loadError, setLoadError] = useState("")
  const [summary, setSummary] = useState({})
  const { axios } = useContext(AppContext)

  // Fetch Bookings for Owner's Hotels
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError("")
      const { data } = await axios.get("/api/booking/owner-bookings")
      if (data.success) {
        setBookings(data.bookings)
        setSummary(data.summary || {})
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setLoadError(error.response?.data?.message || "Could not load guest bookings.")
    } finally {
      setLoading(false)
    }
  }, [axios])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Handle Booking Status Update (e.g., Confirm / Cancel)
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const { data } = await axios.patch(
        `/api/booking/${bookingId}/status`,
        { status: newStatus.toLowerCase() }
      )

      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        )
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update booking status")
    }
  }

  // Filter Bookings based on Search and Status Filter
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.hotel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestDetails?.mobile?.includes(searchTerm) ||
      booking.room?.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "All" ||
      booking.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        )
      case "payment_pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Payment Hold
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        )
    }
  }

  const bookingStats = {
    total: Object.values(summary).reduce((total, count) => total + count, 0),
    confirmed: summary.confirmed || 0,
    pending: summary.pending || 0,
    paymentPending: summary.payment_pending || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guest Bookings</h2>
          <p className="text-xs text-gray-500 mt-1">
            View and manage all reservations across your hotels
          </p>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guest or hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium"
          >
            <option value="All">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Payment_Pending">Payment Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total bookings</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{bookingStats.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-700">Confirmed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{bookingStats.confirmed}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-700">Pending approval</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{bookingStats.pending}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-700">Payment holds</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{bookingStats.paymentPending}</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            Loading reservations...
          </div>
        ) : loadError ? (
          <div className="p-12 text-center text-red-600 text-sm">
            {loadError}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-800 font-semibold">No Bookings Found</p>
            <p className="text-xs text-gray-500 mt-1">
              There are no reservations matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b">
                  <th className="p-4">Hotel</th>
                  <th className="p-4">Room / Stock</th>
                  <th className="p-4">Guest Details</th>
                  <th className="p-4">Check In / Out</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Hotel Info */}
                    <td className="p-4 font-semibold text-gray-900">
                      {booking.hotel?.name || "N/A"}
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-gray-800">
                        {booking.room?.roomType || "Room"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {booking.roomsBooked} booked · {booking.remainingRooms ?? 0} remaining
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Total: {booking.totalRoomStock ?? booking.room?.totalRooms ?? 0} rooms
                      </div>
                    </td>

                    {/* Guest Info */}
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {booking.guestDetails?.name || booking.user?.name || "Guest User"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {booking.guestDetails?.mobile || booking.user?.email || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Email: {booking.guestDetails?.email || booking.user?.email || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Aadhaar •••• {booking.guestDetails?.aadhaarLast4 || "N/A"}
                      </div>
                      {booking.guestDetails?.travelers?.length > 0 && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs font-semibold text-indigo-600">
                            {booking.persons || booking.guestDetails.travelers.length} traveler(s)
                          </summary>
                          <div className="mt-2 space-y-1 border-l-2 border-indigo-100 pl-2">
                            {booking.guestDetails.travelers.map((traveler, index) => (
                              <div key={`${traveler.name}-${index}`} className="text-[11px] text-gray-500">
                                {index + 1}. {traveler.name} · {traveler.mobile} · Aadhaar •••• {traveler.aadhaarLast4}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="p-4 text-xs font-medium text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{new Date(booking.checkInDate).toLocaleDateString()}</span>
                        <span>→</span>
                        <span>{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="p-4 font-bold text-indigo-600">
                      ₹{booking.totalPrice || booking.amount}
                    </td>

                    {/* Payment Status */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          booking.isPaid
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {booking.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>

                    {/* Booking Status */}
                    <td className="p-4">{getStatusBadge(booking.status)}</td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {booking.status?.toLowerCase() === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking._id, "confirmed")}
                              className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking._id, "cancelled")}
                              className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status?.toLowerCase() !== "pending" && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings