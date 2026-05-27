import { useEffect, useRef } from "react"

/**
 * Renders the animated particle-mesh canvas and cursor glow.
 * Drop this inside any auth page wrapper — it positions itself fixed.
 */
export default function AuthBackground() {
  const canvasRef = useRef(null)
  const glowRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const glow   = glowRef.current
    const ctx    = canvas.getContext("2d")

    /* ── Sizing ── */
    let W, H
    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    /* ── Mouse ── */
    const mouse = { x: -1000, y: -1000 }
    let cx = -1000, cy = -1000

    const onMove = e => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener("mousemove", onMove)

    /* ── Cursor glow lerp ── */
    let glowRaf
    const lerpGlow = () => {
      cx += (mouse.x - cx) * 0.09
      cy += (mouse.y - cy) * 0.09
      glow.style.left = cx + "px"
      glow.style.top  = cy + "px"
      glowRaf = requestAnimationFrame(lerpGlow)
    }
    lerpGlow()

    /* ── Particles ── */
    const COUNT      = 100
    const MAX_DIST   = 130
    const MOUSE_RAD  = 175
    const HUES       = [245, 250, 260, 165]

    class Particle {
      constructor() { this.reset(true) }
      reset(init = false) {
        this.x     = Math.random() * W
        this.y     = init ? Math.random() * H : -6
        this.r     = Math.random() * 1.5 + 0.4
        this.vx    = (Math.random() - 0.5) * 0.3
        this.vy    = Math.random() * 0.22 + 0.08
        this.alpha = Math.random() * 0.5 + 0.15
        this.hue   = HUES[Math.floor(Math.random() * HUES.length)]
      }
      update() {
        const dx = this.x - mouse.x, dy = this.y - mouse.y
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d < MOUSE_RAD) {
          const f = (MOUSE_RAD - d) / MOUSE_RAD
          this.x += (dx / d) * f * 1.6
          this.y += (dy / d) * f * 1.6
        }
        this.x += this.vx
        this.y += this.vy
        if (this.y > H + 6 || this.x < -6 || this.x > W + 6) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue},70%,70%,${this.alpha})`
        ctx.fill()
      }
    }

    const particles = Array.from({ length: COUNT }, () => new Particle())

    /* ── Render loop ── */
    let animRaf
    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const ma = a.x - mouse.x, mb = a.y - mouse.y
            const md = Math.sqrt(ma * ma + mb * mb)
            const boost = md < MOUSE_RAD ? 1 + (1 - md / MOUSE_RAD) * 1.5 : 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(124,111,247,${(1 - dist / MAX_DIST) * 0.2 * boost})`
            ctx.lineWidth   = 0.8
            ctx.stroke()
          }
        }
      }
      particles.forEach(p => { p.update(); p.draw() })
      animRaf = requestAnimationFrame(loop)
    }
    loop()

    /* ── Cleanup ── */
    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(animRaf)
      cancelAnimationFrame(glowRaf)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} id="bg-canvas" />
      <div    ref={glowRef}   id="cursor-glow" />
    </>
  )
}

