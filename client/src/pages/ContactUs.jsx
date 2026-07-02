import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setSubmitted(false);
        alert('Thank you for contacting Bharath Rentals! Our local team will respond within 24 hours.');
      }, 1000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Contact Local Support</h1>
        <p className="text-slate-500 mt-1">Get in touch with our Tamil Nadu and regional metro office teams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Our Main Offices</h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="text-primary-600 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Chennai Corporate Hub</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    45 Anna Salai, Teynampet, Chennai, Tamil Nadu - 600018
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="text-primary-600 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Coimbatore Branch</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    102 Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641004
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="text-primary-600 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Bengaluru Support Center</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    89 Residency Road, MG Road Area, Bengaluru, Karnataka - 560025
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-primary-600" />
                <span className="font-semibold text-slate-800">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-primary-600" />
                <span className="font-semibold text-slate-800">support@bharathrentals.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Send an Inquiry</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-950 text-sm"
                placeholder="e.g. Ramesh Kumar"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-950 text-sm"
                placeholder="e.g. ramesh@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Your Message</label>
              <textarea
                required
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-950 text-sm"
                placeholder="Describe your inquiry, booking issues, or feedback..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitted}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-55 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-primary-100"
            >
              <Send size={16} />
              <span>{submitted ? 'Sending Inquiry...' : 'Submit Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
