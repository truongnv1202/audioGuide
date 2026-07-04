export default function MemorialCupCandle({ className = "" }) {
  return (
    <picture className={className}>
      <source srcSet="/images/memorial-lotus-nobg.webp" type="image/webp" />
      <img
        src="/images/memorial-lotus-nobg.png"
        alt=""
        className="memorial-lotus-candle-image block h-auto w-full select-none"
        draggable={false}
        decoding="async"
      />
    </picture>
  );
}
