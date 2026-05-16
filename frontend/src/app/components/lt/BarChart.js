"use client";

const C = { btn: "#3A6048", border: "#b8cdc0", head: "#1E2D26", body: "#2c3a32", muted: "#4a5a52" };

export default function BarChart({ data, valueKey = "count", labelKey, max, color = C.btn, height = 28 }) {
  if (!data || data.length === 0) {
    return <p style={{ color: C.muted, fontSize: 13 }}>Sin datos disponibles.</p>;
  }
  const maxVal = max ?? Math.max(...data.map(d => d[valueKey] || 0));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d, i) => {
        const v = d[valueKey] || 0;
        const pct = maxVal > 0 ? (v / maxVal) * 100 : 0;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 12 }}>
              <span style={{ color: C.body, fontWeight: 500 }}>{d[labelKey]}</span>
              <span style={{ color: C.head, fontWeight: 700 }}>{v}</span>
            </div>
            <div style={{ height, background: "#eef5f0", borderRadius: 4, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <div style={{
                width: `${pct}%`, height: "100%", background: color,
                transition: "width 0.4s ease-out",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
