import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-charcoal to-[#1e1e2e] px-4 text-center">
      <p className="font-orbitron text-xs tracking-[0.5em] text-purpleLight">BEYOND REMEDY</p>
      <h1 className="mt-4 font-orbitron text-4xl font-bold text-ivory md:text-5xl">BioAge Platform</h1>
      <p className="mt-4 max-w-md font-poppins text-sandstone">
        Clinical-grade biological age assessment. Physician-supervised. Built for longevity medicine.
      </p>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="mt-10 min-h-[44px] rounded-pill bg-purple px-10 font-orbitron text-sm font-semibold tracking-widest shadow-glow transition hover:bg-purpleDark"
          >
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/patient/intake"
            className="min-h-[44px] rounded-pill bg-purple px-8 py-3 font-orbitron text-sm font-semibold tracking-wider shadow-glow"
          >
            Patient Portal
          </Link>
          <Link
            to="/clinician/dashboard"
            className="min-h-[44px] rounded-pill border border-purple/50 px-8 py-3 font-orbitron text-sm tracking-wider text-purpleLight"
          >
            Clinician Portal
          </Link>
        </div>
      </SignedIn>
    </div>
  );
}
