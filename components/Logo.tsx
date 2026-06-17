/* Verbadium logo: an element-tile mark ("Vb", periodic-symbol style) + a
   display wordmark. The mark is a self-contained SVG; the wordmark is HTML so
   it reliably uses the loaded display font. */
export default function Logo({ variant = 'full', size = 34, className }: {
  variant?: 'full' | 'mark';
  size?: number;
  className?: string;
}) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="vb-mark">
      <defs>
        <linearGradient id="vbMark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0D5F2" />
          <stop offset="0.55" stopColor="#D3CBEC" />
          <stop offset="1" stopColor="#C7DCEE" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#vbMark)" />
      <text x="20" y="27.5" textAnchor="middle" fontFamily="var(--font-display), 'Hanken Grotesk', Verdana, sans-serif"
        fontWeight="700" fontSize="19" letterSpacing="-0.5" fill="#2A2438">Vb</text>
      <circle cx="31" cy="9.5" r="1.7" fill="#2A2438" opacity="0.45" />
    </svg>
  );
  if (variant === 'mark') return <span className={className}>{mark}</span>;
  return (
    <span className={`vb-logo${className ? ' ' + className : ''}`}>
      {mark}
      <span className="vb-logo-word">Verbadium</span>
    </span>
  );
}
