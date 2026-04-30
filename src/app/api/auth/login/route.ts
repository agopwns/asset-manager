import { createHash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password !== process.env.SITE_PASSWORD) {
    return NextResponse.json(
      { error: "비밀번호가 틀렸습니다" },
      { status: 401 },
    );
  }

  const token = createHash("sha256")
    .update(`${process.env.SITE_PASSWORD}:${process.env.AUTH_SECRET}`)
    .digest("hex");

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
