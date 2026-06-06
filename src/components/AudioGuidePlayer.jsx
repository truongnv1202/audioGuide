"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function formatTime(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function AudioGuidePlayer({ guide }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState("");
  const bars = useMemo(
    () =>
      Array.from({ length: 56 }, (_, index) => {
        const wave = Math.sin(index * 0.85) + Math.cos(index * 0.33);
        return 8 + Math.round(Math.abs(wave) * 13);
      }),
    [],
  );

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }

    setAudioError("");
    const handleLoaded = () => setDuration(audio.duration || 0);
    const handleTime = () => setCurrentTime(audio.currentTime || 0);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [guide.audioUrl]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setAudioError("");
      } catch {
        setAudioError("Chưa tìm thấy file audio cho bài này.");
      }
    } else {
      audio.pause();
    }
  }

  function handleSeek(event) {
    const audio = audioRef.current;
    if (!audio || duration <= 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * duration;
  }

  return (
    <section className="rounded-[2rem] bg-[#ffd776]/70 px-6 py-6 shadow-[0_-14px_45px_rgba(168,101,32,0.16)] backdrop-blur">
      <audio ref={audioRef} preload="metadata" src={guide.audioUrl}>
        <track kind="captions" />
      </audio>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlayback}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--guide-accent)] text-white shadow-lg shadow-[#9d4549]/25 transition active:scale-95"
          aria-label={isPlaying ? "Tạm dừng audio" : "Phát audio"}
        >
          {isPlaying ? (
            <span className="flex gap-1">
              <span className="h-4 w-1.5 rounded-full bg-current" />
              <span className="h-4 w-1.5 rounded-full bg-current" />
            </span>
          ) : (
            <span className="ml-1 h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-current" />
          )}
        </button>

        <span className="w-12 shrink-0 font-semibold text-[#6f4a42]">
          {formatTime(currentTime)}
        </span>

        <button
          type="button"
          onClick={handleSeek}
          className="relative flex h-11 flex-1 items-center justify-between overflow-hidden rounded-full px-1"
          aria-label="Tua audio"
        >
          <span
            className="absolute inset-y-1 left-0 rounded-full bg-[#b75c57]/15"
            style={{ width: `${progress * 100}%` }}
          />
          {bars.map((height, index) => {
            const active = index / bars.length <= progress;
            return (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={active ? "z-10 w-px rounded-full bg-[#9d4549]" : "z-10 w-px rounded-full bg-[#e7b960]"}
                style={{ height }}
              />
            );
          })}
        </button>

        <span className="w-12 shrink-0 text-right font-semibold text-[#6f4a42]">
          {formatTime(duration)}
        </span>
      </div>

      {audioError ? (
        <p className="mt-3 text-center text-sm font-semibold text-[#8b3d40]">
          {audioError}
        </p>
      ) : null}
    </section>
  );
}
