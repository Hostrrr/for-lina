"use client";

import { useEffect, useState } from "react";
import { useHaptics } from "@/lib/haptics";

type Props = {
  onContinue: () => void;
};

export function Reveal({ onContinue }: Props) {
  const haptics = useHaptics();
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    haptics.buzz();
    // once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="screen reveal fade-in">
      <h2 className="screen-title">Сюрприз</h2>
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
              Картинка: <code>public/finale.jpg</code>
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        className="btn primary"
        onClick={() => {
          haptics.tap();
          onContinue();
        }}
      >
        К цветам
      </button>
    </section>
  );
}
