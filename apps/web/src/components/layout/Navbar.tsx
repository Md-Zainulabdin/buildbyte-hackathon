import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/" className="font-serif text-2xl text-charcoal">
          Kaarvan
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to="/opportunities"
            className="text-sm text-gray-500 transition hover:text-charcoal"
          >
            Opportunities
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link
                to="/applications"
                className="text-sm text-gray-500 transition hover:text-charcoal"
              >
                Applications
              </Link>
              <Link
                to="/profile/create"
                className="text-sm text-gray-500 transition hover:text-charcoal"
              >
                Profile
              </Link>
              <Link
                to="/dashboard"
                className="hidden text-sm text-gray-500 transition hover:text-charcoal sm:block"
              >
                {user?.name}
              </Link>
              <button
                onClick={logout}
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
