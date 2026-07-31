import { NextResponse } from "next/server";
import { FLOWER_OPTIONS } from "@/lib/flowers";

type Body = {
  bouquet?: string;
  bouquetName?: string;
  note?: string;
};

export async function POST(request: Request) {
  const key = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Заказы ещё не настроены: добавь WEB3FORMS_ACCESS_KEY в env (Vercel).",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Некорректный запрос" },
      { status: 400 },
    );
  }

  const bouquet = body.bouquet;
  const valid = FLOWER_OPTIONS.some((f) => f.id === bouquet);
  if (!bouquet || !valid) {
    return NextResponse.json(
      { ok: false, error: "Выбери букет" },
      { status: 400 },
    );
  }

  const bouquetName =
    body.bouquetName ||
    FLOWER_OPTIONS.find((f) => f.id === bouquet)?.name ||
    bouquet;
  const note = (body.note || "").trim().slice(0, 1000);

  // Web3Forms требует валидный email в payload (иначе "String does not match")
  const replyEmail =
    process.env.ORDER_REPLY_EMAIL?.trim() || "noreply@example.com";

  const message = [
    `Заказ цветов от Лины`,
    `Букет: ${bouquetName}`,
    `Адрес доставки: ${note || "не указан"}`,
  ].join("\n");

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: key,
      subject: `Заказ цветов: ${bouquetName}`,
      name: "Лина",
      email: replyEmail,
      message,
    }),
  });

  const data = (await res.json()) as {
    success?: boolean;
    message?: string;
    error?: string | { message?: string };
  };

  if (!res.ok || !data.success) {
    const raw =
      (typeof data.error === "string" && data.error) ||
      (typeof data.error === "object" && data.error?.message) ||
      data.message ||
      "Не удалось отправить заказ";
    // более понятно для пользователя
    const friendly =
      /match|pattern|email/i.test(raw)
        ? "Не удалось отправить заказ. Попробуй ещё раз."
        : raw;
    return NextResponse.json({ ok: false, error: friendly }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
