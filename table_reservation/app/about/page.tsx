import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Our Story */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F8F4F0] to-[#e8e0d8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-6 text-center">
            Our <span className="text-[#FF6B35]">Story</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left side - Visual element */}
            <div className="relative">
              <div className="bg-white rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#333333]">Our Mission</h3>
                </div>
                <p className="text-[#333333] opacity-80 text-sm leading-relaxed">
                  To revolutionize how people book restaurants by making it faster, simpler, and more reliable than ever before.
                </p>
              </div>

              <div className="mt-4 bg-gradient-to-r from-[#FF6B35] to-[#ff8659] rounded-xl p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-white">Instant Bookings</h4>
                </div>
                <p className="text-white/90 text-xs">
                  Reserve your table in seconds, not minutes. No phone calls, no waiting.
                </p>
              </div>
            </div>

            {/* Right side - Story text */}
            <div className="space-y-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border-l-4 border-[#FF6B35] hover:bg-white transition-all duration-300">
                <h3 className="text-base font-bold text-[#333333] mb-2 flex items-center gap-2">
                  <span className="text-[#FF6B35]">✦</span> The Beginning
                </h3>
                <p className="text-[#333333] opacity-80 text-sm leading-relaxed">
                  Quick Table was born from a simple frustration: booking a table shouldn't require endless phone calls or guesswork. We created a platform where availability is instant and reservations are confirmed in seconds.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border-l-4 border-[#FF6B35] hover:bg-white transition-all duration-300">
                <h3 className="text-base font-bold text-[#333333] mb-2 flex items-center gap-2">
                  <span className="text-[#FF6B35]">✦</span> Today
                </h3>
                <p className="text-[#333333] opacity-80 text-sm leading-relaxed">
                  We're helping thousands of diners discover and book their perfect dining experiences while making restaurant management effortless. Every feature we build starts with one question: How can we make this easier?
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border-l-4 border-[#FF6B35] hover:bg-white transition-all duration-300">
                <h3 className="text-base font-bold text-[#333333] mb-2 flex items-center gap-2">
                  <span className="text-[#FF6B35]">✦</span> Our Promise
                </h3>
                <p className="text-[#333333] opacity-80 text-sm leading-relaxed">
                  Fast, reliable, and stress-free reservations every single time. We're constantly evolving to give you the best booking experience possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-6 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="bg-[#F8F4F0] p-4 rounded-lg text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#333333] mb-2">Customer Focus</h3>
              <p className="text-[#333333] opacity-80 text-xs">
                We prioritize ease, speed, and satisfaction in every reservation experience.
              </p>
            </div>

            <div className="bg-[#F8F4F0] p-4 rounded-lg text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v4m0 4v8m0-8h4m-4 0H8" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#333333] mb-2">Reliability</h3>
              <p className="text-[#333333] opacity-80 text-xs">
                Instant confirmations and real-time table availability ensure smooth bookings every time.
              </p>
            </div>

            <div className="bg-[#F8F4F0] p-4 rounded-lg text-center transform hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20l9-7-9-7-9 7 9 7z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#333333] mb-2">Innovation</h3>
              <p className="text-[#333333] opacity-80 text-xs">
                We continuously improve our platform to make reservations faster and more intuitive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-4">
            Experience Quick Table Today
          </h2>
          <p className="text-base text-[#333333] mb-6 opacity-80">
            Book your table instantly and enjoy a smooth, hassle-free dining experience.
          </p>
          <Link
            href="/reservation"
            className="inline-block bg-[#FF6B35] text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-[#e55a2b] transition-all transform hover:scale-105 shadow-lg"
          >
            Make a Reservation
          </Link>
        </div>
      </section>
    </main>
  );
}
