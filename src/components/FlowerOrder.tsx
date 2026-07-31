"use client";

import { FormEvent, useState } from "react";
import { FLOWER_OPTIONS, type FlowerId } from "@/lib/flowers";
import { useHaptics } from "@/lib/haptics";

const ORDER_EMAIL =
  process.env.NEXT_PUBLIC_ORDER_EMAIL?.trim() || "hosta20259@gmail.com";

export function FlowerOrder() {
  const haptics = useHaptics();
  const [selected, setSelected] = useState<FlowerId | null>(null);
  const [address, setAddress] = useState("");
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
    if (!address.trim()) {
      haptics.error();
      setError("Напиши адрес доставки");
      return;
    }

    const bouquetName =
      FLOWER_OPTIONS.find((f) => f.id === selected)?.name ?? selected;
    const addr = address.trim();

    setStatus("loading");
    setError("");

    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(ORDER_EMAIL)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: "Лина",
            _subject: `Заказ цветов: ${bouquetName}`,
            _template: "table",
            _captcha: "false",
            Букет: bouquetName,
            Адрес: addr,
            message: `Букет: ${bouquetName}\nАдрес доставки: ${addr}`,
          }),
        },
      );

      const raw = await res.text();
      let data: { success?: string | boolean; message?: string } = {};
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        throw new Error("Сервис писем ответил странно. Попробуй ещё раз.");
      }

      const ok =
        data.success === true ||
        data.success === "true" ||
        /success|отправ|sent|thank/i.test(JSON.stringify(data));

      if (!res.ok || !ok) {
        throw new Error(data.message || "Не удалось отправить заказ");
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
      <section className="screen order-success fade-in">
        <div className="success-glow" aria-hidden />
        <div className="success-card">
          <div className="success-burst" aria-hidden>
            <span>✦</span>
            <span>❀</span>
            <span>✦</span>
          </div>
          <h2 className="success-title">Заказ улетел</h2>
          <p className="success-lede">Скоро будут цветы.</p>
          <p className="success-heart" aria-hidden>
            ♡
          </p>
        </div>
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
          <span>
            Адрес доставки{" "}
            <em className="field-hint">(я его не узнаю, всё автоматически)</em>
          </span>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="Улица, дом, квартира, подъезд…"
            autoComplete="street-address"
            required
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
