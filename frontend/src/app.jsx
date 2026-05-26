import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Predict from './pages/Predict'
import Upload from './pages/Upload'
import { api } from './api'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { LogOut } from 'lucide-react'

import {
  Database,
  LayoutDashboard,
  Users,
  Target
} from "lucide-react"

const NAV = [
  { id: 'upload', label: 'Dataset', icon: Database },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'predict', label: 'Predict Risk', icon: Target },
]

export default function App() {

  const [page, setPage] = useState('dashboard')

  const [k, setK] = useState(5)

  const [dataset, setDataset] = useState(null)

  const [authenticated, setAuthenticated] = useState(
    !!localStorage.getItem("token")
  )

  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {

    if (!authenticated) return

    api.datasetInfo()
      .then(info => {

        if (info.source === 'upload') {

          setDataset({
            filename: info.filename,
            rows: info.row_count,
            colMap: info.col_map
          })

        } else {

          setDataset({
            filename: 'Mall_Customers.csv',
            rows: 200,
            isDefault: true
          })

        }

      })
      .catch(() => {

        setDataset({
          filename: 'Mall_Customers.csv',
          rows: 200,
          isDefault: true
        })

      })

  }, [authenticated])

  const handleDatasetReady = (ds) => {

    if (ds) {

      setDataset(ds)

      setPage('dashboard')

    } else {

      setDataset({
        filename: 'Mall_Customers.csv',
        rows: 200,
        isDefault: true
      })

      setPage('dashboard')
    }
  }

  const logout = () => {

    localStorage.removeItem("token")

    setAuthenticated(false)

    setShowSignup(false)
  }

  if (!authenticated) {

    return showSignup ? (

      <Signup
        switchToLogin={() =>
          setShowSignup(false)
        }
      />

    ) : (

      <Login
        onLogin={() =>
          setAuthenticated(true)
        }
        switchToSignup={() =>
          setShowSignup(true)
        }
      />

    )
  }

  const isDefault =
    !dataset || dataset.isDefault

  return (

    <div className="app">

      <aside className="sidebar">

        <div className="sidebar-logo">
          <h1>CustomerIQ</h1>
          <span>Customer Churn Intelligence</span>
        </div>

        <nav className="sidebar-nav">

          {NAV.map(item => {

            const Icon = item.icon

            return (

              <button
                key={item.id}
                className={`nav-item ${
                  page === item.id
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setPage(item.id)
                }
              >
                <Icon size={18} />
                {item.label}
              </button>

            )

          })}

          <div
            style={{
              marginTop: 'auto',
              paddingTop: 24
            }}
          >

            <div
              style={{
                padding: '0 12px',
                marginBottom: 8,
                fontSize: 11,
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}
            >
              Clusters (k)
            </div>

            <div
              style={{
                padding: '0 12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4
              }}
            >
              {[3,4,5,6,7].map(n => (

                <button
                  key={n}
                  className={`k-btn ${
                    k === n
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setK(n)
                  }
                >
                  {n}
                </button>

              ))}
            </div>

          </div>

        </nav>

        <div
          style={{
            padding: '14px 20px',
            borderTop:
              '1px solid var(--border)'
          }}
        >

          <div
            style={{
              fontSize: 10,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 4
            }}
          >
            Active Dataset
          </div>

          <div
            style={{
              fontSize: 12,
              color: isDefault
                ? 'var(--text2)'
                : '#a78bfa',
              fontWeight:
                isDefault ? 400 : 600,
              wordBreak: 'break-all'
            }}
          >
            {dataset
              ? dataset.filename
              : '—'}
          </div>

          <div
            style={{
              fontSize: 11,
              color: 'var(--text3)',
              marginTop: 2
            }}
          >
            {dataset
              ? `${dataset.rows} rows`
              : ''}
            {isDefault
              ? ' · default'
              : ' · uploaded'}
          </div>

          {!isDefault && (

            <button
              style={{
                marginTop: 8,
                fontSize: 11,
                color: 'var(--text3)',
                background: 'none',
                border:
                  '1px solid var(--border)',
                borderRadius: 5,
                padding: '3px 8px',
                cursor: 'pointer',
                fontFamily:
                  'var(--font-body)'
              }}
              onClick={async () => {

                await api.resetDataset()

                handleDatasetReady(null)

              }}
            >
              ↩ Use default
            </button>

          )}

          <button
            className="btn"
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onClick={logout}
          >
            <LogOut size={16}/>
            Logout
          </button>

        </div>

      </aside>

      <main className="main">

        {page === 'upload' &&
          <Upload
            onDatasetReady={
              handleDatasetReady
            }
            currentDataset={
              isDefault
                ? null
                : dataset
            }
          />
        }

        {page === 'dashboard' &&
          <Dashboard k={k} />
        }

        {page === 'customers' &&
          <Customers k={k} />
        }

        {page === 'predict' &&
          <Predict />
        }

      </main>

    </div>
  )
}