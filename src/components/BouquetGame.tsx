"use client";

import { useMemo, useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { useHaptics } from "@/lib/haptics";

const POOL = ["🌷", "🌹", "🌼", "🌻", "💐", "🪻", "🪷", "🌸"];
const ROUNDS = 3;

function pickRecipe(length: number): string[] {
  const shuffled = [...POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, length);
}

type Props = {
  onWin: () => void;
};

export function BouquetGame({ onWin }: Props) {
  const haptics = useHaptics();
  const [round, setRound] = useState(0);
  const [recipe, setRecipe] = useState(() => pickRecipe(3));
  const [picked, setPicked] = useState<string[]>([]);
  const [message, setMessage] = useState("Собери букет по рецепту");
  const [shake, setShake] = useState(false);

  const grid = useMemo(() => {
    const extras = POOL.filter((f) => !recipe.includes(f))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    return [...recipe, ...extras].sort(() => Math.random() - 0.5);
  }, [recipe, round]);

  const startRound = (index: number) => {
    const len = 3 + Math.min(index, 2);
    setRecipe(pickRecipe(len));
    setPicked([]);
    setMessage("Собери букет по рецепту");
    setRound(index);
  };

  const choose = (flower: string) => {
    const nextIndex = picked.length;
    if (flower !== recipe[nextIndex]) {
      haptics.error();
      setShake(true);
      setMessage("Не тот цветок — начнём этот раунд сначала");
      setTimeout(() => {
        setShake(false);
        setPicked([]);
        setMessage("Собери букет по рецепту");
      }, 500);
      return;
    }

    haptics.tap();
    const next = [...picked, flower];
    setPicked(next);

    if (next.length === recipe.length) {
      if (round + 1 >= ROUNDS) {
        setMessage("Букет готов!");
        haptics.success();
        setTimeout(onWin, 550);
      } else {
        setMessage("Красиво! Следующий раунд…");
        haptics.success();
        setTimeout(() => startRound(round + 1), 650);
      }
    }
  };

  return (
    <section className="screen game fade-in">
      <ProgressBar step={3} />
      <h2 className="screen-title">Собери букет</h2>
      <p className="hud">
        Раунд {round + 1}/{ROUNDS}
      </p>
      <div className={`recipe ${shake ? "shake" : ""}`}>
        <p className="recipe-label">Рецепт</p>
        <div className="recipe-row">
          {recipe.map((f, i) => (
            <span
              key={`${f}-${i}`}
              className={`recipe-item ${i < picked.length ? "done" : ""}`}
            >
              {f}
            </span>
          ))}
        </div>
        <p className="muted">{message}</p>
      </div>
      <div className="bouquet-grid">
        {grid.map((flower, i) => (
          <button
            key={`${flower}-${i}`}
            type="button"
            className="bouquet-btn"
            onClick={() => choose(flower)}
          >
            {flower}
          </button>
        ))}
      </div>
    </section>
  );
}
