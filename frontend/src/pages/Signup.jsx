import { useState } from "react"
import { User, Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react"
import axios from "axios"
import AuthBackground from "./AuthBackground"

/* Password strength scorer */
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
    { level: 1, label: "Weak",   color: "#ef4444" },
    { level: 2, label: "Fair",   color: "#f59e0b" },
    { level: 3, label: "Good",   color: "#10b981" },
    { level: 4, label: "Strong", color: "#7c6ff7" },
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

  /* ── Your existing signup logic — untouched ── */
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
    <main className="auth-page">
      <AuthBackground />

      {/* ══ Left branding ══ */}
      <section className="auth-left">
        <div className="brand-lockup">
          <div className="brand-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="14" fill="url(#lg2)" />
              <path d="M14 24C14 18 18.5 14 24 14c3.5 0 6.5 1.8 8.5 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <circle cx="24" cy="24" r="4.5" fill="white" fillOpacity="0.9"/>
              <circle cx="14" cy="30" r="3"   fill="white" fillOpacity="0.5"/>
              <circle cx="34" cy="30" r="3"   fill="white" fillOpacity="0.5"/>
              <line x1="17" y1="30" x2="21" y2="26" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
              <line x1="31" y1="30" x2="27" y2="26" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
              <defs>
                <linearGradient id="lg2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c6ff7"/><stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="brand-name">CustomerIQ</span>
        </div>

        <h1 className="auth-headline">
          Get started<br/>
          <span className="gradient-text">for free today.</span>
        </h1>

        <p className="auth-sub">
          Join thousands of product and data teams using CustomerIQ to
          understand, retain, and grow their customer base.
        </p>

        <ul className="feature-list">
          <li className="feature-pill">
            <span className="pill-icon">⬡</span>
            No credit card required — free tier included
          </li>
          <li className="feature-pill">
            <span className="pill-icon">⬡</span>
            Connect your data source in under 5 minutes
          </li>
          <li className="feature-pill">
            <span className="pill-icon">⬡</span>
            ML models train automatically on your data
          </li>
        </ul>

        </section>

      {/* ══ Right card ══ */}
      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create your account</h2>
            <p className="auth-card-sub">Start your CustomerIQ journey — it's free</p>
          </div>

          {/* Username */}
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
                autoComplete="username"
              />
            </div>
          </div>

          {/* Email */}
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
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password + strength */}
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
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(v => !v)}
                aria-label="Toggle password"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength meter — only shown when typing */}
            {password && (
              <div className="strength-wrap">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${strength.level * 25}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          <div className={`auth-error${error ? " visible" : ""}`}>{error}</div>

          {/* Submit */}
          <button
            className={`btn-primary${loading ? " loading" : ""}`}
            onClick={handleSignup}
            disabled={loading}
          >
            <span className="btn-text">
              {loading ? "Creating account…" : "Create account"}
            </span>
            <span className="btn-spinner" />
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" className="switch-link" onClick={switchToLogin}>
              Sign in
            </button>
          </p>
        </div>

        <p className="auth-footer">
          Protected by industry-standard encryption · SOC 2 Type II
        </p>
      </section>
    </main>
  )
}
