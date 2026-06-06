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

function playbackRate(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 1;
  }

  return Math.min(Math.max(numeric, 0.5), 2);
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
  const rate = playbackRate(guide.playbackRate);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }

    setAudioError("");
    audio.defaultPlaybackRate = rate;
    audio.playbackRate = rate;
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
  }, [guide.audioUrl, rate]);

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
    <section className="rounded-[clamp(10px,3vw,30px)] border border-[#e5c565] bg-white/95 px-[clamp(16px,4.2vw,46px)] py-[clamp(16px,2dvh,32px)] shadow-[0_3px_10px_rgba(151,110,25,0.24)]">
      <audio ref={audioRef} preload="metadata" src={guide.audioUrl}>
        <track kind="captions" />
      </audio>

      <div className="flex items-center gap-[clamp(12px,3vw,34px)]">
        <button
          type="button"
          onClick={togglePlayback}
          className="grid size-[clamp(45px,12vw,116px)] shrink-0 place-items-center rounded-full bg-[#d4a11d] text-white shadow-[0_5px_10px_rgba(153,111,19,0.22)] transition active:scale-95"
          aria-label={isPlaying ? "Tạm dừng audio" : "Phát audio"}
        >
          {isPlaying ? (
            <span className="flex gap-[clamp(4px,0.7vw,8px)]">
              <span className="h-[clamp(16px,3vw,34px)] w-[clamp(6px,1vw,11px)] rounded-full bg-current" />
              <span className="h-[clamp(16px,3vw,34px)] w-[clamp(6px,1vw,11px)] rounded-full bg-current" />
            </span>
          ) : (
            <span className="ml-1 h-0 w-0 border-y-[clamp(8px,1.6vw,18px)] border-l-[clamp(12px,2.3vw,26px)] border-y-transparent border-l-current" />
          )}
        </button>

        <span className="w-[clamp(38px,10vw,100px)] shrink-0 text-[clamp(12px,3.2vw,31px)] font-normal text-[#493b32]">
          {formatTime(currentTime)}
        </span>

        <button
          type="button"
          onClick={handleSeek}
          className="relative flex h-[clamp(42px,7vw,76px)] flex-1 items-center justify-between overflow-hidden rounded-full px-1"
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
                className={active ? "z-10 w-px rounded-full bg-[#d4a11d]" : "z-10 w-px rounded-full bg-[#efd99c]"}
                style={{ height: `clamp(${height}px, ${height / 5}vw, ${height * 2.1}px)` }}
              />
            );
          })}
        </button>

        <span className="w-[clamp(38px,10vw,100px)] shrink-0 text-right text-[clamp(12px,3.2vw,31px)] font-normal text-[#493b32]">
          {formatTime(duration)}
        </span>
      </div>

      {audioError ? (
        <p className="mt-3 text-center text-[clamp(14px,2.5vw,28px)] font-semibold text-[#8b3d40]">
          {audioError}
        </p>
      ) : null}
    </section>
  );
}
