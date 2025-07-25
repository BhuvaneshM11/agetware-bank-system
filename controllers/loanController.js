const db = require('../db/database')
const { v4: uuidv4 } = require('uuid')

const createLoan = (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body

  if (!customer_id || !loan_amount || !loan_period_years || !interest_rate_yearly) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const interest = loan_amount * loan_period_years * (interest_rate_yearly / 100)
  const totalAmount = loan_amount + interest
  const monthlyEmi = totalAmount / (loan_period_years * 12)
  const loan_id = uuidv4()

  db.run(
    `INSERT INTO Loans (loan_id, customer_id, principal_amount, interest_rate, loan_period_years, total_amount, monthly_emi)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [loan_id, customer_id, loan_amount, interest_rate_yearly, loan_period_years, totalAmount, monthlyEmi],
    (err) => {
      if (err) return res.status(500).json({ error: err.message })

      res.status(201).json({
        loan_id,
        customer_id,
        total_amount_payable: totalAmount,
        monthly_emi: monthlyEmi.toFixed(2)
      })
    }
  )
}

module.exports = { createLoan }
