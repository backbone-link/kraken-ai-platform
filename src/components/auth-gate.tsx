"use client";

import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from "react";

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const locked = countdown > 0;

  useEffect(() => {
    void fetch("/api/auth").then(async (res) => {
      if (res.status === 429) {
        const data = (await res.json()) as { retryAfter: number };
        setLockedUntil(Date.now() + data.retryAfter * 1000);
        setError(`Too many attempts. Try again in ${data.retryAfter}s`);
      }
    });
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;

    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setCountdown(0);
        setLockedUntil(0);
        setError("");
      } else {
        setCountdown(remaining);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error: string; retryAfter?: number };
        setError(data.error);
        setPassword("");
        if (data.retryAfter) {
          setLockedUntil(Date.now() + data.retryAfter * 1000);
        }
        setLoading(false);
        return;
      }

      setAuthed(true);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }, [locked, password]);

  if (authed) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-bg-primary backdrop-blur-2xl">
      <form
        onSubmit={handleSubmit}
        className="flex w-80 flex-col gap-4 rounded-xl border border-border-subtle bg-bg-secondary p-8"
      >
        <p className="text-center text-sm text-text-muted">
          Enter password to continue
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          disabled={locked}
          className="rounded-lg border border-border-subtle bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors disabled:opacity-50"
        />
        {error && (
          <p className="text-center text-sm text-error">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password || locked}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {locked ? `Wait ${countdown}s` : loading ? "..." : "Enter"}
        </button>
      </form>
    </div>
  );
};
