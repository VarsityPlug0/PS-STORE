import { cookies } from "next/headers";
import { validateAdminPassword, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (!validateAdminPassword(password)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return Response.json({ ok: true });
}
