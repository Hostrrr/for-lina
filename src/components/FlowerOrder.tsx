"use client";

import { FormEvent, useState } from "react";
import { FLOWER_OPTIONS, type FlowerId } from "@/lib/flowers";
import { useHaptics } from "@/lib/haptics";

export function FlowerOrder() {
  const haptics = useHaptics();
  const [selected, setSelected] = useState<FlowerId | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) {
      haptics.error();
      setError("Выбери букет");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bouquet: selected,
          bouquetName:
            FLOWER_OPTIONS.find((f) => f.id === selected)?.name ?? selected,
          note,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Не удалось отправить заказ");
      }
      haptics.success();
      setStatus("ok");
    } catch (err) {
      haptics.error();
      setStatus("error");
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    }
  };

  if (status === "ok") {
    return (
      <section className="screen order fade-in">
        <h2 className="screen-title">Заказ улетел ✨</h2>
        <p className="lede">Скоро будут цветы.</p>
      </section>
    );
  }

  return (
    <section className="screen order fade-in">
      <h2 className="screen-title">Цветы</h2>
      <form className="order-form" onSubmit={submit}>
        <div className="bouquet-menu" role="listbox" aria-label="Букеты">
          {FLOWER_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="option"
              aria-selected={selected === f.id}
              className={`bouquet-option ${selected === f.id ? "selected" : ""}`}
              onClick={() => {
                haptics.tap();
                setSelected(f.id);
              }}
            >
              <span className="bouquet-option-emoji">{f.emoji}</span>
              <span className="bouquet-option-text">
                <strong>{f.name}</strong>
                <span className="bouquet-blurb">{f.blurb}</span>
              </span>
            </button>
          ))}
        </div>
        <label className="field">
          <span>Адрес доставки</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Улица, дом, квартира, подъезд…"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button
          type="submit"
          className="btn primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "…" : "Заказать"}
        </button>
      </form>
    </section>
  );
}
