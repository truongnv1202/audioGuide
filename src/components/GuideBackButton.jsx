import Link from "next/link";

export default function GuideBackButton() {
  return (
    <Link href="/" className="guide-back-btn" aria-label="Về trang chủ">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="guide-back-btn-icon">
        <path d="M14.5 5.5 8 12l6.5 6.5" />
      </svg>
    </Link>
  );
}
