import { Outlet, Link } from "react-router-dom"

export default function Layout(){
  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col">
      <header className="w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/sacvpn-logo.svg" alt="SACVPN Logo" className="h-8 w-auto" />
            <span className="text-xl font-extrabold text-blue-700">SACVPN</span>
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link to="/pricing" className="hover:underline text-red-600">Pricing</Link>
            <Link to="/faq" className="hover:underline text-red-600">FAQ</Link>
            <Link to="/about" className="hover:underline text-red-600">About</Link>
            <Link to="/contact" className="hover:underline text-red-600">Contact</Link>
            <Link to="/login" className="font-semibold text-red-600">Login</Link>
          </nav>
        </div>
      </header>

      {/* MAIN centered content */}
      <main className="flex-1 w-full flex items-center justify-center">
        <div className="max-w-7xl w-full px-6 py-12">
          <Outlet/>
        </div>
      </main>

      <footer className="w-full border-t border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-6 py-6 text-sm text-gray-500">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
            <span>© {new Date().getFullYear()} SACVPN — All rights reserved.</span>
            <nav className="flex gap-4">
              <Link to="/pricing" className="hover:underline">Pricing</Link>
              <Link to="/faq" className="hover:underline">FAQ</Link>
              <Link to="/about" className="hover:underline">About</Link>
              <Link to="/contact" className="hover:underline">Contact</Link>
            </nav>
          </div>
          <div className="flex flex-wrap gap-4 items-center justify-center border-t border-gray-200 pt-4">
            <Link to="/terms" className="hover:underline font-medium">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:underline font-medium">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
