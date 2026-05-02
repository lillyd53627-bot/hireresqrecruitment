export default function AffiliateLanding() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">

      <div className="text-center max-w-4xl mx-auto">
        
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/HireResQ.png" 
            alt="HireResQ Logo" 
            className="mx-auto h-28"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Earn Real Income Promoting <br />
          <span className="text-red-500">AI-Powered Hiring Tools</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join the <span className="text-red-500 font-semibold">HireResQ Affiliate Program</span> and earn 
          <strong>40% commission</strong> on every sale + recurring monthly income.
        </p>

        <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8 mb-10 max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-white">💰 Earn R8,000 to R15,000+ Per Week</h2>
          <p className="text-2xl text-red-500 font-semibold mb-2">
            With just a few successful referrals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left max-w-3xl mx-auto">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-red-600/20">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2 text-white">Who You Promote To</h3>
            <p className="text-gray-400 text-sm">
              Recruiters, Employment Agencies, HR Consultants & Entrepreneurs who want to grow their recruitment business.
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl border border-red-600/20">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2 text-white">What They Get</h3>
            <p className="text-gray-400 text-sm">
              A powerful AI hiring platform that helps them source, screen, and place candidates faster and cheaper.
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl border border-red-600/20">
            <div className="text-4xl mb-3">💸</div>
            <h3 className="font-semibold mb-2 text-white">Your Commission</h3>
            <p className="text-gray-400 text-sm">
              Earn <strong>40% upfront</strong> + recurring revenue every month they stay subscribed.
            </p>
          </div>
        </div>

        <a
          href="/affiliate/register"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:scale-105"
        >
          Join the Affiliate Program – Start Earning Today
        </a>

        <p className="mt-8 text-gray-400 text-sm">
          No upfront cost • Weekly payouts • Full marketing support provided
        </p>
      </div>
    </div>
  );
}