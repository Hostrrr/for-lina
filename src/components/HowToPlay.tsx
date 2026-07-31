"use client";

import { useHaptics } from "@/lib/haptics";

type Props = {
  title: string;
  subtitle?: string;
  steps: string[];
  goal: string;
  cta: string;
  onContinue: () => void;
  detailed?: boolean;
};

export function HowToPlay({
  title,
  subtitle,
  steps,
  goal,
  cta,
  onContinue,
  detailed,
}: Props) {
  const haptics = useHaptics();

  return (
    <section className="screen howto fade-in">
      <p className="eyebrow">{detailed ? "Сначала разберёмся" : "Как играть"}</p>
      <h2 className="screen-title">{title}</h2>
      {subtitle ? <p className="lede">{subtitle}</p> : null}
      <ol className="howto-list">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="goal">
        <strong>Цель:</strong> {goal}
      </p>
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
