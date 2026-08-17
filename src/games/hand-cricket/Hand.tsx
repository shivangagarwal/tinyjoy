/**
 * A chunky cartoon hand showing 1–6 "fingers" (6 = all five + a spark),
 * or a closed fist while a pick is still secret.
 */
export default function Hand({
  n,
  color,
  size = 112,
  className = '',
}: {
  /** 1–6, or null for a closed fist */
  n: number | null;
  color: string;
  size?: number;
  className?: string;
}) {
  const shade = 'rgba(0,0,0,0.18)';
  // index, middle, ring, pinky — x positions and full heights
  const fingers = [
    { x: 30, h: 46 },
    { x: 45, h: 52 },
    { x: 60, h: 47 },
    { x: 75, h: 38 },
  ];
  const raised = n === null ? 0 : Math.min(n, 4);
  const thumbUp = n !== null && n >= 5;
  const spark = n === 6;

  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {/* thumb */}
      <g transform={thumbUp ? 'rotate(-38 26 74)' : 'rotate(-5 26 74)'}>
        <rect
          x="16"
          y={thumbUp ? 40 : 58}
          width="14"
          height={thumbUp ? 40 : 22}
          rx="7"
          fill={color}
          stroke={shade}
          strokeWidth="1.5"
        />
      </g>
      {/* palm */}
      <rect x="24" y="58" width="60" height="46" rx="16" fill={color} stroke={shade} strokeWidth="1.5" />
      {/* fingers */}
      {fingers.map((f, i) => {
        const up = i < raised;
        const h = up ? f.h : 14;
        return (
          <rect
            key={i}
            x={f.x - 6}
            y={64 - h}
            width="13"
            height={h + 8}
            rx="6.5"
            fill={color}
            stroke={shade}
            strokeWidth="1.5"
          />
        );
      })}
      {/* knuckle line */}
      <path d="M32 70 Q54 64 78 70" stroke={shade} strokeWidth="1.5" fill="none" />
      {spark && (
        <g fill="#FDE047">
          <path d="M88 8 L91 18 L100 20 L91 23 L88 33 L85 23 L76 20 L85 18 Z" />
          <circle cx="12" cy="30" r="3" />
          <circle cx="94" cy="44" r="2.5" />
        </g>
      )}
    </svg>
  );
}
