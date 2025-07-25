const express = require('express')
const router = express.Router()
const { createLoan } = require('../controllers/loanController')

router.post('/', createLoan)

module.exports = router
