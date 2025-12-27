import Image from 'next/image';

export default function Hero() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Image
            src="/logo-hoa-ai.png"
            alt="HOA Letter AI Logo"
            width={48}
            height={48}
          />
          <span className="text-xl font-semibold tracking-tight">HOA Letter AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:text-green-600 transition">Features</a>
          <a href="#pricing" className="hover:text-green-600 transition">Pricing</a>
          <a href="#faq" className="hover:text-green-600 transition">FAQ</a>
        </nav>
      </header>

      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <Image
          src="/logo-hoa-ai.png"
          alt="HOA Letter AI Logo Large"
          width={120}
          height={120}
          className="mb-4"
        />
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Calm. Clear. Compliant. HOA Letters in Seconds.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Auto-cite your CC&Rs, brand with your letterhead, and email with confidence — no legalese required.
        </p>
        <button className="mt-8 rounded-md bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition">
          Draft My Notice
        </button>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create a Notice</h2>
        <form className="space-y-6 bg-white shadow-sm rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
            <input type="text" className="w-full rounded border-gray-300 focus:ring-green-600 focus:border-green-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select className="w-full rounded border-gray-300 focus:ring-green-600 focus:border-green-600">
              <option>Noise</option>
              <option>Parking</option>
              <option>Trash</option>
              <option>Landscaping</option>
              <option>Pet issue</option>
              <option>Unauthorized modification</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Letter Tone</label>
            <select className="w-full rounded border-gray-300 focus:ring-green-600 focus:border-green-600">
              <option>Friendly</option>
              <option>Neutral</option>
              <option>Firm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" className="w-full rounded border-gray-300 focus:ring-green-600 focus:border-green-600" />
          </div>
          <details className="border-t pt-4 transition-all duration-300 ease-in-out">
            <summary className="text-sm font-semibold text-gray-600 cursor-pointer">Advanced Options (optional)</summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cite Rule</label>
                <input type="text" className="w-full rounded border-gray-300 focus:ring-green-600 focus:border-green-600" placeholder="e.g., Section 4.2 Parking" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Letterhead</label>
                <textarea className="w-full rounded border-gray-300 focus:ring-green-600 focus:border-green-600" rows={3} placeholder="Optional letterhead text or HTML"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Upload</label>
                <input type="file" className="block w-full text-sm text-gray-500" />
              </div>
            </div>
          </details>
          <button type="submit" className="w-full mt-6 rounded-md bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition">
            Generate Letter
          </button>
        </form>
      </section>

      <footer className="text-center text-sm text-gray-500 py-10">
        &copy; {new Date().getFullYear()} HOA Letter AI &middot; Draft assistance only — not legal advice.
      </footer>
    </main>
  );
}