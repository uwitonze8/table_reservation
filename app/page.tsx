import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Blurred Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Base (Not Blurred) */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')`,
          }}
        ></div>
        {/* Top Blur Overlay with Gradient Fade */}
        <div
          className="absolute inset-x-0 top-0 h-[60%] z-0"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
          }}
        ></div>
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 z-0 bg-black/60"></div>

        {/* Content - Centered */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Welcome to <span className="text-[#FF6B35]">Quick Table</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-3xl drop-shadow-md">
            Experience culinary excellence where every dish tells a story of passion, tradition, and innovation
          </p>
          <Link
            href="/reservation"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] text-white px-10 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <span>Reserve Your Table</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-[#FF6B35] font-semibold text-sm uppercase tracking-wider">Our Advantages</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#333333] mt-3 mb-4">
              Why Choose <span className="text-[#FF6B35]">Quick Table</span>?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We make restaurant reservations simple, fast, and reliable for both guests and businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

            {/* Feature 1 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]/20 hover:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8c5a] rounded-2xl rotate-45 flex items-center justify-center shadow-lg group-hover:rotate-[55deg] transition-transform duration-300">
                  <svg className="w-8 h-8 text-white -rotate-45 group-hover:-rotate-[55deg] transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-center pt-8">
                <h3 className="text-xl font-bold text-[#333333] mb-3">Easy Online Booking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Reserve a table in seconds without calling. Fast, simple, and stress-free booking experience.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]/20 hover:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8c5a] rounded-2xl rotate-45 flex items-center justify-center shadow-lg group-hover:rotate-[55deg] transition-transform duration-300">
                  <svg className="w-8 h-8 text-white -rotate-45 group-hover:-rotate-[55deg] transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-center pt-8">
                <h3 className="text-xl font-bold text-[#333333] mb-3">Real-Time Availability</h3>
                <p className="text-gray-600 leading-relaxed">
                  Instantly see which tables are available. Choose the perfect time without any guesswork.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]/20 hover:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8c5a] rounded-2xl rotate-45 flex items-center justify-center shadow-lg group-hover:rotate-[55deg] transition-transform duration-300">
                  <svg className="w-8 h-8 text-white -rotate-45 group-hover:-rotate-[55deg] transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-center pt-8">
                <h3 className="text-xl font-bold text-[#333333] mb-3">Instant Confirmation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every reservation is confirmed immediately. Feel confident and ready for your visit.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Hours & Location Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F4F0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Opening Hours */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-[#333333] mb-6">Opening Hours</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-[#333333] font-medium">Monday - Friday</span>
                  <span className="text-[#FF6B35] font-semibold">5:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-[#333333] font-medium">Saturday</span>
                  <span className="text-[#FF6B35] font-semibold">5:00 AM - 2:00 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#333333] font-medium">Sunday</span>
                  <span className="text-[#FF6B35] font-semibold">11:30 AM - 9:00 PM</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-[#333333] mb-6">Visit Us</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#FF6B35] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-[#333333] font-medium">Address</p>
                    <p className="text-[#333333] opacity-80">Kigali-Rwanda, Remera</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#FF6B35] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-[#333333] font-medium">Phone</p>
                    <p className="text-[#333333] opacity-80">+250 788 587 420</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#FF6B35] mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-[#333333] font-medium">Email</p>
                    <p className="text-[#333333] opacity-80">info@quicktable.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
