import React, { useContext, useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  Building2,
  PlusCircle,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react"
import { AppContext } from "../../context/AppContext"

const OwnerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const context = useContext(AppContext) || {}
  const { owner, logoutUser } = context
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (typeof logoutUser === "function") {
      await logoutUser()
    }
    navigate("/login")
  }

  const navItems = [
    {
      name: "All Hotels",
      path: "/owner",
      icon: Building2,
      end: true,
    },
    {
      name: "Register Hotel",
      path: "/owner/register-hotel",
      icon: PlusCircle,
    },
    {
      name: "Bookings",
      path: "/owner/booking",
      icon: CalendarCheck,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-600" />
          <span className="font-bold text-lg text-gray-800">Owner Portal</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo / Title */}
          <div className="p-6 border-b flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">UrbanStay</h2>
              <p className="text-xs text-indigo-600 font-medium">Hotel Owner Panel</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Profile & Logout */}
        <div className="p-4 border-t bg-gray-50/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-white border rounded-xl shadow-sm">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {owner?.name || "Hotel Owner"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {owner?.email || "owner@hotel.com"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Owner Dashboard</h1>
            <p className="text-xs text-gray-500">Manage your hotels and guest bookings</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Owner Verified
          </span>
        </header>

        <main className="p-4 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default OwnerLayout