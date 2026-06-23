import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"
import axios from "axios"
import AuthBackground from "./AuthBackground"

function scorePassword(pw) {
  if (!pw) return { level: 0, label: "", color: "" }
  let s = 0
  if (pw.length >= 8)  s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw))   s++
  if (/[^a-zA-Z0-9]/.test(pw)) s++
  const levels = [
    { level: 0, label: "",       color: "" },
    { level: 1, label: "Weak",   color: "var(--high)" },
    { level: 2, label: "Fair",   color: "var(--med)" },
    { level: 3, label: "Good",   color: "var(--low)" },
    { level: 4, label: "Strong", color: "var(--accent)" },
  ]
  return levels[Math.min(4, s)]
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
    try {
      setLoading(true)
      setError("")
      await axios.post("http://localhost:8000/auth/signup", { username, email, password })
      switchToLogin()
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const onKey = e => e.key === "Enter" && handleSignup()

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "100px 24px 60px" }}>
      <main className="auth-page" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "64px", width: "100%", maxWidth: "1100px", padding: "0", minHeight: "auto" }}>
        <AuthBackground />

        {/* ══ Left branding ══ */}
        <section className="auth-left" style={{ flex: "1 1 420px", maxWidth: "500px", minWidth: "320px" }}>
          <div className="brand-lockup">
            <div className="brand-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" fill="var(--bg)" stroke="var(--border)" strokeWidth="3" />
                <path d="M14 24C14 18 18.5 14 24 14c3.5 0 6.5 1.8 8.5 4.5" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <circle cx="24" cy="24" r="5" fill="var(--accent)" stroke="var(--border)" strokeWidth="2"/>
              </svg>
            </div>
            <span className="brand-name">CustomerIQ</span>
          </div>

          <h1 className="auth-headline">
            Build smarter<br/>
            <span style={{ color: "var(--accent)" }}>growth strategies.</span>
          </h1>

          <p className="auth-sub">
            ML-powered segmentation, churn prediction, and lifetime value modeling — all in one unified intelligence platform.
          </p>

          <ul className="feature-list">
            <li className="feature-pill"><span>•</span> Cluster analysis across 200+ behavioural signals</li>
            <li className="feature-pill"><span>•</span> Real-time churn risk scoring with explainability</li>
            <li className="feature-pill"><span>•</span> LTV forecasting powered by ensemble models</li>
          </ul>

          <div className="stat-strip">
            <div className="stat-item">
              <div className="stat-num">99.4</div>
              <span className="stat-suffix" style={{ color: "var(--accent)" }}>%</span>
              <span className="stat-desc">Model Accuracy</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-num">5M</div>
              <span className="stat-suffix" style={{ color: "var(--accent)" }}>+</span>
              <span className="stat-desc">Data Points</span>
            </div>
          </div>
        </section>

        {/* ══ Right form card ══ */}
        <section className="auth-card-wrap" style={{ flex: "0 1 400px", minWidth: "340px" }}>
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Create your account</h2>
              <p className="auth-card-sub">Start your CustomerIQ journey — it's free</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-username">Username</label>
              <div className="input-wrap">
                <span className="input-icon"><User size={15} /></span>
                <input
                  id="signup-username"
                  className="form-input"
                  placeholder="ada_lovelace"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={onKey}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Work email</label>
              <div className="input-wrap">
                <span className="input-icon"><Mail size={15} /></span>
                <input
                  id="signup-email"
                  className="form-input"
                  type="email"
                  placeholder="ada@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={onKey}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-pass">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><Lock size={15} /></span>
                <input
                  id="signup-pass"
                  className="form-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={onKey}
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {password && (
                <div className="strength-wrap" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                  <div style={{ flex: 1, height: "6px", background: "var(--bg3)", border: "2px solid var(--border)", position: "relative" }}>
                    <div style={{ height: "100%", width: `${strength.level * 25}%`, background: strength.color }} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: strength.color, textTransform: "uppercase" }}>{strength.label}</span>
                </div>
              )}
            </div>

            {error && <div style={{ color: "var(--high)", fontWeight: "bold", fontSize: "12px", marginBottom: "12px" }}>{error}</div>}

            <button className="btn-primary" onClick={handleSignup} disabled={loading}>
              <span>{loading ? "Creating account…" : "Create account"}</span>
            </button>

            <p className="auth-switch">
              Already have an account?{" "}
              <button type="button" className="switch-link" onClick={switchToLogin}>Sign in</button>
            </p>
          </div>

          <p className="auth-footer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px" }}>
            <ShieldCheck size={14} style={{ color: "var(--low)" }} />
            Protected by industry-standard encryption · SOC 2 Type II
          </p>
        </section>
      </main>
    </div>
  )
}