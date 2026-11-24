import React, { useContext } from 'react'
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import Home from './pages/Home'
import Hotels from './pages/Hotels'
import HotelDetails from './pages/HotelDetails'
import Signup from './pages/Signup'
import Login from './pages/Login'
import About from './pages/About'
import MyBookings from './pages/MyBookings'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AppContext } from './context/AppContext'

// Owner Pages Imports
import OwnerLayout from './pages/owner/OwnerLayout'
import AllHotel from './pages/owner/AllHotel'
import RegisterHotel from './pages/owner/RegisterHotel'
import Booking from './pages/owner/Booking'

const App = () => {
  const location = useLocation();
  const ownerPath = location.pathname.includes("owner");
  
  const context = useContext(AppContext);
  const owner = context?.user?.role === "owner";
  const authChecked = context?.authChecked;

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {!ownerPath && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotel/:id" element={<HotelDetails />} /> {/* <-- 2. Yahan dynamic route add karein */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/bookings" element={<MyBookings />} />

          {/* Owner Dashboard Routes */}
          <Route 
            path="/owner" 
            element={owner ? <OwnerLayout /> : <Navigate to="/login" replace />}
          >
            <Route index element={<AllHotel />} />
            <Route path="all-hotels" element={<AllHotel />} />
            <Route path="register-hotel" element={<RegisterHotel />} />
            <Route path="rooms" element={<AllHotel />} />
            <Route path="booking" element={<Booking />} />
          </Route>

          {/* Fallback for undefined routes */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!ownerPath && <Footer />}
    </div>
  )
}

export default App;