import { useEffect, useState, useMemo } from 'react'
import { api } from '../api'

export default function Customers({ k }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [sortKey, setSortKey] = useState('id')
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    setLoading(true)
    api.customers(k).then(d => setCustomers(d.customers)).finally(() => setLoading(false))
  }, [k])

  const filtered = useMemo(() => {
    let data = [...customers]
    if (riskFilter !== 'All') data = data.filter(c => c.churnRisk === riskFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(c => String(c.id).includes(q) || c.gender.toLowerCase().includes(q) || c.churnRisk.toLowerCase().includes(q))
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

  const SortIcon = ({ k: key }) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading customers...</span></div>

  const riskCounts = {
    'High Risk':   customers.filter(c => c.riskLevel === 3).length,
    'Medium Risk': customers.filter(c => c.riskLevel === 2).length,
    'Low Risk':    customers.filter(c => c.riskLevel === 1).length,
  }

  return (
    <div>
      <div className="page-header">
        <h2>Customer Profiles</h2>
        <p>All {customers.length} customers with cluster assignments and churn risk</p>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="filter-btns">
            {['All', 'High Risk', 'Medium Risk', 'Low Risk'].map(f => (
              <button key={f} className={`filter-btn ${riskFilter === f ? 'active' : ''}`} onClick={() => setRiskFilter(f)}>
                {f} ({f !== 'All' ? riskCounts[f] || 0 : customers.length})
              </button>
            ))}
          </div>
          <input className="search-input" placeholder="Search by ID, gender, risk..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[['id','ID'],['gender','Gender'],['age','Age'],['annualIncome','Income (k$)'],['spendingScore','Spending'],['cluster','Cluster'],['churnRisk','Risk']].map(([key, label]) => (
                  <th key={key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => sort(key)}>
                    {label}{SortIcon({ k: key })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const badgeClass = c.riskLevel === 3 ? 'badge-high' : c.riskLevel === 2 ? 'badge-med' : 'badge-low'
                return (
                  <tr key={c.id}>
                    <td style={{ color: '#f0eff8', fontWeight: 500 }}>#{c.id}</td>
                    <td>{c.gender}</td>
                    <td>{c.age}</td>
                    <td>${c.annualIncome}k</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: `${c.spendingScore}%`, maxWidth: 80, height: 4, borderRadius: 2, background: c.riskLevel === 3 ? '#ef4444' : c.riskLevel === 2 ? '#f59e0b' : '#10b981' }} />
                        <span>{c.spendingScore}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: ['#7c6ff7','#10b981','#f59e0b','#ef4444','#06b6d4'][c.cluster % 5], marginRight: 6 }} />
                      {c.cluster}
                    </td>
                    <td><span className={`badge ${badgeClass}`}>{c.riskBadge} {c.churnRisk}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No customers match your filter.</div>}
        </div>
        <div style={{ marginTop: 12, color: 'var(--text3)', fontSize: 12 }}>Showing {filtered.length} of {customers.length} customers</div>
      </div>
    </div>
  )
}