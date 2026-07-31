"use client";

type Props = {
  step: number;
  total?: number;
};

export function ProgressBar({ step, total = 3 }: Props) {
  return (
    <div className="progress" aria-label={`Испытание ${step} из ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`progress-dot ${i < step ? "done" : ""} ${i === step - 1 ? "current" : ""}`}
        />
      ))}
    </div>
  );
}
