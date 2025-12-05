import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop')`,
            filter: 'blur(2px)',
          }}
        ></div>
        <div className="absolute inset-0 z-0 bg-black/50"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            About <span className="text-[#FF6B35]">Quick Table</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            We make dining out simple. Book your table in seconds.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[#FF6B35] font-semibold text-sm uppercase tracking-wider">Our Story</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] mt-2 mb-6">How It Started</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Quick Table was born from a simple frustration: booking a restaurant table shouldn&apos;t require endless phone calls or uncertainty. We built a platform where you can see real-time availability and confirm your reservation in seconds. Today, we connect thousands of diners with great restaurants every day.
          </p>
        </div>
      </section>

      {/* Vision & Goals */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#FF6B35] font-semibold text-sm uppercase tracking-wider">What Drives Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] mt-3 mb-4">
              Our Vision & <span className="text-[#FF6B35]">Goals</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Vision */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]/20 hover:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8c5a] rounded-2xl rotate-45 flex items-center justify-center shadow-lg group-hover:rotate-[55deg] transition-transform duration-300">
                  <svg className="w-8 h-8 text-white -rotate-45 group-hover:-rotate-[55deg] transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="text-center pt-8">
                <h3 className="text-xl font-bold text-[#333333] mb-3">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To be the leading platform for restaurant reservations, where every diner finds their perfect table and every restaurant fills their seats effortlessly.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Goals */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]/20 hover:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8c5a] rounded-2xl rotate-45 flex items-center justify-center shadow-lg group-hover:rotate-[55deg] transition-transform duration-300">
                  <svg className="w-8 h-8 text-white -rotate-45 group-hover:-rotate-[55deg] transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="text-center pt-8">
                <h3 className="text-xl font-bold text-[#333333] mb-3">Our Goals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Deliver instant bookings, real-time availability, and seamless confirmations. We aim to make every reservation fast, reliable, and stress-free for guests and restaurants alike.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Experience Quick Table?
          </h2>
          <p className="text-white/90 mb-5">
            Join thousands of happy diners. Book your table in seconds.
          </p>
          <Link
            href="/reservation"
            className="inline-flex items-center gap-2 bg-white text-[#FF6B35] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Make a Reservation
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
