"use client";

import { useMemo, useState } from "react";
import { ProgressBar } from "./ProgressBar";

const ICONS = [
  { id: "glove", emoji: "🧤", label: "Перчатка" },
  { id: "hat", emoji: "🎩", label: "Шляпа" },
  { id: "shoe", emoji: "👟", label: "Лунная походка" },
  { id: "mic", emoji: "🎤", label: "Микрофон" },
  { id: "thriller", emoji: "🧟", label: "Thriller" },
  { id: "star", emoji: "🌟", label: "Король попсы" },
];

type Card = {
  uid: string;
  pairId: string;
  emoji: string;
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
  const pairs = ICONS.flatMap((icon) => [
    { uid: `${icon.id}-a`, pairId: icon.id, emoji: icon.emoji },
    { uid: `${icon.id}-b`, pairId: icon.id, emoji: icon.emoji },
  ]);
  return shuffle(pairs);
}

type Props = {
  onWin: () => void;
};

export function MemoryGame({ onWin }: Props) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lock, setLock] = useState(false);

  const done = matched.length === ICONS.length;

  const status = useMemo(() => {
    if (done) return "Все пары найдены!";
    return `Найдено пар: ${matched.length}/${ICONS.length}`;
  }, [done, matched.length]);

  const flip = (uid: string) => {
    if (lock || flipped.includes(uid) || matched.some((m) => deck.find((c) => c.uid === uid)?.pairId === m)) {
      return;
    }
    const card = deck.find((c) => c.uid === uid);
    if (!card || matched.includes(card.pairId)) return;

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
      if (nextMatched.length === ICONS.length) {
        setTimeout(onWin, 600);
      }
    } else {
      setTimeout(() => {
        setFlipped([]);
        setLock(false);
      }, 700);
    }
  };

  const restart = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setLock(false);
  };

  return (
    <section className="screen game fade-in">
      <ProgressBar step={2} />
      <h2 className="screen-title">Вспомни легенду</h2>
      <p className="hud">{status}</p>
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
              aria-label={isUp ? card.emoji : "закрытая карта"}
            >
              <span className="memory-face front">✦</span>
              <span className="memory-face back">{card.emoji}</span>
            </button>
          );
        })}
      </div>
      {!done ? (
        <button type="button" className="btn ghost" onClick={restart}>
          Перемешать заново
        </button>
      ) : null}
    </section>
  );
}
