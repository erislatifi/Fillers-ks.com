// Helpers shared by the admin dictionary editor and the message loader.

type Messages = { [key: string]: string | Messages };

/** {"checkout": {"title": "…"}} → {"checkout.title": "…"} */
export function flattenMessages(obj: Messages, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else Object.assign(out, flattenMessages(v, key));
  }
  return out;
}

/** The {placeholders} a text uses (top-level ICU arguments, e.g. {count}, {name}). */
export function placeholders(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/\{\s*([a-zA-Z_][a-zA-Z0-9_]*)/g)) found.add(m[1]);
  return [...found].sort();
}

/** An override is safe when its braces balance and it keeps every placeholder of the default. */
export function isSafeOverride(defaultText: string, override: string): boolean {
  let depth = 0;
  for (const ch of override) {
    if (ch === "{") depth++;
    if (ch === "}" && --depth < 0) return false;
  }
  if (depth !== 0) return false;
  const want = placeholders(defaultText);
  const got = placeholders(override);
  return want.every((p) => got.includes(p));
}

/**
 * Applies admin overrides ({"checkout.title": "…"}) onto the default messages. Unknown
 * keys, empty values and overrides that would break formatting are ignored, so a typo in
 * the admin can never take the site down.
 */
export function applyOverrides<T extends Messages>(base: T, overrides: unknown): T {
  if (!overrides || typeof overrides !== "object") return base;
  const result = structuredClone(base);
  for (const [path, value] of Object.entries(overrides as Record<string, unknown>)) {
    if (typeof value !== "string" || !value.trim()) continue;
    const parts = path.split(".");
    let node: Messages = result;
    for (const p of parts.slice(0, -1)) {
      const next = node[p];
      if (!next || typeof next === "string") {
        node = {};
        break;
      }
      node = next;
    }
    const last = parts[parts.length - 1];
    const current = node[last];
    if (typeof current === "string" && isSafeOverride(current, value)) node[last] = value;
  }
  return result;
}
