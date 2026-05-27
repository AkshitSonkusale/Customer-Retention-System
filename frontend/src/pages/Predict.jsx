import { useState } from 'react'
import { api } from '../api'

export default function Predict() {
  const [form, setForm] = useState({
  age: '',
  annualIncome: '',
  spendingScore: '',
  gender: 'Male',

  visitFrequency: '',
  satisfactionScore: '',
  complaintsCount: '',
  loyaltyPoints: ''
})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const { age, annualIncome, spendingScore } = form
    if (!age || !annualIncome || !spendingScore) return 'Please fill all fields.'
    if (age < 1 || age > 100) return 'Age must be 1–100.'
    if (annualIncome < 1) return 'Income must be positive.'
    if (spendingScore < 1 || spendingScore > 100) return 'Spending score must be 1–100.'
    return ''
  }

  const handleSubmit = async () => {
  const err = validate()

  if (err) {
    setError(err)
    return
  }

  setError('')
  setLoading(true)

  try {
   const res = await api.predict({
  age: Number(form.age),
  annualIncome: Number(form.annualIncome),
  spendingScore: Number(form.spendingScore),
  gender: form.gender,

  visitFrequency: Number(form.visitFrequency || 0),
  satisfactionScore: Number(form.satisfactionScore || 5),
  complaintsCount: Number(form.complaintsCount || 0),
  loyaltyPoints: Number(form.loyaltyPoints || 0)
})
    console.log('Prediction Response:', res)

    setResult(res)
  } catch {
    setError(
      'Failed to connect to backend. Make sure the API is running on port 8000.'
    )
  } finally {
    setLoading(false)
  }
}

  const riskMessages = {
    'High Risk': {
      action: 'Immediate retention action needed',
      tips: [
        'Send personalised discount offer',
        'Invite to loyalty programme',
        'Schedule follow-up outreach'
      ],
      bg: 'rgba(239,68,68,0.06)',
      border: 'rgba(239,68,68,0.2)'
    },

    'Medium Risk': {
      action: 'Monitor and engage proactively',
      tips: [
        'Send seasonal promotions',
        'Highlight new arrivals',
        'Offer membership upgrade'
      ],
      bg: 'rgba(245,158,11,0.06)',
      border: 'rgba(245,158,11,0.2)'
    },

    'Low Risk': {
      action: 'Maintain engagement to retain loyalty',
      tips: [
        'Reward with exclusive access',
        'Invite to VIP events',
        'Collect feedback to improve experience'
      ],
      bg: 'rgba(16,185,129,0.06)',
      border: 'rgba(16,185,129,0.2)'
    },
  }

  return (
    <div>
      <div className="page-header">
        <h2>Customer Intelligence</h2>
        <p>
          Analyze customer behavior, predict churn risk, and generate retention recommendations.
        </p>
      </div>

      <div className="grid-2" style={{ maxWidth: 800 }}>
        <div className="card">
          <div className="card-title">Customer Profile</div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={form.gender}
                onChange={e => set('gender', e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="100"
                placeholder="e.g. 28"
                value={form.age}
                onChange={e => set('age', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Annual Income (k$)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="e.g. 65"
                value={form.annualIncome}
                onChange={e => set('annualIncome', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Spending Score (1–100)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="100"
                placeholder="e.g. 72"
                value={form.spendingScore}
                onChange={e => set('spendingScore', e.target.value)}
              />
            </div>

            <div className="form-group">
  <label className="form-label">
    Visit Frequency
  </label>

  <input
    className="form-input"
    type="number"
    min="0"
    placeholder="e.g. 12"
    value={form.visitFrequency}
    onChange={e =>
      set('visitFrequency', e.target.value)
    }
  />
</div>

<div className="form-group">
  <label className="form-label">
    Satisfaction Score (1–10)
  </label>

  <input
    className="form-input"
    type="number"
    min="1"
    max="10"
    placeholder="e.g. 8"
    value={form.satisfactionScore}
    onChange={e =>
      set('satisfactionScore', e.target.value)
    }
  />
</div>

<div className="form-group">
  <label className="form-label">
    Complaints Count
  </label>

  <input
    className="form-input"
    type="number"
    min="0"
    placeholder="e.g. 1"
    value={form.complaintsCount}
    onChange={e =>
      set('complaintsCount', e.target.value)
    }
  />
</div>

<div className="form-group">
  <label className="form-label">
    Loyalty Points
  </label>

  <input
    className="form-input"
    type="number"
    min="0"
    placeholder="e.g. 500"
    value={form.loyaltyPoints}
    onChange={e =>
      set('loyaltyPoints', e.target.value)
    }
  />
</div>
          </div>

          {error && (
            <div
              style={{
                color: '#f87171',
                fontSize: 12,
                marginTop: 10
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict Churn Risk →'}
          </button>
        </div>

        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 220,
            background: 'var(--bg3)'
          }}
        >
          {!result && !loading && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text3)'
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  marginBottom: 12
                }}
              >
                🎯
              </div>

              <div style={{ fontSize: 13 }}>
                Fill in the form to get a prediction
              </div>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner" />
            </div>
          )}

          {result && !loading && (() => {

            const info =
              riskMessages[result.predictedChurnRisk] ||
              riskMessages['Medium Risk']

            const badgeClass =
              result.riskLevel === 3
                ? 'badge-high'
                : result.riskLevel === 2
                ? 'badge-med'
                : 'badge-low'

            return (
              <div style={{ width: '100%', padding: 4 }}>

                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: 16
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      marginBottom: 8
                    }}
                  >
                    {result.riskBadge}
                  </div>

                  <span
                    className={`badge ${badgeClass}`}
                    style={{
                      fontSize: 14,
                      padding: '6px 16px'
                    }}
                  >
                    {result.predictedChurnRisk}
                  </span>

                  <div
                    style={{
                      marginTop: 8,
                      color: 'var(--text2)',
                      fontSize: 12
                    }}
                  >
                    Assigned to Cluster {result.cluster}
                  </div>

                  {result.confidence && (
                    <div
                      style={{
                        marginTop: 6,
                        color: 'var(--accent2)',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      Confidence: {result.confidence}%
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: info.bg,
                    border: `1px solid ${info.border}`,
                    borderRadius: 8,
                    padding: 14
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text2)',
                      marginBottom: 8
                    }}
                  >
                    {result.recommendation || info.action}
                  </div>

                  {info.tips.map((t, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: 'var(--text3)',
                        marginTop: 4
                      }}
                    >
                      • {t}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      <div
        className="grid-3"
        style={{
          marginTop: 24,
          maxWidth: 800
        }}
      >
        {[
          {
            risk: 'High Risk 🔴',
            desc: 'Low spending score (< 35). Customers likely disengaged. Needs immediate intervention.',
            border: 'var(--high)'
          },
          {
            risk: 'Medium Risk 🟡',
            desc: 'Moderate spending (35–55). Occasional shoppers. Susceptible to competitor offers.',
            border: 'var(--med)'
          },
          {
            risk: 'Low Risk 🟢',
            desc: 'High spending score (> 55). Loyal and frequent visitors. Focus on maintaining satisfaction.',
            border: 'var(--low)'
          },
        ].map(info => (
          <div
            key={info.risk}
            className="card"
            style={{
              borderColor: info.border + '44'
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 6
              }}
            >
              {info.risk}
            </div>

            <div
              style={{
                color: 'var(--text3)',
                fontSize: 12,
                lineHeight: 1.6
              }}
            >
              {info.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}