import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 线上口令在服务端校验、不可逆向；还原版用环境变量配置。
const PASSCODE = process.env.PASSCODE ?? "0000";
const COOKIE_NAME = "hq_access_2026";

export async function POST(request: Request) {
  let code = "";
  try {
    const body = await request.json();
    code = String(body?.code ?? "");
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (code !== PASSCODE) {
    return NextResponse.json({ ok: false });
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}
