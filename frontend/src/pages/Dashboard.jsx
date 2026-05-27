import { useEffect, useState } from 'react'
import { api } from '../api'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line
} from 'recharts'

const CLUSTER_COLORS = [
  '#7c6ff7',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4'
]

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  const color =
    CLUSTER_COLORS[
      payload.cluster % CLUSTER_COLORS.length
    ]

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      fillOpacity={0.8}
      stroke="none"
    />
  )
}

export default function Dashboard({ k }) {
  const [summary, setSummary] = useState(null)
  const [scatter, setScatter] = useState([])
  const [elbow, setElbow] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    Promise.all([
      api.summary(k),
      api.cluster(k),
      api.elbow(10),
      api.metrics()
    ])
      .then(([sum, clust, elb, met]) => {
        setSummary(sum)
        setScatter(clust.scatterData)
        setElbow(elb.data)
        setMetrics(met)
      })
      .finally(() => setLoading(false))
  }, [k])

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Running K-Means...</span>
      </div>
    )

  if (!summary) return null

  const {
    riskBreakdown,
    clusters,
    silhouetteScore
  } = summary

  return (
    <div>
      <div className="page-header">
        <h2>Churn Overview</h2>
        <p>
          K-Means clustering with k={k} —{' '}
          {summary.totalCustomers} customers analysed
        </p>
      </div>

      {/* EXISTING TOP STATS */}
      <div
        className="grid-4"
        style={{ marginBottom: 24 }}
      >
        <div className="card">
          <div className="card-title">High Risk</div>
          <div className="stat-value stat-high">
            {riskBreakdown.high}
          </div>
          <div className="stat-label">
            Likely to churn
          </div>
        </div>

        <div className="card">
          <div className="card-title">Medium Risk</div>
          <div className="stat-value stat-med">
            {riskBreakdown.medium}
          </div>
          <div className="stat-label">
            Needs attention
          </div>
        </div>

        <div className="card">
          <div className="card-title">Low Risk</div>
          <div className="stat-value stat-low">
            {riskBreakdown.low}
          </div>
          <div className="stat-label">
            Loyal customers
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            Silhouette Score
          </div>
          <div className="stat-value stat-acc">
            {silhouetteScore}
          </div>
          <div className="stat-label">
            Cluster quality (0–1)
          </div>
        </div>
      </div>

      {/* NEW MODEL PERFORMANCE SECTION */}
      {metrics && (
        <div
          className="grid-4"
          style={{ marginBottom: 24 }}
        >
          <div className="card">
            <div className="card-title">
              Accuracy
            </div>
            <div className="stat-value stat-acc">
              {Number(metrics.accuracy).toFixed(1)}%
            </div>
            <div className="stat-label">
              Overall correctness
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              Precision
            </div>
            <div className="stat-value stat-acc">
              {Number(metrics.precision).toFixed(1)}%
            </div>
            <div className="stat-label">
              Prediction quality
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              Recall
            </div>
            <div className="stat-value stat-acc">
              {Number(metrics.recall).toFixed(1)}%
            </div>
            <div className="stat-label">
              Detection rate
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              F1 Score
            </div>
            <div className="stat-value stat-acc">
              {Number(metrics.f1).toFixed(1)}%
            </div>
            <div className="stat-label">
              Balanced metric
            </div>
          </div>
        </div>
      )}

      <div
        className="grid-2"
        style={{ marginBottom: 24 }}
      >
        <div className="card">
          <div className="card-title">
            Income vs Spending Score
          </div>

          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <ScatterChart
              margin={{
                top: 10,
                right: 10,
                bottom: 0,
                left: -10
              }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />

              <XAxis
                dataKey="x"
                name="Income"
                tick={{
                  fill: '#5e5c70',
                  fontSize: 11
                }}
                label={{
                  value:
                    'Annual Income (k$)',
                  position:
                    'insideBottom',
                  offset: -2,
                  fill: '#5e5c70',
                  fontSize: 11
                }}
              />

              <YAxis
                dataKey="y"
                name="Spending"
                tick={{
                  fill: '#5e5c70',
                  fontSize: 11
                }}
                label={{
                  value:
                    'Spending Score',
                  angle: -90,
                  position:
                    'insideLeft',
                  fill: '#f2f1f9',
                  fontSize: 11
                }}
              />

              <Tooltip
                cursor={{
                  strokeDasharray:
                    '3 3',
                  stroke: '#fdf4f4'
                }}
                contentStyle={{
                  background: '#e4e4f0',
                  border:
                    '1px solid rgba(255,255,255,0.92)',
                  borderRadius: 8,
                  fontSize: 12
                }}
                formatter={(
                  val,
                  name
                ) => [
                  val,
                  name === 'x'
                    ? 'Income (k$)'
                    : 'Spending Score'
                ]}
              />

              <Scatter
                data={scatter}
                shape={<CustomDot />}
              >
                {scatter.map(
                  (entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        CLUSTER_COLORS[
                          entry.cluster %
                            CLUSTER_COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">
            Elbow Method — WCSS
          </div>

          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <LineChart
              data={elbow}
              margin={{
                top: 10,
                right: 16,
                bottom: 10,
                left: -10
              }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />

              <XAxis
                dataKey="k"
                tick={{
                  fill: '#5e5c70',
                  fontSize: 11
                }}
                label={{
                  value:
                    'Number of clusters (k)',
                  position:
                    'insideBottom',
                  offset: -2,
                  fill: '#5e5c70',
                  fontSize: 11
                }}
              />

              <YAxis
                tick={{
                  fill: '#5e5c70',
                  fontSize: 11
                }}
              />

              <Tooltip
                contentStyle={{
                  background:
                    '#1a1a26',
                  border:
                    '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 12
                }}
              />

              <Line
                type="monotone"
                dataKey="wcss"
                stroke="#7c6ff7"
                strokeWidth={2}
                dot={{
                  fill: '#7c6ff7',
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  fill: '#a78bfa'
                }}
                name="WCSS"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Cluster Summary
        </div>

        <div className="cluster-cards">
          {clusters.map((c) => {
            const color =
              CLUSTER_COLORS[
                c.id %
                  CLUSTER_COLORS.length
              ]

            const badgeClass =
              c.riskLevel === 3
                ? 'badge-high'
                : c.riskLevel === 2
                ? 'badge-med'
                : 'badge-low'

            return (
              <div
                className="cluster-card"
                key={c.id}
                style={{
                  borderColor:
                    color + '33'
                }}
              >
                <div className="cluster-card-header">
                  <span className="cluster-num">
                    Cluster {c.id}
                  </span>

                  <span
                    className={`badge ${badgeClass}`}
                  >
                    {c.churnRisk}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap'
                  }}
                >
                  <div className="cluster-stat">
                    <div className="cluster-stat-label">
                      Customers
                    </div>
                    <div
                      className="cluster-stat-val"
                      style={{ color }}
                    >
                      {c.count}
                    </div>
                  </div>

                  <div className="cluster-stat">
                    <div className="cluster-stat-label">
                      Avg Spend
                    </div>
                    <div
                      className="cluster-stat-val"
                      style={{ color }}
                    >
                      {c.avgSpending}
                    </div>
                  </div>

                  <div className="cluster-stat">
                    <div className="cluster-stat-label">
                      Avg Income
                    </div>
                    <div
                      className="cluster-stat-val"
                      style={{ color }}
                    >
                      {c.avgIncome}k
                    </div>
                  </div>

                  <div className="cluster-stat">
                    <div className="cluster-stat-label">
                      Avg Age
                    </div>
                    <div
                      className="cluster-stat-val"
                      style={{ color }}
                    >
                      {c.avgAge}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}