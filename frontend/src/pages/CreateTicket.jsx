import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000'

export default function CreateTicket() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'Name is required'
    if (!form.customer_email.trim()) e.customer_email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.customer_email)) e.customer_email = 'Invalid email'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.description.trim()) e.description = 'Description is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) return setErrors(e2)

    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/tickets`, form)
      navigate(`/tickets/${res.data.ticket_id}`)
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Ticket</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below to open a support ticket</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customer_name ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
          </div>

          {/* Customer Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
            <input
              name="customer_email"
              value={form.customer_email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customer_email ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.customer_email && <p className="text-red-500 text-xs mt-1">{errors.customer_email}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Cannot login to my account"
              className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subject ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              rows={4}
              className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}