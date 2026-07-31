"use client";

import { useHaptics } from "@/lib/haptics";

type Props = {
  onStart: () => void;
};

export function Intro({ onStart }: Props) {
  const haptics = useHaptics();

  return (
    <section className="screen intro fade-in">
      <h1 className="hero-title">Лина</h1>
      <p className="lede intro-lede">пройди пожалуйста</p>
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
