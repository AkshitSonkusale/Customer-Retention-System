import { useEffect, useState, useMemo } from 'react'
import { api } from '../api'

export default function Customers({ k }) {
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [riskFilter,setRiskFilter]= useState('All')
  const [sortKey,   setSortKey]   = useState('id')
  const [sortDir,   setSortDir]   = useState('asc')

  useEffect(() => {
    setLoading(true)
    api.customers(k).then(d => setCustomers(d.customers)).finally(() => setLoading(false))
  }, [k])

  const filtered = useMemo(() => {
    let data = [...customers]
    if (riskFilter !== 'All') data = data.filter(c => c.churnRisk === riskFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(c =>
        String(c.id).includes(q) ||
        c.gender.toLowerCase().includes(q) ||
        c.churnRisk.toLowerCase().includes(q)
      )
    }
    data.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    return data
  }, [customers, riskFilter, search, sortKey, sortDir])

  const sort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k: key }) => {
    if (sortKey !== key) return <span style={{ color: 'var(--text3)', marginLeft: 4 }}>⇅</span>
    return <span style={{ color: 'var(--accent2)', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading customers...</span></div>

  const riskCounts = {
    'High Risk':   customers.filter(c => c.riskLevel === 3).length,
    'Medium Risk': customers.filter(c => c.riskLevel === 2).length,
    'Low Risk':    customers.filter(c => c.riskLevel === 1).length,
  }

  const COLORS = ['#7c6ff7','#10b981','#f59e0b','#ef4444','#06b6d4']

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Customer Profiles</h2>
        <p>All {customers.length.toLocaleString()} customers with cluster assignments and churn risk</p>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="filter-btns">
            {['All', 'High Risk', 'Medium Risk', 'Low Risk'].map(f => (
              <button key={f} className={`filter-btn ${riskFilter === f ? 'active' : ''}`}
                onClick={() => setRiskFilter(f)}>
                {f} ({f !== 'All' ? riskCounts[f] || 0 : customers.length})
              </button>
            ))}
          </div>
          <input className="search-input" placeholder="Search ID, gender, risk..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="table-wrap" style={{ border: '2px solid var(--border-strong)' }}>
          <table>
            <thead>
              <tr>
                {[['id','ID'],['gender','Gender'],['age','Age'],['annualIncome','Income'],['spendingScore','Spending'],['cluster','Cluster'],['churnRisk','Risk']].map(([key, label]) => (
                  <th key={key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => sort(key)}>
                    {label}<SortIcon k={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const bClass = c.riskLevel === 3 ? 'badge-high' : c.riskLevel === 2 ? 'badge-med' : 'badge-low'
                const clrColor = COLORS[c.cluster % COLORS.length]
                return (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)', letterSpacing: 1 }}>
                        #{c.id}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text)', fontWeight: 700 }}>{c.gender}</td>
                    <td style={{ color: 'var(--text)', fontWeight: 700 }}>{c.age}</td>
                    <td style={{ color: 'var(--text)', fontWeight: 700 }}>${c.annualIncome}k</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 72, height: 10, background: 'var(--bg)', border: '2px solid var(--border-strong)', position: 'relative', flexShrink: 0 }}>
                          <div style={{
                            width: `${c.spendingScore}%`, height: '100%',
                            background: c.riskLevel === 3 ? 'var(--high)' : c.riskLevel === 2 ? 'var(--med)' : 'var(--low)'
                          }} />
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13 }}>{c.spendingScore}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, background: clrColor, border: '2px solid rgba(0,0,0,0.5)' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: clrColor, letterSpacing: 1 }}>{c.cluster}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${bClass}`}>{c.riskBadge} {c.churnRisk}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>
              No data points matched.
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, color: 'var(--text3)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
          Showing {filtered.length} of {customers.length} records
        </div>
      </div>
    </div>
  )
}