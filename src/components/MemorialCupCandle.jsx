export default function MemorialCupCandle({ className = "", flickerDelay = 0, withLotus = true }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 72" className={className}>
      {withLotus ? (
        <g className="memorial-cup-lotus">
          <ellipse cx="24" cy="66" rx="18" ry="4.2" fill="rgba(20, 48, 32, 0.55)" />
          <ellipse cx="24" cy="64.5" rx="15" ry="3.2" fill="#2f6b45" opacity="0.85" />
          <path
            d="M24 62 C14 58, 8 62, 10 67 C13 69.5, 18 68, 24 62Z"
            fill="#d8899f"
          />
          <path
            d="M24 62 C34 58, 40 62, 38 67 C35 69.5, 30 68, 24 62Z"
            fill="#e8a0b4"
          />
          <path
            d="M24 60 C18 52, 20 46, 26 48 C28 52, 27 58, 24 60Z"
            fill="#f0b8c8"
          />
          <path
            d="M24 60 C30 52, 28 46, 22 48 C20 52, 21 58, 24 60Z"
            fill="#f5c6d4"
          />
          <path
            d="M24 58 C22 48, 24 42, 24 42 C24 42, 26 48, 24 58Z"
            fill="#fce0ea"
          />
          <ellipse cx="24" cy="61.5" rx="4.5" ry="2.2" fill="#ffd8e8" opacity="0.9" />
        </g>
      ) : null}

      <ellipse cx="24" cy="58.5" rx="9" ry="2.4" fill="rgba(255, 170, 60, 0.28)" />

      <path
        d="M16 38 L14.2 56.5 Q24 59 33.8 56.5 L32 38 Z"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.42)"
        strokeWidth="0.75"
      />
      <path
        d="M17 39 L15.5 55.5 Q24 57.5 32.5 55.5 L31 39 Z"
        fill="rgba(255,252,248,0.08)"
      />
      <ellipse cx="24" cy="38.2" rx="8.2" ry="2" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.65" />
      <rect x="17.2" y="42" width="13.6" height="12.5" rx="1.2" fill="rgba(255,252,245,0.94)" />
      <ellipse cx="24" cy="42" rx="6.4" ry="1.5" fill="#fffdf8" />
      <rect x="23.4" y="36.8" width="1.2" height="5.4" rx="0.4" fill="#4a3a28" />

      <g className="memorial-flame" style={{ "--flicker-delay": `${flickerDelay}s` }}>
        <path
          d="M24 36.8 C20.8 32.4, 21.2 27.6, 24 22.8 C26.8 27.6, 27.2 32.4, 24 36.8Z"
          fill="#ffb347"
        />
        <path
          d="M24 34.8 C22.6 31.6, 22.8 28.8, 24 25.6 C25.2 28.8, 25.4 31.6, 24 34.8Z"
          fill="#fff4bf"
        />
        <ellipse cx="24" cy="36.2" rx="2.2" ry="0.8" fill="#ff9a2e" opacity="0.85" />
      </g>

      <path
        d="M17.5 40.5 L18.2 52"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.55"
        strokeLinecap="round"
      />
      <path
        d="M30.5 40.5 L29.8 52"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.45"
        strokeLinecap="round"
      />
    </svg>
  );
}
