import { NextResponse } from "next/server";
import { FLOWER_OPTIONS } from "@/lib/flowers";

type Body = {
  bouquet?: string;
  bouquetName?: string;
  note?: string;
};

export async function POST(request: Request) {
  const key = process.env.WEB3FORMS_ACCESS_KEY;
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
  const note = (body.note || "").slice(0, 1000);

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: key,
      subject: `Заказ цветов от Лины: ${bouquetName}`,
      from_name: "for-lina",
      bouquet: bouquetName,
      bouquet_id: bouquet,
      note: note || "(без комментария)",
      message: `Лина заказала букет «${bouquetName}».\nКомментарий: ${note || "—"}`,
    }),
  });

  const data = (await res.json()) as { success?: boolean; message?: string };
  if (!res.ok || !data.success) {
    return NextResponse.json(
      { ok: false, error: data.message || "Web3Forms отклонил заказ" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
