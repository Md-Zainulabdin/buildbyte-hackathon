import Navbar from "../components/layout/Navbar";
import Badge from "../components/ui/Badge";
import { GOOGLE_AUTH_URL } from "../constants";

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <HeroSection />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function HeroSection() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="mx-auto max-w-[780px] pb-12 pt-16 text-center">
        <Badge>Community-powered help</Badge>
        <h1 className="mt-7 font-serif text-[clamp(40px,7vw,72px)] leading-[1.08] tracking-tight text-charcoal">
          Find trusted local people
          <br />
          to solve problems quickly.
        </h1>
        <p className="mx-auto mt-7 max-w-[420px] text-[15px] leading-relaxed text-gray-600">
          A platform that connects communities with skilled locals.
          Post a need, get help, build trust.
        </p>
        <div className="mt-10">
          <a
            href={GOOGLE_AUTH_URL}
            className="inline-flex items-center gap-3 rounded-full border border-[#E0E0E0] bg-white px-7 py-3.5 text-sm font-medium text-charcoal shadow-sm transition hover:border-[#CCC] hover:shadow-md"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
        </div>
      </div>
    </section>
  );
}
