// Pixel-grid "Ci" lettermark with a street-light style flicker animation.
// Each lit square dims and recovers on its own irregular timing — not a
// synchronized pulse — to mimic a flickering neon/street light.

const C_GRID = [
  [0,1,1,1,0],
  [1,0,0,0,1],
  [1,0,0,0,0],
  [1,0,0,0,0],
  [1,0,0,0,0],
  [1,0,0,0,1],
  [0,1,1,1,0],
]

const I_GRID = [
  [0,1],
  [0,0],
  [0,1],
  [0,1],
  [0,1],
  [0,1],
  [0,1],
]

// Assign each lit pixel one of 3 flicker timing variants for a natural,
// non-uniform look.
const FLICKER_VARIANTS = ['f1', 'f2', 'f3']
const pickFlicker = (row, col) => FLICKER_VARIANTS[(row * 3 + col) % FLICKER_VARIANTS.length]

export default function PixelLogo({ size = 16, gap = 4, iWidthScale = 1, style = {} }) {
  const cellC  = size
  const cellI  = Math.round(size * 0.8)
  const cellIW = Math.round(cellI * iWidthScale)
  const gapI   = Math.max(2, Math.round(gap * 0.75))

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: size * 0.85, ...style }}>
      <style>{`
        @keyframes pixelFlicker1 { 0%,100%{opacity:1} 4%{opacity:.55} 6%{opacity:1} 47%{opacity:1} 49%{opacity:.4} 51%{opacity:1} 78%{opacity:1} 79%{opacity:.6} 81%{opacity:1} }
        @keyframes pixelFlicker2 { 0%,100%{opacity:1} 18%{opacity:1} 20%{opacity:.45} 22%{opacity:1} 60%{opacity:1} 62%{opacity:.5} 64%{opacity:1} 90%{opacity:1} 92%{opacity:.6} 94%{opacity:1} }
        @keyframes pixelFlicker3 { 0%,100%{opacity:1} 30%{opacity:1} 32%{opacity:.5} 34%{opacity:1} 70%{opacity:1} 71%{opacity:.4} 73%{opacity:1} }
        .pixel-lit.f1 { animation: pixelFlicker1 5s infinite ease-in-out; }
        .pixel-lit.f2 { animation: pixelFlicker2 5s infinite ease-in-out; }
        .pixel-lit.f3 { animation: pixelFlicker3 5s infinite ease-in-out; }
      `}</style>

      {/* C */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(5, ${cellC}px)`, gap }}>
        {C_GRID.flatMap((row, r) =>
          row.map((lit, c) => (
            <div
              key={`c-${r}-${c}`}
              className={lit ? `pixel-lit ${pickFlicker(r, c)}` : ''}
              style={{
                width: cellC,
                height: cellC,
                borderRadius: 2,
                background: lit ? 'var(--accent)' : 'var(--bg3)',
                boxShadow: lit ? '0 0 6px rgba(217,119,87,0.55), 0 0 12px rgba(217,119,87,0.25)' : 'none',
              }}
            />
          ))
        )}
      </div>

      {/* i */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(2, ${cellIW}px)`, gap: gapI, marginBottom: Math.round(size * 0.25) }}>
        {I_GRID.flatMap((row, r) =>
          row.map((lit, c) => (
            <div
              key={`i-${r}-${c}`}
              className={lit ? `pixel-lit ${pickFlicker(r + 2, c)}` : ''}
              style={{
                width: cellIW,
                height: cellI,
                borderRadius: 2,
                background: lit ? 'var(--accent)' : 'var(--bg3)',
                boxShadow: lit ? '0 0 6px rgba(217,119,87,0.55), 0 0 12px rgba(217,119,87,0.25)' : 'none',
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}