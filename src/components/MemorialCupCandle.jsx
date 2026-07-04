export default function MemorialCupCandle({ className = "" }) {
  return (
    <picture className={className}>
      <source srcSet="/images/memorial-lotus-candle.webp" type="image/webp" />
      <img
        src="/images/memorial-lotus-candle-sm.png"
        alt=""
        className="memorial-lotus-candle-image block h-auto w-full select-none"
        draggable={false}
        decoding="async"
      />
    </picture>
  );
}
