"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/BrandMark";

/** Sign-in for sales agents (their Payload `users` account with the agent role). */
export function AgentLogin() {
  const t = useTranslations("agentApp.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!navigator.onLine) return setError(t("offline"));
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(t("error"));
      } else if (!json.user?.roles?.includes("agent")) {
        setError(t("notAgent"));
      } else {
        window.location.reload();
        return;
      }
    } catch {
      setError(t("offline"));
    }
    setBusy(false);
  }

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 shadow-sm sm:p-10">
        <div className="flex items-center gap-3">
          <BrandMark className="h-12 w-auto" />
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{t("title")}</h1>
            <p className="text-[14px] text-ink-soft">{t("subtitle")}</p>
          </div>
        </div>
        <label className="mt-8 block text-[13px] font-medium text-ink-soft">
          {t("email")}
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 block h-14 w-full rounded-xl border border-line bg-paper px-4 text-[17px] text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="mt-4 block text-[13px] font-medium text-ink-soft">
          {t("password")}
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 block h-14 w-full rounded-xl border border-line bg-paper px-4 text-[17px] text-ink outline-none focus:border-accent"
          />
        </label>
        {error && <p className="mt-4 rounded-xl bg-accent-pale px-4 py-3 text-[14px] text-accent-deep">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 h-14 w-full rounded-xl bg-ink text-[17px] font-semibold text-paper transition-opacity disabled:opacity-60"
        >
          {t("submit")}
        </button>
      </form>
    </div>
  );
}
