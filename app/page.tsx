import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F8F4F0] to-[#e8e0d8] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#333333] mb-6">
              Welcome to <span className="text-[#FF6B35]">Quick Table</span>
            </h1>
            <p className="text-xl sm:text-2xl text-[#333333] mb-8 max-w-3xl mx-auto">
              Experience culinary excellence where every dish tells a story of passion, tradition, and innovation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/reservation"
                className="bg-[#FF6B35] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#e55a2b] transition-all transform hover:scale-105 shadow-lg"
              >
                Reserve Your Table
              </Link>
              <Link
                href="/menu"
                className="bg-white text-[#333333] px-8 py-4 rounded-full text-lg font-semibold border-2 border-[#333333] hover:bg-[#333333] hover:text-white transition-all shadow-md"
              >
                View Menu
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-4xl font-bold text-center text-[#333333] mb-12">
      Why Choose <span className="text-[#FF6B35]">Quick Table</span>?
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Feature 1 */}
      <div className="text-center p-6 rounded-lg bg-[#F8F4F0] hover:shadow-xl transition-shadow">
        <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-[#333333] mb-3">Easy Online Booking</h3>
        <p className="text-[#333333] opacity-80">
          Customers can reserve a table in seconds without calling, giving them a fast and stress-free booking experience.
        </p>
      </div>

      {/* Feature 2 */}
      <div className="text-center p-6 rounded-lg bg-[#F8F4F0] hover:shadow-xl transition-shadow">
        <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-[#333333] mb-3">Real-Time Availability</h3>
        <p className="text-[#333333] opacity-80">
          Guests instantly see which tables are available, helping them choose the perfect time without guesswork.
        </p>
      </div>

      {/* Feature 3 */}
      <div className="text-center p-6 rounded-lg bg-[#F8F4F0] hover:shadow-xl transition-shadow">
        <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-[#333333] mb-3">Instant Confirmation</h3>
        <p className="text-[#333333] opacity-80">
          Every reservation is confirmed immediately, so customers feel confident and ready for their visit.
        </p>
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
