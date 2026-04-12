import { useState, useEffect } from "react";

export default function LimitedOfferBanner() {
  const [spotsLeft, setSpotsLeft] = useState(12);

  // Fake countdown (decreases every 30 seconds for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsLeft((prev) => (prev > 3 ? prev - 1 : 3));
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 text-center shadow-xl">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm uppercase tracking-widest font-medium mb-1">Limited Launch Offer</p>
        <h3 className="text-2xl font-bold mb-2">
          We’re only onboarding <span className="text-yellow-300">50 clients</span> at this special rate
        </h3>
        <div className="flex items-center justify-center gap-3 text-xl">
          <span>Only</span>
          <span className="bg-white text-red-700 font-bold px-5 py-1 rounded-full text-3xl tabular-nums">
            {spotsLeft}
          </span>
          <span>spots remaining</span>
        </div>
        <p className="mt-3 text-sm opacity-90">
          Once these spots are filled, prices increase and we close the launch cohort.
        </p>
        <a
          href="/pricing"
          className="mt-6 inline-block bg-white text-red-700 hover:bg-yellow-300 hover:text-red-700 font-semibold px-10 py-3.5 rounded-xl text-lg transition-all"
        >
          Secure My Spot Before It’s Gone →
        </a>
      </div>
    </div>
  );
}