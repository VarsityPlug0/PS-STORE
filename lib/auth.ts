import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const COOKIE_NAME = "ps-admin-session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "authenticated";
}

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export { COOKIE_NAME };
