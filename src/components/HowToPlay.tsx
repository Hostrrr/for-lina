"use client";

import { useHaptics } from "@/lib/haptics";

type Props = {
  title: string;
  steps: string[];
  goal: string;
  cta: string;
  onContinue: () => void;
};

export function HowToPlay({ title, steps, goal, cta, onContinue }: Props) {
  const haptics = useHaptics();

  return (
    <section className="screen howto fade-in">
      <p className="eyebrow">Как играть</p>
      <h2 className="screen-title">{title}</h2>
      <ul className="howto-list">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
      <p className="goal">{goal}</p>
      <button
        type="button"
        className="btn primary"
        onClick={() => {
          haptics.tap();
          onContinue();
        }}
      >
        {cta}
      </button>
    </section>
  );
}
