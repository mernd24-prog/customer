export default function ReviewEmptyIllustration() {
  return (
    <svg viewBox="0 0 240 160" className="h-36 w-52 sm:h-40 sm:w-60" aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="148" rx="44" ry="5" fill="#EEE5CF" />
      <path d="M76 26h88a20 20 0 0 1 20 20v34a20 20 0 0 1-20 20h-47l-29 21 5-21H76a20 20 0 0 1-20-20V46a20 20 0 0 1 20-20Z" fill="#F8E7B5" stroke="#EAC66B" strokeWidth="2" strokeLinejoin="round" />
      {[84, 102, 120, 138, 156].map((x) => (
        <path key={x} d="m0-8 2.5 5.5 6 .7-4.5 4 1.3 6-5.3-3-5.3 3 1.3-6-4.5-4 6-.7Z" transform={`translate(${x} 62)`} fill="#FFFDF6" stroke="#BE994C" strokeWidth="1.4" strokeLinejoin="round" />
      ))}
      <path d="M90 82h60" stroke="#EAC66B" strokeWidth="4" strokeLinecap="round" />
      <circle cx="179" cy="31" r="16" fill="#211B69" stroke="#FFFDF6" strokeWidth="3" />
      <path d="M179 24v14m-7-7h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 47v8m-4-4h8m150 36v8m-4-4h8" stroke="#DAA51C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
