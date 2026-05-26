import { useState } from "react"
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react"
import axios from "axios"
import AuthBackground from "./AuthBackground"

export default function Login({ onLogin, switchToSignup }) {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  /* ── Your existing login logic — untouched ── */
  const handleLogin = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await axios.post("http://localhost:8000/auth/login", { email, password })
      localStorage.setItem("token", res.data.access_token)
      onLogin()
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const onKey = e => e.key === "Enter" && handleLogin()

  return (
    <main className="auth-page">
      <AuthBackground />

      {/* ══ Left branding ══ */}
      <section className="auth-left">
        <div className="brand-lockup">
          <div className="brand-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="14" fill="url(#lg1)" />
              <path d="M14 24C14 18 18.5 14 24 14c3.5 0 6.5 1.8 8.5 4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <circle cx="24" cy="24" r="4.5" fill="white" fillOpacity="0.9"/>
              <circle cx="14" cy="30" r="3"   fill="white" fillOpacity="0.5"/>
              <circle cx="34" cy="30" r="3"   fill="white" fillOpacity="0.5"/>
              <line x1="17" y1="30" x2="21" y2="26" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
              <line x1="31" y1="30" x2="27" y2="26" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c6ff7"/><stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="brand-name">CustomerIQ</span>
        </div>

        <h1 className="auth-headline">
          Understand your<br/>
          <span className="gradient-text">customers deeply.</span>
        </h1>

        <p className="auth-sub">
          ML-powered segmentation, churn prediction, and lifetime value
          modeling — all in one unified intelligence platform.
        </p>

        <ul className="feature-list">
          <li className="feature-pill">
            <span className="pill-icon">⬡</span>
            Cluster analysis across 200+ behavioural signals
          </li>
          <li className="feature-pill">
            <span className="pill-icon">⬡</span>
            Real-time churn risk scoring with explainability
          </li>
          <li className="feature-pill">
            <span className="pill-icon">⬡</span>
            LTV forecasting powered by ensemble models
          </li>
        </ul>

        </section>

      {/* ══ Right card ══ */}
      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p className="auth-card-sub">Sign in to your CustomerIQ workspace</p>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <div className="input-wrap">
              <span className="input-icon"><Mail size={15} /></span>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={onKey}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-pass">
              Password
              <a href="#" className="forgot-link" onClick={e => e.preventDefault()}>
                Forgot password?
              </a>
            </label>
            <div className="input-wrap">
              <span className="input-icon"><Lock size={15} /></span>
              <input
                id="login-pass"
                className="form-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onKey}
                autoComplete="current-password"
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
          </div>

          {/* Error */}
          <div className={`auth-error${error ? " visible" : ""}`}>{error}</div>

          {/* Submit */}
          <button
            className={`btn-primary${loading ? " loading" : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {!loading && <LogIn size={16} />}
            <span className="btn-text">
              {loading ? "Signing in…" : "Sign in"}
            </span>
            <span className="btn-spinner" />
          </button>

          {/* Divider + social stubs */}
          <div className="divider"><span>or continue with</span></div>
          <div className="social-row">
            <button className="btn-social" type="button">
              <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="btn-social" type="button">
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <button type="button" className="switch-link" onClick={switchToSignup}>
              Create one free
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
