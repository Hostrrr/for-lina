"use client";

import { BouquetGame } from "./BouquetGame";
import { CatchGame } from "./CatchGame";
import { FlowerOrder } from "./FlowerOrder";
import { HowToPlay } from "./HowToPlay";
import { Intro } from "./Intro";
import { MemoryGame } from "./MemoryGame";
import { Reveal } from "./Reveal";
import { useProgress } from "@/lib/useProgress";
import { useHaptics } from "@/lib/haptics";

export function App() {
  const { progress, ready, go, reset } = useProgress();
  const haptics = useHaptics();

  if (!ready) {
    return (
      <div className="shell">
        <p className="muted loading">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden />
      <button
        type="button"
        className="debug-reset"
        onClick={() => {
          haptics.tap();
          reset();
        }}
      >
        ← к началу
      </button>
      <main className="stage">
        {progress.screen === "intro" && (
          <Intro onStart={() => go("howto-catch")} />
        )}

        {progress.screen === "howto-catch" && (
          <HowToPlay
            title="Поймай духи"
            steps={["Тапай падающие флаконы духов", "20 секунд — набери 12"]}
            goal="12 попаданий"
            cta="Поехали"
            onContinue={() => go("catch")}
          />
        )}

        {progress.screen === "catch" && (
          <CatchGame
            onWin={() => go("howto-memory", { catchDone: true })}
          />
        )}

        {progress.screen === "howto-memory" && (
          <HowToPlay
            title="Карточки"
            steps={["Открывай по 2 карты", "Найди все пары"]}
            goal="6 пар"
            cta="Играть"
            onContinue={() => go("memory")}
          />
        )}

        {progress.screen === "memory" && (
          <MemoryGame
            onWin={() => go("howto-bouquet", { memoryDone: true })}
          />
        )}

        {progress.screen === "howto-bouquet" && (
          <HowToPlay
            title="Собери букет"
            steps={["Жми цветы по рецепту сверху", "Ошибка — раунд сначала"]}
            goal="3 раунда"
            cta="К букету"
            onContinue={() => go("bouquet")}
          />
        )}

        {progress.screen === "bouquet" && (
          <BouquetGame
            onWin={() => go("reveal", { bouquetDone: true })}
          />
        )}

        {progress.screen === "reveal" && (
          <Reveal onContinue={() => go("flowers")} />
        )}

        {progress.screen === "flowers" && <FlowerOrder />}
      </main>
    </div>
  );
}
