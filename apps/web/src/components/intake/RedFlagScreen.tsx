export function RedFlagScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-card border border-brRed/40 bg-brRed/10 p-8 text-center shadow-glow">
      <p className="section-label text-brRed">Clinical Safety</p>
      <h2 className="mt-4 font-orbitron text-xl font-bold text-ivory">
        Your Responses Require Immediate Clinical Attention
      </h2>
      <p className="mt-4 font-poppins text-sm leading-relaxed text-sandstone">
        Based on your answers, this assessment cannot continue online. Please contact Beyond Remedy
        immediately or seek emergency care if you are experiencing a medical emergency.
      </p>
      <div className="mt-8 space-y-2 font-orbitron text-lg font-bold text-ivory">
        <p>📞 (516) 555-0199</p>
        <p className="text-sm font-poppins font-normal text-sandstone">beyondremedyny.com</p>
      </div>
      <p className="mt-6 text-xs text-brMuted">
        If this is an emergency, call 911 or go to your nearest emergency department.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 cursor-pointer rounded-card border border-brMuted px-6 py-2 font-poppins text-sm text-brMuted transition-colors hover:text-ivory"
      >
        Go Back & Correct My Answer
      </button>
    </div>
  );
}
