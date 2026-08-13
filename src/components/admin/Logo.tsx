import React from "react";

function AdminBrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={(size * 140) / 100} aria-hidden>
      <defs>
        <linearGradient id="fk-admin-mark-grad" x1="10%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#f2c879" />
          <stop offset="38%" stopColor="#e91e8c" />
          <stop offset="66%" stopColor="#6c3f9e" />
          <stop offset="100%" stopColor="#155e75" />
        </linearGradient>
      </defs>
      <path
        fill="url(#fk-admin-mark-grad)"
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

export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
      <AdminBrandMark size={30} />
      <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: "0.01em" }}>Fillers</span>
    </div>
  );
}

export function Icon() {
  return <AdminBrandMark size={22} />;
}
