export function AllOrdersIcon({ className = "", size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Row 1 */}
      <circle cx="3.5" cy="4.5" r="1.5" fill="currentColor" />
      <rect x="7" y="3.5" width="10" height="2" rx="1" fill="currentColor" />

      {/* Row 2 */}
      <circle cx="3.5" cy="10" r="1.5" fill="currentColor" />
      <rect x="7" y="9" width="6.5" height="2" rx="1" fill="currentColor" />
      <rect x="13.5" y="9" width="3.5" height="2" rx="1" fill="#D6A323" />

      {/* Row 3 */}
      <circle cx="3.5" cy="15.5" r="1.5" fill="currentColor" />
      <rect x="7" y="14.5" width="4.5" height="2" rx="1" fill="currentColor" />
      <rect x="11.5" y="14.5" width="5.5" height="2" rx="1" fill="#D6A323" />
    </svg>
  );
}
