import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "motion/react";
import { MapPin, Star } from "lucide-react";

const MostPicked = () => {
  const { hotelData } = useContext(AppContext);
  const navigate = useNavigate();
  const popularHotels = [...(hotelData || [])]
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
    .slice(0, 8);

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Traveller favourites</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Popular hotels</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/hotels")}
            className="hidden text-sm font-bold text-blue-700 hover:text-blue-900 sm:block"
          >
            View all hotels
          </button>
        </div>

        {popularHotels.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
            Popular hotels will appear here after properties are listed.
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {popularHotels.map((item, index) => (
          <motion.div
            key={index}
            onClick={() => navigate(`/hotel/${item._id || item.id}`)}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-52 overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {item.rating || 4.5}
              </span>
            </div>
            <div className="p-4 text-left">
              <h3 className="truncate font-bold text-slate-900">{item.name}</h3>
              <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-slate-500">
                <MapPin size={13} className="mt-1 shrink-0 text-blue-700" />
                <span className="line-clamp-1">{item.address}</span>
              </p>
              <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Starting from</span>
                <span className="text-base font-bold text-slate-950">₹{item.price}<span className="text-xs font-normal text-slate-500"> / night</span></span>
              </div>
            </div>
          </motion.div>
        ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default MostPicked;