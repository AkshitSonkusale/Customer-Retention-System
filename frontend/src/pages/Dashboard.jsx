import { useEffect, useState } from 'react'
import { api } from '../api'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line } from 'recharts'

const CLUSTER_COLORS = ['#7c6ff7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

const CustomDot = ({ cx, cy, payload }) => {
  const color = CLUSTER_COLORS[payload.cluster % CLUSTER_COLORS.length]
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="rgba(0,0,0,0.8)" strokeWidth={1.5} />
}

const KPI_CONFIG = [
  { key: 'high',   label: 'High Risk',        sub: 'Likely to churn',    color: 'var(--high)',   border: '#ef4444' },
  { key: 'medium', label: 'Medium Risk',       sub: 'Needs attention',    color: 'var(--med)',    border: '#f59e0b' },
  { key: 'low',    label: 'Low Risk',          sub: 'Loyal customers',    color: 'var(--low)',    border: '#10b981' },
  { key: 'sil',    label: 'Silhouette Score',  sub: 'Cluster quality',    color: 'var(--accent2)',border: '#7c6ff7' },
]

export default function Dashboard({ k }) {
  const [summary,  setSummary]  = useState(null)
  const [scatter,  setScatter]  = useState([])
  const [elbow,    setElbow]    = useState([])
  const [metrics,  setMetrics]  = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.summary(k), api.cluster(k), api.elbow(10), api.metrics()])
      .then(([sum, clust, elb, met]) => {
        setSummary(sum)
        setScatter(clust.scatterData)
        setElbow(elb.data)
        setMetrics(met)
      })
      .finally(() => setLoading(false))
  }, [k])

  if (loading) return <div className="loading"><div className="spinner" /><span>Running K-Means...</span></div>
  if (!summary) return null

  const { riskBreakdown, clusters, silhouetteScore } = summary

  const kpiValues = {
    high:   riskBreakdown.high,
    medium: riskBreakdown.medium,
    low:    riskBreakdown.low,
    sil:    silhouetteScore,
  }

  const tooltipStyle = {
    background: 'var(--bg2)',
    border: '2px solid rgba(255,255,255,0.55)',
    borderRadius: 0,
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text)',
    boxShadow: '3px 3px 0px rgba(0,0,0,0.8)',
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Churn Overview</h2>
        <p>K-Means · k={k} · {summary.totalCustomers.toLocaleString()} customers analysed</p>
      </div>

      {/* KPI cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {KPI_CONFIG.map(({ key, label, sub, color, border }) => (
          <div key={key} className="card" style={{ borderLeft: `6px solid ${border}` }}>
            <div className="card-title">{label}</div>
            <div className="stat-value" style={{ color }}>{kpiValues[key]}</div>
            <div className="stat-label">{sub}</div>
          </div>
        ))}
      </div>

      {/* RF Metrics */}
      {metrics && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          {[['Accuracy', metrics.accuracy], ['Precision', metrics.precision], ['Recall', metrics.recall], ['F1 Score', metrics.f1]].map(([lbl, val]) => (
            <div key={lbl} className="card" style={{ background: 'var(--bg3)', borderLeft: '6px solid var(--accent)' }}>
              <div className="card-title">{lbl}</div>
              <div className="stat-value" style={{ color: 'var(--accent2)' }}>{Number(val).toFixed(1)}%</div>
              <div className="stat-label">Random Forest</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">Income vs Spending Score</div>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="0" />
              <XAxis dataKey="x" name="Income"   tick={{ fill: 'var(--text2)', fontSize: 11, fontWeight: 700 }} />
              <YAxis dataKey="y" name="Spending" tick={{ fill: 'var(--text2)', fontSize: 11, fontWeight: 700 }} />
              <Tooltip cursor={{ stroke: 'var(--accent)', strokeWidth: 1 }} contentStyle={tooltipStyle}
                formatter={(val, name) => [val, name === 'x' ? 'Income (k$)' : 'Spending Score']} />
              <Scatter data={scatter} shape={<CustomDot />}>
                {scatter.map((e, i) => <Cell key={i} fill={CLUSTER_COLORS[e.cluster % CLUSTER_COLORS.length]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Elbow Method — WCSS</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={elbow} margin={{ top: 10, right: 16, bottom: 10, left: -10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="0" />
              <XAxis dataKey="k" tick={{ fill: 'var(--text2)', fontSize: 11, fontWeight: 700 }} />
              <YAxis                tick={{ fill: 'var(--text2)', fontSize: 11, fontWeight: 700 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="wcss" stroke="var(--accent)" strokeWidth={3}
                dot={{ fill: 'var(--accent)', stroke: 'rgba(0,0,0,0.8)', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: 'var(--accent2)' }} name="WCSS" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cluster Summary */}
      <div className="card">
        <div className="card-title">Cluster Summary</div>
        <div className="cluster-cards">
          {clusters.map(c => {
            const color  = CLUSTER_COLORS[c.id % CLUSTER_COLORS.length]
            const bClass = c.riskLevel === 3 ? 'badge-high' : c.riskLevel === 2 ? 'badge-med' : 'badge-low'
            return (
              <div className="cluster-card" key={c.id} style={{ borderLeft: `5px solid ${color}` }}>
                <div className="cluster-card-header">
                  <span className="cluster-num">Cluster {c.id}</span>
                  <span className={`badge ${bClass}`}>{c.churnRisk}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[['Customers', c.count], ['Avg Spend', c.avgSpending], ['Avg Income', `${c.avgIncome}k`], ['Avg Age', c.avgAge]].map(([lbl, val]) => (
                    <div className="cluster-stat" key={lbl}>
                      <div className="cluster-stat-label">{lbl}</div>
                      <div className="cluster-stat-val" style={{ color }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}