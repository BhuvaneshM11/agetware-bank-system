# agetware-bank-system

# 🏦 Agetware Bank Lending System

A simple backend system to manage bank loans using Node.js, Express, and SQLite.

## Features

- LEND: Issue loans with EMI calculations
- PAYMENT: Accept EMI or lump sum payments
- LEDGER: View loan statement & balance
- ACCOUNT OVERVIEW: See all customer loans

## API Endpoints

### LEND
`POST /lend`
```json
{
  "customer_id": "cust1",
  "principal": 50000,
  "years": 2,
  "rate": 10
}
