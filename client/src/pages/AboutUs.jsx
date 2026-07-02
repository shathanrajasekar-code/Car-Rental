import React from 'react';
import { Compass, Users, Award, ShieldCheck } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl bg-slate-950 text-white overflow-hidden p-8 sm:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/30 via-slate-900 to-slate-950"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-primary-400">Our Story</span>
          <h1 className="text-3xl sm:text-5xl font-black font-sans leading-tight">
            Democratizing Travel Across <span className="text-primary-400">Tamil Nadu</span> & Beyond
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Founded with a vision to connect local communities and cities, Bharath Rental System is India's premium self-drive car rental agency. We focus on bridging travel gaps by offering accessible location-centric vehicle rentals.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <h3 className="text-3xl font-black text-primary-600">15+</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Indian Fleet Models</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <h3 className="text-3xl font-black text-primary-600">5+</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tamil Nadu Hubs</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <h3 className="text-3xl font-black text-primary-600">10,000+</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Happy Indian Drivers</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <h3 className="text-3xl font-black text-primary-600">100%</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Insured Self-Drive Cars</p>
        </div>
      </div>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
            <Compass size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Tamil Nadu Connectivity</h3>
          <p className="text-xs text-slate-500 leading-normal">
            With key operations established in Chennai, Coimbatore, Madurai, Trichy, and Salem, we provide specialized regional travel networks for local communities and tourists alike.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Advanced Safety Measures</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Our fleet features state-of-the-art telemetry including SafarLock speed monitors, real-time geofencing, and comprehensive sanitization procedures for every single booking.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero Hidden Fee Guarantee</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Enjoy full billing transparency with clear breakdown panels listing daily rental rates, pre-paid FASTag toll estimates, refundable security deposits, and carbon offsets.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
