"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProgressBar } from "./ProgressBar";

type Item = {
  id: number;
  kind: "star" | "flower";
  x: number;
  y: number;
  speed: number;
};

const DURATION = 20;
const TARGET = 12;
const EMOJIS = { star: "⭐", flower: "🌸" };

type Props = {
  onWin: () => void;
};

export function CatchGame({ onWin }: Props) {
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  const idRef = useRef(0);
  const scoreRef = useRef(0);

  const start = useCallback(() => {
    setTimeLeft(DURATION);
    setScore(0);
    scoreRef.current = 0;
    setItems([]);
    setFailed(false);
    setRunning(true);
  }, []);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          if (scoreRef.current < TARGET) setFailed(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const spawn = window.setInterval(() => {
      const kind = Math.random() > 0.45 ? "flower" : "star";
      idRef.current += 1;
      setItems((prev) => [
        ...prev.slice(-14),
        {
          id: idRef.current,
          kind,
          x: 8 + Math.random() * 84,
          y: -10,
          speed: 0.55 + Math.random() * 0.7,
        },
      ]);
    }, 420);
    return () => window.clearInterval(spawn);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const move = window.setInterval(() => {
      setItems((prev) =>
        prev
          .map((it) => ({ ...it, y: it.y + it.speed * 1.8 }))
          .filter((it) => it.y < 110),
      );
    }, 32);
    return () => window.clearInterval(move);
  }, [running]);

  const catchItem = (id: number) => {
    if (!running) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    setScore((s) => {
      const next = s + 1;
      scoreRef.current = next;
      if (next >= TARGET) {
        setRunning(false);
        setTimeout(onWin, 450);
      }
      return next;
    });
  };

  return (
    <section className="screen game fade-in">
      <ProgressBar step={1} />
      <h2 className="screen-title">Звёзды и цветы</h2>
      <div className="hud">
        <span>⏱ {timeLeft}с</span>
        <span>
          ✦ {score}/{TARGET}
        </span>
      </div>
      <div className="catch-area">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`catch-item ${it.kind}`}
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            onClick={() => catchItem(it.id)}
            aria-label={it.kind === "star" ? "звезда" : "цветок"}
          >
            {EMOJIS[it.kind]}
          </button>
        ))}
        {!running && failed ? (
          <div className="overlay-card">
            <p>Чуть-чуть не хватило. Ещё разок?</p>
            <button type="button" className="btn primary" onClick={start}>
              Попробовать снова
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
