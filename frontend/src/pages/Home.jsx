import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000'

const statusColors = {
  'Open': 'bg-green-100 text-green-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Closed': 'bg-gray-100 text-gray-500',
}

const priorityColors = {
  'Low': 'bg-blue-100 text-blue-600',
  'Medium': 'bg-orange-100 text-orange-600',
  'High': 'bg-red-100 text-red-600',
}

export default function Home() {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [stats, setStats] = useState({ Open: 0, 'In Progress': 0, Closed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [search, status])

  async function fetchTickets() {
    try {
      const params = {}
      if (search) params.search = search
      if (status !== 'All') params.status = status
      const res = await axios.get(`${API}/api/tickets`, { params })
      setTickets(res.data)

      // Calculate stats from full list
      const all = await axios.get(`${API}/api/tickets`)
      const s = { Open: 0, 'In Progress': 0, Closed: 0 }
      all.data.forEach(t => { if (s[t.status] !== undefined) s[t.status]++ })
      setStats(s)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function copyId(e, id) {
    e.preventDefault()
    navigator.clipboard.writeText(id)
    alert(`Copied: ${id}`)
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Open', count: stats['Open'], color: 'border-green-400' },
          { label: 'In Progress', count: stats['In Progress'], color: 'border-yellow-400' },
          { label: 'Closed', count: stats['Closed'], color: 'border-gray-400' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${s.color}`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, ID, or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {['All', 'Open', 'In Progress', 'Closed'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Ticket List */}
      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🎫</p>
          <p className="text-lg">No tickets found</p>
          <Link to="/create" className="text-blue-500 text-sm mt-2 inline-block hover:underline">
            Create your first ticket
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Ticket ID', 'Customer', 'Subject', 'Priority', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, i) => (
                <tr key={t.ticket_id} className={`border-b border-gray-100 hover:bg-blue-50 transition ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/tickets/${t.ticket_id}`} className="text-blue-600 font-mono font-medium hover:underline">
                        {t.ticket_id}
                      </Link>
                      <button onClick={e => copyId(e, t.ticket_id)} className="text-gray-300 hover:text-gray-500 text-xs" title="Copy ID">⧉</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{t.customer_name}</p>
                    <p className="text-gray-400 text-xs">{t.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{t.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[t.priority] || ''}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[t.status] || ''}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}