import { useState, useEffect } from 'react'
import BankingTable from './components/BankingTable'
import './App.css'

function App() {
  const [bankingData, setBankingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch hierarchical data from our Express server
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/accounts')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        setBankingData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon"></div>
          <h1>FinTech Pro</h1>
        </div>
      </header>
      
      <main className="app-main">
        {error ? (
          <div className="error-container">
            <h2>Error Loading Data</h2>
            <p>{error}</p>
            <p className="hint">Make sure the Express server is running on port 3001.</p>
          </div>
        ) : (
          <BankingTable data={bankingData} loading={loading} />
        )}
      </main>
    </div>
  )
}

export default App
