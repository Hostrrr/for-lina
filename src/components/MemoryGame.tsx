"use client";

import { useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { useHaptics } from "@/lib/haptics";

/** Положи файлы в public/memory/ с этими именами (jpg/png/webp). */
export const MEMORY_CARDS = [
  { id: "1", src: "/memory/1.jpg", fallback: "🧤", label: "Карта 1" },
  { id: "2", src: "/memory/2.jpg", fallback: "🎩", label: "Карта 2" },
  { id: "3", src: "/memory/3.jpg", fallback: "👟", label: "Карта 3" },
  { id: "4", src: "/memory/4.jpg", fallback: "🎤", label: "Карта 4" },
  { id: "5", src: "/memory/5.jpg", fallback: "🧟", label: "Карта 5" },
  { id: "6", src: "/memory/6.jpg", fallback: "🌟", label: "Карта 6" },
] as const;

type Card = {
  uid: string;
  pairId: string;
  src: string;
  fallback: string;
  label: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const pairs = MEMORY_CARDS.flatMap((icon) => [
    {
      uid: `${icon.id}-a`,
      pairId: icon.id,
      src: icon.src,
      fallback: icon.fallback,
      label: icon.label,
    },
    {
      uid: `${icon.id}-b`,
      pairId: icon.id,
      src: icon.src,
      fallback: icon.fallback,
      label: icon.label,
    },
  ]);
  return shuffle(pairs);
}

function CardImage({ src, fallback, label }: { src: string; fallback: string; label: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return <span className="memory-emoji">{fallback}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className="memory-img"
      draggable={false}
      onError={() => setBroken(true)}
    />
  );
}

type Props = {
  onWin: () => void;
};

export function MemoryGame({ onWin }: Props) {
  const haptics = useHaptics();
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lock, setLock] = useState(false);

  const done = matched.length === MEMORY_CARDS.length;

  const flip = (uid: string) => {
    if (
      lock ||
      flipped.includes(uid) ||
      matched.some((m) => deck.find((c) => c.uid === uid)?.pairId === m)
    ) {
      return;
    }
    const card = deck.find((c) => c.uid === uid);
    if (!card || matched.includes(card.pairId)) return;

    haptics.tap();
    const next = [...flipped, uid];
    setFlipped(next);

    if (next.length < 2) return;

    const [a, b] = next;
    const ca = deck.find((c) => c.uid === a)!;
    const cb = deck.find((c) => c.uid === b)!;
    setLock(true);

    if (ca.pairId === cb.pairId) {
      const nextMatched = [...matched, ca.pairId];
      setMatched(nextMatched);
      setFlipped([]);
      setLock(false);
      haptics.success();
      if (nextMatched.length === MEMORY_CARDS.length) {
        setTimeout(onWin, 600);
      }
    } else {
      haptics.error();
      setTimeout(() => {
        setFlipped([]);
        setLock(false);
      }, 700);
    }
  };

  const restart = () => {
    haptics.tap();
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setLock(false);
  };

  return (
    <section className="screen game fade-in">
      <div className="game-top">
        <ProgressBar step={2} />
        <div className="hud">
          <span className="game-name">Карточки</span>
          <span>
            {matched.length}/{MEMORY_CARDS.length}
          </span>
        </div>
      </div>
      <div className="memory-grid">
        {deck.map((card) => {
          const isUp =
            flipped.includes(card.uid) || matched.includes(card.pairId);
          return (
            <button
              key={card.uid}
              type="button"
              className={`memory-card ${isUp ? "up" : ""} ${matched.includes(card.pairId) ? "matched" : ""}`}
              onClick={() => flip(card.uid)}
              aria-label={isUp ? card.label : "закрытая карта"}
            >
              <span className="memory-face front">✦</span>
              <span className="memory-face back">
                <CardImage
                  src={card.src}
                  fallback={card.fallback}
                  label={card.label}
                />
              </span>
            </button>
          );
        })}
      </div>
      {!done ? (
        <button type="button" className="btn ghost compact" onClick={restart}>
          Перемешать
        </button>
      ) : null}
    </section>
  );
}
