const express = require('express')
const cors = require('cors')
const path = require('path')
const { getDb, saveDb } = require('./db')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Helper to generate ticket IDs like TKT-001
async function generateTicketId(db) {
  const result = db.exec('SELECT COUNT(*) as count FROM tickets')
  const count = result[0]?.values[0][0] || 0
  const num = String(Number(count) + 1).padStart(3, '0')
  return `TKT-${num}`
}

// POST /api/tickets — Create a new ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { customer_name, customer_email, subject, description, priority } = req.body

    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const db = await getDb()
    const ticket_id = await generateTicketId(db)
    const now = new Date().toISOString()

    db.run(
      `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Open', ?, ?, ?)`,
      [ticket_id, customer_name, customer_email, subject, description, priority || 'Medium', now, now]
    )

    saveDb()
    res.status(201).json({ ticket_id, created_at: now })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tickets — List all tickets with optional search & filter
app.get('/api/tickets', async (req, res) => {
  try {
    const { status, search } = req.query
    const db = await getDb()

    let query = 'SELECT * FROM tickets WHERE 1=1'
    const params = []

    if (status && status !== 'All') {
      query += ' AND status = ?'
      params.push(status)
    }

    if (search) {
      query += ` AND (customer_name LIKE ? OR customer_email LIKE ? OR subject LIKE ? OR description LIKE ? OR ticket_id LIKE ?)`
      const like = `%${search}%`
      params.push(like, like, like, like, like)
    }

    query += ' ORDER BY created_at DESC'

    const result = db.exec(query, params)
    const rows = result[0]
      ? result[0].values.map(row => {
          const cols = result[0].columns
          const obj = {}
          cols.forEach((col, i) => (obj[col] = row[i]))
          return obj
        })
      : []

    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/tickets/:ticket_id — Get single ticket with notes
app.get('/api/tickets/:ticket_id', async (req, res) => {
  try {
    const db = await getDb()
    const { ticket_id } = req.params

    const ticketResult = db.exec('SELECT * FROM tickets WHERE ticket_id = ?', [ticket_id])
    if (!ticketResult[0]) return res.status(404).json({ error: 'Ticket not found' })

    const cols = ticketResult[0].columns
    const ticket = {}
    cols.forEach((col, i) => (ticket[col] = ticketResult[0].values[0][i]))

    const notesResult = db.exec(
      'SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC',
      [ticket_id]
    )
    const notes = notesResult[0]
      ? notesResult[0].values.map(row => {
          const obj = {}
          notesResult[0].columns.forEach((col, i) => (obj[col] = row[i]))
          return obj
        })
      : []

    ticket.notes = notes
    res.json(ticket)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/tickets/:ticket_id — Update status and/or add a note
app.put('/api/tickets/:ticket_id', async (req, res) => {
  try {
    const db = await getDb()
    const { ticket_id } = req.params
    const { status, note } = req.body
    const now = new Date().toISOString()

    if (status) {
      db.run(
        'UPDATE tickets SET status = ?, updated_at = ? WHERE ticket_id = ?',
        [status, now, ticket_id]
      )
    }

    if (note && note.trim()) {
      db.run(
        'INSERT INTO notes (ticket_id, note_text, created_at) VALUES (?, ?, ?)',
        [ticket_id, note.trim(), now]
      )
    }

    saveDb()
    res.json({ success: true, updated_at: now })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Health check
app.get('/api', (req, res) => res.json({ message: 'Support CRM API is running' }))

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

// Keep alive ping - prevents Render from sleeping
const https = require('https')
setInterval(() => {
  https.get('https://support-crm-t4cs.onrender.com/api', () => {
    console.log('Keep alive ping sent')
  }).on('error', () => {})
}, 5 * 60 * 1000)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
