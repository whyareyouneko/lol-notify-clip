
import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function App() {
  const [puuid, setPuuid] = useState('demo')
  const [data, setData] = useState<any>(null)

  const fetchSummary = async () => {
    const r = await fetch(`${API_BASE}/summary/${puuid}`)
    const j = await r.json()
    setData(j)
  }

  return (
    <div style={{fontFamily:'ui-sans-serif', padding:16}}>
      <h1>Rift Rewind</h1>
      <div style={{display:'flex', gap:8}}>
        <input value={puuid} onChange={e=>setPuuid(e.target.value)} placeholder="puuid"/>
        <button onClick={fetchSummary}>Load Summary</button>
      </div>
      <pre style={{marginTop:16, background:'#111', color:'#0f0', padding:12, overflow:'auto'}}>
        {data ? JSON.stringify(data, null, 2) : 'No data'}
      </pre>
    </div>
  )
}
