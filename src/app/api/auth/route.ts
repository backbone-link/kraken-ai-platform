import { NextResponse } from "next/server";
import { headers } from "next/headers";

const MAX_ATTEMPTS = 6;
const LOCKOUT_MS = 10_000;
const REVEAL_THRESHOLD = 3;

const attempts = new Map<string, { count: number; lockedUntil: number }>();

const getClientIp = async () => {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
};

export const GET = async () => {
  const ip = await getClientIp();
  const record = attempts.get(ip);

  if (record && Date.now() < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return NextResponse.json({ locked: true, retryAfter }, { status: 429 });
  }

  return NextResponse.json({ locked: false });
};

export const POST = async (request: Request) => {
  if (!process.env.SITE_PASSWORD) {
    return NextResponse.json(
      { error: "Access disabled" },
      { status: 403 },
    );
  }

  const ip = await getClientIp();
  const record = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };

  if (Date.now() < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${retryAfter}s`, retryAfter },
      { status: 429 },
    );
  }

  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    record.count = 0;
    record.lockedUntil = 0;
  }

  const { password } = (await request.json()) as { password: string };

  if (password !== process.env.SITE_PASSWORD) {
    record.count += 1;

    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_MS;
      attempts.set(ip, record);
      const retryAfter = LOCKOUT_MS / 1000;
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfter}s`, retryAfter },
        { status: 429 },
      );
    }

    attempts.set(ip, record);

    const remaining = MAX_ATTEMPTS - record.count;
    const error =
      record.count > REVEAL_THRESHOLD
        ? `Wrong password. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining`
        : "Wrong password";

    return NextResponse.json({ error }, { status: 401 });
  }

  attempts.delete(ip);
  return NextResponse.json({ ok: true });
};
