import { useState, useRef } from "react"
import { Mail, Lock, Eye, EyeOff, Info, MessageSquare, Layers, Activity, Cpu, Sun, Moon } from "lucide-react"
import axios from "axios"
import AuthBackground from "./AuthBackground"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function Login({ onLogin, switchToSignup }) {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [theme,    setTheme]    = useState(document.documentElement.getAttribute("data-theme") || "dark")

  const aboutRef   = useRef(null)
  const contactRef = useRef(null)

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
  }

<<<<<<< HEAD
  const handleLogin = async () => {
      if (!email.trim() || !password.trim()) {
    setError('Email and password are required.')
    return
  }
  if (!email.includes('@')) {
    setError('Enter a valid email address.')
    return
  }
  if (password.length < 6) {
    setError('Password must be at least 6 characters.')
    return
  }
    try {
      setLoading(true); setError("")
      const res = await axios.post(`${BASE}/auth/login`, { email, password })
      localStorage.setItem("token", res.data.token || res.data.access_token)
      onLogin()
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid email or password")
    } finally {
      setLoading(false)
    }
=======
  /* ── Your existing login logic — untouched ── */
 const handleLogin = async () => {
  try {
    setLoading(true)
    setError("")

    const res = await axios.post(
      "https://customeriq-backend.onrender.com/auth/login",
      {
        email,
        password,
      }
    )

    localStorage.setItem("token", res.data.access_token)

    onLogin()
  } catch (err) {
    setError(err?.response?.data?.detail || "Login failed")
  } finally {
    setLoading(false)
>>>>>>> 9e9cf08259ea7c9b7d412aeda843930c0060b28c
  }
}

  const onKey = e => e.key === "Enter" && handleLogin()

  const inputStyle = {
    paddingLeft: 40,
    background: 'var(--bg)',
    border: '2px solid rgba(255,255,255,0.55)',
    padding: '11px 12px 11px 40px',
    color: 'var(--text)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.12s, box-shadow 0.12s, transform 0.12s',
  }

  const labelStyle = {
    fontSize: 10,
    fontWeight: 800,
    color: 'var(--text2)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", position: "relative" }}>

      {/* Header */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: 64, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 28px", zIndex: 1000, background: "var(--bg)", borderBottom: "2px solid rgba(255,255,255,0.55)" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', border: '2px solid rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 14 }}>Ω</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 3, textTransform: 'uppercase' }}>CustomerIQ</span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => aboutRef.current?.scrollIntoView({ behavior: "smooth" })} className="k-btn" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Info size={13} /> About
          </button>
          <button onClick={() => contactRef.current?.scrollIntoView({ behavior: "smooth" })} className="k-btn" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MessageSquare size={13} /> Contact
          </button>
          <button onClick={toggleTheme} className="k-btn" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      {/* Main split */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "140px 24px 80px", boxSizing: "border-box", position: "relative", zIndex: 10 }}>
        <AuthBackground />

        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 64, width: "100%", maxWidth: 1040 }}>

          {/* Left — branding */}
          <section style={{ flex: "1 1 420px", maxWidth: 480, minWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 50, height: 50, border: "2px solid rgba(255,255,255,0.55)", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 18, boxShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>Ω</div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 30, textTransform: "uppercase", letterSpacing: 4 }}>CustomerIQ</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 400, lineHeight: 1.05, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
              Understand your<br/>
              <span style={{ color: "var(--accent2)" }}>customers deeply.</span>
            </h1>

            <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600, marginBottom: 24, lineHeight: 1.7 }}>
              ML-powered segmentation, churn prediction, and lifetime value modeling — all in one unified intelligence platform.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {['Cluster analysis across behavioural signals', 'Real-time churn risk scoring insights', 'LTV forecasting powered by ensemble models'].map(f => (
                <div key={f} className="feature-pill">→ {f}</div>
              ))}
            </div>

            <div className="stat-strip">
              <div className="stat-item">
                <div className="stat-num">K-Means<span className="stat-suffix" style={{ color: 'var(--accent)', fontSize: 14 }}>++</span></div>
                <span className="stat-desc">Optimized Seeding</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-num">&lt;200<span className="stat-suffix" style={{ color: 'var(--accent)', fontSize: 14 }}>ms</span></div>
                <span className="stat-desc">Inference Speed</span>
              </div>
            </div>
          </section>

          {/* Right — login card */}
          <section style={{ flex: "0 1 400px", minWidth: 340 }}>
            <div className="auth-card" style={{ padding: 36, width: "100%", boxSizing: "border-box" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3 }}>Welcome Back</h2>
                <p style={{ fontSize: 11, color: "var(--text2)", fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Sign in to your CustomerIQ workspace</p>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }}><Mail size={15} /></span>
                  <input style={inputStyle} type="email" placeholder="you@company.com"
                    value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey}
                    onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='3px 3px 0px var(--accent)'; e.target.style.transform='translate(-1px,-1px)' }}
                    onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.55)'; e.target.style.boxShadow='none'; e.target.style.transform='none' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={labelStyle}>Password</label>
                  <a href="#forgot" style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textDecoration: "none", textTransform: 'uppercase', letterSpacing: 0.5 }}>Forgot?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }}><Lock size={15} /></span>
                  <input style={inputStyle} type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey}
                    onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='3px 3px 0px var(--accent)'; e.target.style.transform='translate(-1px,-1px)' }}
                    onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.55)'; e.target.style.boxShadow='none'; e.target.style.transform='none' }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ color: "var(--high)", fontWeight: 800, fontSize: 11, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1, border: "2px solid var(--high)", padding: "8px 12px" }}>
                  ⚠ {error}
                </div>
              )}

              <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ marginTop: 0 }}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>

              <p className="auth-switch" style={{ marginTop: 16 }}>
                No account?{" "}
                <button type="button" className="switch-link" onClick={switchToSignup}>Create one free</button>
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* About section */}
      <section ref={aboutRef} style={{ padding: "80px 24px", maxWidth: 1040, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ borderTop: "2px solid rgba(255,255,255,0.55)", paddingTop: 48 }}>
          <div className="card">
            <div className="card-title" style={{ color: "var(--accent2)" }}>Platform Objective</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 400, marginBottom: 16, textTransform: "uppercase", letterSpacing: 3 }}>
              Advanced Intelligence For Modern Retention
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.7, marginBottom: 32, fontWeight: 600 }}>
              CustomerIQ transforms raw customer data into clean, actionable insight streams. K-Means clustering assigns distinct behavioural risk profiles to customer segments, while Random Forest classification validates and predicts individual churn probability.
            </p>
            <div className="grid-3">
              {[
                { icon: <Layers size={20} />, title: 'Dynamic Clustering', desc: 'Segment customers by income and spending patterns using optimized K-Means++ seeding.' },
                { icon: <Activity size={20} />, title: 'Elbow Method', desc: 'Track WCSS across k values to find the optimal number of clusters for your dataset.' },
                { icon: <Cpu size={20} />, title: 'RF Classification', desc: 'Random Forest validates cluster assignments using all 7 behavioural features.' },
              ].map(c => (
                <div key={c.title} className="card" style={{ background: "var(--bg3)", padding: 24 }}>
                  <div style={{ color: "var(--accent2)", marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>{c.title}</div>
                  <p style={{ color: "var(--text2)", fontSize: 12, lineHeight: 1.6, fontWeight: 600 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer ref={contactRef} style={{ background: "var(--bg2)", borderTop: "2px solid rgba(255,255,255,0.55)", padding: "48px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>CustomerIQ</div>
            <p style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Precision analytics for automated customer retention.
            </p>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: "var(--text2)", fontWeight: 700 }}>
            <span>support@customeriq.internal</span>
            <span>+1 (555) 839-2091</span>
          </div>
        </div>
      </footer>
    </div>
  )
}