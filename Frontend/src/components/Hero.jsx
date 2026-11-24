import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Search, Users, ShieldCheck, Headphones } from "lucide-react";
import { motion } from "motion/react";

const Hero = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const submitSearch = (event) => {
    event.preventDefault();
    navigate("/hotels");
  };

  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(15,23,42,0.96)_25%,rgba(15,23,42,0.72)_58%,rgba(15,23,42,0.25)),url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&fit=crop')] bg-cover bg-center" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-300">
            Hotels, stays and escapes
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Find a stay worth remembering
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
            Compare verified hotels, choose a room and complete your booking securely.
          </p>
        </div>

        <form
          onSubmit={submitSearch}
          className="mt-10 grid gap-2 rounded-2xl bg-white p-3 shadow-2xl lg:grid-cols-[1.35fr_1fr_1fr_0.7fr_auto]"
        >
          <label className="flex min-h-16 items-center gap-3 rounded-xl px-3 hover:bg-slate-50">
            <MapPin className="shrink-0 text-blue-700" size={20} />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase text-slate-500">Destination</span>
              <input
                value={search.destination}
                onChange={(event) => setSearch({ ...search, destination: event.target.value })}
                placeholder="City or hotel"
                className="mt-1 w-full text-sm font-semibold outline-none"
              />
            </span>
          </label>
          <label className="flex min-h-16 items-center gap-3 rounded-xl border-slate-200 px-3 hover:bg-slate-50 lg:border-l">
            <CalendarDays className="shrink-0 text-blue-700" size={20} />
            <span className="flex-1">
              <span className="block text-[11px] font-bold uppercase text-slate-500">Check in</span>
              <input
                type="date"
                value={search.checkIn}
                onChange={(event) => setSearch({ ...search, checkIn: event.target.value })}
                className="mt-1 w-full text-sm font-semibold outline-none"
              />
            </span>
          </label>
          <label className="flex min-h-16 items-center gap-3 rounded-xl border-slate-200 px-3 hover:bg-slate-50 lg:border-l">
            <CalendarDays className="shrink-0 text-blue-700" size={20} />
            <span className="flex-1">
              <span className="block text-[11px] font-bold uppercase text-slate-500">Check out</span>
              <input
                type="date"
                value={search.checkOut}
                onChange={(event) => setSearch({ ...search, checkOut: event.target.value })}
                className="mt-1 w-full text-sm font-semibold outline-none"
              />
            </span>
          </label>
          <label className="flex min-h-16 items-center gap-3 rounded-xl border-slate-200 px-3 hover:bg-slate-50 lg:border-l">
            <Users className="shrink-0 text-blue-700" size={20} />
            <span className="flex-1">
              <span className="block text-[11px] font-bold uppercase text-slate-500">Guests</span>
              <select
                value={search.guests}
                onChange={(event) => setSearch({ ...search, guests: event.target.value })}
                className="mt-1 w-full text-sm font-semibold outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>{count} Guest{count > 1 ? "s" : ""}</option>
                ))}
              </select>
            </span>
          </label>
          <button
            type="submit"
            className="flex min-h-16 items-center justify-center gap-2 rounded-xl bg-blue-700 px-7 text-sm font-bold text-white hover:bg-blue-800"
          >
            <Search size={18} />
            Search
          </button>
        </form>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-slate-200">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-300" />
            Secure reservation
          </span>
          <span className="inline-flex items-center gap-2">
            <Headphones size={16} className="text-blue-300" />
            Booking support
          </span>
          <span>Verified hotel properties</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
