import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback, refreshUser, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (handled) return;
    const code = searchParams.get("code");
    const token = searchParams.get("token");
    const redirect = searchParams.get("redirect");

    async function process() {
      try {
        if (code) {
          await handleGoogleCallback(code);
        } else if (token) {
        }
        await refreshUser();
        if (isAuthenticated) {
          navigate(redirect || "/dashboard", { replace: true });
        } else {
          navigate("/profile/create", { replace: true });
        }
      } catch (e) {
        console.error("[AuthCallback] error:", e);
        setError("Authentication failed. Please try signing in again.");
      } finally {
        setHandled(true);
      }
    }

    process();
  }, [searchParams, handleGoogleCallback, refreshUser, navigate, isAuthenticated, handled]);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-4 font-serif text-4xl text-gray-900">Sign in failed</h1>
          <p className="mb-8 text-lg text-gray-500">{error}</p>
          <a href="/" className="inline-block rounded-full border border-gray-300 px-8 py-3 text-sm text-gray-600 transition hover:opacity-70">
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
        <p className="font-serif text-2xl text-gray-500">Signing you in...</p>
      </div>
    </div>
  );
}