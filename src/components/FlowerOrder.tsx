"use client";

import { FormEvent, useState } from "react";
import { FLOWER_OPTIONS, type FlowerId } from "@/lib/flowers";
import { useHaptics } from "@/lib/haptics";

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

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
    if (!accessKey) {
      haptics.error();
      setError("Заказы не настроены: нет NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY");
      setStatus("error");
      return;
    }

    const bouquetName =
      FLOWER_OPTIONS.find((f) => f.id === selected)?.name ?? selected;

    setStatus("loading");
    setError("");

    try {
      // Web3Forms free: только с клиента (с сервера Vercel часто блокирует)
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Заказ цветов: ${bouquetName} — ${address.trim()}`,
          from_name: "Лина",
          name: "Лина",
          email: "hosta20259@gmail.com",
          // отдельные поля — так адрес виден колонкой в дашборде
          bouquet: bouquetName,
          address: address.trim(),
          // адрес первой строкой: в таблице Message часто видно только начало
          message: `Адрес: ${address.trim()}\nБукет: ${bouquetName}`,
        }),
      });

      const raw = await res.text();
      let data: { success?: boolean; message?: string } = {};
      try {
        data = JSON.parse(raw) as { success?: boolean; message?: string };
      } catch {
        throw new Error("Сервис писем ответил странно. Попробуй ещё раз.");
      }

      if (!res.ok || !data.success) {
        const msg = data.message || "Не удалось отправить заказ";
        if (/access[_ ]?key|pattern|match/i.test(msg)) {
          throw new Error(
            "Неверный ключ Web3Forms. Нужен UUID с web3forms.com (не [SENSITIVE]).",
          );
        }
        throw new Error(msg);
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
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="Улица, дом, квартира, подъезд…"
            autoComplete="street-address"
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
