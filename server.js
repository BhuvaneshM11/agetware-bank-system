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
