import type { IntakeSection } from '@br-bioage/shared';

interface SectionNavProps {
  sections: IntakeSection[];
  currentIndex: number;
  completed: Set<string>;
  onSelect: (index: number) => void;
}

export function SectionNav({ sections, currentIndex, completed, onSelect }: SectionNavProps) {
  return (
    <>
      <nav className="hidden w-56 shrink-0 space-y-1 md:block">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(i)}
            className={`flex w-full min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
              i === currentIndex ? 'bg-purple/20 text-ivory' : 'text-sandstone hover:bg-white/5'
            }`}
          >
            <span className={completed.has(s.id) ? 'text-brGreen' : 'text-brMuted'}>
              {completed.has(s.id) ? '✓' : '○'}
            </span>
            <span className="truncate font-poppins">{s.title}</span>
          </button>
        ))}
      </nav>
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-borderDark bg-charcoal/95 p-3 md:hidden">
        <p className="section-label mb-2 text-center">
          Section {currentIndex + 1} of {sections.length}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(i)}
              className={`shrink-0 rounded-pill px-3 py-2 text-xs font-orbitron ${
                i === currentIndex ? 'bg-purple text-ivory' : 'bg-white/5 text-sandstone'
              }`}
            >
              {completed.has(s.id) ? '✓ ' : ''}
              {s.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
