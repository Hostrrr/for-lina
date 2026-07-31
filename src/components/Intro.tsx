"use client";

import { useHaptics } from "@/lib/haptics";

type Props = {
  onStart: () => void;
};

export function Intro({ onStart }: Props) {
  const haptics = useHaptics();

  return (
    <section className="screen intro fade-in">
      <h1 className="hero-title hero-title-line">
        Лина, пройди
        <br />
        пожалуйста
      </h1>
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
