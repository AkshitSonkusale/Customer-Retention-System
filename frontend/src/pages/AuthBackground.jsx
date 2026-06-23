import { useEffect, useRef } from "react"

export default function AuthBackground() {
  const canvasRef = useRef(null)
  const glowRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const glow   = glowRef.current
    const ctx    = canvas.getContext("2d")

    let W, H
    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const mouse = { x: -1000, y: -1000 }
    let cx = -1000, cy = -1000

    const onMove = e => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener("mousemove", onMove)

    let glowRaf
    const lerpGlow = () => {
      cx += (mouse.x - cx) * 0.09
      cy += (mouse.y - cy) * 0.09
      if (glow) {
        glow.style.left = cx + "px"
        glow.style.top  = cy + "px"
      }
      glowRaf = requestAnimationFrame(lerpGlow)
    }
    lerpGlow()

    const isLightTheme = () => document.documentElement.getAttribute("data-theme") === "light"

    const COUNT      = 100
    const MAX_DIST   = 130
    const MOUSE_RAD  = 175
    const DARK_HUES  = [245, 250, 260, 165]
    const LIGHT_HUES = [20, 25, 32, 15]

    class Particle {
      constructor() { this.reset(true) }
      reset(init = false) {
        this.x     = Math.random() * W
        this.y     = init ? Math.random() * H : -6
        this.r     = Math.random() * 1.5 + 0.4
        this.vx    = (Math.random() - 0.5) * 0.3
        this.vy    = Math.random() * 0.22 + 0.08
        this.alpha = Math.random() * 0.5 + 0.15
        const currentHues = isLightTheme() ? LIGHT_HUES : DARK_HUES
        this.hue = currentHues[Math.floor(Math.random() * currentHues.length)]
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
        if (isLightTheme()) {
          ctx.fillStyle = `hsla(${this.hue}, 95%, 50%, ${this.alpha * 0.75})`
        } else {
          ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.alpha})`
        }
        ctx.fill()
      }
    }

    const particles = Array.from({ length: COUNT }, () => new Particle())

    let animRaf
    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      const lightActive = isLightTheme()
      const strokeRGB = lightActive ? "234, 88, 12" : "124, 111, 247"

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
            ctx.strokeStyle = `rgba(${strokeRGB}, ${(1 - dist / MAX_DIST) * 0.2 * boost})`
            ctx.lineWidth   = 0.8
            ctx.stroke()
          }
        }
      }
      particles.forEach(p => { p.update(); p.draw() })
      animRaf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(animRaf)
      cancelAnimationFrame(glowRaf)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }} />
      <div 
        ref={glowRef} 
        style={{
          width: "500px",
          height: "500px",
          position: "fixed",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 2,
          transform: "translate(-50%, -50%)",
          willChange: "left, top",
          mixBlendMode: "screen",
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.11) 0%, rgba(167, 139, 250, 0.11) 25%, rgba(124, 111, 247, 0.03) 45%, transparent 65%)",
          opacity: 0.85, 
          filter: "blur(6px)"
        }}
      />
    </>
  )
}