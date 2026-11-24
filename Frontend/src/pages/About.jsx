import React from 'react'
import { Building2, BadgeCheck, Search, CalendarCheck, ShieldCheck, Headphones, MapPin, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const About = () => {
  const features = [
    {
      icon: <Building2 className="w-6 h-6 text-blue-700" />,
      title: "Wide Range of Stays",
      description: "Explore top-rated hotels, private rooms, and comfortable accommodations tailored for you."
    },
    {
      icon: <BadgeCheck className="w-6 h-6 text-blue-700" />,
      title: "Clear Pricing",
      description: "Get the best value for your money with stays that perfectly fit your budget."
    },
    {
      icon: <Search className="w-6 h-6 text-blue-700" />,
      title: "Easy Search",
      description: "Quickly filter and find ideal hotels based on your unique preferences and requirements."
    },
    {
      icon: <CalendarCheck className="w-6 h-6 text-blue-700" />,
      title: "Simple Booking",
      description: "Seamless reservation process—book your dream stay in just a few clicks."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-700" />,
      title: "Secure Experience",
      description: "100% safe, reliable, and transparent booking process with zero hassle."
    },
    {
      icon: <Headphones className="w-6 h-6 text-blue-700" />,
      title: "Guest Support",
      description: "Curated properties focused on comfort, cleanliness, and superior guest experiences."
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">About UrbanStay</p>
            <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Hotel booking made clear and simple
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              UrbanStay helps travellers find verified hotels and suitable rooms, compare important details and complete a booking without unnecessary steps.
            </p>
            <Link to="/hotels" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">
              Explore hotels <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&fit=crop"
              alt="Hotel exterior"
              className="h-72 w-full rounded-2xl object-cover"
            />
            <div className="grid gap-3">
              <img
                src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&fit=crop"
                alt="Hotel room"
                className="h-[137px] w-full rounded-2xl object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&fit=crop"
                alt="Hotel suite"
                className="h-[137px] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Our purpose</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">A dependable way to plan your stay</h2>
          </div>
          <p className="text-base leading-7 text-slate-600">
            We focus on practical decisions: location, room capacity, availability, transparent total price and clear payment choices. Property owners receive bookings directly through their dashboard and can view guest details before arrival.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, index) => (
              <article key={index} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
        </div>

        <div className="mt-14 flex flex-col justify-between gap-6 rounded-2xl bg-slate-900 px-6 py-8 text-white md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="text-2xl font-bold">Ready to find your next stay?</h2>
            <p className="mt-2 text-sm text-slate-300">Search available hotels and compare rooms in one place.</p>
          </div>
          <Link to="/hotels" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-900">
            <MapPin size={16} /> Browse destinations
          </Link>
        </div>
      </section>
    </main>
  )
}

export default About