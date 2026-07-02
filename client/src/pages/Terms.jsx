import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-white my-10 rounded-3xl border border-slate-100 shadow-sm">
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Terms & Conditions</h1>
        <p className="text-slate-500 mt-1">Please read these rules carefully before booking a self-drive vehicle.</p>
      </div>

      <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">1. Eligibility Criteria</h3>
          <p>
            To rent a vehicle from Bharath Rental System, the driver must be at least 18 years of age and hold a valid Indian Light Motor Vehicle (LMV) Driving License. The license must be uploaded and verified during registration.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">2. Refundable Security Deposit</h3>
          <p>
            A security deposit of ₹5,000 is pre-charged at checkout to cover any incidental damages, cleaning fines, or traffic violations. This deposit is fully refunded to the source card/bank account within 48 hours of vehicle return.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">3. SafarLock speed monitors & Fines</h3>
          <p>
            All vehicles are equipped with SafarLock speed sensors. Safe driving speeds are capped at 80 km/h in city areas and 120 km/h on expressways. Violations trigger automatic geo-fencing warning notifications. An overspeeding penalty of ₹2,000 per alert will be deducted from the security deposit.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">4. FASTag & Toll Plaza Crossings</h3>
          <p>
            FASTag tolls can be estimated and pre-paid at checkout. If pre-paid, toll crossings are automatically deducted from your pre-paid toll gate balance. Any unpaid toll dues accumulated during the trip will be billed separately or adjusted against your security deposit.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">5. RTO Guidelines & Safety</h3>
          <p>
            The vehicle must only be driven by the registered customer. Carrying hazardous materials, smoking inside the vehicle, or driving under the influence is strictly prohibited. Violators will face immediate booking termination and legal penalties.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
