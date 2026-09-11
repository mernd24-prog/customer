export function BotanicalLeavesSvg({
  className = "",
  color = "#CE9F2D",
  width,
  height,
  ...props
}) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M150 10C110 30 70 50 20 110"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M130 22C142 16 156 18 152 30C142 32 134 26 130 22Z"
        fill="#D6A323"
        fillOpacity="0.8"
      />
      <path
        d="M105 38C108 22 122 18 126 28C118 36 110 38 105 38Z"
        fill={color}
        fillOpacity="0.75"
      />
      <path
        d="M85 55C98 48 112 52 108 64C98 66 89 60 85 55Z"
        fill="#D6A323"
        fillOpacity="0.8"
      />
      <path
        d="M65 72C66 56 80 52 84 62C76 70 69 72 65 72Z"
        fill="#B8871B"
        fillOpacity="0.7"
      />
      <path
        d="M45 90C56 82 70 86 66 98C56 99 48 94 45 90Z"
        fill={color}
        fillOpacity="0.75"
      />
      <path
        d="M25 106C26 92 38 88 42 97C36 104 29 106 25 106Z"
        fill="#D6A323"
        fillOpacity="0.6"
      />
    </svg>
  );
}

export default BotanicalLeavesSvg;
