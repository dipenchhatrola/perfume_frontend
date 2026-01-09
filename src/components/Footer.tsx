import React from 'react'

const Footer = () => {
  return (
    <div>
      
      {/* 10. FOOTER */}
      <footer className="bg-[#1a1a1a] text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif mb-6 italic tracking-wider">Join the Inner Circle</h3>
            <p className="text-stone-400 text-sm mb-8 max-w-sm">Be the first to know about private launches and olfactory workshops.</p>
            <div className="flex border-b border-stone-700 pb-2 max-w-md">
              <input type="email" placeholder="Email Address" className="bg-transparent w-full focus:outline-none text-sm" />
              <button className="uppercase text-[10px] tracking-widest hover:text-stone-400 transition">Subscribe</button>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-6 font-bold">Concierge</h4>
            <ul className="text-stone-400 text-sm space-y-4">
              <li className="hover:text-white cursor-pointer transition">Track Order</li>
              <li className="hover:text-white cursor-pointer transition">Returns</li>
              <li className="hover:text-white cursor-pointer transition">Gifting</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-6 font-bold">Legal</h4>
            <ul className="text-stone-400 text-sm space-y-4">
              <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer transition">Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-stone-800 text-[10px] uppercase tracking-[0.3em] text-stone-600 text-center">
          © 2025 AURA FRAGRANCES.
        </div>
      </footer>
    </div>
  )
}

export default Footer
