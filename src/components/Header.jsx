import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("user");

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/pricing", label: "Pricing" },
    { to: "/demo", label: "Demo" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQ" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TOP BAR */}
        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
          <Link to="/" className="text-2xl font-bold text-red-600">
            HireResQ AI
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? "text-red-600 font-medium"
                    : "text-gray-700 hover:text-red-600 font-medium"
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Dashboard (only if logged in) */}
            {isLoggedIn && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Dashboard
              </Link>
            )}

            {/* WhatsApp */}
            <a
              href="https://wa.me/0834676026"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </nav>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <Button onClick={handleLogout} className="bg-black text-white">
  Logout
</Button>

        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="text-gray-800 hover:text-red-600"
              >
                {link.label}
              </NavLink>
            ))}

            {isLoggedIn && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-gray-800 hover:text-red-600"
              >
                Dashboard
              </Link>
            )}

            <a
              href="https://wa.me/0834676026"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white text-center py-3 rounded-xl"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}