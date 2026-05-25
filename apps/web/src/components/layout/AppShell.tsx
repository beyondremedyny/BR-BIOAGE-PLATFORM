import { Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal to-[#1e1e2e]">
      <header className="sticky top-0 z-40 border-b border-borderDark bg-charcoal/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-orbitron text-sm tracking-[0.3em] text-purpleLight">
            BEYOND REMEDY
          </Link>
          {title && <p className="hidden font-orbitron text-xs text-sandstone sm:block">{title}</p>}
          <UserButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
