import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const picture = searchParams.get("picture");
    const id = searchParams.get("id");

    if (token && id && name && email) {
      login(token, { id, name, email, picture: picture || undefined });
      navigate("/profile/create", { replace: true });
    } else {
      console.error("[AuthCallback] missing params:", {
        token,
        id,
        name,
        email,
      });
      setError("Authentication failed. Please try signing in again.");
    }
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-4 font-serif text-4xl text-gray-900">
            Sign in failed
          </h1>
          <p className="mb-8 text-lg text-gray-500">{error}</p>
          <a
            href="/"
            className="inline-block rounded-full border border-gray-300 px-8 py-3 text-sm text-gray-600 transition hover:opacity-70"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto mb-6 h-8 w-8 animate-pulse rounded-full border-2 border-gray-300 border-t-gray-600" />
        <p className="font-serif text-2xl text-gray-500">
          Signing you in...
        </p>
      </div>
    </div>
  );
}
