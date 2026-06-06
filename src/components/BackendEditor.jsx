"use client";

import { useMemo, useState } from "react";

function cloneGuide(guide) {
  return JSON.parse(JSON.stringify(guide));
}

function fieldValue(value) {
  return value ?? "";
}

function numberValue(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export default function BackendEditor({ secret, initialGuides }) {
  const [guides, setGuides] = useState(initialGuides);
  const [selectedId, setSelectedId] = useState(initialGuides[0]?.id ?? 1);
  const [draft, setDraft] = useState(() => cloneGuide(initialGuides[0] || {}));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedGuide = useMemo(
    () => guides.find((guide) => guide.id === selectedId),
    [guides, selectedId],
  );

  function selectGuide(id) {
    const guide = guides.find((item) => item.id === id);
    setSelectedId(id);
    setDraft(cloneGuide(guide));
    setMessage("");
  }

  function updateField(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateNested(group, field, value) {
    setDraft((current) => ({
      ...current,
      [group]: {
        ...(current[group] || {}),
        [field]: value,
      },
    }));
  }

  async function saveGuide() {
    setSaving(true);
    setMessage("Đang lưu...");

    try {
      const response = await fetch(`/backend/${secret}/guides/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Không lưu được bài viết");
      }

      setGuides((current) =>
        current.map((guide) => (guide.id === result.data.id ? result.data : guide)),
      );
      setDraft(cloneGuide(result.data));
      setMessage(`Đã lưu bài ${String(result.data.id).padStart(2, "0")}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!formData.get("image")?.size && !formData.get("audio")?.size) {
      setMessage("Chọn ảnh hoặc MP3 trước khi upload.");
      return;
    }

    setSaving(true);
    setMessage("Đang upload...");

    try {
      const response = await fetch(`/backend/${secret}/guides/${draft.id}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Không upload được file");
      }

      setGuides((current) =>
        current.map((guide) => (guide.id === result.data.id ? result.data : guide)),
      );
      setDraft(cloneGuide(result.data));
      form.reset();
      setMessage(`Đã upload bài ${String(result.data.id).padStart(2, "0")}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!selectedGuide) {
    return <main className="p-6">Không có bài viết.</main>;
  }

  return (
    <main className="min-h-dvh bg-[#f6efe0] p-4 text-[#30241d] md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-[#dfc271] bg-white/90 p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-black">Backend AudioGuide</h1>
            <a
              className="rounded-full bg-[#f1cf63] px-3 py-1 text-sm font-bold"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              Xem web
            </a>
          </div>
          <div className="grid max-h-[78dvh] gap-2 overflow-y-auto pr-1">
            {guides.map((guide) => (
              <button
                key={guide.id}
                type="button"
                onClick={() => selectGuide(guide.id)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  guide.id === selectedId
                    ? "border-[#c99719] bg-[#fff2ba] font-bold"
                    : "border-[#eadba9] bg-white hover:bg-[#fff8dc]"
                }`}
              >
                <span className="block text-xs text-[#8b6a12]">
                  Bài {String(guide.id).padStart(2, "0")}
                </span>
                <span className="block max-h-10 overflow-hidden whitespace-pre-line">{guide.title1 || guide.title}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-[#dfc271] bg-white/95 p-4 shadow-sm md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#9b7318]">
                Đang sửa bài {String(draft.id).padStart(2, "0")}
              </p>
              <h2 className="text-2xl font-black">Nội dung và giao diện hero</h2>
            </div>
            <div className="flex items-center gap-2">
              {message ? <span className="text-sm font-semibold text-[#7b5d19]">{message}</span> : null}
              <button
                type="button"
                disabled={saving}
                onClick={saveGuide}
                className="rounded-xl bg-[#d4a11d] px-5 py-3 font-black text-white disabled:opacity-60"
              >
                Lưu bài này
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-4">
              <Field label="Title 1">
                <textarea
                  rows={2}
                  value={fieldValue(draft.title1)}
                  onChange={(event) => updateField("title1", event.target.value)}
                  className="backend-input min-h-20"
                  placeholder="Có thể xuống dòng"
                />
              </Field>
              <Field label="Title 2">
                <textarea
                  rows={2}
                  value={fieldValue(draft.title2)}
                  onChange={(event) => updateField("title2", event.target.value)}
                  className="backend-input min-h-20"
                  placeholder="Để trống nếu không hiển thị"
                />
              </Field>
              <Field label="Title 3">
                <textarea
                  rows={2}
                  value={fieldValue(draft.title3)}
                  onChange={(event) => updateField("title3", event.target.value)}
                  className="backend-input min-h-20"
                  placeholder="Để trống nếu không hiển thị"
                />
              </Field>
              <Field label="Nội dung thuyết minh">
                <textarea
                  rows={12}
                  value={fieldValue(draft.description)}
                  onChange={(event) => updateField("description", event.target.value)}
                  className="backend-input"
                />
              </Field>
            </div>

            <div className="space-y-5">
              <Panel title="File">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Ảnh URL">
                    <input
                      value={fieldValue(draft.imageUrl)}
                      onChange={(event) => updateField("imageUrl", event.target.value)}
                      className="backend-input"
                    />
                  </Field>
                  <Field label="Audio URL">
                    <input
                      value={fieldValue(draft.audioUrl)}
                      onChange={(event) => updateField("audioUrl", event.target.value)}
                      className="backend-input"
                    />
                  </Field>
                  <NumberInput
                    label="Tốc độ MP3"
                    value={draft.playbackRate}
                    min={0.5}
                    max={2}
                    step={0.05}
                    onChange={(value) => updateField("playbackRate", value)}
                  />
                </div>
                <form onSubmit={uploadMedia} className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input name="image" type="file" accept="image/*" className="backend-input" />
                  <input name="audio" type="file" accept="audio/mpeg,audio/mp3" className="backend-input" />
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl border border-[#c99719] px-4 py-2 font-bold disabled:opacity-60"
                  >
                    Upload
                  </button>
                </form>
              </Panel>

              <Panel title="Vị trí và cỡ chữ title">
                <div className="grid gap-3 md:grid-cols-3">
                  <TextInput label="Left" value={draft.titleLayout?.left} onChange={(value) => updateNested("titleLayout", "left", value)} />
                  <TextInput label="Top" value={draft.titleLayout?.top} onChange={(value) => updateNested("titleLayout", "top", value)} />
                  <TextInput label="Width" value={draft.titleLayout?.width} onChange={(value) => updateNested("titleLayout", "width", value)} />
                  <TextInput label="Align" value={draft.titleLayout?.align} onChange={(value) => updateNested("titleLayout", "align", value)} />
                  <TextInput label="Gap" value={draft.titleLayout?.gap} onChange={(value) => updateNested("titleLayout", "gap", value)} />
                  <TextInput label="Line height" value={draft.titleLayout?.lineHeight} onChange={(value) => updateNested("titleLayout", "lineHeight", value)} />
                  <TextInput label="Title 1 size" value={draft.titleLayout?.title1Size} onChange={(value) => updateNested("titleLayout", "title1Size", value)} />
                  <TextInput label="Title 2 size" value={draft.titleLayout?.title2Size} onChange={(value) => updateNested("titleLayout", "title2Size", value)} />
                  <TextInput label="Title 3 size" value={draft.titleLayout?.title3Size} onChange={(value) => updateNested("titleLayout", "title3Size", value)} />
                </div>
              </Panel>

              <Panel title="Ảnh hero">
                <div className="grid gap-3 md:grid-cols-2">
                  <TextInput label="Ảnh chính lệch" value={draft.imageLayout?.foregroundPosition} onChange={(value) => updateNested("imageLayout", "foregroundPosition", value)} />
                  <TextInput label="Ảnh nền lệch" value={draft.imageLayout?.backgroundPosition} onChange={(value) => updateNested("imageLayout", "backgroundPosition", value)} />
                  <NumberInput label="Opacity ảnh nền" value={draft.imageLayout?.backgroundOpacity} onChange={(value) => updateNested("imageLayout", "backgroundOpacity", value)} />
                  <NumberInput label="Opacity lớp vàng" value={draft.imageLayout?.overlayOpacity} onChange={(value) => updateNested("imageLayout", "overlayOpacity", value)} />
                </div>
                <p className="mt-2 text-sm text-[#7b6a4c]">
                  Opacity nhập từ 0 đến 1. Ví dụ: 0.4, 0.8, 1.
                </p>
              </Panel>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-black text-[#634817]">{label}</span>
      {children}
    </label>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#eadba9] bg-[#fffaf0] p-4">
      <h3 className="mb-3 text-lg font-black">{title}</h3>
      {children}
    </div>
  );
}

function TextInput({ label, value, onChange }) {
  return (
    <Field label={label}>
      <input value={fieldValue(value)} onChange={(event) => onChange(event.target.value)} className="backend-input" />
    </Field>
  );
}

function NumberInput({ label, value, min = 0, max = 1, step = 0.05, onChange }) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={numberValue(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="backend-input"
      />
    </Field>
  );
}
