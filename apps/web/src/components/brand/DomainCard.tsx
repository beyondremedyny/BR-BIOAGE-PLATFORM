import type { ScoredMarker } from '@br-bioage/shared';
import { formatDelta } from '@br-bioage/shared';
import { MarkerRow } from './MarkerRow';

const DOMAIN_TITLES: Record<string, string> = {
  d1: 'Metabolic Health',
  d2: 'Cardiovascular & Autonomic',
  d3: 'Hormonal & Endocrine',
  d4: 'Cellular & Epigenetic',
  d5: 'Functional & Lifestyle',
};

interface DomainCardProps {
  domain: string;
  delta: number | null;
  markers: ScoredMarker[];
}

export function DomainCard({ domain, delta, markers }: DomainCardProps) {
  const hasData = delta !== null || markers.length > 0;

  return (
    <div className="overflow-hidden rounded-card border border-borderDark bg-cardDark shadow-card">
      <div className="bg-gradient-to-r from-purpleDark to-purple px-5 py-4">
        <p className="section-label text-purpleLight/80">{domain.toUpperCase()}</p>
        <h3 className="font-orbitron text-lg font-semibold text-ivory">{DOMAIN_TITLES[domain] ?? domain}</h3>
        <p className="mt-1 font-orbitron text-2xl font-bold">
          {hasData ? formatDelta(delta) : 'Pending — Labs Required'}
        </p>
      </div>
      <div className="px-5 py-2">
        {markers.length > 0 ? (
          markers.map((m) => <MarkerRow key={m.id} marker={m} />)
        ) : (
          <p className="py-6 text-center text-sm text-brMuted">Pending — Labs Required</p>
        )}
      </div>
    </div>
  );
}
