"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        padding: "8px 16px",
        borderRadius: 999,
        border: "none",
        background: "#18181b",
        color: "#fff",
        cursor: "pointer",
        font: "500 13px system-ui, sans-serif",
      }}
    >
      Printo / Ruaj si PDF
    </button>
  );
}
