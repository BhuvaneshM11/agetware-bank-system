const express = require('express')
const app = express()
const loansRouter = require('./routes/loans')
const customersRouter = require('./routes/customers')
require('./db/database') // Initializes DB

app.use(express.json())

app.use('/loans', loansRouter)
app.use('/customers', customersRouter)

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})


app.post('/payment', async (req, res) => {
  const db = await getDB();
  const { loan_id, amount, type } = req.body;

  if (!loan_id || !amount || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type !== 'EMI' && type !== 'LUMP_SUM') {
    return res.status(400).json({ error: 'Invalid payment type' });
  }

  try {
    const loan = await db.get('SELECT * FROM loans WHERE id = ?', [loan_id]);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const date = new Date().toISOString().split('T')[0];

    await db.run(
      `INSERT INTO payments (loan_id, amount, type, date) VALUES (?, ?, ?, ?)`,
      [loan_id, amount, type, date]
    );

    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
