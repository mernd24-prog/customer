export default function EmptyStateIllustration({ count = 0 }) {
  return (
    <svg viewBox="0 0 240 160" className="h-36 w-52 sm:h-40 sm:w-60" aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="145" rx="68" ry="8" fill="#EEE5CF" />
      <path d="M66 64 128 78 128 137 66 124Z" fill="#F6E6B3" />
      <path d="M128 78 174 61 174 119 128 137Z" fill="#DAA51C" />
      <path d="M66 64 112 47 174 61 128 78Z" fill="#987D3F" />
      <path d="M66 64 56 37 106 27 112 47Z" fill="#EAC66B" />
      <path d="M112 47 146 27 191 38 174 61Z" fill="#BE994C" />
      <rect x="78" y="105" width="32" height="14" rx="2" fill="#FFFDF7" transform="rotate(10 78 105)" />
      <path d="m86 111 16 3" stroke="#BE994C" strokeWidth="3" strokeLinecap="round" />
      <path d="M15 92h27m173-12h-27m15 15h-21" stroke="#EAC66B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="68" cy="63" r="21" fill="#211B69" stroke="white" strokeWidth="4" />
      <text x="68" y="70" textAnchor="middle" fill="white" fontSize="24" fontWeight="700" fontFamily="inherit">{count}</text>
    </svg>
  );
}
