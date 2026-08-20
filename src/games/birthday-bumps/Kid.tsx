/**
 * The birthday kid, mid-bumps stance: hands down, bum up, grinning the whole
 * time. Cartoon-happy on purpose — this is a party, not a punishment.
 */
export default function Kid({
  guarding,
  hitFlash,
  size = 190,
}: {
  /** Hands over the bum — swings get blocked */
  guarding: boolean;
  /** Brief red comic flash on the shorts after a landed bump */
  hitFlash: boolean;
  size?: number;
}) {
  const skin = '#F4C58F';
  const shirt = '#26A69A';
  const shorts = '#F97316';
  const hat = '#D946EF';

  return (
    <svg viewBox="0 0 200 170" width={size} height={size * 0.85} aria-hidden>
      {/* legs */}
      <rect x="118" y="102" width="16" height="52" rx="8" fill={skin} />
      <rect x="142" y="102" width="16" height="52" rx="8" fill={skin} />
      <rect x="114" y="148" width="24" height="12" rx="6" fill="#3A3A3A" />
      <rect x="138" y="148" width="24" height="12" rx="6" fill="#3A3A3A" />

      {/* bum (the target) */}
      <g>
        <circle cx="126" cy="86" r="24" fill={shorts} />
        <circle cx="150" cy="84" r="26" fill={shorts} />
        {hitFlash && (
          <>
            <circle cx="140" cy="85" r="30" fill="#EF4444" opacity="0.55" />
            <path d="M175 60 l10 -12 M182 76 l14 -6 M170 48 l4 -14" stroke="#FDE047" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
      </g>

      {/* torso, bending forward */}
      <rect x="52" y="66" width="86" height="34" rx="17" fill={shirt} transform="rotate(8 95 83)" />

      {/* arms reaching down to knees */}
      <rect x="58" y="86" width="12" height="42" rx="6" fill={skin} transform="rotate(14 64 107)" />
      <rect x="76" y="88" width="12" height="42" rx="6" fill={skin} transform="rotate(6 82 109)" />

      {/* head, laughing */}
      <circle cx="46" cy="66" r="20" fill={skin} />
      <path d="M34 60 q4 -6 10 -4" stroke="#3A3A3A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M36 72 q8 10 16 2" stroke="#3A3A3A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* party hat */}
      <path d="M40 48 L52 22 L62 46 Z" fill={hat} />
      <circle cx="52" cy="21" r="4.5" fill="#FDE047" />

      {/* guard: hands slapped over the bum */}
      {guarding && (
        <g>
          <rect x="150" y="40" width="12" height="40" rx="6" fill={skin} transform="rotate(-30 156 60)" />
          <circle cx="132" cy="74" r="11" fill={skin} stroke="#D9A566" strokeWidth="2" />
          <circle cx="154" cy="70" r="11" fill={skin} stroke="#D9A566" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
