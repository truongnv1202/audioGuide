import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#fff4cf] px-6 text-center text-[#453832]">
      <div className="max-w-sm rounded-3xl bg-white/70 p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#9d4549]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black">Không tìm thấy audio guide</h1>
        <p className="mt-3 text-base leading-7">
          Vui lòng chọn một link có id từ 1 đến 24.
        </p>
        <Link
          href="/?id=1"
          className="mt-6 inline-flex rounded-full bg-[#9d4549] px-6 py-3 font-bold text-white"
        >
          Về bài đầu tiên
        </Link>
      </div>
    </main>
  );
}
