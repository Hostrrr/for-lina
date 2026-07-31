import { NextResponse } from "next/server";

/** Старый серверный прокси больше не используется (Web3Forms free — только client-side). */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Используй форму на сайте — заказы уходят напрямую.",
    },
    { status: 410 },
  );
}
