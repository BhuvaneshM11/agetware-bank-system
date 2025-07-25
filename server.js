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



// Route: GET /ledger/:loan_id

app.get('/ledger/:loan_id', async (req, res) => {
  const db = await getDB();
  const { loan_id } = req.params;

  try {
    const loan = await db.get('SELECT * FROM loans WHERE id = ?', [loan_id]);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const payments = await db.all(
      'SELECT * FROM payments WHERE loan_id = ? ORDER BY date',
      [loan_id]
    );

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = loan.total_amount - totalPaid;
    const emiLeft = Math.ceil(balance / loan.emi);

    res.json({
      loan_id,
      original_amount: loan.total_amount,
      monthly_emi: loan.emi,
      balance_amount: balance,
      emis_left: emiLeft,
      transactions: payments,
    });
  } catch (error) {
    console.error('Ledger error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Route: GET /account-overview/:customer_id

app.get('/account-overview/:customer_id', async (req, res) => {
  const db = await getDB();
  const { customer_id } = req.params;

  try {
    const loans = await db.all('SELECT * FROM loans WHERE customer_id = ?', [customer_id]);
    const payments = await db.all('SELECT loan_id, SUM(amount) as paid FROM payments GROUP BY loan_id');

    const paymentsMap = {};
    for (const row of payments) {
      paymentsMap[row.loan_id] = row.paid;
    }

    const result = loans.map(loan => {
      const paid = paymentsMap[loan.id] || 0;
      const balance = loan.total_amount - paid;
      const emiLeft = Math.ceil(balance / loan.emi);

      return {
        loan_id: loan.id,
        principal: loan.principal,
        interest: loan.interest,
        total_amount: loan.total_amount,
        emi: loan.emi,
        paid_till_now: paid,
        emis_left: emiLeft
      };
    });

    res.json({ customer_id, loans: result });
  } catch (error) {
    console.error('Account overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
