import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GOOGLE_AUTH_URL } from "../../constants";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 sm:px-10">
        <Link
          to="/"
          className="font-serif text-2xl text-charcoal"
        >
          SkillBridge
        </Link>

        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-gray-500 sm:block">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#333]"
              >
                Sign out
              </button>
            </>
          ) : (
            <a
              href={GOOGLE_AUTH_URL}
              className="rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#333]"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
