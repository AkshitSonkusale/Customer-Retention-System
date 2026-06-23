import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"
import axios from "axios"
import AuthBackground from "./AuthBackground"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

function scorePassword(pw) {
  if (!pw) return { level: 0, label: "", color: "" }
  let s = 0
  if (pw.length >= 8)                          s++
  if (pw.length >= 12)                         s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))   s++
  if (/\d/.test(pw))                           s++
  if (/[^a-zA-Z0-9]/.test(pw))                s++
  return [
    { level: 0, label: "",       color: "" },
    { level: 1, label: "Weak",   color: "var(--high)" },
    { level: 2, label: "Fair",   color: "var(--med)" },
    { level: 3, label: "Good",   color: "var(--low)" },
    { level: 4, label: "Strong", color: "var(--accent2)" },
  ][Math.min(4, s)]
}

export default function Signup({ switchToLogin }) {
  const [username, setUsername] = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const strength = scorePassword(password)

  const handleSignup = async () => {
<<<<<<< HEAD
    // Validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters.')
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
      setLoading(true)
      setError("")
      await axios.post(`${BASE}/auth/signup`, { username, email, password })
      switchToLogin()
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed. Try again.")
    } finally {
      setLoading(false)
    }
=======
  try {
    setLoading(true)
    setError("")

    await axios.post(
      "https://customeriq-backend.onrender.com/auth/signup",
      {
        username,
        email,
        password,
      }
    )

    switchToLogin()
  } catch (err) {
    setError(err?.response?.data?.detail || "Signup failed")
  } finally {
    setLoading(false)
>>>>>>> 9e9cf08259ea7c9b7d412aeda843930c0060b28c
  }
}

  const onKey = e => e.key === "Enter" && handleSignup()

  const inputStyle = {
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

  const onFocus = e => {
    e.target.style.borderColor = 'var(--accent)'
    e.target.style.boxShadow   = '3px 3px 0px var(--accent)'
    e.target.style.transform   = 'translate(-1px,-1px)'
  }

  const onBlur = e => {
    e.target.style.borderColor = 'rgba(255,255,255,0.55)'
    e.target.style.boxShadow   = 'none'
    e.target.style.transform   = 'none'
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", position: "relative" }}>
      <AuthBackground />

      <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "100px 24px 60px", boxSizing: "border-box", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: 64, width: "100%", maxWidth: 1040 }}>

          {/* Left — branding */}
          <section style={{ flex: "1 1 420px", maxWidth: 500, minWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 50, height: 50, border: "2px solid rgba(255,255,255,0.55)", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 18, boxShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>Ω</div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 30, textTransform: "uppercase", letterSpacing: 4 }}>CustomerIQ</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 400, lineHeight: 1.05, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
              Build smarter<br/>
              <span style={{ color: "var(--accent2)" }}>growth strategies.</span>
            </h1>

            <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600, marginBottom: 24, lineHeight: 1.7 }}>
              ML-powered segmentation, churn prediction, and lifetime value modeling — all in one unified intelligence platform.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {[
                'Cluster analysis across behavioural signals',
                'Real-time churn risk scoring with explainability',
                'LTV forecasting powered by ensemble models',
              ].map(f => (
                <div key={f} className="feature-pill">→ {f}</div>
              ))}
            </div>

            <div className="stat-strip">
              <div className="stat-item">
                <div className="stat-num">98.95<span style={{ color: 'var(--accent)', fontSize: 16, fontFamily: 'var(--font-display)' }}>%</span></div>
                <span className="stat-desc">Model Accuracy</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-num">10K<span style={{ color: 'var(--accent)', fontSize: 16, fontFamily: 'var(--font-display)' }}>+</span></div>
                <span className="stat-desc">Data Points</span>
              </div>
            </div>
          </section>

          {/* Right — signup card */}
          <section style={{ flex: "0 1 400px", minWidth: 340 }}>
            <div className="auth-card" style={{ padding: 36, width: "100%", boxSizing: "border-box" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, textTransform: "uppercase", letterSpacing: 3 }}>Create Account</h2>
                <p style={{ fontSize: 11, color: "var(--text2)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
                  Start your CustomerIQ journey — it's free
                </p>
              </div>

              {/* Username */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Username</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }}><User size={15} /></span>
                  <input style={inputStyle} placeholder="ada_lovelace"
                    value={username} onChange={e => setUsername(e.target.value)}
                    onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Work Email</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }}><Mail size={15} /></span>
                  <input style={inputStyle} type="email" placeholder="ada@company.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)" }}><Lock size={15} /></span>
                  <input style={inputStyle} type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password strength bar */}
                {password && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--bg3)", border: "2px solid rgba(255,255,255,0.55)", position: "relative", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${strength.level * 25}%`, background: strength.color, transition: "width 0.3s ease" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: strength.color, textTransform: "uppercase", letterSpacing: 1, minWidth: 40 }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div style={{ color: "var(--high)", fontWeight: 800, fontSize: 11, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1, border: "2px solid var(--high)", padding: "8px 12px" }}>
                  ⚠ {error}
                </div>
              )}

              <button className="btn-primary" onClick={handleSignup} disabled={loading}>
                {loading ? "Creating account…" : "Create Account →"}
              </button>

              <p className="auth-switch" style={{ marginTop: 16 }}>
                Already have an account?{" "}
                <button type="button" className="switch-link" onClick={switchToLogin}>Sign in</button>
              </p>
            </div>

            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <ShieldCheck size={13} style={{ color: "var(--low)" }} />
              Protected by industry-standard encryption
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}