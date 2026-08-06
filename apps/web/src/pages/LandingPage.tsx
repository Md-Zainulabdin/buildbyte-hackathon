import Badge from "../components/ui/Badge";
import { GOOGLE_AUTH_URL } from "../constants";

export default function LandingPage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />
      <FooterSection />
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
            className="inline-flex items-center gap-3 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Post a need",
      description: "Describe what you need help with, set a deadline, and choose whether it's paid or volunteer.",
    },
    {
      number: "02",
      title: "Get matched",
      description: "Skilled people in your community find and apply to your opportunity.",
    },
    {
      number: "03",
      title: "Complete & grow",
      description: "Work gets done, trust is built, and your community becomes stronger.",
    },
  ];

  return (
    <section className="border-t border-border px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <Badge>How it works</Badge>
          <h2 className="mt-5 font-serif text-[clamp(28px,5vw,48px)] leading-[1.1] tracking-tight text-charcoal">
            Three simple steps
          </h2>
        </div>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <span className="font-serif text-5xl text-sky-500/30">{step.number}</span>
              <h3 className="mt-4 font-serif text-2xl text-charcoal">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="border-t border-border bg-surface px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid gap-8 text-center md:grid-cols-3">
          <div>
            <p className="font-serif text-[clamp(36px,5vw,56px)] leading-none text-sky-500">12</p>
            <p className="mt-3 text-sm font-medium tracking-[0.1em] text-gray-500 uppercase">Cities active</p>
          </div>
          <div>
            <p className="font-serif text-[clamp(36px,5vw,56px)] leading-none text-sky-500">50+</p>
            <p className="mt-3 text-sm font-medium tracking-[0.1em] text-gray-500 uppercase">Skills listed</p>
          </div>
          <div>
            <p className="font-serif text-[clamp(36px,5vw,56px)] leading-none text-sky-500">100%</p>
            <p className="mt-3 text-sm font-medium tracking-[0.1em] text-gray-500 uppercase">Community driven</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Hyperlocal matching",
      description: "Opportunities are tied to specific cities and areas, so you find help close to home.",
    },
    {
      title: "Skill-based discovery",
      description: "Post opportunities by required skills, and find people who actually match what you need.",
    },
    {
      title: "Paid or volunteer",
      description: "Both paid gigs and volunteer opportunities live here. Choose what works for you.",
    },
  ];

  return (
    <section className="border-t border-border px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <Badge>Why Kaarvan</Badge>
          <h2 className="mt-5 font-serif text-[clamp(28px,5vw,48px)] leading-[1.1] tracking-tight text-charcoal">
            Built for local communities
          </h2>
        </div>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <h3 className="font-serif text-xl text-charcoal">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-t border-border px-6 py-24 text-center sm:py-32">
      <div className="mx-auto max-w-[520px]">
        <Badge>Get started</Badge>
        <h2 className="mt-5 font-serif text-[clamp(28px,5vw,48px)] leading-[1.1] tracking-tight text-charcoal">
          Ready to join your community?
        </h2>
        <p className="mx-auto mt-4 max-w-[380px] text-sm leading-relaxed text-gray-500">
          Sign up in seconds and start posting or applying to opportunities near you.
        </p>
        <div className="mt-8">
          <a
            href={GOOGLE_AUTH_URL}
            className="inline-flex items-center gap-3 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-black/90"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between text-xs text-gray-400">
        <span className="font-serif text-base text-charcoal">Kaarvan</span>
        <span>&copy; {new Date().getFullYear()} Kaarvan. All rights reserved.</span>
      </div>
    </footer>
  );
}
