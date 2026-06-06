import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function TicketDetail() {
  const { ticket_id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [ticket_id])

  async function fetchTicket() {
    try {
      const res = await axios.get(`${API}/api/tickets/${ticket_id}`)
      setTicket(res.data)
      setStatus(res.data.status)
    } catch (err) {
      alert('Ticket not found')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate() {
    setSaving(true)
    try {
      await axios.put(`${API}/api/tickets/${ticket_id}`, { status, note })
      setNote('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchTicket()
    } catch (err) {
      alert('Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-gray-400 py-16">Loading ticket...</p>
  if (!ticket) return null

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="text-sm text-blue-500 hover:underline mb-6 flex items-center gap-1"
      >
        ← Back to all tickets
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-blue-600 font-semibold">{ticket.ticket_id}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                {ticket.status}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                {ticket.priority}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">{ticket.subject}</h1>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Created: {new Date(ticket.created_at).toLocaleString('en-IN')}</p>
            <p>Updated: {new Date(ticket.updated_at).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mt-4 flex gap-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Customer</p>
            <p className="font-medium">{ticket.customer_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Email</p>
            <p className="font-medium">{ticket.customer_email}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 mb-1">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
        </div>
      </div>

      {/* Update Panel */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Update Ticket</h2>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Change Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Add a Note</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add an internal note or update..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Notes Timeline */}
      {ticket.notes && ticket.notes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity Timeline</h2>
          <div className="space-y-4">
            {ticket.notes.map((n, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{n.note_text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}