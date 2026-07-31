"use client";

import { useState } from "react";

type Props = {
  onContinue: () => void;
};

export function Reveal({ onContinue }: Props) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <section className="screen reveal fade-in">
      <p className="eyebrow">Сюрприз</p>
      <h2 className="screen-title">Ты это заслужила</h2>
      <div className="reveal-frame pop-in">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/finale.jpg"
            alt="Сюрприз для Лины"
            className="reveal-img"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="reveal-placeholder">
            <p className="reveal-placeholder-emoji">📸</p>
            <p>
              Сюда вставь свою картинку:
              <br />
              <code>public/finale.jpg</code>
            </p>
          </div>
        )}
      </div>
      <p className="lede">А теперь — цветы. Выбирай.</p>
      <button type="button" className="btn primary" onClick={onContinue}>
        К меню цветов
      </button>
    </section>
  );
}
