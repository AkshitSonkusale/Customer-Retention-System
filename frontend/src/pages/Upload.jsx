import { useState, useRef } from 'react'
import { api } from '../api'

const ROLES = [
  { key: 'id',       label: 'Customer ID',   required: false, hint: 'Unique row identifier' },
  { key: 'gender',   label: 'Gender',        required: false, hint: 'Male / Female column' },
  { key: 'age',      label: 'Age',           required: true,  hint: 'Numeric age column' },
  { key: 'income',   label: 'Annual Income', required: true,  hint: 'Numeric income column' },
  { key: 'spending', label: 'Spending Score',required: true,  hint: 'Numeric score 1–100' },
]

export default function Upload({ onDatasetReady, currentDataset }) {
  const [step, setStep] = useState('idle')
  const [uploadData, setUploadData] = useState(null)
  const [colMap, setColMap] = useState({})
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
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
      setError(e?.response?.data?.detail || 'Upload failed. Check the backend is running.')
      setStep('idle')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleConfirm = async () => {
    for (const r of ROLES.filter(r => r.required)) {
      if (!colMap[r.key]) { setError(`Please map the "${r.label}" column.`); return }
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

  const handleReset = async () => {
    await api.resetDataset()
    setStep('idle'); setUploadData(null); setColMap({}); setError('')
    onDatasetReady(null)
  }

  if (step === 'idle' || step === 'uploading') return (
    <div>
      <div className="page-header">
        <h2>Upload Dataset</h2>
        <p>Upload your own CSV to replace the default Mall_Customers dataset.</p>
      </div>

      {currentDataset && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>✓ Active: {currentDataset.filename}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{currentDataset.rows} rows loaded</div>
          </div>
          <button className="btn" style={{ width: 'auto', padding: '8px 18px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }} onClick={handleReset}>
            Reset to default
          </button>
        </div>
      )}

      <div
        className="card"
        style={{ border: `2px dashed ${drag ? 'var(--accent)' : 'var(--border)'}`, background: drag ? 'rgba(124,111,247,0.05)' : 'var(--bg3)', textAlign: 'center', padding: '52px 24px', cursor: 'pointer', transition: 'all 0.2s' }}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />
        {step === 'uploading'
          ? <><div className="spinner" style={{ margin: '0 auto 14px' }} /><div style={{ color: 'var(--text2)' }}>Parsing CSV…</div></>
          : <>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📂</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: drag ? 'var(--accent2)' : 'var(--text)', marginBottom: 6 }}>Drop your CSV here, or click to browse</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Needs at least 3 numeric columns (age, income, spending score)</div>
            </>
        }
      </div>

      {error && <div style={{ marginTop: 12, color: '#f87171', fontSize: 12 }}>{error}</div>}

      <div className="grid-3" style={{ marginTop: 24 }}>
        {[
          { icon: '📋', title: 'Any CSV format', desc: 'Any column names — you map them in the next step.' },
          { icon: '🔢', title: '3 numeric cols needed', desc: 'Age, Income, and Spending Score (or equivalents).' },
          { icon: '🔄', title: 'Revert anytime', desc: 'Reset to the default Mall dataset with one click.' },
        ].map(c => (
          <div key={c.title} className="card" style={{ background: 'var(--bg3)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.title}</div>
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (step === 'mapping' || step === 'confirming') return (
    <div>
      <div className="page-header">
        <h2>Map Columns</h2>
        <p>Tell us which column in <strong style={{ color: 'var(--text)' }}>{uploadData.filename}</strong> maps to each role. ({uploadData.totalRows} rows detected)</p>
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
                    ? <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>
                    : <span style={{ color: 'var(--text3)', marginLeft: 4 }}>(optional)</span>}
                </label>
                <select className="form-select" value={colMap[role.key] || ''}
                  onChange={e => setColMap(m => ({ ...m, [role.key]: e.target.value || undefined }))}>
                  <option value="">— not mapped —</option>
                  {uploadData.columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{role.hint}</div>
              </div>
            ))}
          </div>
          {error && <div style={{ color: '#f87171', fontSize: 12, marginTop: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}
              onClick={() => { setStep('idle'); setUploadData(null) }}>← Back</button>
            <button className="btn" onClick={handleConfirm} disabled={step === 'confirming'}>
              {step === 'confirming' ? 'Applying…' : 'Confirm & Analyse →'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Preview — first 5 rows</div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr>{uploadData.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {uploadData.preview.map((row, i) => (
                  <tr key={i}>{uploadData.columns.map(c => <td key={c}>{String(row[c] ?? '')}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)' }}>
            {uploadData.totalRows} total rows · {uploadData.numericColumns.length} numeric · {uploadData.categoricalColumns.length} text columns
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header"><h2>Dataset Ready</h2></div>
      <div className="card" style={{ textAlign: 'center', padding: 48, background: 'var(--bg3)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{uploadData.filename} loaded</div>
        <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 24 }}>{uploadData.totalRows} rows · K-Means will now run on your data</div>
        <button className="btn" style={{ maxWidth: 200, margin: '0 auto' }}
          onClick={() => onDatasetReady({ filename: uploadData.filename, rows: uploadData.totalRows, colMap })}>
          Go to Dashboard →
        </button>
      </div>
    </div>
  )
}