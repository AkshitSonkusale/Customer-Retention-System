import { useState, useRef } from 'react'
import { api } from '../api'

const ROLES = [
  { key: 'id',       label: 'Customer ID',    required: false, hint: 'Unique row identifier' },
  { key: 'gender',   label: 'Gender',         required: false, hint: 'Male / Female column'  },
  { key: 'age',      label: 'Age',            required: true,  hint: 'Numeric age column'    },
  { key: 'income',   label: 'Annual Income',  required: true,  hint: 'Numeric income column' },
  { key: 'spending', label: 'Spending Score', required: true,  hint: 'Numeric score 1–100'   },
]

export default function Upload({ onDatasetReady, currentDataset }) {
  const [step,       setStep]       = useState('idle')
  const [uploadData, setUploadData] = useState(null)
  const [colMap,     setColMap]     = useState({})
  const [drag,       setDrag]       = useState(false)
  const [error,      setError]      = useState('')
  const fileRef = useRef()

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) { setError('Please select a CSV file.'); return }
    setError(''); setStep('uploading')
    try {
      const data = await api.uploadCSV(file)
      setUploadData(data)
      setColMap(data.suggestion || {})
      setStep('mapping')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Upload failed. Check backend is running.')
      setStep('idle')
    }
  }

  const handleConfirm = async () => {
    for (const r of ROLES.filter(r => r.required)) {
      if (!colMap[r.key]) { setError(`Map the "${r.label}" column.`); return }
    }
    setError(''); setStep('confirming')
    try {
      await api.confirmUpload(uploadData.token, colMap)
      setStep('done')
      onDatasetReady({ filename: uploadData.filename, rows: uploadData.totalRows, colMap })
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not confirm mapping.')
      setStep('mapping')
    }
  }

  if (step === 'idle' || step === 'uploading') return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Upload Dataset</h2>
        <p>Upload your own CSV to run analysis on your customer data</p>
      </div>

      {currentDataset && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '6px solid var(--low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 2, color: 'var(--low)' }}>
              ✓ ACTIVE: {currentDataset.filename}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
              {currentDataset.rows.toLocaleString()} rows loaded
            </div>
          </div>
          <button className="k-btn" onClick={async () => { await api.resetDataset(); onDatasetReady(null) }}>
            ↩ Reset Default
          </button>
        </div>
      )}

      <div
        className="drop-zone"
        style={{ borderColor: drag ? 'var(--accent)' : 'rgba(255,255,255,0.55)', boxShadow: drag ? 'var(--shadow-accent-lg)' : 'none', transform: drag ? 'translate(-3px,-3px)' : 'none' }}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current.click()}
      >
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />

        {step === 'uploading' ? (
          <div>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 3, color: 'var(--text2)' }}>
              PARSING MATRIX...
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, color: drag ? 'var(--accent2)' : 'var(--text)', marginBottom: 8 }}>
              DROP CSV HERE OR CLICK TO BROWSE
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Requires numeric columns: Age, Income, Spending Score
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 12, color: 'var(--high)', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, border: '2px solid var(--high)', padding: '8px 12px' }}>
          ⚠ {error}
        </div>
      )}

      <div className="grid-3" style={{ marginTop: 24 }}>
        {[
          { icon: '📋', title: 'Any CSV Format', desc: 'Any column names — map them to roles in the next step.' },
          { icon: '🔢', title: '3 Numeric Cols', desc: 'Age, Income, and Spending Score are required fields.' },
          { icon: '🔄', title: 'Revert Anytime', desc: 'Reset to the default dataset with one click.' },
        ].map(c => (
          <div key={c.title} className="card" style={{ background: 'var(--bg3)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 2, marginBottom: 6 }}>{c.title}</div>
            <div style={{ color: 'var(--text2)', fontSize: 12, fontWeight: 600 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (step === 'mapping' || step === 'confirming') return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Map Columns</h2>
        <p>{uploadData.filename} · {uploadData.totalRows.toLocaleString()} rows detected</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-title">Column Roles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ROLES.map(role => (
              <div key={role.key} className="form-group">
                <label className="form-label">
                  {role.label}
                  {role.required
                    ? <span style={{ color: 'var(--high)', marginLeft: 4 }}>*</span>
                    : <span style={{ color: 'var(--text3)', marginLeft: 4 }}>(optional)</span>}
                </label>
                <select className="form-select" value={colMap[role.key] || ''}
                  onChange={e => setColMap(m => ({ ...m, [role.key]: e.target.value || undefined }))}>
                  <option value="">— not mapped —</option>
                  {uploadData.columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{role.hint}</div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ color: 'var(--high)', fontWeight: 800, fontSize: 11, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1, border: '2px solid var(--high)', padding: '8px 12px' }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn" style={{ background: 'transparent', color: 'var(--text2)' }}
              onClick={() => { setStep('idle'); setUploadData(null) }}>← Back</button>
            <button className="btn" onClick={handleConfirm} disabled={step === 'confirming'}>
              {step === 'confirming' ? 'Applying...' : 'Confirm Schema →'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Preview — First 5 Rows</div>
          <div style={{ overflowX: 'auto', border: '2px solid var(--border-strong)' }}>
            <table>
              <thead>
                <tr>{uploadData.columns.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {uploadData.preview.map((row, i) => (
                  <tr key={i}>
                    {uploadData.columns.map(c => <td key={c}>{String(row[c] ?? '')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            {uploadData.totalRows.toLocaleString()} rows · {uploadData.numericColumns.length} numeric · {uploadData.categoricalColumns.length} text columns
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fade-in">
      <div className="page-header"><h2>Dataset Ready</h2></div>
      <div className="card" style={{ textAlign: 'center', padding: 56, background: 'var(--bg3)', maxWidth: 500 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, marginBottom: 8 }}>
          {uploadData.filename}
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>
          {uploadData.totalRows.toLocaleString()} rows loaded · K-Means will run on your data
        </div>
        <button className="btn" onClick={() => onDatasetReady({ filename: uploadData.filename, rows: uploadData.totalRows, colMap })}>
          Go to Dashboard →
        </button>
      </div>
    </div>
  )
}