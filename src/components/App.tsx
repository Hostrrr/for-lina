"use client";

import { BouquetGame } from "./BouquetGame";
import { CatchGame } from "./CatchGame";
import { FlowerOrder } from "./FlowerOrder";
import { HowToPlay } from "./HowToPlay";
import { Intro } from "./Intro";
import { MemoryGame } from "./MemoryGame";
import { Reveal } from "./Reveal";
import { useProgress } from "@/lib/useProgress";

export function App() {
  const { progress, ready, go } = useProgress();

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
      <main className="stage">
        {progress.screen === "intro" && (
          <Intro onStart={() => go("howto-catch")} />
        )}

        {progress.screen === "howto-catch" && (
          <HowToPlay
            detailed
            title="Звёзды и цветы"
            subtitle="Первое испытание. Тут всё просто, но лучше прочитать."
            steps={[
              "На экране сверху вниз падают звёздочки ⭐ и цветочки 🌸.",
              "Кликай (или тапай) по ним пальцем — каждый клик даёт очко.",
              "У тебя есть 20 секунд. Нужно набрать 12 очков.",
              "Если не успеешь — можно сразу попробовать ещё раз. Без наказания.",
            ]}
            goal="Собрать 12 звёзд и цветов, пока не закончилось время."
            cta="Понятно, поехали"
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
            title="Вспомни легенду"
            subtitle="Мини-игра в честь Майкла Джексона."
            steps={[
              "На поле 12 карточек — 6 пар с иконками MJ.",
              "Открывай по две. Если совпали — пара остаётся.",
              "Если нет — карточки закроются, запомни где что было.",
              "Найди все пары. Можно перемешать заново, если совсем запуталась.",
            ]}
            goal="Открыть все пары."
            cta="Понятно"
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
            subtitle="Последнее испытание перед сюрпризом."
            steps={[
              "Сверху показан «рецепт» — цветы в нужном порядке.",
              "Нажимай цветы внизу строго по этому порядку.",
              "Ошибка — раунд начинается сначала (это нормально).",
              "Всего 3 коротких раунда. После третьего — сюрприз.",
            ]}
            goal="Пройти 3 раунда сборки букета."
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
