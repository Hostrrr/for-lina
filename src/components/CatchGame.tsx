"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { useHaptics } from "@/lib/haptics";

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
  const haptics = useHaptics();
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const catchingRef = useRef<Set<number>>(new Set());

  const resetRound = useCallback((withHaptic: boolean) => {
    setTimeLeft(DURATION);
    setScore(0);
    scoreRef.current = 0;
    setItems([]);
    setFailed(false);
    catchingRef.current.clear();
    setRunning(true);
    if (withHaptic) haptics.tap();
  }, [haptics]);

  useEffect(() => {
    resetRound(false);
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          if (scoreRef.current < TARGET) {
            setFailed(true);
            void haptics.error();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // haptics.error is stable enough; avoid resetting the timer each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const spawn = window.setInterval(() => {
      const kind = Math.random() > 0.45 ? "flower" : "star";
      idRef.current += 1;
      setItems((prev) => [
        ...prev.slice(-12),
        {
          id: idRef.current,
          kind,
          x: 12 + Math.random() * 76,
          y: -12,
          speed: 0.5 + Math.random() * 0.65,
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
          .filter((it) => it.y < 112),
      );
    }, 32);
    return () => window.clearInterval(move);
  }, [running]);

  const catchItem = (id: number) => {
    if (!running || catchingRef.current.has(id)) return;
    catchingRef.current.add(id);
    haptics.tap();
    setItems((prev) => prev.filter((it) => it.id !== id));
    setScore((s) => {
      const next = s + 1;
      scoreRef.current = next;
      if (next >= TARGET) {
        setRunning(false);
        haptics.success();
        setTimeout(onWin, 450);
      }
      return next;
    });
  };

  return (
    <section className="screen game fade-in">
      <div className="game-top">
        <ProgressBar step={1} />
        <div className="hud">
          <span className="game-name">Звёзды и цветы</span>
          <span>⏱ {timeLeft}с</span>
          <span>
            ✦ {score}/{TARGET}
          </span>
        </div>
      </div>
      <div className="catch-area">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`catch-item ${it.kind}`}
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            onPointerDown={(e) => {
              e.preventDefault();
              catchItem(it.id);
            }}
            aria-label={it.kind === "star" ? "звезда" : "цветок"}
          >
            {EMOJIS[it.kind]}
          </button>
        ))}
        {!running && failed ? (
          <div className="overlay-card">
            <p>Ещё разок?</p>
            <button
              type="button"
              className="btn primary"
              onClick={() => resetRound(true)}
            >
              Снова
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
