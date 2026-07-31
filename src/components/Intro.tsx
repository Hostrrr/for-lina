"use client";

import { useHaptics } from "@/lib/haptics";

type Props = {
  onStart: () => void;
};

export function Intro({ onStart }: Props) {
  const haptics = useHaptics();

  return (
    <section className="screen intro fade-in">
      <p className="brand">Для Лины</p>
      <h1 className="hero-title">Лина</h1>
      <p className="lede intro-lede">
        Прости. 3 игры → сюрприз → цветы.
      </p>
      <button
        type="button"
        className="btn primary"
        onClick={() => {
          haptics.tap();
          onStart();
        }}
      >
        Начать
      </button>
    </section>
  );
}
