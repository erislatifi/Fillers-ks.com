// Sales-agent referral links: /sq?ref=CODE sets this cookie (src/proxy.ts); checkout and
// registration read it to credit the agent whose `agentCode` matches.
export const REF_COOKIE = "fk-ref";
export const REF_MAX_AGE = 60 * 60 * 24 * 60; // 60 days
