import React from "react";

export function Mark({ size = 30, id = "fk-mark-grad" }: { size?: number; id?: string }) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={(size * 140) / 100} aria-hidden>
      <defs>
        <linearGradient id={id} x1="10%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#f2c879" />
          <stop offset="38%" stopColor="#e91e8c" />
          <stop offset="66%" stopColor="#6c3f9e" />
          <stop offset="100%" stopColor="#155e75" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M72 6
           C40 6 14 34 14 70
           C14 106 40 134 72 134
           C86 134 97 129 100 124
           C82 128 62 118 56 100
           C52 88 56 78 66 74
           C56 70 51 60 55 50
           C58 42 66 38 74 40
           C68 30 68 20 74 12
           Z"
      />
    </svg>
  );
}

/** Wordmark shown above the login form (and anywhere Payload renders the full logo). */
export function Logo() {
  return (
    <div className="fk-logo">
      <Mark size={30} id="fk-mark-grad-logo" />
      <span className="fk-logo__word">
        Fillers <small>Kosovo</small>
      </span>
    </div>
  );
}

/** Compact mark used in the nav header and collapsed spaces. */
export function Icon() {
  return <Mark size={22} id="fk-mark-grad-icon" />;
}
